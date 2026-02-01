const nextConfig = {
	globalPassThroughEnv: ["DATABASE_URL"],
	globalEnv: ["DATABASE_URL"],
	tasks: {
		build: {
			env: ["DATABASE_URL"],
		},
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
