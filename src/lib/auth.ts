import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { validateAddress, validatePhoneNumber } from "./profile-fields";

function optionalProfileField(validate: (value: unknown) => string | undefined) {
  return {
    type: "string" as const,
    required: false as const,
    validator: {
      input: {
        "~standard": {
          version: 1 as const,
          vendor: "equipora",
          validate(value: unknown) {
            const message = validate(value);
            return message ? { issues: [{ message }] } : { value: (value as string).trim() };
          },
        },
      },
    },
  };
}

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("equiporadb");

const createAuth = () => betterAuth({
  // Used for auth endpoints and as the JWT issuer/audience.
  // The Express backend checks these exact values.
  baseURL: process.env.BETTER_AUTH_URL as string,
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      // Every user gets a role; new users (including Google sign-ups)
      // default to "customer".
      // input: false means users can never send their own role during signup.
      role: {
        type: "string",
        defaultValue: "customer",
        input: false,
      },
      phoneNumber: optionalProfileField(validatePhoneNumber),
      address: optionalProfileField(validateAddress),
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    jwt({
      jwt: {
        // Claims the Express backend can trust after verifying the signature
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          // Users created before the role field existed have no role
          role: typeof user.role === "string" ? user.role : "customer",
        }),
      },
    }),
  ],
});

type Auth = ReturnType<typeof createAuth>;
let auth: Auth | undefined;

export async function getAuth(): Promise<Auth> {
  try {
    // The driver shares concurrent connect calls and can reconnect a closed topology.
    await client.connect();
  } catch (error) {
    // Log the failure category without connection strings or credentials.
    console.error("Auth database connection failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    throw new Error("Authentication is temporarily unavailable.");
  }

  // Initialize the adapter only after connecting, since it can start index operations.
  return auth ??= createAuth();
}
