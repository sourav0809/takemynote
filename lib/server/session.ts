import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { getAuth } from "@/lib/server/auth";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
}

/**
 * The signed-in user for this request, or null. Cached per request. This is
 * the only way the Data Access Layer learns who is asking: user ids never come
 * from request bodies or URLs.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const auth = getAuth();
  if (!auth) return null;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, email, name, image } = session.user;
  return { id, email, name, image: image ?? null };
});
