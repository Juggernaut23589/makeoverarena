import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Book a Free Consultation",
  description: "Book your free 30-minute consultation with a MakeoverArena study abroad expert.",
};

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348000000000";

const contactMethods = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: "Email Us",
    value: "info@makeoverarena.com",
    href: "mailto:info@makeoverarena.com",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    label: "WhatsApp",
    value: "Chat with us on WhatsApp",
    href: `https://wa.me/${WHATSAPP}`,
  },
];

const officeHours = [
  { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM WAT" },
  { day: "Saturday", hours: "10:00 AM – 2:00 PM WAT" },
  { day: "Sunday", hours: "Closed" },
];

export default function BookPage() {
  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-navy-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold-400" />
            <span className="text-gold-400 text-xs font-semibold tracking-widest uppercase">Free Consultation</span>
            <div className="h-px w-8 bg-gold-400" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-white mb-4">
            Book a Free{" "}
            <em className="text-gold-400 not-italic">Consultation</em>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            30 minutes with an expert advisor. No obligations. Just honest, personalised guidance.
          </p>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cal.com embed */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
                <h2 className="font-display text-2xl text-navy-900 mb-2">Choose a time</h2>
                <p className="text-navy-500 text-sm mb-6">
                  All times shown in your local timezone. The consultation takes 30 minutes.
                </p>

                {/* Cal.com embed */}
                {process.env.NEXT_PUBLIC_CALCOM_URL ? (
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_CALCOM_URL}?embed=true&hideEventTypeDetails=false&layout=month_view`}
                    className="w-full rounded-xl border border-border"
                    style={{ height: "min(600px, 80vh)", minHeight: "500px" }}
                    frameBorder="0"
                    title="Book a consultation"
                  />
                ) : (
                  <div className="bg-navy-50 rounded-xl border border-border p-8 text-center">
                    <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-navy-700 font-medium mb-2">Calendar Booking</p>
                    <p className="text-navy-500 text-sm mb-4">
                      Set <code className="bg-navy-100 px-1 rounded text-xs">NEXT_PUBLIC_CALCOM_URL</code> in your environment variables to enable live booking (e.g. <code className="bg-navy-100 px-1 rounded text-xs">https://cal.com/your-username/30min</code>).
                    </p>
                    <a
                      href="https://cal.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors"
                    >
                      Set Up Cal.com →
                    </a>
                  </div>
                )}

                {/* Alternatively apply */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-navy-500 text-sm mb-3">Not sure yet? Fill out our application form first — it takes 5 minutes and helps us prepare for your consultation.</p>
                  <Link
                    href="/apply"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gold-600 hover:text-gold-700"
                  >
                    Start Application →
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* What to expect */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-display text-lg text-navy-900 mb-4">What to expect</h3>
                <ul className="space-y-3">
                  {[
                    "We review your profile and goals",
                    "Expert advice on universities and programmes",
                    "Scholarship and funding opportunities",
                    "Clear next steps and timeline",
                    "No hard sell — just honest guidance",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-gold-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-2.5 h-2.5 text-gold-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-navy-600 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-display text-lg text-navy-900 mb-4">Other ways to reach us</h3>
                <div className="space-y-3">
                  {contactMethods.map((m) => (
                    <a
                      key={m.label}
                      href={m.href}
                      className="flex items-center gap-3 text-navy-600 hover:text-navy-900 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center shrink-0 group-hover:bg-navy-100 transition-colors">
                        {m.icon}
                      </div>
                      <div>
                        <div className="text-xs text-navy-400">{m.label}</div>
                        <div className="text-sm font-medium text-navy-700">{m.value}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-navy-900 rounded-2xl p-6">
                <h3 className="font-display text-lg text-white mb-4">Office Hours</h3>
                <div className="space-y-2">
                  {officeHours.map((h) => (
                    <div key={h.day} className="flex justify-between text-sm">
                      <span className="text-white/60">{h.day}</span>
                      <span className="text-white/90 font-medium">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
