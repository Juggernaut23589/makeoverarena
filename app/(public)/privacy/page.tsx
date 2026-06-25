import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | MakeoverArena",
  description: "How MakeoverArena collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "1. Who We Are",
    content: `MakeoverArena is a study abroad consultancy based in Lagos, Nigeria. We operate the website at makeoverarena.com and provide admissions, scholarship, and visa support services to students.

For any privacy-related queries, contact us at: privacy@makeoverarena.com`,
  },
  {
    title: "2. What Personal Data We Collect",
    content: `When you use our services, we may collect:

• Contact information: full name, email address, phone number, WhatsApp number, city, country of residence
• Academic information: education level, GPA, field of study, graduation year, test scores
• Application preferences: target universities, target countries, budget range, intake period
• Communication data: messages sent via our chatbot or email
• Technical data: IP address, browser type, pages visited, time on site (via Google Analytics)
• Payment data: we do not store payment card details; payments are processed by third parties`,
  },
  {
    title: "3. How We Use Your Data",
    content: `We use your personal data to:

• Process your application and match you with appropriate services
• Contact you about your application and send relevant updates
• Schedule and manage consultations
• Send educational content and service information (if you opted in)
• Improve our services and website
• Comply with legal obligations`,
  },
  {
    title: "4. Legal Basis for Processing",
    content: `We process your data on the following legal bases:

• Contract performance: to provide the services you have requested
• Legitimate interests: to operate and improve our services
• Consent: for marketing emails and cookies — you can withdraw consent at any time
• Legal obligation: where required by Nigerian law or applicable regulations`,
  },
  {
    title: "5. Data Sharing",
    content: `We do not sell your personal data. We share data only with:

• Service providers who help us operate (Supabase for database, Resend for email, OpenAI for chatbot, Cal.com for scheduling)
• Analytics providers (Google Analytics — anonymised usage data)
• Professional advisors where legally required

All third-party providers are contractually bound to protect your data and use it only for the specified purpose.`,
  },
  {
    title: "6. Data Retention",
    content: `We retain your personal data for:

• Active clients: for the duration of the engagement plus 3 years
• Inquiries that did not proceed: 2 years from last contact
• Email logs: 12 months
• Analytics data: as per Google Analytics default settings (26 months)

You may request deletion of your data at any time (see section 8).`,
  },
  {
    title: "7. Cookies",
    content: `We use the following cookies:

• Essential cookies: required for the website to function (session management, form state)
• Analytics cookies: Google Analytics — to understand how visitors use our site
• Preference cookies: to remember your cookie consent choice

You can manage cookie preferences via our Cookie Settings banner. See our Cookie Policy for full details.`,
  },
  {
    title: "8. Your Rights",
    content: `You have the right to:

• Access: request a copy of the personal data we hold about you
• Correction: ask us to correct inaccurate or incomplete data
• Deletion: request that we delete your personal data ("right to be forgotten")
• Restriction: ask us to limit how we use your data
• Portability: receive your data in a portable format
• Objection: object to our use of your data for direct marketing
• Withdraw consent: for any processing based on your consent

To exercise any of these rights, email privacy@makeoverarena.com. We will respond within 30 days.`,
  },
  {
    title: "9. Security",
    content: `We take security seriously. We use:

• HTTPS encryption for all data in transit
• Supabase Row Level Security (RLS) to restrict database access
• Environment variables and secret management for API keys
• Regular security reviews of our codebase

No system is 100% secure. If you believe your data has been compromised, contact us immediately.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify registered users of material changes by email. The latest version is always available at makeoverarena.com/privacy.

Last updated: January 2024`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="pt-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-crimson-500" />
            <span className="text-crimson-600 text-xs font-semibold tracking-widest uppercase">
              Legal
            </span>
          </div>
          <h1 className="font-display text-4xl text-navy-900 mb-4">Privacy Policy</h1>
          <p className="text-navy-600 leading-relaxed">
            Your privacy matters to us. This policy explains how MakeoverArena
            collects, uses, and protects your personal information when you use
            our website and services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl text-navy-900 mb-3">
                {section.title}
              </h2>
              <div className="text-navy-600 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 p-6 bg-white rounded-2xl shadow-card">
          <h2 className="font-display text-xl text-navy-900 mb-3">
            Questions about your data?
          </h2>
          <p className="text-navy-600 text-sm mb-4">
            Contact our privacy team at{" "}
            <a
              href="mailto:privacy@makeoverarena.com"
              className="text-crimson-600 hover:text-crimson-700 font-medium"
            >
              privacy@makeoverarena.com
            </a>
            . We will respond within 30 days.
          </p>
          <div className="flex gap-3">
            <Link
              href="/terms"
              className="text-sm text-navy-500 hover:text-navy-700 underline underline-offset-2"
            >
              Terms of Service
            </Link>
            <span className="text-navy-300">·</span>
            <Link
              href="/cookies"
              className="text-sm text-navy-500 hover:text-navy-700 underline underline-offset-2"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
