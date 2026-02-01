/**
 * Middleware that protects dashboard routes.
 * Redirects to sign-in when there is no session cookie.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

	// Optimistic redirect if no session cookie
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*"], // Protect dashboard and all sub-routes
};
