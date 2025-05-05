import { ReactNode } from 'react'

const TopBarButton = ({children} : {children : ReactNode}) => {
    return <span className='w-full hover:bg-[#3a3a3a] rounded-md cursor-pointer max-w-[90%] h-12 inline-flex items-center p-5 text-xl'>
        {children}
    </span>
}

export default TopBarButton