import { apiFetch } from "./http";

export interface UserProfileSummary {
  userId: string;
  username: string;
  displayName: string;
  profileImage: string | null;
}

type UserShortResponse = {
  Username?: unknown;
  DisplayName?: unknown;
  ProfilePicture?: unknown;
};

const profileCache = new Map<string, UserProfileSummary>();

function normalizeUserProfile(userId: string, payload: UserShortResponse): UserProfileSummary | null {
  if (!userId) return null;
  const username = typeof payload.Username === "string" && payload.Username.trim() ? payload.Username.trim() : null;
  const displayName =
    typeof payload.DisplayName === "string" && payload.DisplayName.trim() ? payload.DisplayName.trim() : username;

  if (!username && !displayName) {
    return null;
  }

  const profileImage = typeof payload.ProfilePicture === "string" && payload.ProfilePicture.trim() ? payload.ProfilePicture : null;

  return {
    userId,
    username: username ?? `user-${userId.slice(0, 6)}`,
    displayName: displayName ?? `User ${userId.slice(0, 6)}`,
    profileImage,
  };
}

export function cacheUserProfile(profile: UserProfileSummary) {
  profileCache.set(profile.userId, profile);
}

export function getCachedUserProfile(userId: string): UserProfileSummary | null {
  return profileCache.get(userId) ?? null;
}

export async function fetchUserProfile(userId: string): Promise<UserProfileSummary | null> {
  if (!userId) return null;

  const cached = getCachedUserProfile(userId);
  if (cached) {
    return cached;
  }

  try {
    const response = await apiFetch(`/users/${encodeURIComponent(userId)}/short`);
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(message);
    }

    const payload = (await response.json()) as UserShortResponse;
    const normalized = normalizeUserProfile(userId, payload);
    if (normalized) {
      cacheUserProfile(normalized);
    }
    return normalized;
  } catch (error) {
    console.warn(`Failed to fetch profile for user ${userId}:`, error);
    return null;
  }
}

export async function fetchUserProfiles(userIds: string[]): Promise<Record<string, UserProfileSummary>> {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return {};
  }

  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      const profile = await fetchUserProfile(id);
      return [id, profile] as const;
    })
  );

  return entries.reduce<Record<string, UserProfileSummary>>((acc, [id, profile]) => {
    if (profile) {
      acc[id] = profile;
    }
    return acc;
  }, {});
}

export type UserProfileMap = Record<string, UserProfileSummary>;
