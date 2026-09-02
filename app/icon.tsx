import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0069a8",
          borderRadius: 9,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M4.5 3H11L15 7V17H4.5V3Z"
            fill="#ffffff"
            fillOpacity={0.18}
            stroke="#ffffff"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <path
            d="M11 3V7H15"
            stroke="#ffffff"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <path d="M7 10.5H12.5" stroke="#ffffff" strokeWidth={1.3} strokeLinecap="round" />
          <path d="M7 13H12.5" stroke="#ffffff" strokeWidth={1.3} strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
