import { GetSession } from "@/utils/authenticate";
import { cookies } from 'next/headers';
import Link from "next/link";
import ImageItem from "@/components/ItemDisplay/ImageItem";

type legacyGroup = {
    group: {
        id: string,
        name: string,
        icon: string | null,
    },
    role: {
        rank: number
    }
}

const Dashboard = async () => {
    const retrievedCookies = await cookies();
    const token = retrievedCookies.get('session');
    if (!token) return;
    const session = await GetSession(token.value);

    const groupResponse = await (await fetch(`https://groups.roblox.com/v1/users/${session?.user.Id}/groups/roles`))?.json();
    if (!groupResponse) return;
    const groupData: Array<legacyGroup> = groupResponse.data;
    if (!groupData) return;

    const groupIds = groupData.map(group => group.group.id);
    const iconsResponse = await (await fetch(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupIds.join(',')}&format=webp&size=420x420`))?.json();
    if (!iconsResponse) return;
    const iconsData = iconsResponse.data;

    const updatedGroupData = groupData.map(group => {
        const icon = iconsData.find((icon: { targetId: string }) => icon.targetId === group.group.id);
        return {
            ...group,
            group: {
                ...group.group,
                icon: icon ? icon.imageUrl : group.group.icon
            }
        };
    });

    return <div className="h-screen flex items-center justify-center">
        {updatedGroupData.filter(group => group.role.rank === 255).map(group => (
            <Link href={`/dashboard/${group.group.id}`} key={group.group.id}><ImageItem name={group.group.name} image={group.group.icon || "https://static.trptools.com/icon.webp"} /></Link>
        ))}
    </div>
}

export default Dashboard;