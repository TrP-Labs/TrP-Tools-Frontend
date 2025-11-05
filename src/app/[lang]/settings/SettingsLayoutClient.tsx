"use client";

import { useEffect, useState } from "react";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import { ClientUserService } from "@/lib/services/clientUserService";

interface SettingsLayoutClientProps {
  lang: string;
  strings: any;
  children: React.ReactNode;
}

export default function SettingsLayoutClient({ lang, strings, children }: SettingsLayoutClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    ClientUserService.getSession()
      .then((session) => {
        if (!active) return;
        setIsAuthenticated(Boolean(session.authenticated && session.user));
      })
      .catch(() => {
        if (active) setIsAuthenticated(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <SettingsSidebar
        strings={strings}
        isAuthenticated={isAuthenticated}
        lang={lang}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
