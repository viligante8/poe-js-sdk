import { NextRequest, NextResponse } from 'next/server';
import { OAuthHelper } from 'poe-js-sdk';

export async function POST(req: NextRequest) {
  const refresh = req.cookies.get('poe_refresh_token')?.value;
  if (!refresh) return NextResponse.json({ error: 'no refresh token' }, { status: 401 });

  const clientId = process.env.OAUTH_CLIENT_ID!;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET!;

  try {
    const token = await OAuthHelper.refreshToken(
      { clientId, clientSecret, redirectUri: '', scopes: [] },
      refresh
    );
    const res = NextResponse.json({ ok: true });
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
        maxAge: 30 * 24 * 60 * 60,
      });
    }
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'refresh failed' }, { status: 400 });
  }
}

