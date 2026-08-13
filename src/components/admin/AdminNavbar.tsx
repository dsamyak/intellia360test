"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  MessageSquare,
  Menu,
  Sun,
  Moon,
  Sparkles,
} from "@/components/admin/icons";
import { usePathname, useRouter } from "next/navigation";

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

export default function AdminNavbar({
  onToggleSidebar,
}: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isDark, setIsDark] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

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
            Welcome back, Admin! Here's what's happening on your
            platform today.
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────
          Center Search Bar
      ───────────────────────────────────────── */}

      <div className="admin-search-wrapper hidden md:block">
        <Search className="admin-search-icon w-4 h-4" />

        <input
          type="text"
          placeholder="Search anything across platform... (Schools, Teachers, Students)"
          className="admin-search-input"
        />

        <span className="admin-search-shortcut">
          Ctrl + K
        </span>
      </div>

      {/* ─────────────────────────────────────────
          Right Quick Actions
      ───────────────────────────────────────── */}

      <div className="admin-nav-actions">

        {/* Theme */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="admin-icon-btn"
          title="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="admin-icon-btn"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />

          <span className="admin-badge-count">
            3
          </span>
        </button>

        {/* Messages */}
        <button
          className="admin-icon-btn hidden sm:flex"
          title="Messages"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

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
                Super Admin
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
                    Super Admin
                  </span>

                  <span className="admin-profile-dropdown-role">
                    Platform Administrator
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