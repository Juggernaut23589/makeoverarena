"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { registerStaffAction, loginStaffAction } from "./actions";
import { loginAction as adminLoginAction } from "@/app/(admin)/admin/login/actions";

async function handleAdminLogin(formData: FormData) {
  await adminLoginAction(undefined, formData);
}

type Tab = "login" | "register" | "admin";

export function StaffLoginClient() {
  const [tab, setTab] = useState<Tab>("login");
  const [loginState, loginAction, loginPending] = useActionState(loginStaffAction, undefined);
  const [registerState, registerAction, registerPending] = useActionState(
    registerStaffAction,
    undefined
  );

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 bg-gold-500 rounded-lg flex items-center justify-center">
            <span className="font-display text-navy-900 font-bold text-lg leading-none">M</span>
          </div>
          <span className="font-display font-semibold text-xl text-navy-900">
            Makeover<span className="text-gold-500">Arena</span>
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-navy-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-navy-100">
            {(["login", "register", "admin"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  tab === t
                    ? "text-navy-900 border-b-2 border-gold-500 -mb-px bg-white"
                    : "text-navy-400 hover:text-navy-700"
                }`}
              >
                {t === "login" ? "Sign In" : t === "register" ? "Register" : "Admin"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === "admin" ? (
              <form action={handleAdminLogin} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-gold-500 rounded-full" />
                  <span className="text-xs font-semibold text-gold-600 uppercase tracking-wide">Admin Portal</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-600 mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                    placeholder="admin@makeoverarena.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-600 mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gold-500 text-navy-900 rounded-xl font-semibold text-sm hover:bg-gold-400 transition-colors"
                >
                  Admin Sign In →
                </button>
              </form>
            ) : tab === "login" ? (
              <form action={loginAction} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-600 mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                    placeholder="you@makeoverarena.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-600 mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                {loginState?.error && (
                  <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    {loginState.error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loginPending}
                  className="w-full py-2.5 bg-navy-900 text-white rounded-xl font-semibold text-sm hover:bg-navy-800 transition-colors disabled:opacity-60"
                >
                  {loginPending ? "Signing in…" : "Sign In"}
                </button>
              </form>
            ) : (
              <form action={registerAction} className="space-y-4">
                {registerState?.success ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-navy-900 mb-2">Registration submitted</h3>
                    <p className="text-sm text-navy-500">
                      Your account is pending approval. You&apos;ll receive an email once the super admin activates your account.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-navy-600 mb-1.5 uppercase tracking-wide">
                          Full Name
                        </label>
                        <input
                          name="full_name"
                          type="text"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-navy-600 mb-1.5 uppercase tracking-wide">
                          Email
                        </label>
                        <input
                          name="email"
                          type="email"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                          placeholder="jane@makeoverarena.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-navy-600 mb-1.5 uppercase tracking-wide">
                          Password
                        </label>
                        <input
                          name="password"
                          type="password"
                          required
                          minLength={8}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                          placeholder="Min. 8 characters"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-navy-600 mb-1.5 uppercase tracking-wide">
                          Phone
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                          placeholder="+234 800 000 0000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-navy-600 mb-1.5 uppercase tracking-wide">
                          Job Title
                        </label>
                        <input
                          name="job_title"
                          type="text"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                          placeholder="e.g. Admissions Consultant"
                        />
                      </div>
                    </div>
                    {registerState?.error && (
                      <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                        {registerState.error}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={registerPending}
                      className="w-full py-2.5 bg-navy-900 text-white rounded-xl font-semibold text-sm hover:bg-navy-800 transition-colors disabled:opacity-60"
                    >
                      {registerPending ? "Submitting…" : "Submit Registration"}
                    </button>
                    <p className="text-xs text-navy-400 text-center">
                      Your account will be reviewed by the super admin before you can sign in.
                    </p>
                  </>
                )}
              </form>
            )}
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-navy-400">
          This portal is for MakeoverArena staff only.
        </p>
      </div>
    </div>
  );
}
