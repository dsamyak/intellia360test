"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/common/Logo";
import { sidebarMenuItems, MenuItem } from "@/data/admin/sidebar";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  FolderKanban,
  TrendingUp,
  CreditCard,
  FileText,
  Settings,
  Crown,
  Sparkles,
  ChevronRight,
  X,
} from "@/components/admin/icons";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5 nav-icon" />,
  Building2: <Building2 className="w-5 h-5 nav-icon" />,
  GraduationCap: <GraduationCap className="w-5 h-5 nav-icon" />,
  Users: <Users className="w-5 h-5 nav-icon" />,
  BookOpen: <BookOpen className="w-5 h-5 nav-icon" />,
  FolderKanban: <FolderKanban className="w-5 h-5 nav-icon" />,
  TrendingUp: <TrendingUp className="w-5 h-5 nav-icon" />,
  CreditCard: <CreditCard className="w-5 h-5 nav-icon" />,
  FileText: <FileText className="w-5 h-5 nav-icon" />,
  Settings: <Settings className="w-5 h-5 nav-icon" />,
};

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div>
          {/* Logo Brand Header */}
          <div className="admin-sidebar-logo flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo />
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="admin-sidebar-nav">
            {sidebarMenuItems.map((item: MenuItem) => {
              const isActive =
                pathname === item.path || (item.path !== "/admin/dashboard" && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`admin-nav-item ${isActive ? "active" : ""}`}
                  onClick={onClose}
                >
                  {iconMap[item.icon] || <LayoutDashboard className="w-5 h-5 nav-icon" />}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-orange-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                      {item.badge.text}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Upgrade Pro Widget at Bottom */}
        <div className="admin-upgrade-card">
          <div className="admin-upgrade-title">
            Upgrade to Pro <Crown className="w-4 h-4 text-amber-500 fill-amber-500 inline ml-1" />
          </div>
          <p className="admin-upgrade-desc">
            Unlock advanced features, AI Insights & powerful analytics.
          </p>
          <button className="admin-upgrade-btn flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 inline" /> Upgrade Now <ChevronRight className="w-4 h-4 inline" />
          </button>
        </div>
      </aside>
    </>
  );
}
