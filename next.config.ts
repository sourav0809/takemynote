import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/** The only places the browser may send data to: us and the three AI providers. */
const AI_PROVIDER_ORIGINS = [
  "https://api.openai.com",
  "https://generativelanguage.googleapis.com",
  "https://api.anthropic.com",
];

/**
 * Content-Security-Policy. `connect-src` is the important part: even if a
 * script were injected, it could not send a saved AI key anywhere else.
 * Images may come from any https link, because notes can embed them.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${AI_PROVIDER_ORIGINS.join(" ")}${isDev ? " ws: http://localhost:*" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  images: {
    // 86 keeps the pale skies in the landing images free of banding.
    qualities: [75, 86],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
