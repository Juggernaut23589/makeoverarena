"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-elevated",
        "bg-white dark:bg-navy-800 border border-border",
        "hover:scale-105 active:scale-95",
        className
      )}
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="w-4.5 h-4.5 text-crimson-400" />
      ) : (
        <Moon className="w-4.5 h-4.5 text-navy-700" />
      )}
    </button>
  );
}
