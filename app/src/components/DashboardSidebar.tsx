"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import {
  LayoutDashboard,
  Users,
  Home,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useProfile } from "@/lib/hooks/useProfile";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/automations", icon: Zap, label: "Automations" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/properties", icon: Home, label: "Properties" },
  { href: "/showings", icon: Calendar, label: "Showings" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const bottomNavItems = [
  { href: "/help", icon: HelpCircle, label: "Help & Support" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { profile } = useProfile();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Get initials from profile name
  const getInitials = () => {
    if (!profile?.full_name) return "??";
    const parts = profile.full_name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[var(--sidebar-bg)] border-r border-[var(--card-border)] flex flex-col transition-all duration-300 z-40 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className={`h-16 border-b border-[var(--card-border)] flex items-center ${collapsed ? "justify-center px-2" : "px-6"}`}>
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <Home className="w-5 h-5 fill-current" />
          </div>
        ) : (
          <Logo />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg-hover)]"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-sky-500" : ""}`} />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="py-4 px-3 border-t border-[var(--card-border)] space-y-1">
        <ThemeToggle collapsed={collapsed} />
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg-hover)] transition-all ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5" />
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium text-sm">Sign out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--sidebar-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--card-border-hover)] transition-all"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* User Profile */}
      <div className={`p-4 border-t border-[var(--card-border)] ${collapsed ? "px-2" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {getInitials()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--foreground)] truncate">
                {profile?.full_name || "Loading..."}
              </div>
              <div className="text-xs text-[var(--foreground-muted)] truncate">
                {profile?.email || ""}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
