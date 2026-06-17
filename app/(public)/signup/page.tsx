"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") ?? "";
  const prefillName = searchParams.get("name") ?? "";
  const fromApplication = searchParams.get("applied") === "1";

  const [form, setForm] = useState({ fullName: prefillName, email: prefillEmail, password: "", confirmPassword: "" });

  useEffect(() => {
    if (prefillEmail) setForm((f) => ({ ...f, email: prefillEmail }));
    if (prefillName) setForm((f) => ({ ...f, fullName: prefillName }));
  }, [prefillEmail, prefillName]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError("An account with this email already exists. Please sign in.");
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-card border border-border p-8">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-navy-900 mb-3">Check your email</h2>
          <p className="text-navy-500 text-sm mb-6">
            We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account, then sign in.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 bg-navy-900 text-white rounded-xl font-semibold text-sm hover:bg-navy-800 transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card border border-border p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="font-display text-gold-400 font-bold text-xl leading-none">M</span>
              </div>
            </Link>
            {fromApplication ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-3">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Application received!
                </div>
                <h1 className="font-display text-2xl text-navy-900">Create your account</h1>
                <p className="text-navy-500 text-sm mt-1">Set up your dashboard to track your application and book a free consultation</p>
              </>
            ) : (
              <>
                <h1 className="font-display text-2xl text-navy-900">Create your account</h1>
                <p className="text-navy-500 text-sm mt-1">Track your study abroad journey in one place</p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                placeholder="Amara Okonkwo"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 placeholder:text-navy-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="your@email.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 placeholder:text-navy-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="Minimum 8 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 placeholder:text-navy-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                placeholder="Repeat password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 placeholder:text-navy-300"
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
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-navy-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-gold-600 hover:text-gold-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-navy-400 mt-4">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-gold-600 hover:text-gold-700">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-gold-600 hover:text-gold-700">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
