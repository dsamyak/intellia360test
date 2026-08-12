"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser, LoginInput, RegisterInput, UserRole } from "@/types/auth";

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user:            AuthUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:    (input: LoginInput)    => Promise<{ success: boolean; message: string; unverified?: boolean }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; message: string }>;
  logout:   ()                     => Promise<void>;
  hasRole:  (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDashboardPath(role: UserRole): string {
  if (role === "TEACHER" || role === "SCHOOL") return "/teacher/dashboard";
  if (role === "ADMIN"   || role === "EDITOR") return "/editor/dashboard";
  return "/student/dashboard";
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session from the httpOnly cookie on every page load
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) setUser(json.data as AuthUser);
        }
      } catch {
        // Network error — treat as logged-out
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (input: LoginInput) => {
    const res  = await fetch("/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(input),
    });
    const json = await res.json();

    // Unverified account — 403 with errors.email === ["unverified"]
    if (!json.success && json.errors?.email?.[0] === "unverified") {
      return { success: false, message: json.message, unverified: true };
    }

    if (json.success && json.data) {
      const authUser = json.data as AuthUser;
      setUser(authUser);
      router.push(getDashboardPath(authUser.role));
    }

    return { success: json.success, message: json.message };
  }, [router]);

  // ── Register ───────────────────────────────────────────────────────────────
  // After the new flow, register does NOT issue a session — it just queues a
  // verification email.  The page handles showing the confirmation UI.
  const register = useCallback(async (input: RegisterInput) => {
    const res  = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(input),
    });
    const json = await res.json();
    return { success: json.success, message: json.message };
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }, [router]);

  // ── hasRole ────────────────────────────────────────────────────────────────
  const hasRole = useCallback((...roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
