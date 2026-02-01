const nextConfig = {
	globalPassThroughEnv: ["DATABASE_URL"],
	globalEnv: ["DATABASE_URL"],
	tasks: {
		build: {
			env: ["DATABASE_URL"],
		},
		input: ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"],
	},
	experimental: {
		turbo: {
			resolveAlias: {
				"@": "./",
				"@/generated": "./generated",
			},
		},
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
