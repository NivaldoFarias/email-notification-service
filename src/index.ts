import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { prettyJSON } from "hono/pretty-json";
import { Resource } from "sst";

import { db } from "./drizzle";
import { env } from "./env";
import { awsErrorSchema, emailInputSchema } from "./schemas";
import { notifications, users } from "./tables.sql";

export const handler = handle(setup());

function setup() {
	const client = new SESv2Client();

	const app = new Hono();

	app.use(prettyJSON());

	app.get("/users", async (ctx) => ctx.json(await db.select().from(users).execute()));
	app.get("/notifications", async (ctx) =>
		ctx.json(await db.select().from(notifications).execute()),
	);

	app.post(
		"/email",
		zValidator("json", emailInputSchema, (result, ctx) => {
			if (!result.success) {
				return ctx.json(
					{ message: result.error.issues.map(({ message }) => message).join(", ") },
					400,
				);
			}
		}),
		async (ctx) => {
			try {
				const input = ctx.req.valid("json");

				const user = await db
					.select()
					.from(users)
					.where(eq(users.email, input.destination))
					.execute();

				if (user[0]) {
					const userNotifications = await db
						.select()
						.from(notifications)
						.where(eq(notifications.user_id, user[0].id))
						.execute();

					checkRateLimit(input, userNotifications);
				}

				await client.send(
					new SendEmailCommand({
						FromEmailAddress: Resource.modakEmail.sender,
						Destination: { ToAddresses: [input.destination] },
						Content: {
							Simple: {
								Subject: { Data: `[${input.type}] New Notification` },
								Body: {
									Text: {
										Data: `Sent from my '${Resource.App.name}' on stage '${Resource.App.stage}' and environment '${env.NODE_ENV}'. \n\n${input.message}`,
									},
								},
							},
						},
					}),
				);

				if (!user[0]) {
					const createUser = await db
						.insert(users)
						.values({ email: input.destination })
						.returning({ id: users.id })
						.execute();

					if (!createUser[0]) throw new Error("Failed to create user");

					await db
						.insert(notifications)
						.values({ user_id: createUser[0].id, type: input.type, message: input.message })
						.execute();
				} else {
					await db
						.insert(notifications)
						.values({ user_id: user[0].id, type: input.type, message: input.message })
						.execute();
				}

				return ctx.json({ message: "ok" });
			} catch (error) {
				const awsError = awsErrorSchema.safeParse(error);

				if (awsError.success) {
					return ctx.json(
						{ message: awsError.data.message },
						awsError.data.$metadata.httpStatusCode,
					);
				} else if (error instanceof RateLimitExceededError) {
					return ctx.json({ message: error.message }, 429);
				}

				return ctx.json({ message: error instanceof Error ? error.message : error }, 500);
			}
		},
	);

	return app;
}

/**
 * Some sample notification types and rate limit rules, e.g.:
 *	- **Status**: not more than 2 per minute for each recipient
 *	- **News**: not more than 1 per day for each recipient
 *	- **Marketing**: not more than 3 per hour for each recipient
 */
function checkRateLimit(
	input: typeof emailInputSchema._type,
	userNotifications: (typeof notifications.$inferSelect)[],
) {
	switch (input.type) {
		case "status": {
			const statusNotifications = userNotifications
				.filter(({ type }) => type === "status")
				.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

			const lastMinute = new Date(new Date().setMinutes(new Date().getMinutes() - 1));

			const notificationsWithinLastMinute = statusNotifications.filter(
				({ created_at }) => created_at >= lastMinute,
			);

			if (notificationsWithinLastMinute.length >= 2) {
				throw new RateLimitExceededError("Rate limit exceeded for status notifications");
			}

			break;
		}
		case "news": {
			const newsNotifications = userNotifications
				.filter(({ type }) => type === "news")
				.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

			const lastDay = new Date(new Date().setDate(new Date().getDate() - 1));

			const notificationsWithinLastDay = newsNotifications.filter(
				({ created_at }) => created_at >= lastDay,
			);

			if (notificationsWithinLastDay.length >= 1) {
				throw new RateLimitExceededError("Rate limit exceeded for news notifications");
			}

			break;
		}
		case "marketing": {
			const marketingNotifications = userNotifications
				.filter(({ type }) => type === "marketing")
				.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

			const lastHour = new Date(new Date().setHours(new Date().getHours() - 1));

			const notificationsWithinLastHour = marketingNotifications.filter(
				({ created_at }) => created_at >= lastHour,
			);

			if (notificationsWithinLastHour.length >= 3) {
				throw new RateLimitExceededError("Rate limit exceeded for marketing notifications");
			}

			break;
		}
		default:
			throw new Error("Invalid notification type");
	}
}

class RateLimitExceededError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "RateLimitExceededError";
	}
}
