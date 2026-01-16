"use client";

import { useTheme } from "./providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 transition-all ${
        collapsed ? "justify-center" : ""
      }`}
      title={collapsed ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : undefined}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      {!collapsed && (
        <span className="font-medium text-sm">
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
