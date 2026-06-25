"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AdminSidebar, AdminMobileDrawer, getNavItems } from "./sidebar";
import type { AdminRole } from "@/lib/admin-auth";

export function AdminShell({ children, role, adminName }: { children: React.ReactNode; role: AdminRole; adminName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isInbox = pathname === "/admin/inbox";
  const items = getNavItems(role);
  const current = items.find((i) => i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href));

  return (
    <div className="flex flex-col lg:flex-row h-dvh bg-navy-50 overflow-hidden">
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
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/makeover-logo-icon.png"
            alt="MakeoverArena"
            width={32}
            height={32}
            className="w-7 h-7 object-contain"
          />
          <span className="font-display font-bold text-sm text-white leading-none">
            Makeover<span className="text-crimson-400">Arena</span>
          </span>
        </Link>
        {current && <span className="ml-auto text-white/50 text-xs font-medium uppercase tracking-wide truncate">{current.label}</span>}
      </header>

      <AdminSidebar role={role} adminName={adminName} />
      <AdminMobileDrawer open={open} onClose={() => setOpen(false)} role={role} adminName={adminName} />

      <main className={isInbox ? "flex-1 min-h-0 overflow-hidden flex flex-col" : "flex-1 overflow-y-auto"}>
        {children}
      </main>
    </div>
  );
}
