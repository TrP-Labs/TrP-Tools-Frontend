import prisma from '@/../prisma/prisma'
import { User } from "@prisma/client";

export async function getUserFromrobloxId(robloxUserId : string) : Promise<User | null> {
    return await prisma.user.findFirst({
        where : {
            robloxId : robloxUserId
        }
    })
}

export async function createUser(robloxUserId : string)  : Promise<User> {
    const user = await prisma.user.create({
        data : {
            robloxId : robloxUserId
        }
    })

    return user
}