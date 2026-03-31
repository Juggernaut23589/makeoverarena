import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | MakeoverArena",
  description: "Terms and conditions for using MakeoverArena's study abroad consultancy services.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By submitting an application, booking a consultation, or using any service provided by MakeoverArena ("we", "our", "us"), you agree to be bound by these Terms of Service.

If you do not agree to these terms, please do not use our services.`,
  },
  {
    title: "2. Services Provided",
    content: `MakeoverArena provides study abroad consultancy services including:

• University research and shortlisting
• Application document support (SOP, CV, personal statement review)
• Scholarship identification and application support
• Visa application guidance
• Pre-departure orientation

We do not guarantee admission to any university or the success of any visa application. We provide expert guidance and support to maximise your chances.`,
  },
  {
    title: "3. Client Responsibilities",
    content: `You agree to:

• Provide accurate, complete, and truthful information in your application and all interactions with our team
• Submit documents and information on time as requested
• Be responsive to our communications within a reasonable timeframe
• Not share any proprietary materials, templates, or strategies provided by MakeoverArena with third parties
• Understand that final admissions decisions rest with universities, not MakeoverArena`,
  },
  {
    title: "4. Fees and Payment",
    content: `Service fees are communicated during your free consultation and outlined in your service agreement. Payment terms:

• A deposit is required before work commences
• Remaining balance is due as outlined in your service agreement
• Fees are non-refundable unless MakeoverArena fails to deliver the agreed services
• We reserve the right to pause services if payment is outstanding

All prices are quoted in Nigerian Naira (₦) unless otherwise stated.`,
  },
  {
    title: "5. Intellectual Property",
    content: `All materials provided by MakeoverArena — including templates, guides, frameworks, and advice — remain our intellectual property. You may use them for your personal application only. You may not:

• Share, sell, or redistribute our materials
• Use our materials to provide services to others
• Remove any attribution or branding from our documents`,
  },
  {
    title: "6. Confidentiality",
    content: `Both parties agree to maintain confidentiality of sensitive information shared during the engagement. We will not share your personal details with third parties except as required to deliver our services or as required by law (see our Privacy Policy).`,
  },
  {
    title: "7. Limitation of Liability",
    content: `MakeoverArena's liability is limited to the fees paid for the specific service in which the issue arose. We are not liable for:

• University admission or rejection decisions
• Visa refusals or delays
• Changes in university requirements, deadlines, or policies
• Losses arising from your failure to provide accurate information or meet deadlines
• Indirect, consequential, or incidental losses of any kind`,
  },
  {
    title: "8. Termination",
    content: `Either party may terminate the engagement with 7 days written notice. In the event of termination:

• Fees for work already completed are non-refundable
• We will provide all completed documents and work product to you
• You may not use any incomplete materials for submission without our written consent`,
  },
  {
    title: "9. Governing Law",
    content: `These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved through good-faith negotiation first, and if unresolved, through arbitration in Lagos, Nigeria.`,
  },
  {
    title: "10. Changes to These Terms",
    content: `We reserve the right to update these Terms. Significant changes will be communicated to active clients. Continued use of our services after changes constitutes acceptance of the updated Terms.

Last updated: January 2024`,
  },
];

export default function TermsPage() {
  return (
    <div className="pt-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold-500" />
            <span className="text-gold-600 text-xs font-semibold tracking-widest uppercase">
              Legal
            </span>
          </div>
          <h1 className="font-display text-4xl text-navy-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-navy-600 leading-relaxed">
            Please read these terms carefully before using MakeoverArena&apos;s
            services. By using our services, you agree to be bound by these
            terms.
          </p>
        </div>

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

        <div className="mt-12 p-6 bg-white rounded-2xl shadow-card">
          <h2 className="font-display text-xl text-navy-900 mb-3">
            Questions about these terms?
          </h2>
          <p className="text-navy-600 text-sm mb-4">
            Contact us at{" "}
            <a
              href="mailto:legal@makeoverarena.com"
              className="text-gold-600 hover:text-gold-700 font-medium"
            >
              legal@makeoverarena.com
            </a>
          </p>
          <div className="flex gap-3">
            <Link
              href="/privacy"
              className="text-sm text-navy-500 hover:text-navy-700 underline underline-offset-2"
            >
              Privacy Policy
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
