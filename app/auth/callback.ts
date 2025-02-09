'use server';

import { cookies } from 'next/headers';
import prisma from '@/prisma/prisma';
import crypto from 'crypto';

const  CallbackRoute = async (code: string, state: string): Promise<boolean> => {
  const retrievedCookies = await cookies();
  const codeVerifier = retrievedCookies.get('pkce_code_verifier')?.value;
  const savedState = retrievedCookies.get('oauth_state')?.value;

  if (!codeVerifier || !savedState || savedState !== state) return false;

  const tokenUrl = 'https://apis.roblox.com/oauth/v1/token';
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${process.env.BASE_URL}/callback`,
    client_id: process.env.ROBLOX_IDENTITY_CLIENT_ID!,
    client_secret: process.env.ROBLOX_IDENTITY_SECRET!,
    code_verifier: codeVerifier,
  });

  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!tokenResponse.ok) return false

  const tokenData = await tokenResponse.json();
  const { refresh_token, access_token } = tokenData;

  const userUrl = 'https://apis.roblox.com/oauth/v1/userinfo'
  const userDataResponse = await fetch(userUrl, {
      headers: { 
          'Authorization': `Bearer ${access_token}`
      }
  });

  if (!userDataResponse.ok) return false
  const userData = await userDataResponse.json()

  await prisma.user.upsert({
    where: { Id: userData.sub },
    update: { identityToken: refresh_token },
    create: { Id: userData.sub, identityToken: refresh_token },
  });

  const sessionToken = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week

  await prisma.session.create({
    data: {
      token: sessionToken,
      userAgent: '',
      userId: userData.sub,
      lastUsed: new Date(),
      expiresAt,
    },
  });

  retrievedCookies.set('session', sessionToken, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
  });

  retrievedCookies.delete('pkce_code_verifier');
  retrievedCookies.delete('oauth_state');

  return true;
}

export default CallbackRoute