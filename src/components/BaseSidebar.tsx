"use client"
import React, { useState, FC } from "react"
import { useRouter, usePathname } from "next/navigation"

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
    id, 
    selected, 
    url, 
    setSelected 
}: { 
    children: React.ReactNode; 
    id: number; 
    selected: number; 
    url: string; 
    setSelected: React.Dispatch<React.SetStateAction<number>> 
}) => {
    const router = useRouter()
    
    const handleClick = () => {
        setSelected(id);
        router.push(url);
    };
    
    return (
        <button 
            onClick={handleClick} 
            className={`w-11/12 m-auto p-2 pl-4 my-1 text-left cursor-pointer flex flex-row items-center ${
                selected === id ? 'border-solid' : 'border-none'
            } border-[#5d5d5d] border-2 rounded-3xl hover:filter ${
                selected === id ? 'brightness-150' : 'hover:brightness-75 active:brightness-110'
            }`}
        >
            {children}
        </button>
    );
};

const BaseSidebar = ({ items, title, isAuthenticated = true, lang = "", className = "" }: BaseSidebarProps) => {
    const pathname = usePathname();
    const [selected, setSelected] = useState(() => {
        // Determine initial selected state based on current pathname
        const currentItem = items.find(item => {
            const itemPath = lang ? `/${lang}${item.url}` : item.url;
            return pathname.includes(itemPath);
        });
        return currentItem?.ID || items[0]?.ID || 1;
    });

    const visibleItems = items.filter(({ RequiresAccount }) => 
        !RequiresAccount || isAuthenticated
    );

    return (
        <aside className={`w-64 bg-[var(--foreground)] border-r border-[var(--background-muted)] ${className}`}>
            <div className="p-6">
                <h2 className="text-xl font-semibold text-[var(--text)] mb-6">
                    {title}
                </h2>
                <nav className="space-y-3">
                    {visibleItems.map(({ ID, Icon, Text, url }) => (
                        <SidebarButton 
                            key={ID} 
                            id={ID} 
                            selected={selected} 
                            setSelected={setSelected} 
                            url={lang ? `/${lang}${url}` : url}
                        >
                            {Icon && <Icon size={23} stroke={1.5} />}
                            <span className={`${Icon ? 'ml-3' : ''}`}>{Text}</span>
                        </SidebarButton>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default BaseSidebar; 