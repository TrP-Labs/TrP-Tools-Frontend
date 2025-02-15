"use server"
import { cookies } from 'next/headers';
import prisma from '@/prisma/prisma';
import userResponse from '@/types/actionResponses/userResponse';
import { GetSession } from '@/utils/authenticate'

const getSession = async () => {
    const retrievedCookies = await cookies();
    const token = retrievedCookies.get('session');

    if (!token) return

    const session = await GetSession(token.value);
    if (!session) return;
    const { activeToken } = session;

    // get information
    const userUrl = 'https://apis.roblox.com/oauth/v1/userinfo'
    const userDataResponse = await fetch(userUrl, {
        headers: { 
            'Authorization': `Bearer ${activeToken}`
        }
    });

    if (!userDataResponse.ok) return
    const userData = await userDataResponse.json()

    const response : userResponse = {
        userId : userData.sub,
        username : userData.preferred_username,
        displayName : userData.name,
        imageUrl : userData.picture
    }

    return response
}

export default getSession