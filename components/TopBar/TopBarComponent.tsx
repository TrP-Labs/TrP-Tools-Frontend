"use client"
import React from "react"
import Link from "next/link";
import { usePathname } from "next/navigation";

const TopBarComponent = ({children, href} : {children: React.ReactNode; href:string}) => {
    const pathname = usePathname();
    return <Link href={href} className={`ml-3 hover:text-blue-300 text-xl ${pathname === href ? "text-white" : "text-gray-400"}`}>{children}</Link>
}

export default TopBarComponent