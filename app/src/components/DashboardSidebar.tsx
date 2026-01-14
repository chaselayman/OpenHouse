"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
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
} from "lucide-react";
import { useState } from "react";
import { useProfile } from "@/lib/hooks/useProfile";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
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
      className={`fixed left-0 top-0 h-screen bg-[#0B0C10] border-r border-white/5 flex flex-col transition-all duration-300 z-40 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className={`h-16 border-b border-white/5 flex items-center ${collapsed ? "justify-center px-2" : "px-6"}`}>
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]">
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
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-sky-400" : ""}`} />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="py-4 px-3 border-t border-white/5 space-y-1">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all ${
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
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all ${
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
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0B0C10] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* User Profile */}
      <div className={`p-4 border-t border-white/5 ${collapsed ? "px-2" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {getInitials()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {profile?.full_name || "Loading..."}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {profile?.email || ""}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
