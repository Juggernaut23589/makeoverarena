import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "MakeoverArena — Find Scholarships to Study Abroad",
  description:
    "A centralised, verified scholarship database for African students pursuing study abroad — search, save, and track funding opportunities to the US, UK, Canada, Australia, and Europe.",
};

const stats = [
  { number: "60+", label: "Verified Scholarships" },
  { number: "15+", label: "Countries Covered" },
  { number: "3", label: "Access Tiers" },
  { number: "24/7", label: "Database Access" },
];

const services = [
  {
    title: "Scholarship Database",
    description: "A continuously-updated, verified database of scholarship opportunities — searchable by country, field, and funding type.",
    icon: "🏅",
    href: "/services/scholarships",
    image: "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=600&q=80",
  },
];

const journeySteps = [
  { icon: "✍️", label: "Create Account", sub: "Day 1", color: "bg-crimson-50 border-crimson-200 text-crimson-700" },
  { icon: "💳", label: "Subscribe", sub: "Day 1", color: "bg-navy-50 border-navy-200 text-navy-700" },
  { icon: "🔎", label: "Search & Filter", sub: "Ongoing", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { icon: "🔖", label: "Save Matches", sub: "Ongoing", color: "bg-green-50 border-green-200 text-green-700" },
  { icon: "📥", label: "Download Details", sub: "Ongoing", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { icon: "🎓", label: "Apply & Get Funded", sub: "Ongoing", color: "bg-gold-50 border-gold-300 text-gold-700" },
];

const process = [
  {
    step: "01",
    title: "Create an Account",
    description: "Sign up free in under a minute and tell us your academic profile — field of study, GPA, and destination preferences.",
  },
  {
    step: "02",
    title: "Subscribe to a Tier",
    description: "Pick the access tier that fits your needs — unlock more verified scholarships at higher tiers.",
  },
  {
    step: "03",
    title: "Search & Filter",
    description: "Find scholarships matched to your profile — filter by country, field of study, funding type, and deadline.",
  },
  {
    step: "04",
    title: "Save & Apply",
    description: "Bookmark the opportunities that fit, download the details, and apply directly with the source institution.",
  },
];

const destinations = [
  { country: "United States", flag: "🇺🇸", universities: "Harvard, MIT, Stanford, UCLA", image: "https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?w=400&q=80" },
  { country: "United Kingdom", flag: "🇬🇧", universities: "Oxford, Cambridge, UCL, LSE", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80" },
  { country: "Canada", flag: "🇨🇦", universities: "U of T, UBC, McGill, Waterloo", image: "https://images.unsplash.com/photo-1507992781348-310259076fe0?w=400&q=80" },
  { country: "Australia", flag: "🇦🇺", universities: "ANU, U of Melbourne, UNSW", image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=400&q=80" },
  { country: "Germany", flag: "🇩🇪", universities: "TU Munich, LMU, Heidelberg", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80" },
  { country: "Netherlands", flag: "🇳🇱", universities: "TU Delft, Amsterdam, Leiden", image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=400&q=80" },
];

const faqs = [
  { q: "What exactly do I get access to?", a: "A searchable, continuously-updated database of verified scholarship opportunities — filterable by country, field of study, funding type, and deadline, with the ability to save and download listings." },
  { q: "How are listings verified?", a: "Every scholarship goes through a staged research, verification, and approval process by our team before it's published, so you're not wasting time on stale or fake listings." },
  { q: "How much does it cost?", a: "Access is sold in Basic, Standard, and Premium tiers over fixed periods — pricing is shown on the Scholarships page and at signup." },
  { q: "Can I change tiers or renew later?", a: "Yes — you can upgrade, downgrade, or renew your access anytime from your dashboard." },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen bg-navy-900 flex flex-col justify-end overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1800&q=80"
            alt="University campus"
            fill
            className="object-cover object-center opacity-30"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/70 to-navy-900/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/60 via-transparent to-transparent" />
        </div>

        {/* Floating decorative orb */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-crimson-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-32">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-crimson-400" />
              <span className="text-crimson-400 text-sm font-medium tracking-widest uppercase">
                Study Abroad Experts
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.05] mb-6">
              Find the Funding{" "}
              <br />
              <em className="text-gradient-gold not-italic font-normal">for Your Journey</em>
              <br />
              Abroad
            </h1>

            <p className="text-white/70 text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10 max-w-xl">
              A verified, constantly-updated database of scholarships for ambitious African students — search, save, and track funding opportunities for universities across the globe.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-4 bg-crimson-500 text-white rounded-xl font-semibold text-base hover:bg-crimson-400 transition-all duration-200 shadow-glow-crimson"
              >
                Subscribe to the Database
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/services/scholarships"
                className="inline-flex items-center gap-2 px-7 py-4 border border-white/25 text-white rounded-xl font-medium text-base hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Plans
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/10">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center md:px-8">
                  <div className="font-display text-3xl font-light text-crimson-400 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-crimson-500" />
                <span className="text-crimson-600 text-xs font-semibold tracking-widest uppercase">
                  What We Do
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-light text-navy-900 leading-tight">
                Everything you need to{" "}
                <em className="not-italic text-crimson-500">find funding</em>
              </h2>
            </div>
            <Link
              href="/signup"
              className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-navy-700 hover:text-navy-900 group"
            >
              Subscribe to the database
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 max-w-sm mx-auto gap-5">
            {services.map((service, i) => (
              <Link
                key={service.title}
                href={service.href}
                className="group relative rounded-2xl overflow-hidden bg-white shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
                  <div className="absolute top-3 left-3 text-2xl">{service.icon}</div>
                </div>
                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display text-xl text-navy-900 font-medium mb-2">
                    {service.title}
                  </h3>
                  <p className="text-navy-600 text-sm leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-crimson-600 group-hover:gap-2 transition-all">
                    Learn more
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-navy-900 relative overflow-hidden">
        {/* decorative */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-white/20" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-white/20" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-crimson-400" />
              <span className="text-crimson-400 text-xs font-semibold tracking-widest uppercase">
                The Process
              </span>
              <div className="h-px w-8 bg-crimson-400" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-white">
              From sign-up to{" "}
              <em className="text-crimson-400 not-italic">funded</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step, i) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {i < process.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-white/10 z-0" />
                )}
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                  <div className="font-display text-5xl font-light text-crimson-400/30 mb-4 leading-none">
                    {step.step}
                  </div>
                  <h3 className="font-display text-xl text-white font-medium mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-crimson-500 text-white rounded-xl font-semibold text-base hover:bg-crimson-400 transition-colors"
            >
              Create a Free Account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── DESTINATIONS ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-crimson-500" />
              <span className="text-crimson-600 text-xs font-semibold tracking-widest uppercase">
                Study Destinations
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-navy-900">
              Where will your story{" "}
              <em className="not-italic text-crimson-500">unfold?</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {destinations.map((dest) => (
              <Link
                key={dest.country}
                href="/services/scholarships"
                className="group relative rounded-2xl overflow-hidden h-44 md:h-52"
              >
                <Image
                  src={dest.image}
                  alt={dest.country}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{dest.flag}</span>
                    <span className="text-white font-display text-lg font-medium">{dest.country}</span>
                  </div>
                  <p className="text-white/60 text-xs line-clamp-1">{dest.universities}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      {/* Was a strip of named university logos ("partner network") and
          three testimonial cards built from stock Pexels photos under
          invented names and quotes — removed per the platform review
          (claiming a partnership with Harvard/MIT/Stanford/etc. with none
          in place, and presenting fabricated people as real students, are
          both real exposure, not just unpolished content). Replace this
          block with real, consented student stories as they're collected. */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-crimson-500" />
              <span className="text-crimson-600 text-xs font-semibold tracking-widest uppercase">
                Success Stories
              </span>
              <div className="h-px w-8 bg-crimson-500" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-navy-900">
              We&apos;re building a story worth telling.
            </h2>
          </div>

          <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-card text-center">
            <p className="text-navy-600 text-sm leading-relaxed">
              We&apos;re collecting verified, consented stories from our subscribers. Check back soon
              — or subscribe today and be one of the first we feature.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-crimson-500 text-white rounded-xl font-semibold text-sm hover:bg-crimson-400 transition-colors"
            >
              Subscribe Now
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SUCCESS TIMELINE ─── */}
      <section className="py-24 bg-navy-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/20" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-crimson-400" />
              <span className="text-crimson-400 text-xs font-semibold tracking-widest uppercase">
                Student Journey
              </span>
              <div className="h-px w-8 bg-crimson-400" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-white">
              From sign-up to{" "}
              <em className="text-crimson-400 not-italic">funded</em>
            </h2>
            <p className="text-white/50 text-base mt-3 max-w-xl mx-auto">
              Here&apos;s exactly what happens after you subscribe to the database.
            </p>
          </div>

          {/* Desktop timeline */}
          <div className="hidden md:block relative">
            {/* Connecting line */}
            <div className="absolute top-7 left-[8.33%] right-[8.33%] h-0.5 bg-white/10" />
            <div className="grid grid-cols-6 gap-4">
              {journeySteps.map((step, i) => (
                <div key={step.label} className="flex flex-col items-center text-center gap-3">
                  <div className="relative z-10 w-14 h-14 rounded-full bg-navy-800 border border-white/10 flex items-center justify-center text-2xl shadow-lg">
                    {step.icon}
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-crimson-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm leading-tight">{step.label}</div>
                    <div className="text-white/40 text-xs mt-0.5">{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile timeline */}
          <div className="md:hidden relative pl-8">
            <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-white/10" />
            <div className="space-y-6">
              {journeySteps.map((step, i) => (
                <div key={step.label} className="relative flex items-start gap-4">
                  <div className="absolute -left-8 w-7 h-7 rounded-full bg-navy-800 border border-white/10 flex items-center justify-center text-sm z-10">
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-crimson-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-white font-semibold text-sm">{step.label}</span>
                    </div>
                    <div className="text-white/40 text-xs mt-0.5 ml-6">{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-crimson-500 text-white rounded-xl font-semibold text-base hover:bg-crimson-400 transition-colors"
            >
              Begin Your Journey →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ PREVIEW ─── */}
      <section className="py-24 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-crimson-500" />
                <span className="text-crimson-600 text-xs font-semibold tracking-widest uppercase">
                  Got Questions?
                </span>
              </div>
              <h2 className="font-display text-4xl font-light text-navy-900">
                Frequently asked questions
              </h2>
              <p className="text-navy-500 text-base mt-2">
                Everything students ask us before getting started.
              </p>
            </div>
            <Link
              href="/faq"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-colors"
            >
              Full FAQ Page →
            </Link>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-cream rounded-xl p-6 border border-border hover:border-crimson-200 transition-colors">
                <h3 className="font-semibold text-navy-900 mb-2 flex items-start gap-2">
                  <span className="text-crimson-500 shrink-0 mt-0.5">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-navy-600 text-sm leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-5 bg-crimson-50 border border-crimson-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-navy-900 text-sm">Still have questions?</p>
              <p className="text-navy-500 text-xs mt-0.5">Our team responds within 24 hours.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/faq" className="px-4 py-2 rounded-lg border border-navy-200 text-navy-700 text-sm font-medium hover:bg-white transition-colors">
                Browse FAQs
              </Link>
              <a href="mailto:info@makeoverarena.com" className="px-4 py-2 rounded-lg bg-crimson-500 text-white text-sm font-semibold hover:bg-crimson-400 transition-colors">
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="py-24 bg-navy-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1800&q=80"
            alt="Graduation"
            fill
            className="object-cover object-center opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 to-navy-900/80" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-crimson-400" />
            <span className="text-crimson-400 text-xs font-semibold tracking-widest uppercase">
              Get Started Today
            </span>
            <div className="h-px w-8 bg-crimson-400" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light text-white mb-5 leading-tight">
            Your scholarship{" "}
            <em className="text-crimson-400 not-italic">is waiting</em>
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Create a free account today — subscribe to unlock the full database and start your search.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-crimson-500 text-white rounded-xl font-semibold text-base hover:bg-crimson-400 transition-colors"
            >
              Create a Free Account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/services/scholarships"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-xl font-medium text-base hover:bg-white/10 transition-colors"
            >
              View Plans & Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
