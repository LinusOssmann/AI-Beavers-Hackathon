const nextConfig = {
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
