import { RobloxUserInfo } from "@/lib/auth/types";

export class ClientUserService {
  /**
   * Fetch Roblox user information (client-side)
   */
  static async getRobloxUserInfo(userId: string): Promise<RobloxUserInfo> {
    const response = await fetch(`/api/roblox/basicuser?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Check if user is authenticated (client-side)
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch('/api/account/status');
      if (response.ok) {
        const data = await response.json();
        return data.authenticated;
      }
      return false;
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  }

  /**
   * Logout user (client-side)
   */
  static async logout(): Promise<void> {
    const response = await fetch('/api/account/logout', { method: 'POST' });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
  }
} 