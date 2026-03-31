import type { Metadata } from "next";
import { MultiStepForm } from "@/components/forms/multi-step-form";

export const metadata: Metadata = {
  title: "Start Your Application",
  description: "Apply in 5 minutes. Tell us about your study abroad goals and we'll match you with the right universities and scholarships.",
};

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Header */}
      <div className="bg-navy-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(212,168,83,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)" }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold-400" />
            <span className="text-gold-400 text-xs font-semibold tracking-widest uppercase">
              Step 1 of 5
            </span>
            <div className="h-px w-8 bg-gold-400" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-white mb-4">
            Start Your{" "}
            <em className="text-gold-400 not-italic">Application</em>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Takes about 5 minutes. We&apos;ll review your profile and get back to you within 24 hours.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MultiStepForm />
      </div>
    </div>
  );
}
