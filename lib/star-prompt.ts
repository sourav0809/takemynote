/**
 * When to ask for a GitHub star: once someone has used the app for a day and
 * come back, never during their first visit, and never more than a few times.
 * Kept on this device only (not in backups), so a restore doesn't trigger it.
 */

const STORAGE_KEY = "takemynote:star-prompt";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Rules, in one place. */
export const STAR_PROMPT_RULES = {
  /** Time since the first visit before we ask. */
  minAgeMs: DAY_MS,
  /** Different days the app was opened: they came back, so they likely like it. */
  minActiveDays: 2,
  /** "Maybe later" asks again after this long… */
  snoozeMs: 7 * DAY_MS,
  /** …but only this many times. */
  maxSnoozes: 2,
} as const;

type PromptState = "pending" | "snoozed" | "done";

interface StarPromptRecord {
  firstSeenAt: number;
  /** Local dates (YYYY-MM-DD) the app was opened; only the latest few are kept. */
  activeDays: string[];
  state: PromptState;
  snoozeCount: number;
  nextAskAt: number;
}

const MAX_TRACKED_DAYS = 14;

function localDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function read(): StarPromptRecord | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StarPromptRecord) : null;
  } catch {
    return null;
  }
}

function write(record: StarPromptRecord): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

/** Notes today's visit (and the first visit ever). Returns the updated record. */
export function recordVisit(now = Date.now()): StarPromptRecord {
  const existing = read();
  const record = existing ?? { firstSeenAt: now, activeDays: [], state: "pending", snoozeCount: 0, nextAskAt: 0 };
  const today = localDate(now);
  if (!existing || !record.activeDays.includes(today)) {
    record.activeDays = [...new Set([...record.activeDays, today])].slice(-MAX_TRACKED_DAYS);
    write(record);
  }
  return record;
}

export function shouldAskForStar(record: StarPromptRecord, now = Date.now()): boolean {
  if (record.state === "done") return false;
  if (record.state === "snoozed") return now >= record.nextAskAt;
  return (
    now - record.firstSeenAt >= STAR_PROMPT_RULES.minAgeMs &&
    record.activeDays.length >= STAR_PROMPT_RULES.minActiveDays
  );
}

/** How many days they've written with the app, for a warm line in the dialog. */
export function countActiveDays(): number {
  return read()?.activeDays.length ?? 0;
}

/** Starred, or said no: never ask again. */
export function finishStarPrompt(): void {
  const record = read();
  if (record) write({ ...record, state: "done" });
}

/** "Maybe later": ask again in a week, a limited number of times. */
export function snoozeStarPrompt(now = Date.now()): void {
  const record = read();
  if (!record) return;
  const snoozeCount = record.snoozeCount + 1;
  write({
    ...record,
    snoozeCount,
    state: snoozeCount > STAR_PROMPT_RULES.maxSnoozes ? "done" : "snoozed",
    nextAskAt: now + STAR_PROMPT_RULES.snoozeMs,
  });
}
