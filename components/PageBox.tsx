const PageBox = ({children} : {children : React.ReactNode}) => {
    return <div className="p-3 bg-[#272727] rounded-md shadow-md mt-5">
        {children}
    </div>
}

export default PageBox 