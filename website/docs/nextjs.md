---
id: nextjs
title: Next.js Integration
---

This guide shows how to use the SDK with Next.js (App Router), including a secure OAuth flow with httpOnly cookies and API routes. A working example lives in `examples/nextjs/` in the repo.

## Goals

- Server-only storage of refresh/access tokens (httpOnly cookies)
- OAuth Authorization Code + PKCE flow
- Typed calls from server routes and client components

## Folder Layout (App Router)

```
app/
  api/
    auth/
      login/route.ts        → starts PKCE + redirect
      callback/route.ts     → handles callback, stores cookies
      refresh/route.ts      → refreshes access token
    profile/route.ts        → calls PoE API using access token
  page.tsx                  → example client component
```

## Environment

```
OAUTH_CLIENT_ID=...             # from PoE developer portal
OAUTH_CLIENT_SECRET=...         # optional for confidential clients
OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback
USER_AGENT="OAuth myapp/1.0.0 (contact: you@example.com)"
```

## Login Route

```ts title="app/api/auth/login/route.ts"
import { NextResponse } from 'next/server';
import { OAuthHelper } from 'poe-js-sdk';

export async function GET() {
  const state = crypto.randomUUID();
  const pkce = await OAuthHelper.generatePKCE();

  const url = OAuthHelper.buildAuthUrl(
    {
      clientId: process.env.OAUTH_CLIENT_ID!,
      redirectUri: process.env.OAUTH_REDIRECT_URI!,
      scopes: ['account:profile'], // recommend account:* only in user login
    },
    state,
    pkce,
  );

  const res = NextResponse.redirect(url);
  res.cookies.set('oauth_state', state, { httpOnly: true, sameSite: 'lax' });
  res.cookies.set('pkce_verifier', pkce.codeVerifier, { httpOnly: true, sameSite: 'lax' });
  return res;
}
```

## Callback Route

```ts title="app/api/auth/callback/route.ts"
import { NextResponse } from 'next/server';
import { OAuthHelper } from 'poe-js-sdk';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  const cookies = (await import('next/headers')).cookies();
  const state = cookies.get('oauth_state')?.value;
  const verifier = cookies.get('pkce_verifier')?.value;

  if (!code || !verifier || state !== returnedState) {
    return new NextResponse('Invalid OAuth state or missing code', { status: 400 });
  }

  const tokens = await OAuthHelper.exchangeCodeForToken(
    {
      clientId: process.env.OAUTH_CLIENT_ID!,
      clientSecret: process.env.OAUTH_CLIENT_SECRET, // confidential only; token endpoint uses client_secret_post
      redirectUri: process.env.OAUTH_REDIRECT_URI!,
      scopes: ['account:profile'], // do not request service:* here
      userAgent: process.env.USER_AGENT!, // set UA on token requests (server only)
    },
    code,
    verifier,
  );

  const res = NextResponse.redirect(new URL('/', req.url));
  res.cookies.set('access_token', tokens.access_token, { httpOnly: true, sameSite: 'lax' });
  if (tokens.refresh_token) {
    res.cookies.set('refresh_token', tokens.refresh_token, { httpOnly: true, sameSite: 'lax' });
  }
  res.cookies.delete('oauth_state');
  res.cookies.delete('pkce_verifier');
  return res;
}
```

## Refresh Route

```ts title="app/api/auth/refresh/route.ts"
import { NextResponse } from 'next/server';
import { OAuthHelper } from 'poe-js-sdk';

export async function POST() {
  const cookies = (await import('next/headers')).cookies();
  const refreshToken = cookies.get('refresh_token')?.value;
  if (!refreshToken) return new NextResponse('Missing refresh token', { status: 401 });

  const tokens = await OAuthHelper.refreshToken({
    clientId: process.env.OAUTH_CLIENT_ID!,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    userAgent: process.env.USER_AGENT!,
  }, refreshToken);

  const res = NextResponse.json({ ok: true });
  res.cookies.set('access_token', tokens.access_token, { httpOnly: true, sameSite: 'lax' });
  if (tokens.refresh_token) {
    res.cookies.set('refresh_token', tokens.refresh_token, { httpOnly: true, sameSite: 'lax' });
  }
  return res;
}
```

## Using the API from a Route

```ts title="app/api/profile/route.ts"
import { NextResponse } from 'next/server';
import { PoEApiClient } from 'poe-js-sdk';

export async function GET() {
  const cookies = (await import('next/headers')).cookies();
  const token = cookies.get('access_token')?.value;
  if (!token) return new NextResponse('Unauthorized', { status: 401 });

  const client = new PoEApiClient({
    accessToken: token,
    userAgent: process.env.USER_AGENT!,
  });
  const profile = await client.getProfile();
  return NextResponse.json(profile);
}
```

## Client Page Linking to Login

```tsx title="app/page.tsx"
export default function Page() {
  return (
    <main>
      <a href="/api/auth/login">Login with PoE</a>
    </main>
  );
}
```

See the full working version in `examples/nextjs/` for additional cookie flags, error handling, and production hardening.
