"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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
          shouldCreateUser: false, // Staff must already exist
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/staff/dashboard`,
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("not found") || error.status === 400) {
          throw new Error("No staff account found with this email. Contact your administrator.");
        }
        throw error;
      }

      router.push(`/auth/verify?email=${encodeURIComponent(email.trim())}&staff=1`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-gold-500 rounded-lg flex items-center justify-center">
            <span className="font-display text-navy-900 font-bold text-lg leading-none">M</span>
          </div>
          <span className="font-display font-semibold text-xl text-white">
            Makeover<span className="text-gold-400">Arena</span>
          </span>
        </Link>

        <div className="bg-navy-800 rounded-2xl border border-white/10 shadow-elevated p-8">
          <div className="mb-6 text-center">
            <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl text-white font-medium mb-1">Staff Portal</h1>
            <p className="text-white/50 text-sm">Enter your work email to sign in</p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Work email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@makeoverarena.com"
                required
                className={cn(
                  "w-full px-4 py-3 rounded-xl border border-white/10 bg-navy-700",
                  "text-white placeholder:text-white/30",
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
                "bg-gold-500 text-navy-900 hover:bg-gold-400",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {loading ? "Sending code…" : "Send sign-in code →"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-white/30">
          Not staff?{" "}
          <Link href="/auth/login" className="text-white/50 hover:text-white/70 transition-colors">
            Client login
          </Link>
        </p>
      </div>
    </div>
  );
}
