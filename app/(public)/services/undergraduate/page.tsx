import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Undergraduate Admissions",
  description: "Expert guidance for Bachelor's degree admissions to top universities in the US, UK, Canada, Australia, and Europe.",
};

const included = [
  "University research and shortlisting (personalised to your profile)",
  "Common App / UCAS / direct application support",
  "Personal statement / essay review and editing",
  "Academic document preparation and certification",
  "Letters of recommendation strategy",
  "Scholarship identification and application",
  "Visa application guidance (student visa)",
  "Pre-departure orientation and support",
];

const timeline = [
  { phase: "Month 1", title: "Profile Assessment", desc: "We review your academic profile, goals, and shortlist target universities." },
  { phase: "Month 2–3", title: "Application Preparation", desc: "Document gathering, essay writing, and application portal setup." },
  { phase: "Month 3–4", title: "Submission", desc: "Applications submitted to all target universities with tracking." },
  { phase: "Month 4–6", title: "Admissions & Visa", desc: "Managing offer letters, accepting admission, visa application support." },
];

export default function UndergraduatePage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-72 md:h-96 bg-navy-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=80"
          alt="University campus"
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold-400" />
            <span className="text-gold-400 text-xs font-semibold tracking-widest uppercase">Service</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-white">
            Undergraduate <em className="text-gold-400 not-italic">Admissions</em>
          </h1>
          <p className="text-white/60 mt-3 text-lg max-w-lg">
            Expert guidance from application strategy to holding your offer letter.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <div>
                <h2 className="font-display text-3xl text-navy-900 mb-5">What&apos;s included</h2>
                <ul className="space-y-3">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gold-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-gold-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-navy-700 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timeline */}
              <div>
                <h2 className="font-display text-3xl text-navy-900 mb-5">Application Timeline</h2>
                <div className="space-y-4">
                  {timeline.map((t, i) => (
                    <div key={t.phase} className="flex gap-5">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </div>
                        {i < timeline.length - 1 && <div className="w-px flex-1 bg-navy-200 mt-2" />}
                      </div>
                      <div className="pb-6">
                        <span className="text-xs text-gold-600 font-semibold uppercase tracking-wide">{t.phase}</span>
                        <h3 className="font-semibold text-navy-900 mt-0.5 mb-1">{t.title}</h3>
                        <p className="text-navy-600 text-sm leading-relaxed">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-display text-xl text-navy-900 mb-4">Ready to apply?</h3>
                <p className="text-navy-600 text-sm mb-5">Start your application today. It takes 5 minutes and our team responds within 24 hours.</p>
                <Link
                  href="/apply"
                  className="block w-full text-center px-5 py-3 bg-gold-500 text-navy-900 rounded-xl font-semibold text-sm hover:bg-gold-400 transition-colors mb-3"
                >
                  Start Application →
                </Link>
                <Link
                  href="/book"
                  className="block w-full text-center px-5 py-3 border border-navy-200 text-navy-700 rounded-xl text-sm hover:bg-navy-50 transition-colors"
                >
                  Book Free Consultation
                </Link>
              </div>

              <div className="bg-navy-900 rounded-2xl p-6 text-white">
                <div className="text-3xl font-display font-light text-gold-400 mb-1">₦150k+</div>
                <div className="text-white/60 text-sm mb-4">Starting price for undergraduate packages</div>
                <div className="text-white/50 text-xs">Price varies based on number of universities and service level. Book a free consultation for a personalised quote.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
