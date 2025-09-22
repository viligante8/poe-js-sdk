# Next.js Auth Example (App Router)

End-to-end OAuth flow using Next.js route handlers with secure httpOnly cookies.

What it shows
- Login endpoint that redirects to PoE OAuth with PKCE
- Callback endpoint that exchanges the code and sets cookies
- Using the access token server-side to call the API securely

Environment
- `OAUTH_CLIENT_ID` (required)
- `OAUTH_CLIENT_SECRET` (required for confidential client)
- `OAUTH_REDIRECT_URI` (e.g. `http://localhost:3000/api/auth/callback`)

Security notes
- Tokens are stored in httpOnly, `Secure`, `SameSite=Lax` cookies
- Refresh happens server-side only via `/api/auth/refresh`
- No secrets in the browser

Routes
- `app/api/auth/login/route.ts` – starts the flow
- `app/api/auth/callback/route.ts` – handles the provider redirect
- `app/api/profile/route.ts` – example of calling the PoE API with the stored token
 - `app/api/auth/refresh/route.ts` – refreshes access tokens using the refresh token
