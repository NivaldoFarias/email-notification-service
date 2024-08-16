import { z } from "zod";

import type { StatusCode } from "hono/utils/http-status";

export const awsErrorSchema = z.object({
	name: z.string(),
	message: z.string(),
	stack: z.string(),
	$fault: z.string(),
	$metadata: z.object({
		httpStatusCode: z.number().refine((code): code is StatusCode => code >= 400 && code < 600),
		requestId: z.string(),
		attempts: z.number(),
		totalRetryDelay: z.number(),
	}),
});

export const emailInputSchema = z.object({
	type: z.enum(["news", "status", "marketing"]),
	destination: z.string().email(),
	message: z.string(),
});

export class Notification {
	constructor(
		public readonly id: number,
		public readonly userId: number,
		public readonly type: string,
		public readonly message: string,
		public readonly createdAt: string,
		public readonly updatedAt: string,
	) {}
}

export class User {
	constructor(
		public readonly id: number,
		public readonly email: string,
		public readonly createdAt: string,
		public readonly updatedAt: string,
	) {}
}
