import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
		seed: "tsx prisma/seed.ts",
	},
	// Only specify datasource for migrations when DATABASE_URL is available
	// During build (prisma generate), this can be undefined
	...(process.env.DATABASE_URL
		? {
				datasource: {
					url: env("DATABASE_URL"),
				},
		  }
		: {}),
});
