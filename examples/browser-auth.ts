// Browser-only example demonstrating SPA auth helper usage.
// This file is for reference and should be bundled in a web app.

import { createBrowserAuth, Storages } from 'poe-js-sdk/browser-auth';
import { PoEApiClient } from 'poe-js-sdk';

// Choose storage (default is sessionStorage). Here we persist across sessions.
const storage = typeof localStorage !== 'undefined'
  ? new Storages.Web(localStorage, 'poe_auth_tokens')
  : undefined;

const auth = createBrowserAuth({
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:5173/callback',
  scopes: ['account:profile']
}, storage);

// Wire up a login button
export function wireLoginButton(button: HTMLElement) {
  button.addEventListener('click', () => auth.login());
}

export async function onCallbackPage() {
  if (location.search.includes('code=')) {
    await auth.handleRedirectCallback();
  }
}

export async function getProfile() {
  const client = new PoEApiClient({
    userAgent: 'OAuth myapp/1.0.0 (contact: dev@example.com)',
    accessToken: await auth.getAccessToken(),
  });
  return client.getProfile();
}

// Optional: react to token changes (update UI)
auth.setOnTokenChange((t) => {
  // eslint-disable-next-line no-console
  console.log('token changed', !!t);
});
