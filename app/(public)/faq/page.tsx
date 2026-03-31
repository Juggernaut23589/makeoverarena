"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const faqCategories = [
  {
    category: "General",
    faqs: [
      {
        q: "What is MakeoverArena?",
        a: "MakeoverArena is a Nigeria-based study abroad consultancy that helps students gain admission to top universities in the US, UK, Canada, Australia, and Europe. We provide end-to-end support from university selection to visa application.",
      },
      {
        q: "Where is your office?",
        a: "We serve students across Nigeria and Africa. Our team works remotely and online, so you can get our full support regardless of your location.",
      },
      {
        q: "What countries do you support?",
        a: "We currently specialise in the US, UK, Canada, Australia, Germany, France, Netherlands, Ireland, Sweden, and other European destinations.",
      },
    ],
  },
  {
    category: "Application Process",
    faqs: [
      {
        q: "How do I get started?",
        a: "Start by filling out our free application form — it takes about 5 minutes. Our advisor will review your profile and reach out within 24 hours to schedule a free consultation.",
      },
      {
        q: "How long does the application process take?",
        a: "Typically 3–6 months from initial inquiry to receiving your admission offer, depending on the intake cycle and number of universities you apply to.",
      },
      {
        q: "Do you help with the application essays?",
        a: "Yes — personal statement and essay review is included in all our packages. We review and provide detailed feedback to help your writing shine.",
      },
      {
        q: "Can I apply if I have a low GPA?",
        a: "Absolutely. A strong application is more than just grades. We help you present your profile holistically, identify the right universities, and craft a compelling narrative.",
      },
    ],
  },
  {
    category: "Pricing & Packages",
    faqs: [
      {
        q: "How much does it cost?",
        a: "Our packages start from ₦150,000 and go up to ₦500,000 depending on the number of universities, service level, and additional support needed. Book a free consultation for a personalised quote.",
      },
      {
        q: "Is there a free consultation?",
        a: "Yes! We offer a free 30-minute consultation to understand your goals and explain how we can help, with no obligation.",
      },
      {
        q: "When do I pay?",
        a: "Payment is discussed during your consultation. We typically require a deposit to begin and the remainder upon completion of key milestones.",
      },
    ],
  },
  {
    category: "Documents Required",
    faqs: [
      {
        q: "What documents will I need?",
        a: "Common documents include academic transcripts, CV/Resume, Statement of Purpose, Letters of Recommendation, standardised test scores (IELTS/TOEFL/GRE), and a valid passport. We provide a personalised checklist for your specific applications.",
      },
      {
        q: "Do I need an IELTS/TOEFL score?",
        a: "Most English-speaking countries require proof of English proficiency. However, some universities offer conditional offers or waivers for candidates from English-medium schools. We'll advise you on your specific situation.",
      },
    ],
  },
  {
    category: "Scholarships",
    faqs: [
      {
        q: "Do you help with scholarship applications?",
        a: "Yes — our Scholarship Assistance service is dedicated to this. We identify scholarships you qualify for, advise on strategy, review essays, and help with the full application.",
      },
      {
        q: "What is your scholarship success rate?",
        a: "65% of our scholarship applicants received some form of funding — from partial awards to full scholarships covering tuition and living costs.",
      },
    ],
  },
  {
    category: "Visa",
    faqs: [
      {
        q: "Do you help with student visa applications?",
        a: "Yes. Our Visa Support service covers documentation preparation, form filling guidance, interview preparation, and financial requirement advice for all major destinations.",
      },
      {
        q: "What is your visa success rate?",
        a: "We have a very high visa success rate when clients follow our guidance carefully. Visa approval depends on meeting the requirements — we make sure you're fully prepared.",
      },
    ],
  },
];

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-gold-200 text-navy-900 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function FAQPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return faqCategories;
    const q = query.toLowerCase();
    return faqCategories
      .map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter(
          (faq) =>
            faq.q.toLowerCase().includes(q) ||
            faq.a.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.faqs.length > 0);
  }, [query]);

  const totalResults = filtered.reduce((n, c) => n + c.faqs.length, 0);

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-navy-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold-400" />
            <span className="text-gold-400 text-xs font-semibold tracking-widest uppercase">Help Centre</span>
            <div className="h-px w-8 bg-gold-400" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-white mb-4">
            Frequently Asked <em className="text-gold-400 not-italic">Questions</em>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
            Everything you need to know about our services, process, and pricing.
          </p>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search result count */}
          {query && (
            <p className="text-sm text-navy-500 mb-6">
              {totalResults > 0
                ? `${totalResults} result${totalResults !== 1 ? "s" : ""} for "${query}"`
                : `No results for "${query}"`}
            </p>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-navy-400 text-sm mb-4">No matching questions found.</p>
              <button
                onClick={() => setQuery("")}
                className="text-gold-600 hover:text-gold-700 text-sm underline underline-offset-2"
              >
                Clear search
              </button>
            </div>
          )}

          {filtered.map((cat) => (
            <div key={cat.category} className="mb-12">
              <h2 className="font-display text-2xl text-navy-900 mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span>{cat.category}</span>
                <div className="h-px flex-1 bg-border" />
              </h2>
              <div className="space-y-3">
                {cat.faqs.map((faq) => (
                  <div key={faq.q} className="bg-white rounded-xl p-6 shadow-card">
                    <h3 className="font-semibold text-navy-900 mb-2">{highlight(faq.q, query)}</h3>
                    <p className="text-navy-600 text-sm leading-relaxed">{highlight(faq.a, query)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="bg-navy-900 rounded-2xl p-8 text-center">
            <h3 className="font-display text-2xl text-white mb-3">Still have questions?</h3>
            <p className="text-white/60 text-sm mb-6">
              Our team is happy to help. Book a free consultation or send us a message.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/book"
                className="inline-flex items-center justify-center px-6 py-3 bg-gold-500 text-navy-900 rounded-xl font-semibold text-sm hover:bg-gold-400 transition-colors"
              >
                Book Free Consultation
              </Link>
              <a
                href="mailto:info@makeoverarena.com"
                className="inline-flex items-center justify-center px-6 py-3 border border-white/20 text-white rounded-xl text-sm hover:bg-white/10 transition-colors"
              >
                Send an Email
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
