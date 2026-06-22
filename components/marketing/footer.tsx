import React from "react";
import Link from "next/link";

const PHONE = process.env.NEXT_PUBLIC_PHONE ?? "+234 800 000 0000";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348000000000";
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "#";
const LINKEDIN = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "#";
const TWITTER = process.env.NEXT_PUBLIC_TWITTER_URL ?? "#";

const services = [
  { href: "/services/undergraduate", label: "Undergraduate Admissions" },
  { href: "/services/graduate", label: "Graduate Admissions" },
  { href: "/services/scholarships", label: "Scholarship Assistance" },
  { href: "/services/visa", label: "Visa Support" },
];

const company = [
  { href: "/about", label: "About Us" },
  { href: "/success-stories", label: "Success Stories" },
  { href: "/faq", label: "FAQs" },
  { href: "/book", label: "Book Consultation" },
];

const legal = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
];

const destinations = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Netherlands",
];

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      {/* CTA Band */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-light text-white mb-3">
                Ready to start your{" "}
                <em className="text-gold-400 not-italic">journey?</em>
              </h2>
              <p className="text-white/60 text-base max-w-md">
                Join 2,000+ students who have achieved their dream of studying abroad with our expert guidance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/apply"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors"
              >
                Start Your Application →
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Book Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-gold-500 rounded-lg flex items-center justify-center shrink-0">
                <span className="font-display text-navy-900 font-bold text-lg leading-none">M</span>
              </div>
              <span className="font-display font-semibold text-xl text-white">
                Makeover<span className="text-gold-400">Arena</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              Africa&apos;s leading study-abroad consultancy. We help ambitious students gain admission to top universities across the globe.
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@makeoverarena.com
              </p>
              <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white/80 transition-colors">
                <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {PHONE}
              </a>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white/80 transition-colors">
                <svg className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
            </div>
            {/* Social */}
            <div className="flex gap-3 mt-6">
              {[
                { label: "Instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                { label: "LinkedIn", icon: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" },
                { label: "Twitter/X", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.629 5.905-5.629zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
              ].map((social) => {
                const href = social.label === "Instagram" ? INSTAGRAM : social.label === "LinkedIn" ? LINKEDIN : TWITTER;
                return (
                  <a
                    key={social.label}
                    href={href}
                    target={href !== "#" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                      <path d={social.icon} />
                    </svg>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {services.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">
              Destinations
            </h3>
            <ul className="space-y-2.5">
              {destinations.map((d) => (
                <li key={d}>
                  <span className="text-sm text-white/60">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} MakeoverArena. All rights reserved.
            </p>
            <Link
              href="/staff/login"
              className="text-xs text-white/20 hover:text-white/40 transition-colors"
            >
              Staff Login
            </Link>
            <span className="text-xs text-white/10">·</span>
            <Link
              href="/admin/login"
              className="text-xs text-white/20 hover:text-white/40 transition-colors"
            >
              Admin Login
            </Link>
          </div>
          <div className="flex gap-6">
            {legal.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
