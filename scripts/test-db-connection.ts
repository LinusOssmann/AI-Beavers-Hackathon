import "dotenv/config";
import { execSync } from "child_process";
import pg from "pg";

const SERVER_ENDPOINT = "http://127.0.0.1:7242/ingest/52974f17-a6ae-4987-b7f3-bf037d6a812d";

function log(level: string, message: string, data?: any) {
	const payload = {
		location: "test-db-connection.ts",
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

async function testConnection() {
	const dbUrl = process.env.DATABASE_URL;
	
	if (!dbUrl) {
		log("ERROR", "DATABASE_URL not set", { hypothesisId: "C" });
		process.exit(1);
	}

	// #region agent log
	log("INFO", "Starting connection test", {
		hypothesisId: "ALL",
		dbUrl: dbUrl.replace(/:[^:@]+@/, ":****@"), // Mask password
	});
	// #endregion agent log

	// Parse connection string
	const url = new URL(dbUrl);
	const config = {
		host: url.hostname,
		port: parseInt(url.port),
		database: url.pathname.slice(1) || "postgres",
		user: url.username,
		password: url.password,
		ssl: url.searchParams.get("sslmode") === "disable" ? false : { rejectUnauthorized: false },
		connectionTimeoutMillis: 5000,
	};

	// #region agent log
	log("INFO", "Connection config parsed", {
		hypothesisId: "C",
		config: { ...config, password: "****" },
	});
	// #endregion agent log

	// Test 1: Basic connection
	log("INFO", "Test 1: Attempting basic connection", { hypothesisId: "C" });
	const client = new pg.Client(config);
	
	try {
		// #region agent log
		log("INFO", "Calling client.connect()", { hypothesisId: "C", timestamp: Date.now() });
		// #endregion agent log
		
		await client.connect();
		
		// #region agent log
		log("SUCCESS", "Connection established", {
			hypothesisId: "C",
			timestamp: Date.now(),
		});
		// #endregion agent log

		// Test 2: Query execution
		log("INFO", "Test 2: Executing query", { hypothesisId: "A" });
		const result = await client.query("SELECT version(), current_database(), current_user");
		
		// #region agent log
		log("SUCCESS", "Query executed successfully", {
			hypothesisId: "A",
			data: {
				version: result.rows[0]?.version?.substring(0, 50),
				database: result.rows[0]?.current_database,
				user: result.rows[0]?.current_user,
			},
		});
		// #endregion agent log

		// Test 3: Check connection parameters
		log("INFO", "Test 3: Checking connection parameters", { hypothesisId: "A" });
		const paramResult = await client.query(`
			SELECT name, setting 
			FROM pg_settings 
			WHERE name IN ('max_connections', 'shared_buffers', 'statement_timeout', 'idle_in_transaction_session_timeout')
		`);
		
		// #region agent log
		log("INFO", "Connection parameters retrieved", {
			hypothesisId: "A",
			parameters: paramResult.rows,
		});
		// #endregion agent log

		// Test 4: Test transaction (simulating migration)
		log("INFO", "Test 4: Testing transaction (simulating migration)", { hypothesisId: "A" });
		await client.query("BEGIN");
		
		// #region agent log
		log("INFO", "Transaction started", { hypothesisId: "A", timestamp: Date.now() });
		// #endregion agent log
		
		await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
		
		// #region agent log
		log("INFO", "After 1s wait in transaction", { hypothesisId: "A", timestamp: Date.now() });
		// #endregion agent log
		
		await client.query("SELECT 1");
		
		// #region agent log
		log("SUCCESS", "Query executed in transaction", { hypothesisId: "A" });
		// #endregion agent log
		
		await client.query("ROLLBACK");
		
		// #region agent log
		log("SUCCESS", "Transaction rolled back successfully", { hypothesisId: "A" });
		// #endregion agent log

		// Test 5: Check for connection pooler
		log("INFO", "Test 5: Checking for connection pooler", { hypothesisId: "B" });
		const poolerResult = await client.query(`
			SELECT version() as version, 
			       (SELECT setting FROM pg_settings WHERE name = 'application_name') as application_name
		`);
		
		// #region agent log
		log("INFO", "Pooler check completed", {
			hypothesisId: "B",
			version: poolerResult.rows[0]?.version,
			applicationName: poolerResult.rows[0]?.application_name,
		});
		// #endregion agent log

		await client.end();
		
		// #region agent log
		log("SUCCESS", "Connection closed cleanly", { hypothesisId: "ALL" });
		// #endregion agent log
		
		log("SUCCESS", "All connection tests passed", { hypothesisId: "ALL" });
		return true;
	} catch (error: any) {
		// #region agent log
		log("ERROR", "Connection test failed", {
			hypothesisId: "C",
			error: {
				message: error.message,
				code: error.code,
				name: error.name,
				stack: error.stack?.substring(0, 200),
			},
		});
		// #endregion agent log
		
		try {
			await client.end();
		} catch {}
		throw error;
	}
}

// Test 6: Check if database server is reachable
async function testServerReachability() {
	const dbUrl = process.env.DATABASE_URL;
	if (!dbUrl) return;
	
	const url = new URL(dbUrl);
	const host = url.hostname;
	const port = parseInt(url.port);
	
	log("INFO", "Test 6: Checking server reachability", { hypothesisId: "C", host, port });
	
	try {
		// Try to connect using netcat or similar (fallback to pg connection test)
		const result = await testConnection();
		return result;
	} catch (error: any) {
		log("ERROR", "Server unreachable or connection failed", {
			hypothesisId: "C",
			error: error.message,
		});
		throw error;
	}
}

async function main() {
	try {
		await testServerReachability();
		log("SUCCESS", "Database connection test completed successfully", { hypothesisId: "ALL" });
		process.exit(0);
	} catch (error: any) {
		log("ERROR", "Database connection test failed", {
			hypothesisId: "ALL",
			error: error.message,
		});
		process.exit(1);
	}
}

main();
