import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    EMAIL_SENDER: z.string().email(),
    NODE_ENV: z.enum(["development", "production"]),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
