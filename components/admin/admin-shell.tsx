"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar, AdminMobileDrawer, adminNavItems } from "./sidebar";

/**
 * Responsive chrome for the admin area.
 * - lg+ : static collapsible sidebar (left) + scrollable main.
 * - <lg : sticky top bar with hamburger that opens a slide-out drawer.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isInbox = pathname === "/admin/inbox";
  const current = adminNavItems.find((i) =>
    i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href)
  );

  return (
    <div className="flex flex-col lg:flex-row h-dvh bg-navy-50 overflow-hidden">
      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center gap-3 h-14 px-4 bg-navy-900 border-b border-white/10 shrink-0">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 -ml-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
          aria-label="Open menu"
          aria-expanded={open}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-display text-white font-semibold text-sm">
          Makeover<span className="text-gold-400">Arena</span>
        </span>
        {current && (
          <span className="ml-auto text-white/50 text-xs font-medium uppercase tracking-wide truncate">
            {current.label}
          </span>
        )}
      </header>

      <AdminSidebar />
      <AdminMobileDrawer open={open} onClose={() => setOpen(false)} />

      <main className={isInbox ? "flex-1 min-h-0 overflow-hidden flex flex-col" : "flex-1 overflow-y-auto"}>
        {children}
      </main>
    </div>
  );
}
