"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { error?: string; success?: boolean };
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
      } else {
        window.location.href = "/admin";
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    // min-h-dvh uses the dynamic viewport height so the form is
    // always fully visible on mobile even with the browser chrome present.
    <div className="min-h-dvh bg-navy-950 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-sm py-8">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <Image
              src="/makeover-logo-dark.png"
              alt="MakeoverArena"
              width={200}
              height={50}
              className="h-10 w-auto mx-auto mb-2"
              priority
            />
          </Link>
          <p className="text-white/40 text-sm mt-1">Admin Portal</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-navy-900 rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full h-11 px-3 bg-navy-800 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all"
              placeholder="admin@makeoverarena.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full h-11 px-3 bg-navy-800 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full h-11 bg-crimson-500 text-white rounded-lg font-semibold text-sm hover:bg-crimson-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
