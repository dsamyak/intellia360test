"use client";

import React, { useState } from "react";
import Link from "next/link";

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) { setSent(true); }
      else { setError(json.message); }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <nav className="auth-nav">
        <Link href="/" className="auth-logo" aria-label="Intellia360 Home">
          <span className="auth-logo-text">
            intellia<span className="three">3</span><span className="six">6</span>0
          </span>
        </Link>
        <Link href="/login" className="auth-nav-link" id="nav-back-login">← Back to Login</Link>
      </nav>

      <div className="auth-body" style={{ gridTemplateColumns: "1fr", maxWidth: "480px" }}>
        <div className="auth-card">
          <h1 className="auth-card-title">Forgot Password?</h1>
          <p className="auth-card-tagline">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {sent ? (
            <div className="auth-success-banner" style={{ marginTop: "24px" }}>
              ✅ Check your inbox — a reset link has been sent if that email is registered.
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit} noValidate style={{ marginTop: "8px" }}>
              {error && <div className="auth-error-banner" role="alert">⚠️ {error}</div>}
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="forgot-email">Email Address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><MailIcon /></span>
                  <input id="forgot-email" type="email" className="auth-input"
                    placeholder="Enter your registered email"
                    value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
              </div>
              <button type="submit" id="forgot-submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Sending…" : "Send Reset Link"}
                {!loading && <ArrowIcon />}
              </button>
              <p className="auth-footer-switch">
                Remember your password? <Link href="/login">Log In</Link>
              </p>
            </form>
          )}
        </div>
      </div>

      <footer className="auth-page-footer">
        <span>© 2025 Intellia360. All rights reserved.</span>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Service</Link>
        <Link href="/support">Support</Link>
      </footer>
    </div>
  );
}
