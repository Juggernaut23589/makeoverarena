"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/(admin)/admin/login/actions";
import type { AdminRole } from "@/lib/admin-auth";

type NavItem = { href: string; label: string; icon: React.ReactNode; superAdminOnly?: boolean; external?: boolean };

const allNavItems: NavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" /></svg>,
  },
  {
    href: "/admin/inbox",
    label: "WhatsApp",
    icon: <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  },
  {
    href: "/admin/inquiries",
    label: "Inquiries",
    icon: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  },
  {
    href: "/admin/consultations",
    label: "Consultations",
    icon: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
  {
    href: "/admin/documents",
    label: "Documents",
    icon: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
  {
    href: "/admin/clients",
    label: "Clients",
    superAdminOnly: true,
    icon: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  },
  {
    href: "/admin/team",
    label: "Team",
    superAdminOnly: true,
    icon: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    superAdminOnly: true,
    icon: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    href: "https://www.makeoverarena.com/",
    label: "Blog",
    external: true,
    icon: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
  },
];

// Exported for use in admin-shell for active item detection
export function getNavItems(role: AdminRole): NavItem[] {
  return allNavItems.filter((i) => !i.superAdminOnly || role === "super_admin");
}

function NavLinks({ collapsed, role, onNavigate }: { collapsed: boolean; role: AdminRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = getNavItems(role);
  return (
    <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
      {items.map((item) => {
        const isActive = !item.external && (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href));
        const classes = cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group relative",
          isActive ? "bg-white/10 text-white font-medium" : "text-white/60 hover:bg-white/5 hover:text-white"
        );
        if (item.external) {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={classes}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="flex-1">{item.label}</span>}
            </a>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={classes}
            title={collapsed ? item.label : undefined}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="flex-1">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ collapsed, role, adminName, onToggleCollapse }: {
  collapsed: boolean;
  role: AdminRole;
  adminName: string;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="border-t border-white/5 p-3 space-y-1">
      {!collapsed && adminName && (
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-white/40 truncate">{adminName}</p>
          <p className="text-xs text-crimson-400/70 font-medium">{role === "super_admin" ? "Super Admin" : "Admin"}</p>
        </div>
      )}
      {!collapsed && (
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Public Site
        </Link>
      )}
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors"
          title={collapsed ? "Sign Out" : undefined}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </form>
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <svg className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      )}
    </div>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center h-16 px-4 border-b border-white/5 shrink-0", collapsed ? "justify-center" : "")}
    >
      {collapsed ? (
        <div className="w-8 h-8 bg-crimson-500 rounded-lg flex items-center justify-center shrink-0">
          <span className="font-display text-white font-bold text-sm leading-none">M</span>
        </div>
      ) : (
        <Image
          src="/makeover-logo-dark.png"
          alt="MakeoverArena"
          width={150}
          height={36}
          className="h-7 w-auto"
        />
      )}
    </Link>
  );
}

export function AdminSidebar({ role, adminName }: { role: AdminRole; adminName: string }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={cn("hidden lg:flex flex-col bg-navy-900 border-r border-white/5 transition-all duration-300 h-full shrink-0", collapsed ? "w-16" : "w-60")}>
      <Brand collapsed={collapsed} />
      <NavLinks collapsed={collapsed} role={role} />
      <SidebarFooter collapsed={collapsed} role={role} adminName={adminName} onToggleCollapse={() => setCollapsed(!collapsed)} />
    </aside>
  );
}

export function AdminMobileDrawer({ open, onClose, role, adminName }: { open: boolean; onClose: () => void; role: AdminRole; adminName: string }) {
  return (
    <div className="lg:hidden" aria-hidden={!open}>
      <div
        className={cn("fixed inset-0 z-40 bg-black/50 transition-opacity duration-300", open ? "opacity-100" : "opacity-0 pointer-events-none")}
        onClick={onClose}
      />
      <aside
        className={cn("fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] flex flex-col bg-navy-900 border-r border-white/5 shadow-2xl transition-transform duration-300 ease-out", open ? "translate-x-0" : "-translate-x-full")}
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/5 shrink-0">
          <Link href="/" className="flex items-center">
            <Image
              src="/makeover-logo-dark.png"
              alt="MakeoverArena"
              width={150}
              height={36}
              className="h-7 w-auto"
            />
          </Link>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors" aria-label="Close menu">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <NavLinks collapsed={false} role={role} onNavigate={onClose} />
        <SidebarFooter collapsed={false} role={role} adminName={adminName} />
      </aside>
    </div>
  );
}
