import { generateSessionToken, createSession, setSessionTokenCookie } from "@/lib/auth/session";
import { roblox } from "@/lib/auth/oauth";
import { cookies } from "next/headers";
import { decodeIdToken } from "arctic";
import { createUser, getUserFromrobloxId } from "@/lib/auth/userdb";
import { RobloxOAuthClaims } from "@/lib/auth/types";
import { NextRequest, NextResponse } from "next/server";

import type { OAuth2Tokens } from "arctic";

export async function GET(request: NextRequest): Promise<Response> {
	try {
		const url = new URL(request.url);
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");
		const cookieStore = await cookies();
		const storedState = cookieStore.get("roblox_oauth_state")?.value ?? null;
		const codeVerifier = cookieStore.get("roblox_code_verifier")?.value ?? null;
		
		if (code === null || state === null || storedState === null || codeVerifier === null) {
			return NextResponse.redirect(new URL('/login?error=invalid_request', request.url));
		}
		
		if (state !== storedState) {
			return NextResponse.redirect(new URL('/login?error=state_mismatch', request.url));
		}

		let tokens: OAuth2Tokens;
		try {
			tokens = await roblox.validateAuthorizationCode(code, codeVerifier);
		} catch (e) {
			console.error("OAuth validation error:", e);
			return NextResponse.redirect(new URL('/login?error=invalid_code', request.url));
		}
		
		const claims = decodeIdToken(tokens.idToken()) as RobloxOAuthClaims;
		const robloxUserId = claims.sub;

		if (!robloxUserId) {
			return NextResponse.redirect(new URL('/login?error=invalid_user', request.url));
		}

		const existingUser = await getUserFromrobloxId(robloxUserId);

		if (existingUser !== null) {
			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, existingUser.id);
			await setSessionTokenCookie(sessionToken, session.expiresAt);
			return NextResponse.redirect(new URL('/', request.url));
		}

		// Create new user
		const user = await createUser(robloxUserId);

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, user.id);
		await setSessionTokenCookie(sessionToken, session.expiresAt);
		
		return NextResponse.redirect(new URL('/', request.url));
	} catch (error) {
		console.error("Login callback error:", error);
		return NextResponse.redirect(new URL('/login?error=server_error', request.url));
	}
}