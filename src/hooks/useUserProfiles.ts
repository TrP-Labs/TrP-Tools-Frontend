"use client";

import * as React from "react";
import {
  fetchUserProfiles,
  getCachedUserProfile,
  type UserProfileSummary,
} from "@/lib/api/users";

export interface UseUserProfilesResult {
  profiles: Record<string, UserProfileSummary>;
  loading: boolean;
  error: string | null;
}

function normalizeIds(ids: Array<string | null | undefined>): string[] {
  const cleaned = ids
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value): value is string => Boolean(value));

  const seen = new Set<string>();
  return cleaned.filter((id) => {
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
}

export function useUserProfiles(ids: Array<string | null | undefined>): UseUserProfilesResult {
  const normalizedIds = React.useMemo(() => normalizeIds(ids), [ids]);
  const key = React.useMemo(() => normalizedIds.join("|"), [normalizedIds]);
  const [version, setVersion] = React.useState(0);
  const [loading, setLoading] = React.useState(() => normalizedIds.length > 0);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (normalizedIds.length === 0) {
      setLoading(false);
      setError(null);
      return;
    }

    const missing = normalizedIds.filter((id) => !getCachedUserProfile(id));
    if (missing.length === 0) {
      setLoading(false);
      // bump version so memoized profiles re-evaluate when ID list changes but data already cached
      setVersion((prev) => prev + 1);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchUserProfiles(missing)
      .then(() => {
        if (cancelled) return;
        setError(null);
        setVersion((prev) => prev + 1);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load user profiles");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const profiles = React.useMemo(() => {
    const snapshot: Record<string, UserProfileSummary> = {};
    normalizedIds.forEach((id) => {
      const cached = getCachedUserProfile(id);
      if (cached) {
        snapshot[id] = cached;
      }
    });
    return snapshot;
  }, [key, version]);

  return { profiles, loading, error };
}
