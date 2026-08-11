"use client";

import React, { useState } from "react";
import { Search, Bell, MessageSquare, Menu, Sun, Moon, Sparkles } from "@/components/admin/icons";
import { usePathname } from "next/navigation";

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

export default function AdminNavbar({ onToggleSidebar }: AdminNavbarProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  // Format title from pathname
  const getPageTitle = () => {
    if (pathname === "/admin" || pathname === "/admin/dashboard") return "Dashboard";
    const segment = pathname.split("/")[2] || "Dashboard";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="admin-navbar">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="admin-icon-btn lg:hidden"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb & Title */}
        <div>
          <div className="text-[12px] font-semibold text-[#64748b] tracking-wider">
            Admin / {getPageTitle()}
          </div>
          <h1 className="text-[28px] lg:text-[30px] font-[800] text-[#172033] leading-tight">
            {getPageTitle()}
          </h1>
          <p className="text-[13px] text-[#64748b] hidden sm:block">
            Welcome back, Admin! Here's what's happening on your platform today.
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="admin-search-wrapper hidden md:block">
        <Search className="admin-search-icon w-4 h-4" />
        <input
          type="text"
          placeholder="Search anything across platform... (Schools, Teachers, Students)"
          className="admin-search-input"
        />
        <span className="admin-search-shortcut">Ctrl + K</span>
      </div>

      {/* Right Quick Actions */}
      <div className="admin-nav-actions">
        <button
          onClick={() => setIsDark(!isDark)}
          className="admin-icon-btn"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <button className="admin-icon-btn" title="Notifications">
          <Bell className="w-4 h-4" />
          <span className="admin-badge-count">3</span>
        </button>

        <button className="admin-icon-btn hidden sm:flex" title="Messages">
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Profile Dropdown */}
        <div className="admin-user-profile">
          <div className="admin-avatar">👨‍💼</div>
          <div className="admin-user-info hidden sm:flex">
            <span className="admin-user-name">Super Admin</span>
            <span className="admin-user-role flex items-center gap-1">
              Platform Admin <Sparkles className="w-3 h-3 text-orange-500 inline" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
