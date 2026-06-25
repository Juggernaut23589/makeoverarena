import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Visa Application Support | MakeoverArena",
  description:
    "End-to-end student visa guidance for the US, UK, Canada, Australia, Germany, and Europe. Flawless documentation — stress-free.",
  openGraph: {
    title: "Visa Application Support | MakeoverArena",
    description:
      "End-to-end student visa guidance. Flawless documentation, stress-free.",
  },
};

const countries = [
  {
    flag: "🇺🇸",
    country: "United States",
    visa: "F-1 Student Visa",
    highlights: [
      "DS-160 form completion",
      "SEVIS fee payment",
      "Visa interview preparation",
      "Financial documentation",
    ],
  },
  {
    flag: "🇬🇧",
    country: "United Kingdom",
    visa: "UK Student Visa (Tier 4)",
    highlights: [
      "CAS number support",
      "UKVI online application",
      "Biometrics appointment",
      "English language evidence",
    ],
  },
  {
    flag: "🇨🇦",
    country: "Canada",
    visa: "Study Permit",
    highlights: [
      "Letter of Acceptance",
      "Proof of funds documentation",
      "Biometrics appointment",
      "IRCC portal guidance",
    ],
  },
  {
    flag: "🇦🇺",
    country: "Australia",
    visa: "Student Visa (Subclass 500)",
    highlights: [
      "CoE from university",
      "OSHC health insurance",
      "Genuine Temporary Entrant (GTE) statement",
      "ImmiAccount portal",
    ],
  },
  {
    flag: "🇩🇪",
    country: "Germany",
    visa: "National Visa (Type D)",
    highlights: [
      "Blocked account (Sperrkonto)",
      "German embassy appointment",
      "Certified translations",
      "Health insurance requirement",
    ],
  },
  {
    flag: "🇳🇱",
    country: "Netherlands",
    visa: "MVV + Residence Permit",
    highlights: [
      "University sponsorship letter",
      "IND registration",
      "Proof of funds",
      "Health insurance guidance",
    ],
  },
];

const included = [
  "Country-specific visa roadmap built around your admission timeline",
  "Complete checklist of required documents with guidance on each",
  "Financial documentation review (bank statements, sponsorship letters)",
  "Personal statement / Statement of Purpose review for visa purposes",
  "Visa interview preparation — mock interviews with common questions and best answers",
  "Guidance on certified translations and document attestation",
  "Support with health insurance requirements (OSHC, EHIC, UKVI surcharge)",
  "Blocked account / proof-of-funds setup guidance (Germany, Netherlands)",
  "Follow-up support if visa is refused — understanding reasons and reapplication",
];

const timeline = [
  {
    phase: "Step 1",
    title: "Visa Eligibility Assessment",
    desc: "We review your admission offer, passport, finances, and profile to confirm eligibility and flag any potential issues early.",
  },
  {
    phase: "Step 2",
    title: "Document Compilation",
    desc: "We give you a precise document checklist, review every item you gather, and advise on translations and certifications.",
  },
  {
    phase: "Step 3",
    title: "Application Submission",
    desc: "We guide you through the visa portal step-by-step and review your application before submission.",
  },
  {
    phase: "Step 4",
    title: "Interview Prep & Follow-Up",
    desc: "For US and other interview-required visas, we run mock sessions. We track your application and follow up on decisions.",
  },
];

export default function VisaPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-72 md:h-96 bg-navy-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80"
          alt="Passport and boarding pass"
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
            Visa Application <em className="text-crimson-400 not-italic">Support</em>
          </h1>
          <p className="text-white/60 mt-3 text-lg max-w-xl">
            End-to-end guidance for student visas across the US, UK, Canada,
            Australia, Germany, and Europe.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-navy-950 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/10">
            {[
              { number: "98%", label: "visa success rate for our applicants" },
              { number: "6", label: "countries with dedicated visa guides" },
              { number: "72h", label: "document review turnaround" },
              { number: "100%", label: "clients supported from start to stamp" },
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
              {/* Countries */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px w-6 bg-crimson-500" />
                  <span className="text-crimson-600 text-xs font-semibold tracking-widest uppercase">
                    Destinations
                  </span>
                </div>
                <h2 className="font-display text-3xl text-navy-900 mb-6">
                  Countries we cover
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {countries.map((c) => (
                    <div
                      key={c.country}
                      className="bg-white rounded-xl p-5 shadow-card border border-border"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{c.flag}</span>
                        <div>
                          <h3 className="font-semibold text-navy-900 text-sm">
                            {c.country}
                          </h3>
                          <span className="text-xs text-crimson-600">{c.visa}</span>
                        </div>
                      </div>
                      <ul className="mt-3 space-y-1.5">
                        {c.highlights.map((h) => (
                          <li
                            key={h}
                            className="flex items-center gap-2 text-xs text-navy-600"
                          >
                            <div className="w-1 h-1 rounded-full bg-crimson-400 shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
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
                  Our Visa Process
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

              {/* Warning callout */}
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="text-amber-500 shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">
                      Start early — visa timelines are unpredictable
                    </h3>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      Embassy appointment slots fill up months in advance.
                      We recommend beginning your visa application immediately
                      after receiving your admission offer — ideally 3–4 months
                      before your programme start date.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
                <h3 className="font-display text-xl text-navy-900 mb-4">
                  Get visa support
                </h3>
                <p className="text-navy-600 text-sm mb-5">
                  Already have an offer? Start your visa application immediately.
                  Our team responds within 24 hours.
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
                  {[
                    "Document review and checklist",
                    "Mock visa interview sessions",
                    "Financial documentation guidance",
                    "Refusal support and reapplication",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-navy-600">
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
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-navy-900 rounded-2xl p-6 text-white">
                <div className="text-3xl font-display font-light text-crimson-400 mb-1">
                  ₦80k+
                </div>
                <div className="text-white/60 text-sm mb-4">
                  Standalone visa support package
                </div>
                <div className="text-white/50 text-xs">
                  Visa support is included free in our Undergraduate and Graduate
                  admissions packages. Contact us to discuss your situation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
