import { toNextJsHandler } from "better-auth/next-js";

import { getAuth } from "@/lib/server/auth";

/** Better Auth: sign in with Google, callbacks, session, sign out, delete account. */
function handler(request: Request): Promise<Response> | Response {
  const auth = getAuth();
  if (!auth) return new Response("Not found", { status: 404 });
  const { GET, POST } = toNextJsHandler(auth);
  return request.method === "POST" ? POST(request) : GET(request);
}

export { handler as GET, handler as POST };
