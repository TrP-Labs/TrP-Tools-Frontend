"use client"
import withAuthProtection from "@/utilityComponents/withAuthProtection";

const layout = ({children} : {children : React.ReactNode}) => {
    return <>{children}</>
}

export default withAuthProtection(layout)