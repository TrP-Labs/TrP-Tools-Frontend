"use client"
import React, { FC } from "react"
import { IconBrush, IconUser } from "@tabler/icons-react"
import BaseSidebar from "../BaseSidebar"

type SettingList = {
    ID: number;
    Icon: FC<{ size?: number; stroke?: number }>;
    Text: string;
    url: string;
    RequiresAccount: boolean;
};

type SettingsStrings = {
    appearance: string;
    account: string;
    language: string;
    theme: string;
};

interface SettingsSidebarProps {
    strings: SettingsStrings;
    isAuthenticated: boolean;
    lang: string;
}

const SettingsPages: SettingList[] = [
    {
        ID: 1,
        Icon: IconBrush,
        Text: "appearance",
        url: '/settings/appearance',
        RequiresAccount: false
    },
    {
        ID: 2,
        Icon: IconUser,
        Text: "account",
        url: '/settings/account',
        RequiresAccount: true
    },
];

const SettingsSidebar = ({ strings, isAuthenticated, lang }: SettingsSidebarProps) => {
    const items = SettingsPages.map(page => ({
        ...page,
        Text: strings[page.Text as keyof SettingsStrings]
    }));

    return (
        <BaseSidebar
            items={items}
            title="Settings"
            isAuthenticated={isAuthenticated}
            lang={lang}
        />
    );
};

export default SettingsSidebar; 