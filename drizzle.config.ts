import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
	driver: "aws-data-api",
	dialect: "postgresql",
	dbCredentials: {
		database: Resource.modakDatabase.database,
		secretArn: Resource.modakDatabase.secretArn,
		resourceArn: Resource.modakDatabase.clusterArn,
	},
	schema: ["./src/**/*.sql.ts"],
	out: "./migrations",
});
