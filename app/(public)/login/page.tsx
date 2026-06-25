"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") ?? "";
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message === "Invalid login credentials"
        ? "Incorrect email or password."
        : authError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/api/auth/callback?next=/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card border border-border p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="font-display text-crimson-400 font-bold text-xl leading-none">M</span>
              </div>
            </Link>
            <h1 className="font-display text-2xl text-navy-900">
              {resetMode ? "Reset Password" : "Welcome back"}
            </h1>
            <p className="text-navy-500 text-sm mt-1">
              {resetMode
                ? "Enter your email to receive a reset link"
                : "Sign in to your MakeoverArena dashboard"}
            </p>
          </div>

          {resetSent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-navy-700 font-medium mb-2">Check your email</p>
              <p className="text-navy-500 text-sm mb-6">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              <button
                onClick={() => { setResetMode(false); setResetSent(false); }}
                className="text-sm text-crimson-600 hover:text-crimson-700 font-medium"
              >
                ← Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={resetMode ? handleReset : handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400 placeholder:text-navy-300"
                />
              </div>

              {!resetMode && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-navy-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setResetMode(true)}
                      className="text-xs text-crimson-600 hover:text-crimson-700"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400 placeholder:text-navy-300"
                  />
                </div>
              )}

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-navy-900 text-white rounded-xl font-semibold text-sm hover:bg-navy-800 transition-colors disabled:opacity-60"
              >
                {loading ? "Please wait…" : resetMode ? "Send Reset Link" : "Sign In"}
              </button>

              {resetMode && (
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="w-full text-sm text-navy-500 hover:text-navy-700 py-1"
                >
                  ← Back to sign in
                </button>
              )}
            </form>
          )}

          {!resetMode && !resetSent && (
            <p className="text-center text-sm text-navy-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-crimson-600 hover:text-crimson-700 font-medium">
                Sign up
              </Link>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-navy-400 mt-4">
          Student portal for MakeoverArena clients only.{" "}
          <Link href="/apply" className="text-crimson-600 hover:text-crimson-700">
            Apply here
          </Link>{" "}
          if you&apos;re new.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-crimson-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
