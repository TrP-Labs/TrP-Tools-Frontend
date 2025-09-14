"use client"
import React, { FC } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link";

type SidebarItem = {
  ID: number;
  Icon?: FC<{ size?: number; stroke?: number }>;
  Text: string;
  url: string;
  RequiresAccount?: boolean;
};

interface BaseSidebarProps {
  items: SidebarItem[];
  title: string;
  isAuthenticated?: boolean;
  lang?: string;
  className?: string;
}

const SidebarButton = ({
  children,
  href,
  isActive,
}: {
  children: React.ReactNode;
  href: string;
  isActive: boolean;
}) => {
  return (
    <Link href={href} className={`w-11/12 m-auto p-2 pl-4 my-3 text-left flex flex-row items-center outline-2 rounded-3xl
          ${isActive ? 'outline-2 border-[#5d5d5d] brightness-150' : 'outline-[#5d5d5d] hover:brightness-75 active:brightness-110'}`}>
        {children}
    </Link>
  );
};

const BaseSidebar = ({
  items,
  title,
  isAuthenticated = true,
  lang = "",
  className = "",
}: BaseSidebarProps) => {
  const pathname = usePathname();

  const visibleItems = items.filter(({ RequiresAccount }) => !RequiresAccount || isAuthenticated);

  return (
    <aside className={`w-64 bg-[var(--foreground)] border-r border-[var(--background-muted)] ${className}`}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-6">{title}</h2>
        <nav className="space-y-3">
          {visibleItems.map(({ ID, Icon, Text, url }) => {
            const href = lang ? `/${lang}${url}` : url;
            const cleanPathname = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
            const isActive = url == cleanPathname

            return (
              <SidebarButton key={ID} href={href} isActive={isActive}>
                {Icon && <Icon size={23} stroke={1.5} />}
                <span className={Icon ? 'ml-3' : ''}>{Text}</span>
              </SidebarButton>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default BaseSidebar;
