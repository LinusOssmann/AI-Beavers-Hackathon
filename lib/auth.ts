/**
 * Server-side auth config for better-auth.
 * Uses Prisma and Next.js cookies for sessions and email/password sign-in.
 */
import { prisma } from "@/prisma/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  advanced: { disableOriginCheck: true },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()], // Enable automatic cookie handling in Next.js
});
