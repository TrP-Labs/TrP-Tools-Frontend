const Loading = ({title, description} : {title:string, description:string}) => {
    return <div className="text-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-gray-500">{description}</p>
        <div className="mt-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent m-auto" />
        </div>
    </div>
}

export default Loading