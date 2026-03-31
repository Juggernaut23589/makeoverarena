"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") ?? "";
  const inquiryId = searchParams.get("inquiry") ?? "";

  const [email, setEmail] = useState(prefillEmail);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/client/dashboard`,
          data: inquiryId ? { inquiry_id: inquiryId } : undefined,
        },
      });

      if (error) throw error;

      const params = new URLSearchParams({ email: email.trim() });
      if (inquiryId) params.set("inquiry", inquiryId);
      router.push(`/verify?${params.toString()}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
        <div className="w-9 h-9 bg-gold-500 rounded-lg flex items-center justify-center">
          <span className="font-display text-navy-900 font-bold text-lg leading-none">M</span>
        </div>
        <span className="font-display font-semibold text-xl text-navy-900 dark:text-white">
          Makeover<span className="text-gold-500">Arena</span>
        </span>
      </Link>

      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-elevated border border-border p-8">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl text-navy-900 dark:text-white font-medium mb-1">
            Welcome back
          </h1>
          <p className="text-navy-500 dark:text-navy-300 text-sm">
            Enter your email to receive a sign-in code
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={cn(
                "w-full px-4 py-3 rounded-xl border border-border bg-white dark:bg-navy-700",
                "text-navy-900 dark:text-white placeholder:text-navy-400",
                "focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent",
                "transition-all duration-150"
              )}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className={cn(
              "w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150",
              "bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? "Sending code…" : "Send sign-in code →"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-sm text-navy-500 dark:text-navy-400">
          New to MakeoverArena?{" "}
          <Link href="/apply" className="text-gold-600 hover:text-gold-500 font-medium">
            Start your application
          </Link>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-navy-400 dark:text-navy-500">
        Staff member?{" "}
        <Link href="/staff/login" className="text-navy-600 dark:text-navy-300 hover:underline">
          Go to Staff Portal
        </Link>
      </p>
    </div>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
