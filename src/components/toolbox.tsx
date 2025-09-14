import Link from "next/link";

export default function(props : {name : string, imageurl: string, url: string}) {
    return <Link href={props.url}>
        <div className="p-5 bg-[var(--background-secondary)] rounded-4xl">
            <img height={225} width={350} src={'https://cdn.trptools.com/tdwstage.webp'} className="rounded-3xl" ></img>
            <h1 className="text-3xl font-bold mt-2">{props.name}</h1>
        </div>
    </Link>
}