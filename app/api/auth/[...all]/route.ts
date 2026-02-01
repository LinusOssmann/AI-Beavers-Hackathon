/**
 * Catch-all route for better-auth (sign-in, sign-out, session, etc.).
 * The API delegates to the Next.js handler from better-auth.
 */
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
