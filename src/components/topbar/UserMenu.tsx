"use client"
import Link from "next/link"
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import TopBarButton from "./TopBarButton";
import { ClientUserService } from "@/lib/services/clientUserService";

// Types
interface RobloxUserInfo {
  username: string;
  displayName: string;
  profileImage?: string;
  userId: string;
}

interface MenuStrings {
  profile: string;
  settings: string;
  logout: string;
  about: string;
  login: string;
  more: string;
}

interface ErrorStrings {
  failedToLoadUser: string;
  logoutFailedTryAgain: string;
}

// Loading skeleton component
const LoggedInSkeleton = () => {
  return (
    <>
      <div className="rounded-full w-12 h-12 mr-2 bg-gray-600 animate-pulse" />
      <div className="flex flex-col">
        <div className="rounded-full w-32 h-5 bg-gray-600 animate-pulse" />
        <div className="rounded-full w-24 h-3 mt-1 bg-gray-600 animate-pulse" />
      </div>
    </>
  );
};

// More button component for logged out users
const MoreButton = ({ strings, lang }: { strings: MenuStrings; lang: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
                router.push('/login');
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
  robloxId, 
  strings,
  errorStrings,
  lang
}: { 
  robloxId: string; 
  strings: MenuStrings;
  errorStrings: ErrorStrings;
  lang: string;
}) => {
  const [data, setData] = useState<RobloxUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!robloxId) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const userInfo = await ClientUserService.getRobloxUserInfo(robloxId);
        setData(userInfo);
      } catch (e) {
        console.error("Failed to load user info", e);
        setError(errorStrings.failedToLoadUser);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [robloxId, errorStrings.failedToLoadUser]);

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

  if (loading) return <LoggedInSkeleton />;
  if (error) return <MoreButton strings={strings} lang={lang} />;
  if (!data) return <MoreButton strings={strings} lang={lang} />;

  return (
    <div className="relative" ref={menuRef}>
      <div 
        className={`flex flex-row cursor-pointer hover:bg-[var(--foreground)] active:bg-[var(--background-secondary-muted)] mr-3 ${
          isOpen ? "bg-[var(--background-secondary)]" : ""
        } p-1 transition-colors rounded-xl`}
        onClick={handleMenuClick}
      >
        <img 
          className="w-12 h-12 mr-2 rounded-full bg-[var(--background-muted)]" 
          src={data.profileImage || '/icon.png'} 
          alt={`${data.displayName}'s profile picture`} 
          width={48} 
          height={48} 
        />
        <div className="flex flex-col h-12 items-center">
          <span className="w-32 h-6 mr-auto font-medium">{data.displayName}</span>
          <span className="w-24 h-6 mr-auto text-sm font-sm text-gray-400">@{data.username}</span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[70px] right-0 w-48 bg-[var(--background-secondary)] rounded-xl shadow-lg z-50 border border-[var(--background-muted)] mr-3">
          <div className="p-3 space-y-2">
            <Link 
              href={`/users/${data.userId}`} 
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
  robloxId, 
  strings,
  lang
}: { 
  robloxId: string | null; 
  strings: MenuStrings;
  lang: string;
}) => {
  const errorStrings = {
    failedToLoadUser: "Failed to load user info",
    logoutFailedTryAgain: "Logout failed. Please try again."
  };

  if (!robloxId) {
    return <MoreButton strings={strings} lang={lang} />;
  }

  return <LoggedInUser robloxId={robloxId} strings={strings} errorStrings={errorStrings} lang={lang} />;
};

export default UserMenu; 