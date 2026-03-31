"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message || "Invalid credentials");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
      <h2 className="font-semibold text-white mb-6">Sign in to your account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@makeoverarena.com"
            className="w-full h-11 bg-white/5 border border-white/10 rounded-lg px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full h-11 bg-white/5 border border-white/10 rounded-lg px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-gold-500 text-navy-900 rounded-lg font-semibold text-sm hover:bg-gold-400 disabled:opacity-60 transition-colors mt-2 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
}
