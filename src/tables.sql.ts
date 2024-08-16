import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	email: text("email").notNull(),
	created_at: timestamp("created_at").notNull().defaultNow(),
	updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
	id: serial("id").primaryKey(),
	user_id: serial("user_id").notNull(),
	type: text("type").notNull(),
	message: text("message").notNull(),
	created_at: timestamp("created_at").notNull().defaultNow(),
	updated_at: timestamp("updated_at").notNull().defaultNow(),
});
