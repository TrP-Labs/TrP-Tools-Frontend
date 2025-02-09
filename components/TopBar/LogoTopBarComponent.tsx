import Image from "next/image"
import Link from "next/link"

const TopBarComponent = ({href, src} : {href:string; src:string}) => {
    return <Link href={href}><Image src={src} alt={'TrP Tools logo'} width={45} height={45} className="ml-3 mr-2 hover:scale-110 transition-all"></Image></Link>
}

export default TopBarComponent