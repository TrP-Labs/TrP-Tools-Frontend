import { GetSession } from "@/utils/authenticate";
import { cookies } from 'next/headers';
import prisma from "@/prisma/prisma";
import CreateGroupFunction from "./create";
import ImageItem from "@/components/ItemDisplay/ImageItem";
import { InvisibleFunctionButton } from "@/components/Button";

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

const CreateGroup = async () => {
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
        }
    })

    const ownedNonTrPToolsGroup = groupData.filter(group => {
        const matchingGroup = trptoolsGroups.find(g => g.robloxId == group.group.id);
        return !matchingGroup && group.role.rank == 255 ? group : null
    });


    const groupIds = ownedNonTrPToolsGroup.map(group => group.group.id);
    const iconsResponse = await (await fetch(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupIds.join(',')}&format=webp&size=420x420`))?.json();
    if (!iconsResponse) return;
    const iconsData = iconsResponse.data;

    const updatedGroupData = ownedNonTrPToolsGroup.map(group => {
        const icon = iconsData.find((icon: { targetId: string }) => icon.targetId === group.group.id);
        return {
            ...group,
            group: {
                ...group.group,
                icon: icon ? icon.imageUrl : group.group.icon
            }
        };
    });

    return  <div className="h-screen flex flex-col items-center justify-center">
    <h1 className="text-4xl mb-4">Select a group to create</h1>
    <div className="flex items-center justify-center">
        {updatedGroupData.filter(group => group.role.rank === 255).map(group => (
            <InvisibleFunctionButton func={CreateGroupFunction} prop={group.group.id.toString()} key={group.group.id}><ImageItem name={group.group.name} image={group.group.icon || "https://static.trptools.com/icon.webp"} /></InvisibleFunctionButton>
        ))}
    </div>
    </div>
}

export default CreateGroup