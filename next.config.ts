import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow ngrok (and similar) hosts in dev so the MCP server works through tunnels
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.ngrok.app",
  ],
  async headers() {
    return [
      {
        source: "/mcp/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
