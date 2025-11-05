"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconBrowserShare } from "@tabler/icons-react";
import HeaderSection from "./HeaderSection";
import UserMenu from "./UserMenu";
import { ClientUserService } from "@/lib/services/clientUserService";

interface HeaderClientProps {
  lang: string;
  topbarStrings: {
    groups: string;
    shifts: string;
    tools: string;
    dashboard: string;
    wiki: string;
  };
  menuStrings: {
    profile: string;
    settings: string;
    logout: string;
    about: string;
    login: string;
    more: string;
  };
  errorStrings?: {
    logoutFailed?: string;
    logoutFailedTryAgain?: string;
  };
}

export default function HeaderClient({
  lang,
  topbarStrings,
  menuStrings,
  errorStrings,
}: HeaderClientProps) {
  const [robloxId, setRobloxId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    ClientUserService.getSession()
      .then((session) => {
        if (!active) return;
        if (session.authenticated && session.user) {
          setRobloxId(session.user.robloxId.toString());
        } else {
          setRobloxId(null);
        }
      })
      .catch(() => {
        if (active) setRobloxId(null);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-screen h-16 top-0 bg-[var(--header)] flex flex-row items-center shadow-md select-none">
      <div className="flex flex-row items-center">
        <Link href={'/'}>
          <img
            src={'https://static.trptools.com/icon.webp'}
            alt={'TrP Tools logo'}
            width={45}
            height={45}
            className="ml-3 mr-2 hover:scale-110 transition-all"
          />
        </Link>

        <HeaderSection href="/groups">{topbarStrings.groups}</HeaderSection>
        <HeaderSection href="/shifts">{topbarStrings.shifts}</HeaderSection>
        <HeaderSection href="/tools">{topbarStrings.tools}</HeaderSection>
        <HeaderSection href="/dashboard">{topbarStrings.dashboard}</HeaderSection>
        <HeaderSection href="https://trolleybus.wiki">
          <span className="inline-flex items-center">
            {topbarStrings.wiki}
            <IconBrowserShare size={15} className="ml-2" />
          </span>
        </HeaderSection>
      </div>
      <div className="flex flew-row items-center ml-auto">
        <UserMenu robloxId={robloxId} strings={menuStrings} errors={errorStrings} lang={lang} />
      </div>
    </div>
  );
}
