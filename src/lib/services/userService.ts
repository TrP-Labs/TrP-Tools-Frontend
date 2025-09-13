import { getCurrentSession } from "@/lib/auth/session";
import { getUserFromrobloxId, createUser } from "@/lib/auth/userdb";
import { RobloxUserInfo } from "@/lib/auth/types";

export class UserService {
  /**
   * Get current authenticated user
   */
  static async getCurrentUser() {
    const { user } = await getCurrentSession();
    return user;
  }

  /**
   * Get user by Roblox ID
   */
  static async getUserByRobloxId(robloxId: string) {
    return await getUserFromrobloxId(robloxId);
  }

  /**
   * Create new user
   */
  static async createNewUser(robloxId: string) {
    return await createUser(robloxId);
  }

  /**
   * Get or create user by Roblox ID
   */
  static async getOrCreateUser(robloxId: string) {
    let user = await this.getUserByRobloxId(robloxId);
    
    if (!user) {
      user = await this.createNewUser(robloxId);
    }
    
    return user;
  }

  /**
   * Fetch Roblox user information (server-side)
   */
  static async getRobloxUserInfo(userId: string): Promise<RobloxUserInfo> {
    try {
      // Fetch user data from Roblox API
      const userRes = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
        headers: {
          'User-Agent': 'TrPTools/1.0',
        },
      });

      if (!userRes.ok) {
        if (userRes.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`Roblox API error: ${userRes.status}`);
      }

      const userData = await userRes.json();

      // Fetch thumbnail data
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`,
        {
          headers: {
            'User-Agent': 'TrPTools/1.0',
          },
        }
      );

      let profileImage = null;
      if (thumbRes.ok) {
        const thumbData = await thumbRes.json();
        profileImage = thumbData.data[0]?.imageUrl || null;
      }

      return {
        username: userData.name,
        displayName: userData.displayName,
        userId: userId,
        profileImage: profileImage,
      };
    } catch (error) {
      console.error('Error fetching Roblox user info:', error);
      throw new Error('Failed to fetch user information');
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const { session } = await getCurrentSession();
    return session !== null;
  }
} 