"use client"
import { useEffect, useContext } from "react";
import { AuthContext } from "@/utilityComponents/AuthProvider";
import Loading from "@/components/Loading";
import { useRouter } from 'next/navigation'

const layout = ({children} : {children : React.ReactNode}) => {
    const router = useRouter()
    const sessionContext = useContext(AuthContext)
    const loading = sessionContext?.loaded
    const user = sessionContext?.session

    useEffect(() => {
      if (loading != 'loading' && !user) {
        router.push('/');
      }
    }, [loading, user, router]);

    if (loading == "loading") {
        return <div className="flex min-h-screen items-center justify-center">
        <Loading title="Authenticating" description="Verifying you can access the dashboard..." />
      </div>
    } 

    return <>{children}</>
}

export default layout