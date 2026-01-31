import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const SERVER_ENDPOINT = "http://127.0.0.1:7242/ingest/52974f17-a6ae-4987-b7f3-bf037d6a812d";

function log(level: string, message: string, data?: any) {
	const payload = {
		location: "test-prisma-connection.ts",
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

async function testPrismaConnection() {
	const dbUrl = process.env.DATABASE_URL;
	
	if (!dbUrl) {
		log("ERROR", "DATABASE_URL not set", { hypothesisId: "C" });
		process.exit(1);
	}

	// #region agent log
	log("INFO", "Starting Prisma connection test", {
		hypothesisId: "ALL",
		dbUrl: dbUrl.replace(/:[^:@]+@/, ":****@"),
		connectionParams: {
			hasSingleUse: dbUrl.includes("single_use_connections"),
			hasConnectionLimit: dbUrl.includes("connection_limit"),
			hasTimeouts: dbUrl.includes("timeout"),
		},
	});
	// #endregion agent log

	try {
		// #region agent log
		log("INFO", "Creating PrismaClient instance", { hypothesisId: "A" });
		// #endregion agent log
		
		const prisma = new PrismaClient({
			log: ["query", "error", "warn"],
		});

		// #region agent log
		log("INFO", "Attempting to connect via Prisma", { hypothesisId: "A", timestamp: Date.now() });
		// #endregion agent log

		// Test 1: Simple query
		const result = await prisma.$queryRaw`SELECT version(), current_database(), current_user`;
		
		// #region agent log
		log("SUCCESS", "Prisma query executed successfully", {
			hypothesisId: "A",
			timestamp: Date.now(),
			result: Array.isArray(result) ? result[0] : result,
		});
		// #endregion agent log

		// Test 2: Transaction (simulating migration)
		// #region agent log
		log("INFO", "Testing transaction (simulating migration)", { hypothesisId: "A" });
		// #endregion agent log
		
		await prisma.$transaction(async (tx) => {
			// #region agent log
			log("INFO", "Transaction started", { hypothesisId: "A", timestamp: Date.now() });
			// #endregion agent log
			
			await tx.$queryRaw`SELECT 1`;
			
			// #region agent log
			log("INFO", "Query executed in transaction", { hypothesisId: "A" });
			// #endregion agent log
			
			await new Promise((resolve) => setTimeout(resolve, 1000));
			
			// #region agent log
			log("INFO", "After 1s wait in transaction", { hypothesisId: "A", timestamp: Date.now() });
			// #endregion agent log
			
			await tx.$queryRaw`SELECT 2`;
			
			// #region agent log
			log("SUCCESS", "Second query in transaction executed", { hypothesisId: "A" });
			// #endregion agent log
		});

		// #region agent log
		log("SUCCESS", "Transaction completed successfully", { hypothesisId: "A" });
		// #endregion agent log

		await prisma.$disconnect();
		
		// #region agent log
		log("SUCCESS", "Prisma disconnected cleanly", { hypothesisId: "ALL" });
		// #endregion agent log
		
		log("SUCCESS", "All Prisma connection tests passed", { hypothesisId: "ALL" });
		return true;
	} catch (error: any) {
		// #region agent log
		log("ERROR", "Prisma connection test failed", {
			hypothesisId: "A",
			error: {
				message: error.message,
				code: error.code,
				name: error.name,
				meta: error.meta,
			},
		});
		// #endregion agent log
		
		throw error;
	}
}

async function main() {
	try {
		await testPrismaConnection();
		log("SUCCESS", "Prisma connection test completed successfully", { hypothesisId: "ALL" });
		process.exit(0);
	} catch (error: any) {
		log("ERROR", "Prisma connection test failed", {
			hypothesisId: "ALL",
			error: error.message,
		});
		console.error(error);
		process.exit(1);
	}
}

main();
