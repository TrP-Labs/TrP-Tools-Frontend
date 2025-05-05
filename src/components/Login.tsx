"use client"
import Link from "next/link"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import getUserInfo from "@/app/api/roblox/basicuser";
import TopBarButton from "./TopBarButton";
import logout from "@/app/api/account/logout";

const LoggedInSkeleton = () => {
     return <>
        <div className="rounded-full w-12 h-12 mr-2 bg-gray-600 animate-pulse" />
        <div className="flex flex-col">
            <div className="rounded-full w-32 h-5 bg-gray-600 animate-pulse" />
            <div className="rounded-full w-24 h-3 mt-1 bg-gray-600 animate-pulse" />
        </div>
     </>
}

const LoginButton = () => {
    const router = useRouter()

    return <button onClick={() => router.push('/login')} className="cursor-pointer hover:bg-[#313131] p-4 transition-colors rounded-xl text-xl">
        Login
    </button>
}

const LoggedInUser = ({renderFunction, robloxId} : {renderFunction : Function, robloxId : string | null}) => {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isClicked, setIsClicked] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            if (!robloxId) {
                setLoading(false)
                return
            }

            try {
                const userInfo = await getUserInfo(robloxId)
                setData(userInfo)
            } catch (e) {
                console.error("Failed to load user info", e)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [robloxId])

    if (loading) return <LoggedInSkeleton />
    if (!data) return <LoginButton />

    return <div className="relative group"
    onClick={() => {setIsClicked(!isClicked)}}>
        <div className={`flex flex-row cursor-pointer hover:bg-[#313131] active:bg-[#414141] ${isClicked ? "bg-[#313131]" : null} p-1 transition-colors rounded-xl`}>
            <img className="w-12 h-12 mr-2 rounded-full bg-[#3a3a3a]" src={data.profileImage || '/icon.png'} alt='Your profile picture' width={48} height={48} />
            <div className="flex flex-col h-12 items-center">
                <span className="w-32 h-6 mr-auto font-medium"> {data.displayName} </span>
                <span className="w-24 h-6 mr-auto text-sm font-sm text-gray-400"> @{data.username} </span>
            </div>
        </div>

        <div className={`absolute top-[70px] w-full bg-[#313131] h-48 rounded-xl ${isClicked ? 'scale-100' : 'scale-0'} transition-transform duration-100 flex flex-col justify-evenly origin-top items-center`}>
            <Link className="w-full flex justify-center" href={`/users/${data.userId}`}><TopBarButton>Profile</TopBarButton></Link>
            <Link className="w-full flex justify-center" href={'/settings'}><TopBarButton>Settings</TopBarButton></Link>
            <button className="w-full" onClick={async () => {await logout(); renderFunction(); router.push('/');}}><TopBarButton>Logout</TopBarButton></button>
        </div>
    </div>
}

const LoggedInUserContainer = ({ robloxId } : {robloxId : string | null}) => {
    const [renderState, setRender] = useState(0);
    const forceRender = () => setRender(prev => prev + 1);

    return <LoggedInUser key={renderState} renderFunction={forceRender} robloxId={robloxId} />
}

export default LoggedInUserContainer