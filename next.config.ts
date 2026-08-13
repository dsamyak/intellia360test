import type { NextConfig } from "next";
import path from "path";

// ── Security headers applied to every response ────────────────────────────────
const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options",        value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer privacy
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  // Disable legacy features we don't use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Force HTTPS in production (1 year, include subdomains)
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]
    : []),
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://accounts.google.com https://*.resend.com",
      "frame-src https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Redirect HTTP → HTTPS in production.
  // Uses a backtick template literal so the env var actually interpolates.
  async redirects() {
    if (process.env.NODE_ENV !== "production") return [];

    const appHost = (process.env.NEXT_PUBLIC_APP_URL ?? "")
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    if (!appHost) return [];

    return [
      {
        source:      "/:path*",
        has:         [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: `https://${appHost}/:path*`,
        permanent:   true,
      },
    ];
  },
};

export default nextConfig;
