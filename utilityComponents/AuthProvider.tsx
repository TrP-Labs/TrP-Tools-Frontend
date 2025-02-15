"use client"
import { useState, createContext, useEffect } from "react"
import React from "react"
import getSession from "@/app/auth/session"
import userResponse from "@/types/actionResponses/userResponse"

const AuthContext = createContext<{session:userResponse | undefined, loaded:"loading" | "loaded" | "failed"} | null>(null)

const AuthProvider = ({children, SessionData} : {children : React.ReactNode, SessionData : Promise<userResponse | undefined>}) => {
    const [session, setSession] = useState<userResponse | undefined>();
    const [sessionLoaded, setSessionLoaded] = useState<"loading" | "loaded" | "failed">("loading");

    useEffect(() => {
        const loadSession = async () => {
            try {
                const sessionData = await SessionData;
                setSession(sessionData);
                setSessionLoaded("loaded");
            } catch (error) {
                setSessionLoaded("failed");
            }
        };

        loadSession();
    }, [SessionData]);

    const contextObject = {
        session : session,
        loaded: sessionLoaded
    }

    return <AuthContext.Provider value={contextObject}>{children}</AuthContext.Provider>
}

export default AuthProvider
export {AuthContext}