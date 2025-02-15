import type { Metadata, ResolvingMetadata } from 'next'
import PageBox from '@/components/PageBox'
import Image from 'next/image'
import { FunctionButton, LinkButton } from '@/components/Button' 
import List from '@/components/ItemDisplay/List'
import User from '@/components/Data/User'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
 
export async function generateMetadata({ params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const id = (await params).id
 
  // fetch data
  //const product = await fetch(`https://.../${id}`).then((res) => res.json())
 
  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || []
 
  return {
    title: "meow",
    //openGraph: {
      //images: ['/some-specific-page-image.jpg', ...previousImages],
    //},
  }
}

const GroupPage = async ({params, searchParams} : Props) => {
    const id = (await params).id
    return <div className='flex flex-col w-[95%] mx-auto'>
        <PageBox>
            <div className="flex flex-row items-center">
                <Image src="https://static.trptools.com/icon.webp" alt="Floof Transit Logo" height={150} width={150} />
                <h1 className='ml-5 text-4xl font-bold'>Floof Transit</h1>
                <div className='ml-auto flex flex-col'>
                    <LinkButton link='/meow' style='link'>Meow</LinkButton>
                </div>
            </div>
        </PageBox>
        <PageBox>
            <List name="Staff">
                <User />
            </List>
        </PageBox>
    </div>
}

export default GroupPage