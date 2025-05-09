import { ReactNode } from 'react'

const TopBarButton = ({children} : {children : ReactNode}) => {
    return <span className='w-full hover:bg-[var(--background-muted)] rounded-md cursor-pointer max-w-[90%] h-12 inline-flex items-center p-5 text-xl'>
        {children}
    </span>
}

export default TopBarButton