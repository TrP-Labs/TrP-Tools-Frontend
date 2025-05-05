"use server"
import { getCurrentSession, invalidateSession, deleteSessionTokenCookie } from "@/lib/auth/session";

export default async function logout(): Promise<ActionResult | null> {
	const { session } = await getCurrentSession();
	if (!session) {
		return {
			error: "Unauthorized"
		};
	}

	await invalidateSession(session.id);
	await deleteSessionTokenCookie();
	return null;
}

interface ActionResult {
	error: string | null;
}