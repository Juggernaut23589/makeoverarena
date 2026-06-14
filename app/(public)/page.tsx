import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "MakeoverArena — Your Journey to Top Universities Starts Here",
  description:
    "Nigeria's #1 study-abroad consultancy. Expert guidance for undergraduate, graduate, PhD, scholarship, and visa applications to US, UK, Canada, Australia, and Europe.",
};

const stats = [
  { number: "2,400+", label: "Students Helped" },
  { number: "92%", label: "Success Rate" },
  { number: "200+", label: "Partner Universities" },
  { number: "15+", label: "Countries" },
];

const services = [
  {
    title: "Undergraduate",
    description: "Bachelor's degree admissions to top universities in the US, UK, Canada, and beyond.",
    icon: "🎓",
    href: "/services/undergraduate",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80",
  },
  {
    title: "Graduate",
    description: "Masters and postgraduate admissions — personalized strategy for every applicant.",
    icon: "📚",
    href: "/services/graduate",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
  },
  {
    title: "Scholarships",
    description: "Identify and win funding — 65% of our scholarship applicants received financial aid.",
    icon: "🏅",
    href: "/services/scholarships",
    image: "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=600&q=80",
  },
  {
    title: "Visa Support",
    description: "End-to-end visa guidance so your documentation is flawless and stress-free.",
    icon: "🌍",
    href: "/services/visa",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
  },
];

const testimonials = [
  {
    name: "Adaeze Okonkwo",
    school: "University of Toronto, Canada",
    program: "MSc Computer Science",
    quote: "MakeoverArena helped me navigate the entire application process from scratch. I had zero idea where to start and they guided me to a full scholarship offer.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
    scholarship: "Full Scholarship",
  },
  {
    name: "Emeka Nwosu",
    school: "University of Edinburgh, UK",
    program: "MBA",
    quote: "Professional, responsive, and genuinely invested in my success. They reviewed my SOP multiple times until it was perfect. Absolutely recommend.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    scholarship: null,
  },
  {
    name: "Fatima Al-Hassan",
    school: "Georgia Tech, USA",
    program: "MSc Electrical Engineering",
    quote: "From GRE prep guidance to visa support — they were with me every step. Now I'm studying at my dream university in Atlanta.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    scholarship: "Merit Award",
  },
];

const process = [
  {
    step: "01",
    title: "Submit Your Profile",
    description: "Fill out our smart application form in under 10 minutes. Tell us about your goals and background.",
  },
  {
    step: "02",
    title: "Free Consultation",
    description: "Our expert advisor reviews your profile and schedules a personalised 30-minute strategy session.",
  },
  {
    step: "03",
    title: "Custom Strategy",
    description: "We build your tailored university list, scholarship targets, and timeline — specific to you.",
  },
  {
    step: "04",
    title: "We Do the Heavy Lifting",
    description: "Application preparation, document review, SOP writing support, interview prep, and submission.",
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
  { q: "How long does the application process take?", a: "Typically 3–6 months from initial inquiry to admission offer, depending on the intake period and number of universities." },
  { q: "What is your success rate?", a: "We maintain a 92% admission success rate across all our applicants." },
  { q: "Do you help with scholarship applications?", a: "Yes — 65% of our scholarship applicants received funding ranging from partial to full scholarships." },
  { q: "How much does it cost to use your service?", a: "Packages start from ₦150,000 and vary based on the number of universities and complexity of your application." },
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
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-32">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-gold-400" />
              <span className="text-gold-400 text-sm font-medium tracking-widest uppercase">
                Study Abroad Experts
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.05] mb-6">
              Your Journey to{" "}
              <br />
              <em className="text-gradient-gold not-italic font-normal">Top Universities</em>
              <br />
              Starts Here
            </h1>

            <p className="text-white/70 text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10 max-w-xl">
              We guide ambitious African students through every step — from choosing the right program to holding that admission letter. 92% success rate across 200+ partner universities.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 px-7 py-4 bg-gold-500 text-navy-900 rounded-xl font-semibold text-base hover:bg-gold-400 transition-all duration-200 shadow-glow-gold"
              >
                Start Your Application
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-7 py-4 border border-white/25 text-white rounded-xl font-medium text-base hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Free Consultation
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
                  <div className="font-display text-3xl font-light text-gold-400 mb-1">
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
                <div className="h-px w-8 bg-gold-500" />
                <span className="text-gold-600 text-xs font-semibold tracking-widest uppercase">
                  What We Do
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-light text-navy-900 leading-tight">
                Services tailored to{" "}
                <em className="not-italic text-gold-500">your ambitions</em>
              </h2>
            </div>
            <Link
              href="/apply"
              className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-navy-700 hover:text-navy-900 group"
            >
              View all services
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-gold-600 group-hover:gap-2 transition-all">
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
              <div className="h-px w-8 bg-gold-400" />
              <span className="text-gold-400 text-xs font-semibold tracking-widest uppercase">
                The Process
              </span>
              <div className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-white">
              From inquiry to{" "}
              <em className="text-gold-400 not-italic">admission offer</em>
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
                  <div className="font-display text-5xl font-light text-gold-400/30 mb-4 leading-none">
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
              href="/apply"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 text-navy-900 rounded-xl font-semibold text-base hover:bg-gold-400 transition-colors"
            >
              Start Now — It&apos;s Free
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
              <div className="h-px w-8 bg-gold-500" />
              <span className="text-gold-600 text-xs font-semibold tracking-widest uppercase">
                Study Destinations
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-navy-900">
              Where will your story{" "}
              <em className="not-italic text-gold-500">unfold?</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {destinations.map((dest) => (
              <Link
                key={dest.country}
                href="/apply"
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
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold-500" />
              <span className="text-gold-600 text-xs font-semibold tracking-widest uppercase">
                Success Stories
              </span>
              <div className="h-px w-8 bg-gold-500" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-navy-900">
              Real students.{" "}
              <em className="not-italic text-gold-500">Real results.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-gold-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-navy-700 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={t.image}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 text-sm">{t.name}</div>
                    <div className="text-navy-500 text-xs">{t.program}</div>
                    <div className="text-navy-400 text-xs">{t.school}</div>
                  </div>
                  {t.scholarship && (
                    <div className="ml-auto shrink-0">
                      <span className="bg-gold-100 text-gold-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {t.scholarship}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/success-stories"
              className="inline-flex items-center gap-2 text-sm font-medium text-navy-700 hover:text-navy-900 group"
            >
              Read all success stories
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ PREVIEW ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold-500" />
              <span className="text-gold-600 text-xs font-semibold tracking-widest uppercase">
                FAQs
              </span>
              <div className="h-px w-8 bg-gold-500" />
            </div>
            <h2 className="font-display text-4xl font-light text-navy-900">
              Common questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-cream rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-navy-900 mb-2">{faq.q}</h3>
                <p className="text-navy-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-sm font-medium text-navy-700 hover:text-navy-900 group"
            >
              View all FAQs
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="py-24 bg-navy-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1800&q=80"
            alt="Graduation"
            fill
            className="object-cover object-center opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 to-navy-900/80" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-gold-400" />
            <span className="text-gold-400 text-xs font-semibold tracking-widest uppercase">
              Get Started Today
            </span>
            <div className="h-px w-8 bg-gold-400" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light text-white mb-5 leading-tight">
            Your dream university{" "}
            <em className="text-gold-400 not-italic">is waiting</em>
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Take the first step today. Our application takes 5 minutes and our team responds within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-500 text-navy-900 rounded-xl font-semibold text-base hover:bg-gold-400 transition-colors"
            >
              Start Application — Free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-xl font-medium text-base hover:bg-white/10 transition-colors"
            >
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
