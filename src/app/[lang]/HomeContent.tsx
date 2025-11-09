"use client";

import { useEffect, useState } from "react";
import UserIdentityRow from "@/components/users/UserIdentityRow";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { ClientUserService } from "@/lib/services/clientUserService";
import type { ApiSessionUser } from "@/lib/types/user";
import type { UserProfileSummary } from "@/lib/api/users";

interface HomeContentProps {
  strings: any;
}

const buildFallbackProfile = (user: ApiSessionUser): UserProfileSummary => {
  const displayName = user.siteRank ? `${user.siteRank} ${user.robloxId}` : `User ${user.robloxId}`;
  return {
    userId: user.userId,
    displayName,
    username: user.robloxId,
    profileImage: null,
  };
};

export default function HomeContent({ strings }: HomeContentProps) {
  const [sessionUser, setSessionUser] = useState<ApiSessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    let active = true;

    ClientUserService.getSession()
      .then((session) => {
        if (!active) return;
        if (session.authenticated && session.user) {
          setSessionUser(session.user);
        } else {
          setSessionUser(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setSessionUser(null);
      })
      .finally(() => {
        if (active) setSessionLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const loginHref = ClientUserService.loginUrl();
  const userId = sessionUser?.userId ?? null;
  const { profiles, loading: profileLoading } = useUserProfiles(userId ? [userId] : []);
  const profileFromApi = userId ? profiles[userId] : null;
  const resolvedProfile = profileFromApi ?? (sessionUser ? buildFallbackProfile(sessionUser) : null);
  const authenticated = Boolean(sessionUser);
  const welcomeName = resolvedProfile?.displayName ?? "there";
  const welcomeMessage = strings.home.welcomeBack.replace("{name}", welcomeName);
  const isProfileLoading = Boolean(userId) && profileLoading && !profileFromApi;

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text)] mb-8">
          {strings.home.title}
        </h1>

        {authenticated && resolvedProfile ? (
          <div className="bg-[var(--background-secondary)] rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              {welcomeMessage}
            </h2>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 gap-4">
              <UserIdentityRow
                profile={resolvedProfile}
                loading={!resolvedProfile && isProfileLoading}
                size="lg"
                showUsername
              />
              <p className="text-[var(--text)] opacity-75">{strings.home.readyToManage}</p>
            </div>
          </div>
        ) : sessionLoading ? (
          <div className="bg-[var(--background-secondary)] rounded-lg p-6 mb-8 animate-pulse">
            <div className="w-1/3 h-6 bg-[var(--background-muted)] rounded mb-4" />
            <div className="w-full h-4 bg-[var(--background-muted)] rounded" />
          </div>
        ) : (
          <div className="bg-[var(--background-secondary)] rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              {strings.home.getStarted}
            </h2>
            <p className="text-[var(--text)] mb-4">
              {strings.home.signInDescription}
            </p>
            <a
              href={loginHref}
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {strings.home.signInButton}
            </a>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-[var(--text)] mb-3">{strings.home.features.groupManagement}</h3>
            <p className="text-[var(--text)] opacity-75">
              {strings.home.features.groupManagementDesc}
            </p>
          </div>

          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-[var(--text)] mb-3">{strings.home.features.shiftScheduling}</h3>
            <p className="text-[var(--text)] opacity-75">
              {strings.home.features.shiftSchedulingDesc}
            </p>
          </div>

          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-[var(--text)] mb-3">{strings.home.features.analytics}</h3>
            <p className="text-[var(--text)] opacity-75">
              {strings.home.features.analyticsDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
