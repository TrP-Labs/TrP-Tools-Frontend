"use server"
import { getCurrentSession } from "@/lib/auth/session";

export default async function getLoggedIn() {

    const { session } = await getCurrentSession();

	if (!session) {
		return null
	}
  
    return true
}