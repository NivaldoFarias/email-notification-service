import { Resource } from "sst";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const client = new SESv2Client();

export const handler = async () => {
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
              Data: `Sent from my SST app '${Resource.App.name}' on stage '${Resource.App.stage}'.`,
            },
          },
        },
      },
    })
  );

  return {
    statusCode: 200,
    body: "Sent!",
  };
};
