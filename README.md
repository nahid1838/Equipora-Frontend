# Equipora

Equipora is an equipment rental marketplace. Customers can browse equipment, save favorites, book rentals through Stripe Checkout, and apply to become owners. Owners manage listings and rentals. Admins review equipment and owner applications and manage users.

The frontend uses Next.js App Router, React, Tailwind CSS, Better Auth, MongoDB, and Framer Motion. The Express backend is deployed separately.

## Local setup

1. Use Node.js 24 and run `npm ci`.
2. Copy `.env.example` to `.env.local` and replace placeholders with local values. Keep the real file out of Git.
3. Start the backend, then run `npm run dev`. Open `http://localhost:3000`.
4. Use `npx --no-install tsc --noEmit --incremental false` and `npm run lint` to check changes.

| Variable | Required | Sensitive | Local and production use |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | No | Browser-accessible backend origin. Use `http://localhost:5000` locally and the deployed backend HTTPS origin on Vercel. |
| `BETTER_AUTH_URL` | Yes | No | Canonical Next.js origin. Use `http://localhost:3000` locally or the frontend HTTPS origin on Vercel. Set the identical value on the backend. |
| `BETTER_AUTH_SECRET` | Yes | Yes | Server-only Better Auth secret. Use a strong random value at least 32 characters long and separate secrets per environment. |
| `MONGODB_URI` | Yes | Yes | Server-only MongoDB connection URI. Both projects use `equiporadb` on the same MongoDB cluster. Use isolated data for local QA. |
| `GOOGLE_CLIENT_ID` | For Google sign-in | No | Web OAuth client ID from Google Cloud Console. Set on the frontend project with the secret. |
| `GOOGLE_CLIENT_SECRET` | For Google sign-in | Yes | Server-only Google OAuth client secret. |
| `GITHUB_CLIENT_ID` | For GitHub sign-in | No | OAuth application client ID. Set with its secret if using the GitHub button. |
| `GITHUB_CLIENT_SECRET` | For GitHub sign-in | Yes | Server-only GitHub OAuth application secret. |

## Deploy manually on Vercel

1. Deploy the Express backend first using its README. Verify `/api/health` and copy the backend origin.
2. Import the frontend repository into a separate Vercel project. Select the repository root (`.`), the Next.js preset, and Node.js 24.x. Use the default install and output settings and the `npm run build` script. No custom route rewrites are required.
3. Add the frontend variables above and deploy from the dashboard. Set `NEXT_PUBLIC_API_URL` to the deployed backend origin. Changing this build-time variable requires redeploying the frontend.
4. Check that the backend's `CLIENT_URL` and `BETTER_AUTH_URL` exactly match the canonical frontend origin. Redeploy after updating them. Verify the homepage, Browse, protected equipment detail navigation, sign-in, and dashboards. The production URLs are assigned when you create the Vercel projects.

### Better Auth and Google OAuth

The browser calls same-origin Better Auth routes under `/api/auth`. Better Auth trusts its configured base origin by default, so a single canonical frontend origin needs no additional trusted-origins variable. Use that same host for testing rather than interchangeable preview URLs. Use the identical `BETTER_AUTH_URL` on both projects, with no path or trailing slash, so the issuer and audience match exactly. The frontend issues JWTs at `/api/auth/token`; the backend verifies them using the frontend's public `/api/auth/jwks`. [Better Auth options](https://better-auth.com/docs/reference/options)

In Google Cloud Console, create or edit a **Web application** OAuth client and configure its consent screen and test users if it is in Testing:

- **Authorized JavaScript origin:** `https://<frontend-host>`.
- **Authorized redirect URI:** `https://<frontend-host>/api/auth/callback/google`.
- If sharing this OAuth client with local development, add `http://localhost:3000` and `http://localhost:3000/api/auth/callback/google` respectively. You can also use a separate OAuth client for development.
- Set the Google credentials on the frontend Vercel project and redeploy. If enabling GitHub, its OAuth application callback is `https://<frontend-host>/api/auth/callback/github`.

These callback paths use Better Auth's default provider callback route, mounted by the Next.js auth route. The backend origin is used only for the Equipora API. [Better Auth OAuth](https://better-auth.com/docs/concepts/oauth) · [Google web OAuth setup](https://developers.google.com/identity/protocols/oauth2/web-server)

For Owner Application QA, submit as a customer, review as an admin using a different browser session, and return to the customer's **Check status** action or reload the dashboard. Verify the owner dashboard and a protected owner API operation. Check that a rejected user still sees the Customer Dashboard and can reapply.

## Payment QA

Configure the backend Stripe webhook before testing hosted Checkout. Start with Stripe test mode, test accounts, and isolated data. Verify payment success, cancellation, missed-webhook recovery, and refund status. The frontend never treats a return URL as evidence of a successful charge.
