import { generateState, generateCodeVerifier } from "arctic";
import { roblox } from "@/lib/auth/oauth";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

export async function GET(): Promise<Response> {
	try {
		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		const url = roblox.createAuthorizationURL(state, codeVerifier, ["openid", "profile"]);

		const cookieStore = await cookies();
		cookieStore.set("roblox_oauth_state", state, {
			path: "/",
			httpOnly: true,
			secure: config.nodeEnv === "production",
			maxAge: 60 * 10, // 10 minutes
			sameSite: "lax"
		});
		cookieStore.set("roblox_code_verifier", codeVerifier, {
			path: "/",
			httpOnly: true,
			secure: config.nodeEnv === "production",
			maxAge: 60 * 10, // 10 minutes
			sameSite: "lax"
		});

		return new Response(null, {
			status: 302,
			headers: {
				Location: url.toString()
			}
		});
	} catch (error) {
		console.error("Login route error:", error);
		return new Response(null, {
			status: 500,
			headers: {
				Location: "/?error=login_failed"
			}
		});
	}
}