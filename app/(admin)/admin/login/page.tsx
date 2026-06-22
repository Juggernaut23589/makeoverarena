"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const result = await loginAction(undefined, formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        window.location.href = "/admin";
        return;
      }
    } catch (e) {
      console.error("Admin login error:", e);
      setError("Connection error. Please try again.");
    }
    setPending(false);
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="font-display text-navy-900 font-bold text-2xl leading-none">M</span>
            </div>
            <h1 className="font-display text-2xl text-white font-light">
              Makeover<span className="text-gold-400">Arena</span>
            </h1>
          </Link>
          <p className="text-white/40 text-sm mt-1">Admin Portal</p>
        </div>

        <form
          action={handleSubmit}
          className="bg-navy-900 rounded-2xl border border-white/10 p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 bg-navy-800 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
              placeholder="admin@makeoverarena.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 bg-navy-800 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 bg-gold-500 text-navy-900 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {pending ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          Staff access only · MakeoverArena
        </p>
      </div>
    </div>
  );
}
