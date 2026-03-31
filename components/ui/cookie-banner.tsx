"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function accept(type: "all" | "necessary") {
    localStorage.setItem("cookie-consent", type);
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setVisible(false);

    // If user accepted all, ensure GA4 fires (it loads via script tag already;
    // this grants consent for future visits too)
    if (type === "all" && typeof window !== "undefined" && "gtag" in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
      });
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 lg:p-8 pointer-events-none">
      <div className="max-w-3xl mx-auto bg-navy-900 text-white rounded-2xl shadow-elevated p-5 sm:p-6 pointer-events-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">🍪</span>
              <p className="font-semibold text-sm">We use cookies</p>
            </div>
            <p className="text-white/70 text-xs leading-relaxed">
              We use cookies to improve your experience and analyse site traffic. By clicking
              &ldquo;Accept all&rdquo; you consent to analytics cookies.{" "}
              <Link href="/cookies" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
                Cookie policy
              </Link>
              {" · "}
              <Link href="/privacy" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
                Privacy policy
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => accept("necessary")}
              className="px-4 py-2 text-xs font-medium border border-white/20 text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            >
              Necessary only
            </button>
            <button
              onClick={() => accept("all")}
              className="px-4 py-2 text-xs font-semibold bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-400 transition-colors"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
