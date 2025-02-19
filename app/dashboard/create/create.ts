'use server'
import prisma from "@/prisma/prisma";
import getSession from "@/app/auth/session";
import { redirect } from "next/navigation";

const CreateGroupFunction = async (groupId : string) => {
    const SessionData = await getSession()
    if (!SessionData) return
    
    const groupResponse = await (await fetch(`https://groups.roblox.com/v1/groups/${groupId}`))?.json();
    if (!groupResponse) return;
    const groupRoleResponse = await (await fetch(`https://groups.roblox.com/v1/groups/${groupId}/roles`))?.json();
    if (!groupRoleResponse) return;
    const groupRoleData : Array<any> = groupRoleResponse.roles
    if (!groupRoleData) return;
    
    const ownerId = groupRoleData.find(role => role.rank == 255).id

    if (groupResponse.owner.userId != SessionData.userId) return
    if (await prisma.group.findFirst({where:{robloxId : groupId}})) return 

    await prisma.group.create({
        data: {
            robloxId : groupId,
            ranks : {
                create : {
                    robloxId : ownerId.toString(),
                    color : '#9b59b6',
                    visible : true,

                    permission_manage : true,
                    permission_dispatch : true, 
                    permission_host : true,
                }
            }
        }
    })

    redirect(`/dashboard/${groupId}`)
}

export default CreateGroupFunction