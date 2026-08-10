"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/auth";

// ── Role Options ──────────────────────────────────────────────────────────────
const ROLES: { value: UserRole; label: string; icon: string; sub: string }[] = [
  { value: "STUDENT", label: "Student",  icon: "🎓",  sub: "Learn & Grow"      },
  { value: "TEACHER", label: "Teacher",  icon: "👩‍🏫", sub: "Teach & Inspire"   },
  { value: "EDITOR",  label: "Editor",   icon: "✏️",  sub: "Create & Publish"  },
  { value: "USER",    label: "Parent",   icon: "👨‍👧", sub: "Support & Track"   },
  { value: "ADMIN",   label: "Admin",    icon: "🛡️",  sub: "Manage & Monitor"  },
];

// ── Icons ────────────────────────────────────────────────────────────────────
function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
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
function ShieldCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 814 1000" fill="#000">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 426.8 0 290.9 0 165.1 0 75.3 50.7 11 150.7 11c72.5 0 120.7 47.8 163.3 47.8 40.5 0 103.5-51 185.5-51 28.3 0 130 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
    </svg>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!agreeToTerms) { setError("Please agree to the Terms of Service to continue."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const result = await register({
        name, email, username, dateOfBirth, password,
        confirmPassword, role, agreeToTerms,
      });
      if (!result.success) setError(result.message);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      {/* ── Nav ── */}
      <nav className="auth-nav">
        <Link href="/" className="auth-logo" aria-label="Intellia360 Home">
          <span className="auth-logo-text">
            intellia<span className="three">3</span><span className="six">6</span>0
          </span>
        </Link>
        <div className="auth-nav-action">
          <span>Already have an account?</span>
          <Link href="/login" className="auth-nav-link" id="nav-login-btn">
            Login <ArrowIcon />
          </Link>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="auth-body">
        {/* Left — Form Card */}
        <div className="auth-card">
          <h1 className="auth-card-title">Create Your Intellia360 Account</h1>
          <p className="auth-card-tagline">Join our learning community and start your journey today!</p>

          {/* Role Selector */}
          <span className="auth-role-label" style={{ marginTop: "8px" }}>I am a</span>
          <div className="auth-role-grid" role="group" aria-label="Select your role">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                className={`auth-role-btn${role === r.value ? " active" : ""}`}
                onClick={() => setRole(r.value)}
                aria-pressed={role === r.value}
                id={`reg-role-${r.value}`}
              >
                <span className="role-icon">{r.icon}</span>
                {r.label}
                <span className="role-sub">{r.sub}</span>
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="auth-error-banner" role="alert">⚠️ {error}</div>
            )}

            {/* Name + Email */}
            <div className="auth-form-row">
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="reg-name">Full Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><PersonIcon /></span>
                  <input id="reg-name" type="text" className="auth-input" placeholder="Enter your full name"
                    value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="reg-email">Email Address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><MailIcon /></span>
                  <input id="reg-email" type="email" className="auth-input" placeholder="Enter your email"
                    value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
              </div>
            </div>

            {/* Username + DOB */}
            <div className="auth-form-row">
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="reg-username">Username</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><PersonIcon /></span>
                  <input id="reg-username" type="text" className="auth-input" placeholder="Choose a username"
                    value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="reg-dob">Date of Birth</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><CalendarIcon /></span>
                  <input id="reg-dob" type="date" className="auth-input"
                    value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="reg-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><LockIcon /></span>
                <input id="reg-password" type={showPassword ? "text" : "password"}
                  className="auth-input has-right-icon" placeholder="Create a strong password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                <button type="button" className="auth-input-right-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <span className="auth-input-hint">
                <ShieldCheckIcon />
                Use 8+ characters with a mix of letters, numbers &amp; symbols
              </span>
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><LockIcon /></span>
                <input id="reg-confirm" type={showConfirm ? "text" : "password"}
                  className="auth-input has-right-icon" placeholder="Confirm your password"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                <button type="button" className="auth-input-right-btn"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}>
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="auth-checkbox-wrap">
              <input type="checkbox" id="reg-terms" checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)} />
              I agree to the{" "}
              <Link href="/terms" style={{ color: "#2563eb", fontWeight: 600 }}>Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" style={{ color: "#2563eb", fontWeight: 600 }}>Privacy Policy</Link>
            </label>

            {/* Submit */}
            <button type="submit" id="register-submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Creating Account…" : "Create Account"}
              {!loading && <ArrowIcon />}
            </button>

            {/* Social */}
            <div className="auth-divider"><span>or sign up with</span></div>
            <div className="auth-social-row">
              <button type="button" className="auth-social-btn" id="reg-google"><GoogleIcon /> Google</button>
              <button type="button" className="auth-social-btn" id="reg-microsoft"><MicrosoftIcon /> Microsoft</button>
              <button type="button" className="auth-social-btn" id="reg-apple"><AppleIcon /> Apple</button>
            </div>

            <p className="auth-terms-notice">
              By creating an account, you agree to our{" "}
              <Link href="/terms">Terms of Service</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </form>
        </div>

        {/* Right — Panel */}
        <div className="auth-panel">
          <h2 className="auth-panel-headline">
            <span className="word-learn">Learn.</span>{" "}
            <span className="word-teach">Teach.</span>{" "}
            <span className="word-grow">Grow.</span>{" "}
            <span className="word-together">Together.</span>
          </h2>
          <p className="auth-panel-desc">
            Intellia360 is an AI-powered adaptive learning platform designed for students,
            teachers, parents and administrators to create a better learning experience together.
          </p>

          {/* Feature List */}
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon" style={{ background: "#eff6ff" }}>📘</div>
              <div className="auth-feature-text">
                <strong>Personalized Learning</strong>
                <p>AI adapts to your pace and style for better results.</p>
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon" style={{ background: "#f5f3ff" }}>🤖</div>
              <div className="auth-feature-text">
                <strong>Smart Insights</strong>
                <p>Real-time analytics and reports to track progress.</p>
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon" style={{ background: "#fff7ed" }}>📊</div>
              <div className="auth-feature-text">
                <strong>Engaging Content</strong>
                <p>Interactive lessons, quizzes and activities.</p>
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon" style={{ background: "#f0fdf4" }}>🛡️</div>
              <div className="auth-feature-text">
                <strong>Safe &amp; Secure</strong>
                <p>Your data is protected with enterprise-grade security.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="auth-page-footer">
        <span>© 2025 Intellia360. All rights reserved.</span>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Service</Link>
        <Link href="/support">Support</Link>
      </footer>
    </div>
  );
}
