export interface ApiSessionUser {
  userId: string;
  robloxId: string;
  siteRank: string;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  user?: ApiSessionUser | null;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  username: string;
  profileImage?: string | null;
}
