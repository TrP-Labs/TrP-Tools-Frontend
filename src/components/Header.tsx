import Link from "next/link"
import LoggedInUserContainer from "./Login"
import { getCurrentSession } from "@/lib/auth/session"
import HeaderSection from "./HeaderSection";

export default async function Header() {
    const { user } = await getCurrentSession();
    const robloxId : string | null = user?.robloxId || null

    return <div className="w-screen h-16 top-0 bg-[#272727] flex flex-row items-center shadow-md select-none">
        <div className="flex flex-row items-center">
            <Link href={'/'}>
                <img src={'https://static.trptools.com/icon.webp'} 
                alt={'TrP Tools logo'} 
                width={45} 
                height={45} 
                className="ml-3 mr-2 hover:scale-110 transition-all"></img>
            </Link>

            <HeaderSection href="/home" >Home</HeaderSection>
        </div>
        <div className="flex flew-row items-center ml-auto mr-3">
            <LoggedInUserContainer robloxId={robloxId} />
        </div>
    </div>
}