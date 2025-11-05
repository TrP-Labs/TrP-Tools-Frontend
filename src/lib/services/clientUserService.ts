import { apiFetch, buildApiUrl } from "@/lib/api/http";
import { type AuthSessionResponse } from "@/lib/types/user";

export class ClientUserService {
  static loginUrl() {
    return buildApiUrl("/auth/login");
  }

  static async getSession(): Promise<AuthSessionResponse> {
    try {
      const response = await apiFetch("/auth/session");

      if (!response.ok) {
        if ([401, 403, 422].includes(response.status)) {
          return { authenticated: false, user: null };
        }
        const message = await response.text().catch(() => response.statusText);
        throw new Error(message);
      }

      return (await response.json()) as AuthSessionResponse;
    } catch (error) {
      console.warn("Unable to retrieve session from API:", error);
      return { authenticated: false, user: null };
    }
  }

  /**
   * Check if user is authenticated (client-side)
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return Boolean(session.authenticated && session.user);
  }

  /**
   * Logout user (client-side)
   */
  static async logout(): Promise<void> {
    try {
      const response = await apiFetch("/auth/session", { method: "DELETE" });

      // Some backends may respond with 204/no content. Treat non-OK as failure.
      if (!response.ok && response.status !== 204) {
        throw new Error(`Logout failed with status ${response.status}`);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Logout failed");
    }
  }
}
