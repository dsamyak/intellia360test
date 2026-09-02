"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Bell,
  Menu,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
} from "@/components/admin/icons";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { sidebarMenuItems } from "@/data/admin/sidebar";

interface PendingAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  requestedRole: string;
}

const SEARCH_DESTINATIONS = [
  ...sidebarMenuItems.map((item) => ({ label: item.label, path: item.path })),
  { label: "My Profile", path: "/admin/profile" },
];

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

export default function AdminNavbar({
  onToggleSidebar,
}: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // ── Dark mode: persist in localStorage, apply to <html> element ───────────
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem("adminTheme") === "dark" ||
      document.documentElement.classList.contains("dark")
    );
  });

  // Apply on first render
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("admin-dark");
    } else {
      document.documentElement.classList.remove("admin-dark");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("admin-dark", next);
    localStorage.setItem("adminTheme", next ? "dark" : "light");
  };
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // ── Quick-nav search ───────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_DESTINATIONS.filter((d) => d.label.toLowerCase().includes(q));
  }, [searchQuery]);

  const goToSearchResult = (path: string) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(path);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      goToSearchResult(searchResults[0].path);
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  // Ctrl/Cmd + K focuses the search box, as the UI hint already advertises
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  // ── Notifications: real pending role-upgrade requests ──────────────────────
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const loadPendingAccounts = () => {
    fetch("/api/admin/users?pending=true&limit=50")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setPendingAccounts(
            (json.data as Array<{ id: string; name: string; email: string; role: string; requestedRole: string | null }>)
              .filter((u) => u.requestedRole)
              .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, requestedRole: u.requestedRole as string }))
          );
        }
      })
      .catch(() => {
        // Network error — leave the bell showing the last known count
      });
  };

  useEffect(() => {
    loadPendingAccounts();
  }, []);

  const handleApprove = async (account: PendingAccount) => {
    setApprovingId(account.id);
    try {
      const res = await fetch(`/api/admin/users/${account.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: account.requestedRole }),
      });
      const json = await res.json();
      if (json.success) {
        setPendingAccounts((prev) => prev.filter((a) => a.id !== account.id));
      } else {
        window.alert(json.message ?? "Failed to approve role upgrade.");
      }
    } catch {
      window.alert("Network error. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  // ─────────────────────────────────────────────
  // Format title from pathname
  // ─────────────────────────────────────────────

  const getPageTitle = () => {
    if (pathname === "/admin" || pathname === "/admin/dashboard") {
      return "Dashboard";
    }

    const segment = pathname.split("/")[2] || "Dashboard";

    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  // ─────────────────────────────────────────────
  // Close profile dropdown on outside click
  // ─────────────────────────────────────────────

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // ─────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Remove client-side user data if present
      localStorage.removeItem("user");

      setIsProfileOpen(false);

      /*
       * IMPORTANT:
       * Change this route if your actual admin/login
       * page uses a different URL.
       */
      router.push("/login");
    } catch (error) {
      console.error("[AdminNavbar] Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="admin-navbar">

      {/* ─────────────────────────────────────────
          Left — Breadcrumb & Title
      ───────────────────────────────────────── */}

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="admin-icon-btn lg:hidden"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="text-[12px] font-semibold text-[#64748b] tracking-wider">
            Admin / {getPageTitle()}
          </div>

          <h1 className="text-[28px] lg:text-[30px] font-[800] text-[#172033] leading-tight">
            {getPageTitle()}
          </h1>

          <p className="text-[13px] text-[#64748b] hidden sm:block">
            Welcome back, {user?.name?.split(" ")[0] ?? "Admin"}! Here&apos;s what&apos;s happening on your
            platform today.
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────
          Center Search Bar
      ───────────────────────────────────────── */}

      <div ref={searchRef} className="admin-search-wrapper hidden md:block" style={{ position: "relative" }}>
        <Search className="admin-search-icon w-4 h-4" />

        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search anything across platform... (Schools, Teachers, Students)"
          className="admin-search-input"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          onKeyDown={handleSearchKeyDown}
        />

        {!searchQuery && (
          <span className="admin-search-shortcut">
            Ctrl + K
          </span>
        )}

        {isSearchOpen && searchQuery && (
          <div
            style={{
              position: "absolute", left: 0, right: 0, top: "calc(100% + 6px)", zIndex: 50,
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,.12)", overflow: "hidden",
            }}
          >
            {searchResults.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: 12.5, color: "#94a3b8", fontWeight: 600 }}>
                No matching pages.
              </div>
            ) : (
              searchResults.map((result) => (
                <button
                  key={result.path}
                  type="button"
                  onClick={() => goToSearchResult(result.path)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "10px 14px", fontSize: 13, fontWeight: 600, background: "none", border: "none",
                    color: "#334155", cursor: "pointer",
                  }}
                >
                  {result.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────
          Right Quick Actions
      ───────────────────────────────────────── */}

      <div className="admin-nav-actions">

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="admin-icon-btn"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications — real pending role-upgrade requests */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            type="button"
            className="admin-icon-btn"
            title="Pending role upgrade requests"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-expanded={isNotifOpen}
            aria-haspopup="menu"
          >
            <Bell className="w-4 h-4" />

            {pendingAccounts.length > 0 && (
              <span className="admin-badge-count">
                {pendingAccounts.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div
              style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 50, width: 320,
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
                boxShadow: "0 10px 30px rgba(0,0,0,.14)", overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>
                Pending Role Requests
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {pendingAccounts.length === 0 ? (
                  <div style={{ padding: "16px 14px", fontSize: 12.5, color: "#94a3b8", fontWeight: 600 }}>
                    No pending requests right now.
                  </div>
                ) : (
                  pendingAccounts.map((account) => (
                    <div key={account.id} style={{ padding: "10px 14px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {account.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {account.role} → {account.requestedRole}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApprove(account)}
                        disabled={approvingId === account.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 8,
                          border: "none", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff",
                          fontSize: 11, fontWeight: 700, cursor: "pointer", opacity: approvingId === account.id ? .6 : 1, whiteSpace: "nowrap",
                        }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {approvingId === account.id ? "…" : "Approve"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────
            Profile
        ───────────────────────────────────── */}

        <div
          ref={profileRef}
          className="admin-user-profile-wrapper"
        >
          <button
            type="button"
            className="admin-user-profile"
            onClick={() =>
              setIsProfileOpen((previous) => !previous)
            }
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
          >
            <div className="admin-avatar">
              👨‍💼
            </div>

            <div className="admin-user-info hidden sm:flex">
              <span className="admin-user-name">
                {user?.name ?? "Admin"}
              </span>

              <span className="admin-user-role flex items-center gap-1">
                Platform Admin

                <Sparkles className="w-3 h-3 text-orange-500 inline" />
              </span>
            </div>

            <span className="admin-profile-arrow">
              {isProfileOpen ? "▴" : "▾"}
            </span>
          </button>

          {/* ───────────────────────────────────
              Profile Dropdown
          ─────────────────────────────────── */}

          {isProfileOpen && (
            <div
              className="admin-profile-dropdown"
              role="menu"
            >
              {/* Admin information */}
              <div className="admin-profile-dropdown-header">
                <div className="admin-profile-dropdown-avatar">
                  👨‍💼
                </div>

                <div className="admin-profile-dropdown-info">
                  <span className="admin-profile-dropdown-name">
                    {user?.name ?? "Admin"}
                  </span>

                  <span className="admin-profile-dropdown-role">
                    {user?.email ?? "Platform Administrator"}
                  </span>
                </div>
              </div>

              <div className="admin-profile-divider" />

              {/* Profile */}
              <button
                type="button"
                className="admin-profile-dropdown-item"
                role="menuitem"
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push("/admin/profile");
                }}
              >
                <span className="admin-profile-item-icon">
                  👤
                </span>

                <span>My Profile</span>
              </button>

              {/* Logout */}
              <button
                type="button"
                className="admin-profile-dropdown-item admin-logout-item"
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <span className="admin-profile-item-icon">
                  {isLoggingOut ? "⏳" : "🚪"}
                </span>

                <span>
                  {isLoggingOut
                    ? "Logging out..."
                    : "Logout"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}