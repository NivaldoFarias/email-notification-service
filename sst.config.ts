/// <reference path="./.sst/platform/config.d.ts" />

import { env } from "./src/env";

export default $config({
	app(input) {
		return {
			name: "modak",
			removal: input.stage === "main" ? "retain" : "remove",
			home: "aws",
		};
	},
	async run() {
		const email = new sst.aws.Email("modakEmail", {
			sender: env.EMAIL_SENDER,
		});

		const gateway = new sst.aws.Function("modakGateway", {
			handler: "src/email.handler",
			link: [email],
			description: "Sends email notifications",
			environment: env,
			url: {
				cors: {
					allowMethods: ["GET", "POST"],
				},
			},
		});

		return {
			gateway: gateway.url,
		};
	},
	console: {
		autodeploy: {
			target(event) {
				if (event.type === "branch" && event.branch === "main" && event.action === "pushed") {
					return { stage: "production" };
				}
			},
		},
	},
});
