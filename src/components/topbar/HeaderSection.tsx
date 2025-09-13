"use client"
import React from "react"
import Link from "next/link";
import { usePathname } from "next/navigation";

const HeaderSection = ({children, href} : {children: React.ReactNode; href:string}) => {
    const pathname = usePathname();
    return <Link href={href} className={`ml-3 items-center hover:text-blue-300 text-xl ${'/' + pathname.split('/')[1] === href ? "text-[var(--text)]" : "text-[var(--text-muted)] flex flex-row"}`}>{children}</Link>
}

export default HeaderSection