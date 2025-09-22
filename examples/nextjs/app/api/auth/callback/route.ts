import { NextRequest, NextResponse } from 'next/server';
import { OAuthHelper } from 'poe-js-sdk';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const err = url.searchParams.get('error');

  if (err) return NextResponse.json({ error: err }, { status: 400 });
  if (!code || !state) return NextResponse.json({ error: 'missing code/state' }, { status: 400 });

  const stateCookie = req.cookies.get('poe_state')?.value;
  const verifier = req.cookies.get('poe_code_verifier')?.value;
  if (!stateCookie || !verifier || stateCookie !== state) {
    return NextResponse.json({ error: 'state mismatch' }, { status: 400 });
  }

  const clientId = process.env.OAUTH_CLIENT_ID!;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET!; // confidential client
  const redirectUri = process.env.OAUTH_REDIRECT_URI!;

  const token = await OAuthHelper.exchangeCodeForToken(
    { clientId, clientSecret, redirectUri, scopes: ['account:profile'] },
    code,
    verifier
  );

  const res = NextResponse.redirect('/');
  // Clear transient cookies
  res.cookies.set('poe_state', '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set('poe_code_verifier', '', { httpOnly: true, path: '/', maxAge: 0 });

  // Store tokens (httpOnly cookies). In production use encrypted storage.
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + Math.max(0, token.expires_in - 30);
  res.cookies.set('poe_access_token', token.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: token.expires_in,
  });
  if (token.refresh_token) {
    res.cookies.set('poe_refresh_token', token.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      // keep refresh short as well or store server-side
      maxAge: 30 * 24 * 60 * 60,
    });
  }
  res.cookies.set('poe_access_expires', String(expiresAt), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: token.expires_in,
  });
  return res;
}

