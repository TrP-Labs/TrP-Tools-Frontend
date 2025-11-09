"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import TopBarButton from "./TopBarButton";
import { ClientUserService } from "@/lib/services/clientUserService";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import UserIdentityRow from "@/components/users/UserIdentityRow";
import type { ApiSessionUser } from "@/lib/types/user";

interface MenuStrings {
  profile: string;
  settings: string;
  logout: string;
  about: string;
  login: string;
  more: string;
}

interface ErrorStrings {
  logoutFailedTryAgain: string;
}

const buildFallbackProfile = (user: ApiSessionUser) => {
  const displayName = user.siteRank ? `${user.siteRank} ${user.robloxId}` : `User ${user.robloxId}`;
  return {
    userId: user.userId,
    displayName,
    username: user.robloxId,
    profileImage: null,
  };
};

// More button component for logged out users
const MoreButton = ({ strings, lang }: { strings: MenuStrings; lang: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={handleMenuClick}
        className="cursor-pointer hover:bg-[#313131] p-4 transition-colors rounded-xl text-xl mr-3"
      >
        {strings.more}
      </button>

      {isOpen && (
        <div className="absolute top-[70px] right-0 w-48 bg-[var(--background-secondary)] rounded-xl shadow-lg z-50 border border-[var(--background-muted)] mr-3">
          <div className="p-3 space-y-2">
            <Link 
              href={`/${lang}/settings`} 
              onClick={handleItemClick}
              className="w-full flex justify-center"
            >
              <TopBarButton>{strings.settings}</TopBarButton>
            </Link>
            <Link 
              href={`/${lang}/about`} 
              onClick={handleItemClick}
              className="w-full flex justify-center"
            >
              <TopBarButton>{strings.about}</TopBarButton>
            </Link>
            <button 
              onClick={() => {
                handleItemClick();
                window.location.href = ClientUserService.loginUrl();
              }}
              className="w-full"
            >
              <TopBarButton>{strings.login}</TopBarButton>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Logged in user component with proper error handling
const LoggedInUser = ({
  sessionUser,
  strings,
  errorStrings,
  lang,
}: {
  sessionUser: ApiSessionUser;
  strings: MenuStrings;
  errorStrings: ErrorStrings;
  lang: string;
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { profiles, loading } = useUserProfiles([sessionUser.userId]);
  const profileFromApi = profiles[sessionUser.userId];
  const profile = profileFromApi ?? buildFallbackProfile(sessionUser);
  const showSkeleton = !profile && loading;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await ClientUserService.logout();
      setIsOpen(false);
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error("Logout failed", e);
      setError(errorStrings.logoutFailedTryAgain);
    }
  };

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <div 
        className={`flex flex-row cursor-pointer hover:bg-[var(--foreground)] active:bg-[var(--background-secondary-muted)] mr-3 ${
          isOpen ? "bg-[var(--background-secondary)]" : ""
        } p-1 transition-colors rounded-xl`}
        onClick={handleMenuClick}
      >
        <UserIdentityRow
          profile={profile}
          loading={showSkeleton}
          showUsername
          size="md"
          subtitle={sessionUser.siteRank}
          className="flex-1 min-w-0"
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

      {isOpen && (
        <div className="absolute top-[70px] right-0 w-48 bg-[var(--background-secondary)] rounded-xl shadow-lg z-50 border border-[var(--background-muted)] mr-3">
          <div className="p-3 space-y-2">
            <Link 
              href={`/users/${profile.userId}`} 
              onClick={handleItemClick}
              className="w-full flex justify-center"
            >
              <TopBarButton>{strings.profile}</TopBarButton>
            </Link>
            <Link 
              href={`/${lang}/settings`} 
              onClick={handleItemClick}
              className="w-full flex justify-center"
            >
              <TopBarButton>{strings.settings}</TopBarButton>
            </Link>
            <Link 
              href={`/${lang}/about`} 
              onClick={handleItemClick}
              className="w-full flex justify-center"
            >
              <TopBarButton>{strings.about}</TopBarButton>
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full"
            >
              <TopBarButton>{strings.logout}</TopBarButton>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main container component
const UserMenu = ({
  sessionUser,
  strings,
  errors,
  lang,
}: {
  sessionUser: ApiSessionUser | null;
  strings: MenuStrings;
  errors?: Partial<Record<"logoutFailedTryAgain", string>>;
  lang: string;
}) => {
  const errorStrings = {
    logoutFailedTryAgain: errors?.logoutFailedTryAgain ?? "Logout failed. Please try again."
  };

  if (!sessionUser) {
    return <MoreButton strings={strings} lang={lang} />;
  }

  return <LoggedInUser sessionUser={sessionUser} strings={strings} errorStrings={errorStrings} lang={lang} />;
};

export default UserMenu; 
