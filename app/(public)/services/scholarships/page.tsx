import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Scholarship Applications | MakeoverArena",
  description:
    "Identify and win scholarships for study abroad. 65% of our scholarship applicants received financial aid — partial to fully-funded.",
  openGraph: {
    title: "Scholarship Applications | MakeoverArena",
    description:
      "65% of our scholarship applicants received funding. Let us find and win scholarships for you.",
  },
};

const scholarships = [
  {
    name: "Chevening Scholarship",
    country: "🇬🇧 United Kingdom",
    coverage: "Fully funded",
    desc: "UK government's flagship global scholarship for future leaders. Covers tuition, living costs, and flights.",
  },
  {
    name: "Commonwealth Scholarship",
    country: "🇬🇧 United Kingdom",
    coverage: "Fully funded",
    desc: "For students from Commonwealth countries pursuing Masters or PhD in the UK.",
  },
  {
    name: "Fulbright Foreign Student Program",
    country: "🇺🇸 United States",
    coverage: "Fully funded",
    desc: "Prestigious US government scholarship covering tuition, living expenses, and health insurance.",
  },
  {
    name: "DAAD Scholarship",
    country: "🇩🇪 Germany",
    coverage: "Fully funded",
    desc: "Germany's largest scholarship organisation — ideal for STEM and research-focused applicants.",
  },
  {
    name: "Erasmus Mundus",
    country: "🇪🇺 Europe",
    coverage: "Fully funded",
    desc: "EU-funded joint Masters and PhD programmes across multiple European universities.",
  },
  {
    name: "University Merit Awards",
    country: "🌍 Global",
    coverage: "Partial to full",
    desc: "Dozens of institution-specific merit scholarships we identify and apply for alongside your main application.",
  },
];

const included = [
  "Comprehensive scholarship audit — every award you are eligible for, ranked by fit",
  "Personalised scholarship application calendar with deadlines and requirements",
  "Scholarship essay and personal statement writing support (multiple rounds of editing)",
  "Chevening, Commonwealth, Fulbright, DAAD, and Erasmus Mundus application support",
  "Interview preparation for competitive awards (mock interviews with feedback)",
  "Referee briefing — how to brief your referees to maximise scholarship success",
  "University merit award applications integrated into your main admissions strategy",
  "Post-award guidance on acceptance, deferral, and conditions",
];

const timeline = [
  {
    phase: "Week 1–2",
    title: "Scholarship Audit",
    desc: "We map every award you qualify for — government, institutional, and private — and rank them by competitiveness and value.",
  },
  {
    phase: "Week 3–6",
    title: "Essay & Document Preparation",
    desc: "We build your scholarship essays, leadership narratives, and supplemental materials tailored to each award's criteria.",
  },
  {
    phase: "Month 2–3",
    title: "Submission & Interviews",
    desc: "Applications submitted on time. For interview-stage awards, we run full mock interview sessions with detailed feedback.",
  },
  {
    phase: "Month 3+",
    title: "Results & Negotiation",
    desc: "We help you compare awards, understand conditions, and in some cases negotiate merit aid amounts with universities.",
  },
];

export default function ScholarshipsPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-72 md:h-96 bg-navy-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=1600&q=80"
          alt="Scholarship award ceremony"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-crimson-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-crimson-400" />
            <span className="text-crimson-400 text-xs font-semibold tracking-widest uppercase">
              Service
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-white">
            Scholarship <em className="text-crimson-400 not-italic">Applications</em>
          </h1>
          <p className="text-white/60 mt-3 text-lg max-w-xl">
            65% of our scholarship applicants received funding — from partial
            awards to fully-funded offers.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-navy-950 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/10">
            {[
              { number: "65%", label: "of applicants received funding" },
              { number: "₦0", label: "cost for fully-funded winners" },
              { number: "40+", label: "scholarship programs we work with" },
              { number: "3.2x", label: "more awards won vs. solo applicants" },
            ].map((o) => (
              <div key={o.label} className="text-center md:px-8">
                <div className="font-display text-2xl font-light text-crimson-400 mb-0.5">
                  {o.number}
                </div>
                <div className="text-white/50 text-xs leading-snug">{o.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left — content */}
            <div className="lg:col-span-2 space-y-14">
              {/* Scholarships we cover */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px w-6 bg-crimson-500" />
                  <span className="text-crimson-600 text-xs font-semibold tracking-widest uppercase">
                    Scholarships We Target
                  </span>
                </div>
                <h2 className="font-display text-3xl text-navy-900 mb-6">
                  Major awards we apply for
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {scholarships.map((s) => (
                    <div
                      key={s.name}
                      className="bg-white rounded-xl p-5 shadow-card border border-border"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-navy-900 text-sm">
                          {s.name}
                        </h3>
                        <span className="shrink-0 bg-crimson-100 text-crimson-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {s.coverage}
                        </span>
                      </div>
                      <div className="text-xs text-navy-500 mb-2">{s.country}</div>
                      <p className="text-navy-600 text-xs leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What's included */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px w-6 bg-crimson-500" />
                  <span className="text-crimson-600 text-xs font-semibold tracking-widest uppercase">
                    Full Service
                  </span>
                </div>
                <h2 className="font-display text-3xl text-navy-900 mb-6">
                  What&apos;s included
                </h2>
                <ul className="space-y-3">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-crimson-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg
                          className="w-3 h-3 text-crimson-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-navy-700 text-sm leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timeline */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px w-6 bg-crimson-500" />
                  <span className="text-crimson-600 text-xs font-semibold tracking-widest uppercase">
                    Process
                  </span>
                </div>
                <h2 className="font-display text-3xl text-navy-900 mb-6">
                  Our Scholarship Process
                </h2>
                <div className="space-y-4">
                  {timeline.map((t, i) => (
                    <div key={t.phase} className="flex gap-5">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </div>
                        {i < timeline.length - 1 && (
                          <div className="w-px flex-1 bg-navy-200 mt-2" />
                        )}
                      </div>
                      <div className="pb-6">
                        <span className="text-xs text-crimson-600 font-semibold uppercase tracking-wide">
                          {t.phase}
                        </span>
                        <h3 className="font-semibold text-navy-900 mt-0.5 mb-1">
                          {t.title}
                        </h3>
                        <p className="text-navy-600 text-sm leading-relaxed">
                          {t.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
                <h3 className="font-display text-xl text-navy-900 mb-4">
                  Apply for funding
                </h3>
                <p className="text-navy-600 text-sm mb-5">
                  Tell us about your profile and we&apos;ll identify every scholarship
                  you&apos;re eligible for — at no upfront cost.
                </p>
                <Link
                  href="/apply"
                  className="block w-full text-center px-5 py-3 bg-crimson-500 text-white rounded-xl font-semibold text-sm hover:bg-crimson-400 transition-colors mb-3"
                >
                  Start Application →
                </Link>
                <Link
                  href="/book"
                  className="block w-full text-center px-5 py-3 border border-navy-200 text-navy-700 rounded-xl text-sm hover:bg-navy-50 transition-colors"
                >
                  Book Free Consultation
                </Link>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-navy-500 leading-relaxed">
                    Our scholarship service is often bundled with admissions
                    packages at no extra cost. Book a consultation to discuss
                    your options.
                  </p>
                </div>
              </div>

              <div className="bg-navy-900 rounded-2xl p-6 text-white">
                <div className="text-crimson-400 text-3xl mb-2">🏅</div>
                <div className="text-white font-display text-xl mb-2">
                  Success story
                </div>
                <blockquote className="text-white/60 text-sm leading-relaxed italic mb-4">
                  &ldquo;MakeoverArena helped me win the Chevening Scholarship. I had
                  applied twice before on my own and failed. They knew exactly
                  what the selectors were looking for.&rdquo;
                </blockquote>
                <div className="text-white/80 text-sm font-medium">
                  Chioma A.
                </div>
                <div className="text-white/40 text-xs">
                  Chevening Scholar, LSE — MSc Development Studies
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
