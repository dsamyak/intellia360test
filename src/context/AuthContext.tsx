"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser, LoginInput, RegisterInput, UserRole } from "@/types/auth";

// ─── Context Shape ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<{ success: boolean; message: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session from cookie on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setUser(json.data as AuthUser);
          }
        }
      } catch {
        // Network error — treat as logged out
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (json.success && json.data) {
      setUser(json.data as AuthUser);
      // Redirect based on role
      const role = (json.data as AuthUser).role;
      if (role === "TEACHER" || role === "ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER") {
        router.push("/teacher/dashboard");
      } else if (role === "EDITOR") {
        router.push("/editor/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }
    return { success: json.success, message: json.message };
  }, [router]);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (json.success && json.data) {
      setUser(json.data as AuthUser);
      const role = (json.data as AuthUser).role;
      if (role === "TEACHER" || role === "ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER") {
        router.push("/teacher/dashboard");
      } else if (role === "EDITOR") {
        router.push("/editor/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }
    return { success: json.success, message: json.message };
  }, [router]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }, [router]);

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

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
