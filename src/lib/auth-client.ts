import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
// Type-only import: this does NOT pull server code into the browser bundle
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL as string,
  plugins: [
    // Adds authClient.token() so we can get a JWT for the Express API
    jwtClient(),
    // Makes session.user.role correctly typed on the client
    inferAdditionalFields<typeof auth>(),
  ],
});

// Export the auth methods from the SAME client instance
export const { signIn, signUp, useSession } = authClient;
