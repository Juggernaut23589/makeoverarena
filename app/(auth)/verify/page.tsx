"use client";

import { Suspense, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const inquiryId = searchParams.get("inquiry") ?? "";
  const isStaff = searchParams.get("staff") === "1";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== "")) handleVerify(newOtp.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      handleVerify(pasted);
    }
  };

  const handleVerify = async (token: string) => {
    if (token.length !== 6 || loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) throw error;

      const userId = data.user?.id;

      // If coming from application form, create client profile
      if (inquiryId && userId) {
        await fetch("/api/client/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inquiryId }),
        });
      }

      toast.success("Verified! Redirecting…");
      router.push(isStaff ? "/staff/dashboard" : "/client/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid code. Try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      toast.success("New code sent to your email");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error("Failed to resend. Please go back and try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
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
          <div className="w-12 h-12 bg-gold-100 dark:bg-gold-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-navy-900 dark:text-white font-medium mb-1">
            Check your email
          </h1>
          <p className="text-navy-500 dark:text-navy-300 text-sm">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-navy-700 dark:text-white">{email}</span>
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className={cn(
                "w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all duration-150",
                "bg-white dark:bg-navy-700 text-navy-900 dark:text-white",
                digit
                  ? "border-gold-400 dark:border-gold-500"
                  : "border-border focus:border-gold-400",
                "focus:outline-none focus:ring-2 focus:ring-gold-400/30",
                "disabled:opacity-50"
              )}
            />
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 mb-4 text-sm text-navy-500">
            <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            Verifying…
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-navy-500 dark:text-navy-400 hover:text-navy-700 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            {resending ? "Sending…" : "Didn't receive it? Resend code"}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <Link
            href={isStaff ? "/staff/login" : "/auth/login"}
            className="text-sm text-navy-500 dark:text-navy-400 hover:text-navy-700 dark:hover:text-white transition-colors"
          >
            ← Use a different email
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
