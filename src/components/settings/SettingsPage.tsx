import React from "react"

const SettingsPage = ({name, children} : {name : string, children: React.ReactNode}) => {
    return <div className="flex justify-center w-full">
        <div className="flex flex-col mx-auto w-8/12 p-4">
            <h1 className="text-4xl font-bold">{name}</h1>
            <div className="flex flex-col mt-6">
               {children} 
            </div> 
        </div>
    </div>
}

export default SettingsPage