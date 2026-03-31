import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login | MakeoverArena",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      {/* Background decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center">
              <span className="font-display text-navy-900 font-bold text-xl leading-none">M</span>
            </div>
          </div>
          <h1 className="font-display text-2xl text-white">
            Makeover<span className="text-gold-400">Arena</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Admin Portal</p>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}
