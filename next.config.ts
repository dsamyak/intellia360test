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
  // Set only in production to avoid breaking local http://localhost dev flow.
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]
    : []),
  // Content Security Policy
  // Adjust 'script-src' and 'connect-src' as you add third-party integrations.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline scripts (nonces preferred in prod, unsafe-inline for now)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      // API calls and WebSocket HMR
      "connect-src 'self' https://accounts.google.com https://*.resend.com",
      // Google OAuth popup / iframe
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

  // Apply security headers to every page and API route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Redirect HTTP → HTTPS in production at the Next.js layer
  // (Vercel / your CDN should handle this too, belt-and-suspenders)
  async redirects() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source:      "/:path*",
        has:         [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://${process.env.NEXT_PUBLIC_APP_URL?.replace('https://','')}/:path*",
        permanent:   true,
      },
    ];
  },
};

export default nextConfig;
