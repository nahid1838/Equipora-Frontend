import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
// Type-only import: this does NOT pull server code into the browser bundle
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  // Better Auth is served on the same origin as the Next.js client.
  plugins: [
    // Adds authClient.token() so we can get a JWT for the Express API
    jwtClient(),
    // Makes session.user.role correctly typed on the client
    inferAdditionalFields<typeof auth>(),
  ],
});

// Export the auth methods from the SAME client instance
export const { signIn, signUp, useSession } = authClient;
