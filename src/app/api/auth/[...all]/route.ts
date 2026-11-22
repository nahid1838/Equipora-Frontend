import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(async (request: Request) => {
  let auth;
  try {
    auth = await getAuth();
  } catch {
    return Response.json(
      { message: "Authentication is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
  return auth.handler(request);
});
