import type { NextConfig } from "next";
import path from "path";

// ─────────────────────────────────────────────────────────────
// Security headers applied to every response
// ─────────────────────────────────────────────────────────────
const securityHeaders = [
  // Prevent clickjacking
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },

  // Prevent MIME-type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },

  // Referrer privacy
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },

  // Disable browser features we don't use
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },

  // Force HTTPS in production
  ...(process.env.NODE_ENV === "production"
    ? [
      {
        key: "Strict-Transport-Security",
        value:
          "max-age=31536000; includeSubDomains; preload",
      },
    ]
    : []),

  // ─────────────────────────────────────────────────────────
  // Content Security Policy
  // ─────────────────────────────────────────────────────────
  {
    key: "Content-Security-Policy",
    value: [
      // Default
      "default-src 'self'",

      // Scripts
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",

      // Styles
      // accounts.google.com serves the Google sign-in button's stylesheet.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",

      // Fonts
      "font-src 'self' https://fonts.gstatic.com",

      // Images
      "img-src 'self' data: blob: https:",

      // API / network requests
      "connect-src 'self' https://accounts.google.com https://*.resend.com",

      // ───────────────────────────────────────────────────────
      // IFRAME SOURCES
      // ───────────────────────────────────────────────────────
      //
      // Intellia360 itself
      // Google Accounts
      // Grade 1–12 Vercel lesson/architecture apps
      // YouTube
      // YouTube no-cookie
      // Google Drive
      //
      // Keep in step with EMBEDDABLE_HOSTS in
      // src/lib/content/lesson-modules.ts — the Editor rejects
      // architecture/video links on any site not listed here.
      //
      "frame-src 'self' https://accounts.google.com https://*.vercel.app https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://drive.google.com",

      // Prevent plugins
      "object-src 'none'",

      // Restrict base URL
      "base-uri 'self'",

      // Restrict form submissions
      "form-action 'self'",

      // Upgrade insecure requests
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

// ─────────────────────────────────────────────────────────────
// Next.js configuration
// ─────────────────────────────────────────────────────────────
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },

  // ───────────────────────────────────────────────────────────
  // CURRICULUM FILES
  // ───────────────────────────────────────────────────────────
  // These routes read src/data/grades with fs at request time
  // (src/lib/content), not through imports, so make sure the
  // JSON ships with their server functions.
  outputFileTracingIncludes: {
    "/api/editor/**": ["./src/data/grades/**/*.json"],
    "/api/student/lesson-resources": ["./src/data/grades/**/*.json"],
    "/api/student/videos": ["./src/data/grades/**/*.json"],
    "/api/student/edunotes": ["./src/data/grades/**/*.json"],
    "/api/student/edunotes/content": ["./src/data/grades/**/*.json"],
  },

  // ───────────────────────────────────────────────────────────
  // SECURITY HEADERS
  // ───────────────────────────────────────────────────────────
  async headers() {
    return [
      // =======================================================
      // EDUNOTES CONTENT
      // =======================================================
      {
        source: "/api/student/edunotes/content",

        headers: [
          ...securityHeaders.filter(
            (header) =>
              header.key !== "X-Frame-Options"
          ),

          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },

      // =======================================================
      // ALL OTHER ROUTES
      // =======================================================
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // ───────────────────────────────────────────────────────────
  // HTTP → HTTPS REDIRECT IN PRODUCTION
  // ───────────────────────────────────────────────────────────
  async redirects() {
    // No redirect during local development
    if (process.env.NODE_ENV !== "production") {
      return [];
    }

    const appHost = (
      process.env.NEXT_PUBLIC_APP_URL ?? ""
    )
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    // If app URL is not configured,
    // don't create a redirect.
    if (!appHost) {
      return [];
    }

    return [
      {
        source: "/:path*",

        has: [
          {
            type: "header",
            key: "x-forwarded-proto",
            value: "http",
          },
        ],

        destination: `https://${appHost}/:path*`,

        permanent: true,
      },
    ];
  },
};

export default nextConfig;