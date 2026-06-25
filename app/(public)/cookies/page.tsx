import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | MakeoverArena",
  description: "How MakeoverArena uses cookies and how you can manage your preferences.",
};

const cookieTypes = [
  {
    name: "Strictly Necessary",
    required: true,
    description:
      "These cookies are required for the website to function. They cannot be disabled. They include session management and form state cookies.",
    examples: ["Session token (Supabase auth)", "Form draft state (localStorage)", "Cookie consent preference"],
  },
  {
    name: "Analytics",
    required: false,
    description:
      "We use Google Analytics 4 to understand how visitors use our website. All data is anonymised and aggregated — we cannot identify individual users.",
    examples: ["_ga (Google Analytics ID)", "_ga_XXXXX (session counter)", "Page views, click events, session duration"],
  },
  {
    name: "Functional",
    required: false,
    description:
      "These cookies remember your preferences and improve your experience. We currently use these minimally.",
    examples: ["Language preference", "Chatbot session context"],
  },
];

export default function CookiesPage() {
  return (
    <div className="pt-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-crimson-500" />
            <span className="text-crimson-600 text-xs font-semibold tracking-widest uppercase">
              Legal
            </span>
          </div>
          <h1 className="font-display text-4xl text-navy-900 mb-4">Cookie Policy</h1>
          <p className="text-navy-600 leading-relaxed">
            This policy explains how MakeoverArena uses cookies and similar
            tracking technologies, and how you can control them.
          </p>
        </div>

        {/* What are cookies */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-navy-900 mb-3">
            What Are Cookies?
          </h2>
          <p className="text-navy-600 text-sm leading-relaxed">
            Cookies are small text files stored on your device when you visit a
            website. They help the site remember your preferences and
            understand how you interact with it. Some cookies are essential for
            the site to work; others are optional and used for analytics or
            personalisation.
          </p>
        </section>

        {/* Cookie types */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-navy-900 mb-6">
            Cookies We Use
          </h2>
          <div className="space-y-5">
            {cookieTypes.map((type) => (
              <div
                key={type.name}
                className="bg-white rounded-xl shadow-card p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-semibold text-navy-900">{type.name}</h3>
                  <span
                    className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                      type.required
                        ? "bg-navy-100 text-navy-700"
                        : "bg-crimson-100 text-crimson-700"
                    }`}
                  >
                    {type.required ? "Required" : "Optional"}
                  </span>
                </div>
                <p className="text-navy-600 text-sm leading-relaxed mb-4">
                  {type.description}
                </p>
                <div>
                  <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-2">
                    Examples
                  </p>
                  <ul className="space-y-1">
                    {type.examples.map((ex) => (
                      <li key={ex} className="flex items-center gap-2 text-xs text-navy-500">
                        <div className="w-1 h-1 rounded-full bg-crimson-400 shrink-0" />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to manage */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-navy-900 mb-3">
            How to Manage Cookies
          </h2>
          <p className="text-navy-600 text-sm leading-relaxed mb-4">
            You can control cookies in the following ways:
          </p>
          <ul className="space-y-3 text-navy-600 text-sm leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-crimson-500 font-bold shrink-0 mt-0.5">1.</span>
              <span>
                <strong>Cookie banner:</strong> When you first visit our site, a
                cookie consent banner will appear. You can accept all cookies,
                or accept only necessary cookies.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-crimson-500 font-bold shrink-0 mt-0.5">2.</span>
              <span>
                <strong>Browser settings:</strong> You can configure your
                browser to block or delete cookies. Note that blocking
                necessary cookies may affect site functionality. See your
                browser&apos;s help documentation for instructions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-crimson-500 font-bold shrink-0 mt-0.5">3.</span>
              <span>
                <strong>Google Analytics opt-out:</strong> You can install the{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-crimson-600 hover:text-crimson-700 underline"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>{" "}
                to prevent your data from being used by Google Analytics.
              </span>
            </li>
          </ul>
        </section>

        {/* Third parties */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-navy-900 mb-3">
            Third-Party Services
          </h2>
          <p className="text-navy-600 text-sm leading-relaxed">
            Some functionality on our site is provided by third-party services
            which may set their own cookies. These include Google Analytics,
            Cal.com (booking), and Supabase (authentication). Please refer to
            their privacy policies for information on their cookie use.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl text-navy-900 mb-3">
            Changes to This Policy
          </h2>
          <p className="text-navy-600 text-sm leading-relaxed">
            We may update this Cookie Policy as our technology or legal
            obligations change. The latest version is always at
            makeoverarena.com/cookies.
          </p>
          <p className="text-navy-400 text-xs mt-2">Last updated: January 2024</p>
        </section>

        <div className="p-6 bg-white rounded-2xl shadow-card">
          <h2 className="font-display text-xl text-navy-900 mb-3">
            Questions about cookies?
          </h2>
          <p className="text-navy-600 text-sm mb-4">
            Email us at{" "}
            <a
              href="mailto:privacy@makeoverarena.com"
              className="text-crimson-600 hover:text-crimson-700 font-medium"
            >
              privacy@makeoverarena.com
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
              href="/terms"
              className="text-sm text-navy-500 hover:text-navy-700 underline underline-offset-2"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
