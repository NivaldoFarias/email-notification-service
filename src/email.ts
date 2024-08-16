import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { prettyJSON } from "hono/pretty-json";
import { Resource } from "sst";

import { env } from "./env";
import { awsErrorSchema, emailInputSchema } from "./schemas";

export const handler = handle(setup());

function setup() {
	const client = new SESv2Client();

	const app = new Hono();

	app.use(prettyJSON());
	app.post(
		"/email",
		zValidator("json", emailInputSchema, (result, ctx) => {
			if (!result.success) return ctx.json(result.error, 400);
		}),
		async (ctx) => {
			try {
				const input = ctx.req.valid("json");

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

				return ctx.json({ message: "ok" });
			} catch (error) {
				const awsError = awsErrorSchema.safeParse(error);

				if (awsError.success) {
					return ctx.json(
						{ message: awsError.data.message },
						awsError.data.$metadata.httpStatusCode,
					);
				}

				return ctx.json({ message: error instanceof Error ? error.message : error }, 500);
			}
		},
	);

	return app;
}
