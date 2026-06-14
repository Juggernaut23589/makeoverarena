"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Discreet staff-portal entry, pinned bottom-left so it never collides with
 * the AI chat widget (bottom-right). The public marketing site is light-only,
 * so no theme toggle is shown here.
 */
export function FloatingButtons() {
  return (
    <div className="fixed bottom-6 left-6 flex flex-col items-center gap-3 z-40">
      <Link
        href="/staff/dashboard"
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-elevated",
          "bg-navy-900 hover:bg-navy-800",
          "hover:scale-105 active:scale-95 group relative"
        )}
        aria-label="Staff Portal"
      >
        <svg className="w-4.5 h-4.5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {/* Tooltip (opens to the right since the button is on the left edge) */}
        <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-navy-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Staff Portal
        </span>
      </Link>
    </div>
  );
}
