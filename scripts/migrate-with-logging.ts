import "dotenv/config";
import { execSync } from "child_process";

const SERVER_ENDPOINT = "http://127.0.0.1:7242/ingest/52974f17-a6ae-4987-b7f3-bf037d6a812d";

function log(level: string, message: string, data?: any) {
	const payload = {
		location: "migrate-with-logging.ts",
		message,
		data: { level, ...data },
		timestamp: Date.now(),
		sessionId: "debug-session",
		runId: "run1",
		hypothesisId: data?.hypothesisId || "ALL",
	};
	
	// #region agent log
	fetch(SERVER_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	}).catch(() => {});
	// #endregion agent log
	
	console.log(`[${level}] ${message}`, data || "");
}

/**
 * Prisma migrate needs a stable connection. Strip serverless/pooler params
 * (single_use_connections, connection_limit=1) that cause P1017 "Server has closed the connection".
 */
function migrationSafeUrl(url: string): string {
	try {
		const u = new URL(url);
		u.searchParams.delete("single_use_connections");
		u.searchParams.delete("connection_limit");
		u.searchParams.set("connection_limit", "2");
		return u.toString();
	} catch {
		return url;
	}
}

function main() {
	const dbUrl = process.env.DATABASE_URL;

	if (!dbUrl) {
		log("ERROR", "DATABASE_URL not set", { hypothesisId: "C" });
		process.exit(1);
	}

	const migrateDbUrl = migrationSafeUrl(dbUrl);
	const shadowUrl = process.env.SHADOW_DATABASE_URL
		? migrationSafeUrl(process.env.SHADOW_DATABASE_URL)
		: undefined;
	const migrateEnv = {
		...process.env,
		DATABASE_URL: migrateDbUrl,
		...(shadowUrl && { SHADOW_DATABASE_URL: shadowUrl }),
	};

	// #region agent log
	log("INFO", "Starting Prisma migration", {
		hypothesisId: "ALL",
		dbUrl: migrateDbUrl.replace(/:[^:@]+@/, ":****@"),
		connectionParams: {
			hasSingleUse: dbUrl.includes("single_use_connections=true"),
			hasConnectionLimit: dbUrl.includes("connection_limit"),
			hasConnectTimeout: dbUrl.includes("connect_timeout"),
			hasPoolTimeout: dbUrl.includes("pool_timeout"),
			hasSocketTimeout: dbUrl.includes("socket_timeout"),
		},
		parsedUrl: {
			host: new URL(dbUrl).hostname,
			port: new URL(dbUrl).port,
			database: new URL(dbUrl).pathname.slice(1),
		},
	});
	// #endregion agent log

	try {
		// #region agent log
		log("INFO", "Executing: prisma migrate dev", { hypothesisId: "ALL", timestamp: Date.now() });
		// #endregion agent log

		execSync("npx prisma migrate dev", {
			stdio: "inherit",
			env: migrateEnv,
			cwd: process.cwd(),
		});
		
		// #region agent log
		log("SUCCESS", "Migration completed successfully", {
			hypothesisId: "ALL",
			timestamp: Date.now(),
		});
		// #endregion agent log
		
		process.exit(0);
	} catch (error: any) {
		// #region agent log
		log("ERROR", "Migration failed", {
			hypothesisId: "ALL",
			error: {
				message: error.message,
				code: error.code,
				signal: error.signal,
				status: error.status,
			},
			timestamp: Date.now(),
		});
		// #endregion agent log
		
		process.exit(1);
	}
}

main();
