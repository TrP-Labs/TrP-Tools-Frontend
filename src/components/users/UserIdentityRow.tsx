"use client";

import React from "react";
import type { UserProfileSummary } from "@/lib/api/users";

interface UserIdentityRowProps {
  profile?: UserProfileSummary | null;
  loading?: boolean;
  showUsername?: boolean;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeToAvatar: Record<NonNullable<UserIdentityRowProps["size"]>, string> = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export default function UserIdentityRow({
  profile,
  loading = false,
  showUsername = true,
  subtitle,
  size = "md",
  className = "",
}: UserIdentityRowProps) {
  if (loading) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`${sizeToAvatar[size]} rounded-full bg-[var(--background-muted)] animate-pulse`} />
        <div className="flex flex-col gap-2">
          <div className="w-32 h-4 rounded bg-[var(--background-muted)] animate-pulse" />
          {showUsername && <div className="w-24 h-3 rounded bg-[var(--background-muted)] animate-pulse" />}
        </div>
      </div>
    );
  }

  const displayName = profile?.displayName ?? "Unknown user";
  const username = profile?.username ?? "unknown";
  const avatar = profile?.profileImage || "/icon.png";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={avatar}
        alt={`${displayName}'s avatar`}
        className={`${sizeToAvatar[size]} rounded-full object-cover bg-[var(--background-muted)]`}
        loading="lazy"
      />
      <div className="flex flex-col leading-tight min-w-0">
        <span className="font-semibold text-[var(--text)] truncate">{displayName}</span>
        {subtitle && <span className="text-xs text-[var(--text-muted)] truncate">{subtitle}</span>}
        {showUsername && <span className="text-sm text-[var(--text-muted)] truncate">@{username}</span>}
      </div>
    </div>
  );
}
