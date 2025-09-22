import { NextRequest, NextResponse } from 'next/server';
import { PoEApiClient } from 'poe-js-sdk';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('poe_access_token')?.value;
  if (!access) return NextResponse.json({ error: 'not authenticated' }, { status: 401 });

  const client = new PoEApiClient({
    userAgent: 'OAuth nextjs-example/1.0.0 (contact: you@example.com)',
    accessToken: access,
  });

  try {
    const profile = await client.getProfile();
    return NextResponse.json(profile);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'api error' }, { status: 500 });
  }
}

