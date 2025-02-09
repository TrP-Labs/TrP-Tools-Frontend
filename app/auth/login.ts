"use server"
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import crypto from 'crypto';

function generateCodeVerifier() {
  return crypto.randomBytes(64).toString('hex');
}

function generateCodeChallenge(verifier: string) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

const Login = async () => {
  const retrievedCookies = await cookies()
  const clientId = process.env.ROBLOX_IDENTITY_CLIENT_ID!;
  const baseUrl = process.env.BASE_URL!;
  const redirectUri = `${baseUrl}/auth/callback`;
  const scopes = ['openid', 'profile', 'group:read'].join(' ');

  // Generate PKCE values and state
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Build the Roblox OAuth URL with PKCE and state
  const oauthUrl = new URL('https://apis.roblox.com/oauth/v1/authorize');
  oauthUrl.searchParams.set('client_id', clientId);
  oauthUrl.searchParams.set('redirect_uri', redirectUri);
  oauthUrl.searchParams.set('response_type', 'code');
  oauthUrl.searchParams.set('scope', scopes);
  oauthUrl.searchParams.set('code_challenge', codeChallenge);
  oauthUrl.searchParams.set('code_challenge_method', 'S256');
  oauthUrl.searchParams.set('state', state);

  // Set cookies for PKCE verifier and state
  retrievedCookies.set('pkce_code_verifier', codeVerifier, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax'
  });
  retrievedCookies.set('oauth_state', state, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax'
  });

  redirect(oauthUrl.toString())
}

export default Login