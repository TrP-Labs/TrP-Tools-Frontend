"use client";

import { useEffect, useState } from "react";
import { ClientUserService } from "@/lib/services/clientUserService";

interface HomeContentProps {
  strings: any;
}

const buildMockUserProfile = (robloxId: string) => {
  const id = robloxId.toString();
  return {
    displayName: `User ${id}`,
    username: `user${id}`,
    profileImage: null as string | null,
  };
};

export default function HomeContent({ strings }: HomeContentProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<ReturnType<typeof buildMockUserProfile> | null>(null);

  useEffect(() => {
    let active = true;

    ClientUserService.getSession()
      .then((session) => {
        if (!active) return;
        if (session.authenticated && session.user) {
          setAuthenticated(true);
          setUserInfo(buildMockUserProfile(session.user.robloxId.toString()));
        } else {
          setAuthenticated(false);
          setUserInfo(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setAuthenticated(false);
        setUserInfo(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const loginHref = ClientUserService.loginUrl();

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text)] mb-8">
          {strings.home.title}
        </h1>

        {authenticated && userInfo ? (
          <div className="bg-[var(--background-secondary)] rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              {strings.home.welcomeBack.replace('{name}', userInfo.displayName)}
            </h2>
            <div className="flex items-center space-x-4">
              <img
                src={userInfo.profileImage || '/icon.png'}
                alt={`${userInfo.displayName}'s avatar`}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="text-[var(--text)] font-medium">@{userInfo.username}</p>
                <p className="text-[var(--text)] opacity-75">{strings.home.readyToManage}</p>
              </div>
            </div>
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
