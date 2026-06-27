"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { LogoIcon } from "@/components/ui/logo-icon";
import { loginStaffAction, registerStaffAction } from "@/app/staff/login/actions";

type Tab = "staff-login" | "staff-register" | "admin";

const TABS: { id: Tab; label: string }[] = [
  { id: "staff-login", label: "Staff Sign In" },
  { id: "staff-register", label: "Staff Register" },
  { id: "admin", label: "Admin Login" },
];

/* ── Staff Sign-In ─────────────────────────────────────────────────────── */
function StaffLoginForm() {
  const [state, action, pending] = useActionState(loginStaffAction, undefined);

  useEffect(() => {
    if (state?.success) window.location.href = "/staff/dashboard";
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      {state?.error && <Banner type="error">{state.error}</Banner>}
      <Field id="sl-email" name="email" type="email" label="Email" placeholder="you@example.com" />
      <Field id="sl-password" name="password" type="password" label="Password" placeholder="••••••••" />
      <SubmitBtn pending={pending}>Sign In →</SubmitBtn>
    </form>
  );
}

/* ── Staff Register ────────────────────────────────────────────────────── */
function StaffRegisterForm() {
  const [state, action, pending] = useActionState(registerStaffAction, undefined);

  if (state?.success) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-navy-900 mb-1">Application submitted!</p>
        <p className="text-sm text-navy-500">
          Your account is pending admin approval. You&apos;ll receive an email once approved.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && <Banner type="error">{state.error}</Banner>}
      <Field id="sr-name" name="full_name" type="text" label="Full Name" placeholder="Your full name" />
      <Field id="sr-email" name="email" type="email" label="Work Email" placeholder="you@example.com" />
      <Field id="sr-title" name="job_title" type="text" label="Job Title" placeholder="e.g. Admissions Consultant" />
      <Field id="sr-phone" name="phone" type="tel" label="Phone (optional)" placeholder="+234 800 000 0000" />
      <Field id="sr-password" name="password" type="password" label="Password" placeholder="Min. 8 characters" />
      <SubmitBtn pending={pending}>Request Access →</SubmitBtn>
    </form>
  );
}

/* ── Admin Login ───────────────────────────────────────────────────────── */
function AdminLoginForm() {
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
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Login failed."); }
      else { window.location.href = "/admin"; }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Banner type="error">{error}</Banner>}
      <Field
        id="al-email" type="email" label="Admin Email"
        placeholder="admin@makeoverarena.com"
        value={email} onChange={(e) => setEmail(e.target.value)}
      />
      <Field
        id="al-password" type="password" label="Password"
        placeholder="••••••••"
        value={password} onChange={(e) => setPassword(e.target.value)}
      />
      <SubmitBtn pending={pending}>Admin Sign In →</SubmitBtn>
    </form>
  );
}

/* ── Shared sub-components ─────────────────────────────────────────────── */
function Field({
  id, name, type, label, placeholder, value, onChange,
}: {
  id: string; name?: string; type: string; label: string; placeholder: string;
  value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-navy-600 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={type !== "tel"}
        className="w-full h-11 px-3.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-crimson-400 transition"
      />
    </div>
  );
}

function SubmitBtn({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-11 mt-1 bg-crimson-500 text-white rounded-lg font-semibold text-sm hover:bg-crimson-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}

function Banner({ type, children }: { type: "error"; children: React.ReactNode }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
      {children}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function PortalPage() {
  const [tab, setTab] = useState<Tab>("staff-login");

  return (
    <div className="min-h-screen bg-cream flex items-start justify-center pt-8 pb-16 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <LogoIcon className="w-11 h-11" />
          <span className="font-brand font-black text-2xl text-gold-600 tracking-tight">
            MakeoverArena
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3.5 text-xs font-semibold transition-colors ${
                  tab === t.id
                    ? "text-crimson-600 border-b-2 border-crimson-500 bg-crimson-50/40"
                    : "text-navy-400 hover:text-navy-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Form area */}
          <div className="p-6">
            {tab === "staff-login" && (
              <>
                <h2 className="font-display font-semibold text-lg text-navy-900 mb-1">Staff Sign In</h2>
                <p className="text-navy-400 text-sm mb-5">Access your staff dashboard</p>
                <StaffLoginForm />
              </>
            )}
            {tab === "staff-register" && (
              <>
                <h2 className="font-display font-semibold text-lg text-navy-900 mb-1">Join the Team</h2>
                <p className="text-navy-400 text-sm mb-5">Request a staff account — pending admin approval</p>
                <StaffRegisterForm />
              </>
            )}
            {tab === "admin" && (
              <>
                <h2 className="font-display font-semibold text-lg text-navy-900 mb-1">Admin Access</h2>
                <p className="text-navy-400 text-sm mb-5">Sign in to the administration panel</p>
                <AdminLoginForm />
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-navy-400 mt-5">
          Student login?{" "}
          <Link href="/login" className="text-crimson-600 hover:text-crimson-700 font-medium">
            My Account →
          </Link>
        </p>
      </div>
    </div>
  );
}
