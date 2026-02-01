/**
 * Client-side auth for better-auth.
 * This is the React client used for sign-in, sign-out, and session state in the browser.
 */
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.BETTER_AUTH_URL ?? "",
});
