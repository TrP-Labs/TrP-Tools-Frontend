'use client'
const baseButtonCSS = "rounded-lg m-3 p-2 hover:bg-gray-400 transition duration-300 "

type style = "create" | "danger" | "info" | "blank" | "link"

const styles = {
    create : "bg-green-500",
    danger : "bg-red-500",
    info : "bg-blue-500",
    blank : "bg-gray-500",
    link : "bg-gray-700"
}

const FunctionButton = ({children, func, style} : {children : React.ReactNode, func : Function, style : style }) => {
    return <button className={baseButtonCSS + styles[style]} onClick={() => func()}> {children} </button>
}

const InvisibleFunctionButton = ({children, func, prop} : {children : React.ReactNode, func : Function, prop : any }) => {
    'use client'
    return <button onClick={() => func(prop)}> {children} </button>
}

const LinkButton = ({children, link, style} : {children : React.ReactNode, link : string, style : style}) => {
    return <a className={baseButtonCSS + styles[style]} href={link}> {children} </a>
}

export {FunctionButton, LinkButton, InvisibleFunctionButton}