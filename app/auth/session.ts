"use server"
import { cookies } from 'next/headers';
import prisma from '@/prisma/prisma';

type userResponse = {
    userId : number,
    username : string,
    displayName : string,
    imageUrl : string | null
}

const getSession = async () => {
    const retrievedCookies = await cookies();
    const token = retrievedCookies.get('session');

    if (!token) return 

    const session = await prisma.session.findUnique({
        where: {
          token: token.value
        },
        include: {
          user: true,
        },
    });

    if (!session?.user) return

    // reauthorize token
    const tokenUrl = 'https://apis.roblox.com/oauth/v1/token';
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: session.user.identityToken!,
      client_id: process.env.ROBLOX_IDENTITY_CLIENT_ID!,
      client_secret: process.env.ROBLOX_IDENTITY_SECRET!,
    });
  
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    
    if (!tokenResponse.ok) return
    const tokenData = await tokenResponse.json()

    await prisma.user.update({
        where:  {Id:session.user.Id},
        data: {identityToken:tokenData.refresh_token}
    })

    // get information
    const userUrl = 'https://apis.roblox.com/oauth/v1/userinfo'
    const userDataResponse = await fetch(userUrl, {
        headers: { 
            'Authorization': `Bearer ${tokenData.access_token}`
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