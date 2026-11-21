"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const faqCategories = [
  {
    category: "General",
    faqs: [
      {
        q: "What is MakeoverArena?",
        a: "MakeoverArena is a centralised, verified scholarship database for African students pursuing study abroad — search, save, and track funding opportunities to universities in the US, UK, Canada, Australia, and Europe.",
      },
      {
        q: "Where is your office?",
        a: "We serve students across Nigeria and Africa. Our team works remotely and online, so you can get our full support regardless of your location.",
      },
      {
        q: "What countries are covered?",
        a: "The database includes scholarships for the US, UK, Canada, Australia, Germany, France, Netherlands, and other European destinations, with new listings added continuously.",
      },
      {
        q: "How do I get started?",
        a: "Create a free account — it takes about a minute. Tell us your academic profile, pick an access tier, and start searching.",
      },
    ],
  },
  {
    category: "The Scholarship Database",
    faqs: [
      {
        q: "How are listings verified?",
        a: "Every scholarship goes through a staged research, verification, and approval process by our team before it's published, so you're not wasting time on stale or fake listings.",
      },
      {
        q: "Can I save and download scholarships?",
        a: "Yes — you can bookmark any scholarship to a saved list and download the full details for later reference.",
      },
      {
        q: "Will I be notified about deadlines or new matches?",
        a: "Yes — you'll get notifications for upcoming renewal/expiry, failed payments, and new scholarships matching your profile.",
      },
    ],
  },
  {
    category: "Pricing & Access",
    faqs: [
      {
        q: "How much does it cost?",
        a: "Access is sold as Basic, Standard, and Premium tiers over a fixed period (e.g. 1, 3, or 6 months) rather than a one-time fee — pricing is shown on the Scholarships page and at signup.",
      },
      {
        q: "Can I change tiers or renew later?",
        a: "Yes — you can upgrade, downgrade, or renew your access anytime from your dashboard.",
      },
      {
        q: "What happens when my subscription expires?",
        a: "You'll get renewal reminders before expiry. Once expired, your access reverts to whatever free listings are available until you renew.",
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
      <mark className="bg-crimson-200 text-navy-900 rounded px-0.5">
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
            <div className="h-px w-8 bg-crimson-400" />
            <span className="text-crimson-400 text-xs font-semibold tracking-widest uppercase">Help Centre</span>
            <div className="h-px w-8 bg-crimson-400" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-white mb-4">
            Frequently Asked <em className="text-crimson-400 not-italic">Questions</em>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
            Everything you need to know about the scholarship database and pricing.
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
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-crimson-400 text-sm"
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
                className="text-crimson-600 hover:text-crimson-700 text-sm underline underline-offset-2"
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
              Our team is happy to help. Subscribe to get started or send us a message.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 bg-crimson-500 text-white rounded-xl font-semibold text-sm hover:bg-crimson-400 transition-colors"
              >
                Subscribe Now
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
