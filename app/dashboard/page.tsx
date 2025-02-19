import { GetSession } from "@/utils/authenticate";
import { cookies } from 'next/headers';
import prisma from "@/prisma/prisma";
import Link from "next/link";
import ImageItem from "@/components/ItemDisplay/ImageItem";
import { Prisma } from "@prisma/client";

type legacyGroup = {
    group: {
        id: string,
        name: string,
        icon: string | null,
    },
    role: {
        id: number,
        rank: number
    }
}

type combinedGroup = Array<{
    trptoolsGroup : Prisma.Group,
    robloxGroup : legacyGroup,
    iconId : string | null
}>

const NoGroups = () => {
    return <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl">You have no groups.</h1>
        <Link href={'/dashboard/create'} className="text-blue-300 hover:text-blue-200">Click here to create one</Link>
    </div>
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

    const trptoolsGroups = await prisma.group.findMany({
        where : {
            robloxId: {
                in: groupData.map(group => group.group.id.toString()),
            }
        },
        include : {
            ranks: true
        }
    })

    const adminGroups = trptoolsGroups.filter(group => {
        return group.ranks.some(rankRelation => {
            const matchingGroup = groupData.find(g => g.group.id == group.robloxId);
            return matchingGroup && rankRelation.robloxId === matchingGroup.role.id.toString() && (
                rankRelation.permission_manage ||
                rankRelation.permission_host ||
                rankRelation.permission_dispatch
            );
        });
    });

    const groupIds = adminGroups.map(group => group.robloxId);
    if (groupIds.length <= 0) return NoGroups()
    const iconsResponse = await (await fetch(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupIds.join(',')}&format=webp&size=420x420`))?.json();
    if (!iconsResponse) return;
    const iconsData : Array<any> = iconsResponse.data;

    const combinedGroupData : combinedGroup = adminGroups.map(group => {
        const matchingGroup = groupData.find(g => g.group.id == group.robloxId);
        const iconData = iconsData.find(icon => icon.targetId == group.robloxId);
        return {
            trptoolsGroup: group,
            robloxGroup: matchingGroup,
            iconId: iconData?.imageUrl
        };
    });

    return <div className="h-screen flex flex-col items-center justify-center">
    <h1 className="text-4xl mb-4">Select a group to manage, Or create one.</h1>
    <div className="flex items-center justify-center">
        {combinedGroupData.map(group => (
            <Link href={`/dashboard/${group.trptoolsGroup.id}`} key={group.trptoolsGroup.id}><ImageItem name={group.robloxGroup.group.name} image={group.iconId || "https://static.trptools.com/icon.webp"} /></Link>
        ))}
        <Link href={`/dashboard/create`} key={-1}><ImageItem name={""} image={"https://static.trptools.com/plus.webp"} /></Link>
    </div>
    </div>
}

export default Dashboard;