import Image from "next/image"

const ImageItem = ({name, image} : {name: string, image:string}) => {
    return <div className="h-44 w-36 min-w-36 bg-[#363636] p-2 rounded-md cursor-pointer select-none ml-2 flex flex-col justify-center">
        <Image height={160} width={160} alt="Group Icon" src={image} className="rounded-md"/>
        <p className="text-lg truncate mt-1">{name}</p>
    </div>
}

export default ImageItem