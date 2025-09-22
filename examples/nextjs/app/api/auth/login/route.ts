import { NextRequest, NextResponse } from 'next/server';
import { OAuthHelper } from 'poe-js-sdk';

// Helper: generate PKCE with Web Crypto (browser-safe) or fallback
async function generatePKCE() {
  const toBase64Url = (buf: ArrayBuffer) =>
    Buffer.from(new Uint8Array(buf))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const rnd = new Uint8Array(32);
  crypto.getRandomValues(rnd);
  const codeVerifier = toBase64Url(rnd.buffer);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  const codeChallenge = toBase64Url(digest);
  return { codeVerifier, codeChallenge };
}

export async function GET(req: NextRequest) {
  const clientId = process.env.OAUTH_CLIENT_ID!;
  const redirectUri = process.env.OAUTH_REDIRECT_URI!;
  const scopes = ['account:profile'];
  const state = crypto.randomUUID();
  const pkce = await generatePKCE();

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

