"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  if (hasSession === null) {
    return (
      <div className="w-10 h-10 border-4 border-crimson-400 border-t-transparent rounded-full animate-spin" />
    );
  }

  if (!hasSession) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-card border border-border p-8">
          <h1 className="font-display text-2xl text-navy-900 mb-2">Link expired</h1>
          <p className="text-navy-500 text-sm mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/login" className="text-sm text-crimson-600 hover:text-crimson-700 font-medium">
            ← Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-card border border-border p-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl text-navy-900">Set a new password</h1>
          <p className="text-navy-500 text-sm mt-1">Choose a new password for your account</p>
        </div>

        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-navy-700 font-medium mb-1">Password updated</p>
            <p className="text-navy-500 text-sm">Redirecting you to sign in…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400 placeholder:text-navy-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400 placeholder:text-navy-300"
              />
            </div>

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
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-10 h-10 border-4 border-crimson-400 border-t-transparent rounded-full animate-spin" />
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
