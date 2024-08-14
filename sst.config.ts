/// <reference path="./.sst/platform/config.d.ts" />

import { env } from "./src/env";

export default $config({
  app(input) {
    return {
      name: "modak",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const email = new sst.aws.Email("MyEmail", {
      sender: env.EMAIL_SENDER,
    });

    const api = new sst.aws.Function("MyApi", {
      handler: "src/sender.handler",
      link: [email],
      url: true,
    });

    return {
      api: api.url,
    };
  },
});
