import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Graduate Admissions | MakeoverArena",
  description:
    "Expert Masters and PhD admissions guidance to top universities in the US, UK, Canada, Australia, and Europe. Personalised strategy for every applicant.",
  openGraph: {
    title: "Graduate Admissions | MakeoverArena",
    description:
      "Expert Masters and PhD admissions guidance to top universities worldwide.",
  },
};

const included = [
  "University research and shortlisting matched to your research interests and career goals",
  "Statement of Purpose (SOP) strategy, drafting, and multiple rounds of editing",
  "CV / resume optimisation for academic applications",
  "Reference letter guidance and professor outreach strategy",
  "GRE / GMAT / IELTS / TOEFL preparation resources and score strategy",
  "Scholarship and fellowship identification (Chevening, Commonwealth, Fulbright, DAAD, etc.)",
  "Research proposal writing support for PhD applicants",
  "Visa application guidance (Tier 4 / F-1 / study permit)",
  "Pre-departure orientation and accommodation guidance",
];

const timeline = [
  {
    phase: "Month 1",
    title: "Profile Assessment & Strategy",
    desc: "We review your GPA, research interests, and career goals, then build a targeted university list across reach, match, and safety tiers.",
  },
  {
    phase: "Month 2",
    title: "Document Preparation",
    desc: "SOP drafting, CV overhaul, reference letter briefing, and test score strategy — everything polished before submission.",
  },
  {
    phase: "Month 3–4",
    title: "Application Submission",
    desc: "We submit to all target programs with full tracking and follow up on missing documents or portal issues.",
  },
  {
    phase: "Month 4–7",
    title: "Decisions, Funding & Visa",
    desc: "Managing offer comparisons, funding negotiations, acceptance, and complete visa application support.",
  },
];

const outcomes = [
  { number: "87%", label: "of graduate applicants received at least one offer" },
  { number: "61%", label: "secured partial or full scholarship funding" },
  { number: "4.2x", label: "average scholarship value vs. self-applicants" },
  { number: "24h", label: "average response time from our graduate team" },
];

export default function GraduatePage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-72 md:h-96 bg-navy-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80"
          alt="Graduate students on campus"
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
            Graduate <em className="text-crimson-400 not-italic">Admissions</em>
          </h1>
          <p className="text-white/60 mt-3 text-lg max-w-xl">
            Masters and PhD applications handled with the precision and depth
            that elite programmes demand.
          </p>
        </div>
      </section>

      {/* Outcome stats bar */}
      <div className="bg-navy-950 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/10">
            {outcomes.map((o) => (
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
                  Application Timeline
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

              {/* Scholarships callout */}
              <div className="rounded-2xl bg-navy-900 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-crimson-500/10 blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <span className="text-crimson-400 text-xs font-semibold tracking-widest uppercase">
                    Funding Support
                  </span>
                  <h3 className="font-display text-2xl text-white mt-2 mb-3">
                    We chase scholarships so you don&apos;t have to
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-5">
                    From Chevening and Commonwealth to DAAD, Erasmus Mundus, and
                    university-specific merit awards — we identify every funding
                    avenue available to your profile and incorporate them into
                    your application strategy from day one.
                  </p>
                  <Link
                    href="/services/scholarships"
                    className="inline-flex items-center gap-2 text-crimson-400 text-sm font-medium hover:text-crimson-300 transition-colors"
                  >
                    Learn about our Scholarships service
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
                <h3 className="font-display text-xl text-navy-900 mb-4">
                  Ready to apply?
                </h3>
                <p className="text-navy-600 text-sm mb-5">
                  Start your application in 5 minutes. Our graduate team responds
                  within 24 hours with a personalised plan.
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

                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-sm text-navy-600">
                    <svg
                      className="w-4 h-4 text-crimson-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    SOP written with you, not for you
                  </div>
                  <div className="flex items-center gap-3 text-sm text-navy-600">
                    <svg
                      className="w-4 h-4 text-crimson-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Unlimited document revisions
                  </div>
                  <div className="flex items-center gap-3 text-sm text-navy-600">
                    <svg
                      className="w-4 h-4 text-crimson-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Scholarship search included
                  </div>
                  <div className="flex items-center gap-3 text-sm text-navy-600">
                    <svg
                      className="w-4 h-4 text-crimson-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Visa support included
                  </div>
                </div>
              </div>

              <div className="bg-navy-900 rounded-2xl p-6 text-white">
                <div className="text-3xl font-display font-light text-crimson-400 mb-1">
                  ₦200k+
                </div>
                <div className="text-white/60 text-sm mb-4">
                  Starting price for Masters packages
                </div>
                <div className="text-white/50 text-xs">
                  Price varies based on number of programmes and complexity.
                  PhD packages quoted individually. Book a free consultation for
                  your personalised quote.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
