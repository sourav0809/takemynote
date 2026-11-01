import { ImageResponse } from "next/og";

import { APP_NAME } from "@/lib/constants";
import { getNoteDisplayTitle, getNoteExcerpt } from "@/lib/note-utils";
import { getSharedNote } from "@/lib/server/shared-note";
import type { NoteContent } from "@/types/note";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `A note shared with ${APP_NAME}`;

/** Link preview for a shared note: its title and first lines on the brand's calm background. */
export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const shared = await getSharedNote((await params).token);
  const title = shared ? getNoteDisplayTitle(shared.title) : "Note not available";
  const excerpt = shared ? getNoteExcerpt(shared.content as unknown as NoteContent) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(160deg, #f4f8fc 0%, #e8f0f8 55%, #dbe8f4 100%)",
          color: "#0a0a0a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700, color: "#1d6fb8" }}>
          <div style={{ width: 34, height: 40, borderRadius: 6, background: "#1d6fb8", display: "flex" }} />
          {APP_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2, maxWidth: 1000 }}>
            {title.length > 70 ? `${title.slice(0, 70)}…` : title}
          </div>
          {excerpt && (
            <div style={{ fontSize: 30, lineHeight: 1.4, color: "#525252", maxWidth: 980 }}>
              {excerpt.length > 140 ? `${excerpt.slice(0, 140)}…` : excerpt}
            </div>
          )}
        </div>
        <div style={{ fontSize: 24, color: "#737373" }}>Shared note · read-only</div>
      </div>
    ),
    size
  );
}
