"use client"

import React, { useState, useEffect, FC } from "react"
import { useRouter } from "next/navigation"
import getLoggedIn from "@/app/api/account/getLoggedIn"
import { IconBrush, IconUser } from "@tabler/icons-react"
import { type getStrings } from "@/app/strings"

type SettingList = {
    ID: number;
    Icon: FC<{ size?: number; stroke?: number }>;
    Text: string;
    url: string,
    RequiresAccount: boolean;
};

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

const SettingsButton = ({ children, id, selected, url, setSelected }: { children: React.ReactNode, id: number, selected: number, url : string, setSelected: React.Dispatch<React.SetStateAction<number>> }) => {
    const router = useRouter()
    return <button onClick={() => {setSelected(id); router.push(url)}} className={`w-11/12 m-auto p-1 pl-4 my-2 text-left cursor-pointer flex flex-row ${selected === id ? 'border-solid' : 'border-none'} border-[#5d5d5d] border-2 rounded-3xl hover:filter ${selected === id ? 'brightness-150' : 'hover:brightness-75 active:brightness-110'}`}>
        {children}
    </button>
}

const Sidebar = ({ children, strings }: { children: React.ReactNode; strings: Awaited<ReturnType<typeof getStrings>>["settings"]; }) => {
    const [selected, setSelected] = useState(1)
    
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
      const fetchLoginStatus = async () => {
        const result = await getLoggedIn();
        setIsLoggedIn(result);
      };
      fetchLoginStatus();
    }, []);
  
    if (isLoggedIn === null) return null; // can be a loader

    return <div className="flex h-screen">
        <div className="left-0 h-screen w-48 bg-[var(--foreground)]">
            {SettingsPages
            .filter(({ RequiresAccount }) => !RequiresAccount || isLoggedIn)
            .map(({ ID, Icon, Text, url}) => (
                <SettingsButton key={ID} id={ID} selected={selected} setSelected={setSelected} url={url}>
                    <Icon size={23} stroke={1.5} />
                    <span className="ml-2">{strings[Text as keyof typeof strings]}</span>
                </SettingsButton>
            ))}
        </div>
        <div className="left-48 flex-1">
            {children}
        </div>
    </div>
}

export default Sidebar