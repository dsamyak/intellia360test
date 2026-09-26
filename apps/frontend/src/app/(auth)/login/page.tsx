"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { postLoginPath } from "@intellia360/shared/auth/roles";
import type { AuthUser } from "@intellia360/shared/types/auth";
import { apiFetch } from "@/lib/api";

// ─── Page ─────────────────────────────────────────────────────────────────────
// Login is email + password only. Role is read from the DB; the UI
// selector previously shown here was cosmetic and has been removed
// to avoid confusing users about what role they will log in as.

// ─── Icons ───────────────────────────────────────────────────────────────────
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
// Brand spark used on the "AI-Powered Insights" card. The robot emoji that
// used to sit there read as another product's assistant logo.
function AiSparkIcon() {
  return (
    <svg
      className="feat-icon-svg"
      viewBox="0 0 32 32"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="feat-ai-spark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <path
        d="M16 3.2c.5 0 .9.3 1.1.8l2 5.4a5 5 0 0 0 3 3l5.4 2c.5.2.8.6.8 1.1s-.3.9-.8 1.1l-5.4 2a5 5 0 0 0-3 3l-2 5.4a1.2 1.2 0 0 1-2.2 0l-2-5.4a5 5 0 0 0-3-3l-5.4-2a1.2 1.2 0 0 1 0-2.2l5.4-2a5 5 0 0 0 3-3l2-5.4c.2-.5.6-.8 1.1-.8Z"
        fill="url(#feat-ai-spark)"
      />
      <circle cx="25.5" cy="6.5" r="2.6" fill="#f97316" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
function GoogleIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 814 1000" fill="#000">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 426.8 0 290.9 0 165.1 0 75.3 50.7 11 150.7 11c72.5 0 120.7 47.8 163.3 47.8 40.5 0 103.5-51 185.5-51 28.3 0 130 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: { client_id: string; callback: (r: { credential: string }) => void }): void;
          renderButton(el: HTMLElement, opts: object): void;
          prompt(): void;
        };
      };
    };
  }
}

/**
 * The page the proxy was protecting when it sent the visitor here
 * (`/login?next=/student/quiz`). Read at call time rather than through
 * useSearchParams so the page can still be prerendered without a Suspense
 * boundary; postLoginPath() decides whether it is safe to follow.
 */
function readNextParam(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("next");
}

export default function LoginPage() {
  const { login, completeLogin, status, user } = useAuth();
  const router = useRouter();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  // True once this tab starts its own sign-in, so the effect below does not
  // navigate a second time on top of completeLogin().
  const signingInHere = useRef(false);

  // Another tab signed in while this one sat on the form. Follow it rather
  // than leaving a login page the proxy would bounce on the next request.
  useEffect(() => {
    if (status !== "authenticated" || !user || signingInHere.current) return;
    router.replace(postLoginPath(user.role, readNextParam()));
  }, [status, user, router]);

  // ── Load Google Identity Services ─────────────────────────────────────────
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleCredential = useCallback(async (response: { credential: string }) => {
    setGoogleLoading(true);
    setError("");
    signingInHere.current = true;
    try {
      const res = await apiFetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        // Same path as a password sign-in: the session is recorded in
        // AuthContext (so the console shows the real account, not a
        // placeholder) and the role lands on its own dashboard.
        completeLogin(json.data as AuthUser, readNextParam());
      } else {
        signingInHere.current = false;
        setError(json.message ?? "Google sign-in failed.");
      }
    } catch {
      signingInHere.current = false;
      setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }, [completeLogin]);

  useEffect(() => {
    if (!googleClientId) return;

    const scriptId = "google-gsi";
    if (document.getElementById(scriptId)) {
      // Script already loaded — just initialise
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline", size: "large", text: "signin_with", width: 280,
          });
        }
      }
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline", size: "large", text: "signin_with", width: 280,
        });
      }
    };
    document.body.appendChild(script);
  }, [googleClientId, handleGoogleCredential]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setUnverified(false);
    setLoading(true);
    signingInHere.current = true;
    try {
      const result = await login({ emailOrUsername, password, rememberMe }, { next: readNextParam() });
      if (!result.success) {
        signingInHere.current = false;
        if (result.unverified) setUnverified(true);
        setError(result.message);
      }
    } catch {
      signingInHere.current = false;
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // The site header and footer come from (auth)/layout.tsx, so the page no
  // longer renders its own text-only logo bar or footer.
  return (
    <div className="auth-shell">
      {/* Body */}
      <div className="auth-body">
        {/* Left — form */}
        <div className="auth-card">
          <h1 className="auth-card-title">Welcome to Intellia360</h1>
          <p className="auth-card-subtitle">AI-Powered Adaptive Learning Platform</p>
          <p className="auth-card-tagline">Login to continue your learning journey</p>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* Generic error */}
            {error && !unverified && (
              <div className="auth-error-banner" role="alert">⚠️ {error}</div>
            )}

            {/* Unverified-email banner */}
            {unverified && (
              <div
                style={{
                  background: "rgba(245,158,11,.10)",
                  border: "1.5px solid rgba(245,158,11,.35)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
                role="alert"
              >
                <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600, color: "#92400e" }}>
                  📧 Email not verified
                </p>
                <p style={{ margin: 0, fontSize: "0.83rem", color: "#78350f", lineHeight: 1.5 }}>
                  Please check your inbox and click the verification link before logging in.
                </p>
                <Link
                  href={`/resend-verification?email=${encodeURIComponent(emailOrUsername)}`}
                  style={{
                    alignSelf: "flex-start",
                    fontSize: "0.83rem",
                    fontWeight: 700,
                    color: "#f97316",
                    textDecoration: "none",
                  }}
                >
                  Resend verification email →
                </Link>
              </div>
            )}

            {/* Email */}
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="login-email">Email</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><MailIcon /></span>
                <input
                  id="login-email"
                  type="text"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><LockIcon /></span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input has-right-icon"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-input-right-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="auth-check-row">
              <label className="auth-checkbox-wrap">
                <input
                  type="checkbox"
                  id="login-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="auth-forgot-link">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" id="login-submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Logging in…" : "Login"}
              {!loading && <ArrowIcon />}
            </button>

            {/* Social */}
            <div className="auth-divider"><span>or continue with</span></div>
            <div className="auth-social-row">
              {/* Real Google Identity Services button (renders when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set) */}
              {googleClientId ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div ref={googleBtnRef} style={{ minHeight: 44 }} />
                  {googleLoading && (
                    <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                      Signing in with Google…
                    </p>
                  )}
                </div>
              ) : (
                // Placeholder shown when env var not set (dev without Google)
                <button
                  type="button"
                  className="auth-social-btn"
                  style={{ gridColumn: "1/-1", opacity: 0.5, cursor: "not-allowed" }}
                  disabled
                  title="Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable"
                >
                  <GoogleIcon /> Google (not configured)
                </button>
              )}
              <button type="button" className="auth-social-btn"><MicrosoftIcon /> Microsoft</button>
              <button type="button" className="auth-social-btn"><AppleIcon /> Apple</button>
            </div>

            <p className="auth-footer-switch">
              Don&apos;t have an account? <Link href="/register">Sign Up</Link>
            </p>
          </form>
        </div>

        {/* Right — panel */}
        <div className="auth-panel">
          <h2 className="auth-panel-headline">
            <span className="word-learn">Learn.</span>{" "}
            <span className="word-teach">Teach.</span>{" "}
            <span className="word-grow">Grow.</span>{" "}
            <span className="word-together">Together.</span>
          </h2>
          <p className="auth-panel-desc">
            Intellia360 is designed for students, teachers, parents and administrators
            to create a better learning experience together.
          </p>
          <div className="auth-feature-grid">
            <div className="auth-feature-card"><span className="feat-icon">📘</span>Personalized Learning</div>
            <div className="auth-feature-card"><span className="feat-icon"><AiSparkIcon /></span>AI-Powered Insights</div>
            <div className="auth-feature-card"><span className="feat-icon">📊</span>Real-time Progress</div>
            <div className="auth-feature-card"><span className="feat-icon">🛡️</span>Safe &amp; Secure</div>
          </div>
          <div className="auth-trust-row">
            <div className="auth-trust-badge">
              <span className="trust-icon">🔒</span>
              Your data is protected with enterprise-grade security and privacy.
            </div>
            <div className="auth-trust-badge">
              <span className="trust-icon">👥</span>
              <span><strong>Trusted by</strong><br />10K+ Users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
