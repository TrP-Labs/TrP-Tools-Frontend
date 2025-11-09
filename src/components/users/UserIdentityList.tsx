"use client";

import React from "react";
import UserIdentityRow from "./UserIdentityRow";
import { useUserProfiles } from "@/hooks/useUserProfiles";

interface UserIdentityListProps {
  userIds: Array<string | null | undefined>;
  emptyMessage?: string;
  showUsername?: boolean;
  dense?: boolean;
  className?: string;
}

function buildSkeletonCount(length: number) {
  if (length > 0 && length < 3) return length;
  return 3;
}

export default function UserIdentityList({
  userIds,
  emptyMessage = "No users found.",
  showUsername = true,
  dense = false,
  className = "",
}: UserIdentityListProps) {
  const cleanedIds = React.useMemo(
    () => userIds.filter((id): id is string => typeof id === "string" && Boolean(id.trim())),
    [userIds]
  );
  const { profiles, loading, error } = useUserProfiles(cleanedIds);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: buildSkeletonCount(cleanedIds.length) }).map((_, index) => (
          <UserIdentityRow key={index} loading size={dense ? "sm" : "md"} showUsername={showUsername} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className={`text-sm text-red-400 ${className}`}>{error}</p>;
  }

  const uniqueIds = Array.from(new Set(cleanedIds));
  const orderedProfiles = uniqueIds
    .map((id) => profiles[id])
    .filter((profile): profile is NonNullable<(typeof profiles)[string]> => Boolean(profile));

  if (orderedProfiles.length === 0) {
    return <p className={`text-sm text-[var(--text-muted)] ${className}`}>{emptyMessage}</p>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {orderedProfiles.map((profile) => (
        <UserIdentityRow
          key={profile.userId}
          profile={profile}
          size={dense ? "sm" : "md"}
          showUsername={showUsername}
        />
      ))}
    </div>
  );
}
