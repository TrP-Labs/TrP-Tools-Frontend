import prisma from '@/prisma/prisma';

const GetSession = async (token : string) => {
  const opID = (Math.floor(Math.random() * 50)).toString() 
    const session = await prisma.session.findUnique({
        where: {
          token: token
        },
        include: {
          user: true,
        },
    });

    if (!session?.user) return null

    // check if it is valid
    if (session.expiresAt <= new Date()) {
        await prisma.session.delete({
            where : {
                token : token
            }
        })
        return null
    }

    // check if the active token exists and works
    if (session.user.activeIdentityToken) {
      const tokenUrl = 'https://apis.roblox.com/oauth/v1/token/introspect';
      const params = new URLSearchParams({
        token: session.user.activeIdentityToken!,
        client_id: process.env.ROBLOX_IDENTITY_CLIENT_ID!,
        client_secret: process.env.ROBLOX_IDENTITY_SECRET!,
      });

      const introspectionResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      const introspectionData = await introspectionResponse.json()
      if (introspectionData?.active) {
        console.log("no refresh needed! :3")
        return {
          user : session.user,
          activeToken : session.user.activeIdentityToken
      }
      }
    }

    // reauthorize token
    console.log("refresh required >:3")
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

    
    if (!tokenResponse.ok) {return}
    const tokenData = await tokenResponse.json()

    await prisma.user.update({
        where:  {Id:session.user.Id},
        data: {identityToken:tokenData.refresh_token, activeIdentityToken:tokenData.access_token}
    })

    return {
        user : session.user,
        activeToken : tokenData.access_token
    }
}

export {GetSession}