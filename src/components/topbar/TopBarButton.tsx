import { ReactNode } from 'react'

const TopBarButton = ({children} : {children : ReactNode}) => {
    return <span className='w-full hover:bg-[var(--background-muted)] rounded-md cursor-pointer max-w-[90%] h-10 inline-flex items-center p-3 text-lg'>
        {children}
    </span>
}

export default TopBarButton