// OAuth and authentication types
export interface RobloxOAuthClaims {
  sub: string; // Roblox user ID
  iss: string; // Issuer
  aud: string; // Audience
  exp: number; // Expiration time
  iat: number; // Issued at
  name?: string;
  nickname?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
}

export interface RobloxUserInfo {
  username: string;
  displayName: string;
  profileImage?: string;
  userId: string;
}

export interface SessionUser {
  id: string;
  robloxId: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
  error?: string;
} 