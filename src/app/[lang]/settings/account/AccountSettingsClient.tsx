"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/components/settings/LogoutButton";
import { ClientUserService } from "@/lib/services/clientUserService";
import type { ApiSessionUser } from "@/lib/types/user";

interface AccountSettingsClientProps {
  lang: string;
  strings: any;
}

const mockProfileFromSession = (user: ApiSessionUser) => {
  const robloxId = user.robloxId.toString();
  const prefix = user.siteRank ? `${user.siteRank} ` : '';
  return {
    displayName: `${prefix}User ${robloxId}`,
    username: `user${robloxId}`,
    profileImage: null as string | null,
  };
};

export default function AccountSettingsClient({ lang, strings }: AccountSettingsClientProps) {
  const [user, setUser] = useState<ApiSessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    ClientUserService.getSession()
      .then((session) => {
        if (!active) return;
        if (session.authenticated && session.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center w-full">
        <div className="flex flex-col mx-auto w-8/12 p-4">
          <h1 className="text-4xl font-bold text-[var(--text)] mb-8">
            {strings.settings.categories.account}
          </h1>
          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <p className="text-[var(--text)] opacity-75">Loading account information…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center w-full">
        <div className="flex flex-col mx-auto w-8/12 p-4">
          <h1 className="text-4xl font-bold text-[var(--text)] mb-8">
            {strings.settings.categories.account}
          </h1>
          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <p className="text-[var(--text)] opacity-75">
              {strings.settings.messages.signInRequired}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const userInfo = mockProfileFromSession(user);

  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col mx-auto w-8/12 p-4">
        <h1 className="text-4xl font-bold text-[var(--text)] mb-8">
          {strings.settings.categories.account}
        </h1>

        <div className="space-y-8">
          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              {strings.settings.sections.profileInformation}
            </h2>
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={userInfo.profileImage || '/icon.png'}
                alt={`${userInfo.displayName}'s avatar`}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="text-[var(--text)] font-medium text-lg">{userInfo.displayName}</p>
                <p className="text-[var(--text)] opacity-75">@{userInfo.username}</p>
                <p className="text-[var(--text)] opacity-75 text-sm">Roblox ID: {user.robloxId}</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              {strings.settings.sections.accountActions}
            </h2>
            <div className="space-y-4">
              <LogoutButton
                confirmMessage={strings.settings.messages.logoutConfirm}
                errorMessage={strings.settings.messages.logoutFailed}
                buttonText={strings.loginMenu.logout}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
