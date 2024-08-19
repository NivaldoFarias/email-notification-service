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
		const vpc = new sst.aws.Vpc("modakVpc");
		const rds = new sst.aws.Postgres("modakDatabase", { vpc });
		const email = new sst.aws.Email("modakEmail", { sender: env.EMAIL_SENDER });

		const gateway = new sst.aws.Function("modakGateway", {
			handler: "src/index.handler",
			link: [email, rds],
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
