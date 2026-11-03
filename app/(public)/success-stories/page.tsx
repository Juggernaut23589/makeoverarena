import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Student Success Stories",
  description: "Real, consented stories from MakeoverArena students — coming soon as our first clients complete their journeys.",
};

/**
 * This page previously showed 6 "success stories" built from stock Pexels
 * photos under invented names, fabricated quotes, and an unverified stats
 * row (2,400+ students, 92% success, etc.) — removed per the platform
 * review: presenting invented people as real former clients is a genuine
 * exposure, not just unpolished placeholder content. Replace the section
 * below with real, consented stories as clients complete their journeys —
 * see supabase.client_profiles / application_tracking for who's eligible.
 */
export default function SuccessStoriesPage() {
  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-navy-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(212,168,83,0.5) 0%, transparent 50%)" }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-crimson-400" />
            <span className="text-crimson-400 text-xs font-semibold tracking-widest uppercase">Success Stories</span>
            <div className="h-px w-8 bg-crimson-400" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-white mb-4">
            Every story here{" "}
            <em className="text-crimson-400 not-italic">will be real.</em>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            We&apos;re collecting verified, consented stories as our clients complete their
            journeys. Nothing on this page is published until the student it belongs to has
            agreed to share it.
          </p>
        </div>
      </section>

      {/* Empty state */}
      <section className="py-20 bg-cream">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-card p-10">
            <p className="text-navy-600 text-sm leading-relaxed">
              No stories are published yet. Check back soon — or be one of the first students
              we feature.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-navy-900 mb-4">
            Your success story{" "}
            <em className="text-crimson-500 not-italic">starts here</em>
          </h2>
          <p className="text-navy-600 mb-8">
            Start your application and work with an advisor on your study abroad journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-crimson-500 text-white rounded-xl font-semibold text-sm hover:bg-crimson-400 transition-colors"
            >
              Start Your Application →
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-7 py-3.5 border border-navy-200 text-navy-700 rounded-xl text-sm hover:bg-navy-50 transition-colors"
            >
              Book Free Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
