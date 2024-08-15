import { Resource } from "sst";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

import { env } from "./env";

const client = new SESv2Client();

const app = new Hono().post("/email", async (ctx) => {
  try {
    await client.send(
      new SendEmailCommand({
        FromEmailAddress: Resource.modakEmail.sender,
        Destination: {
          ToAddresses: [Resource.modakEmail.sender],
        },
        Content: {
          Simple: {
            Subject: {
              Data: "New SST App Notification",
            },
            Body: {
              Text: {
                Data: `Sent from my SST app '${Resource.App.name}' on stage '${Resource.App.stage}' and environment '${env.NODE_ENV}'.`,
              },
            },
          },
        },
      })
    );

    return ctx.json({
      status: "ok",
      message: "Sent!" + JSON.stringify(ctx),
    });
  } catch (error) {
    return ctx.json({
      status: "error",
      message: error instanceof Error ? error.message : error,
    });
  }
});

export const handler = handle(app);
