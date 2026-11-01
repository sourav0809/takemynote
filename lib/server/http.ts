import "server-only";

import type { z } from "zod";

import { isAccountsEnabled } from "@/lib/server/env";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { getCurrentUser, type CurrentUser } from "@/lib/server/session";
import type { ApiErrorBody } from "@/lib/sync/schemas";

export type ErrorCode =
  | "accounts_disabled"
  | "unauthorized"
  | "not_found"
  | "invalid_request"
  | "too_large"
  | "rate_limited"
  | "server_error";

const STATUS: Record<ErrorCode, number> = {
  accounts_disabled: 404,
  unauthorized: 401,
  not_found: 404,
  invalid_request: 400,
  too_large: 413,
  rate_limited: 429,
  server_error: 500,
};

/** Thrown inside route handlers; turned into a JSON error by `handle`. */
export class ApiError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string
  ) {
    super(message);
  }
}

export function json<T>(body: T, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function errorResponse(code: ErrorCode, message: string): Response {
  return json<ApiErrorBody>({ error: { code, message } }, STATUS[code]);
}

/** Largest request body we read, a little above the 1 MB note limit. */
const MAX_BODY_BYTES = 1_100_000;

/** Reads and validates a JSON body. */
export async function readBody<S extends z.ZodType>(request: Request, schema: S): Promise<z.infer<S>> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) throw new ApiError("too_large", "This is too large to sync.");
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new ApiError("too_large", "This is too large to sync.");

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ApiError("invalid_request", "The request body must be JSON.");
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError("invalid_request", parsed.error.issues[0]?.message ?? "Invalid request.");
  }
  return parsed.data;
}

/** Per-user write limit for the sync API. */
const WRITES_PER_MINUTE = 120;

interface HandleOptions {
  /** Counts toward the per-user write limit. */
  isWrite?: boolean;
}

/** Checks accounts are enabled and turns errors into JSON responses. */
async function handle(run: () => Promise<Response>): Promise<Response> {
  try {
    if (!isAccountsEnabled()) throw new ApiError("accounts_disabled", "Accounts are not available.");
    return await run();
  } catch (error) {
    if (error instanceof ApiError) return errorResponse(error.code, error.message);
    console.error("[api]", error instanceof Error ? error.message : error);
    return errorResponse("server_error", "Something went wrong.");
  }
}

/**
 * Wraps a route handler: checks accounts are enabled, requires a signed-in
 * user, applies the write rate limit and turns errors into JSON responses.
 */
export function withUser(
  run: (user: CurrentUser) => Promise<Response>,
  { isWrite = false }: HandleOptions = {}
): Promise<Response> {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) throw new ApiError("unauthorized", "Sign in to sync.");
    if (isWrite && !(await checkRateLimit(`write:${user.id}`, WRITES_PER_MINUTE, 60))) {
      throw new ApiError("rate_limited", "Too many changes at once. Trying again shortly.");
    }
    return run(user);
  });
}

/** Like `withUser`, for routes anyone can call (guest sharing). Callers apply their own limits. */
export function withoutUser(run: () => Promise<Response>): Promise<Response> {
  return handle(run);
}

/** Throws `rate_limited` once `key` has been used `limit` times in the window. */
export async function enforceRateLimit(key: string, limit: number, windowSeconds: number): Promise<void> {
  if (!(await checkRateLimit(key, limit, windowSeconds))) {
    throw new ApiError("rate_limited", "Too many requests. Try again in a moment.");
  }
}
