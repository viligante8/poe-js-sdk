import { NextRequest, NextResponse } from 'next/server';
import { OAuthHelper } from 'poe-js-sdk';

export async function GET(req: NextRequest) {
  const clientId = process.env.OAUTH_CLIENT_ID!;
  const redirectUri = process.env.OAUTH_REDIRECT_URI!;
  const scopes = ['account:profile'];
  const state = crypto.randomUUID();
  const pkce = await OAuthHelper.generatePKCE();

  const url = OAuthHelper.buildAuthUrl(
    { clientId, redirectUri, scopes },
    state,
    pkce
  );

  // Set transient cookies to validate callback
  const res = NextResponse.redirect(url);
  res.cookies.set('poe_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 5 * 60,
  });
  res.cookies.set('poe_code_verifier', pkce.codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 5 * 60,
  });
  return res;
}
