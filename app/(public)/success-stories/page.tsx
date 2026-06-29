import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Student Success Stories",
  description: "Read how MakeoverArena has helped 2,400+ Nigerian students gain admission to top universities worldwide.",
};

const stories = [
  {
    name: "Adaeze Okonkwo",
    university: "University of Toronto",
    country: "Canada",
    flag: "🇨🇦",
    program: "MSc Computer Science",
    scholarship: "Full Scholarship — $45,000/year",
    quote: "MakeoverArena helped me navigate the entire application process from scratch. I had zero idea where to start and they guided me to a full scholarship offer. Best decision I ever made.",
    image: "https://images.pexels.com/photos/3869648/pexels-photo-3869648.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
    year: "2024",
  },
  {
    name: "Emeka Nwosu",
    university: "University of Edinburgh",
    country: "United Kingdom",
    flag: "🇬🇧",
    program: "MBA — Business Management",
    scholarship: null,
    quote: "Professional, responsive, and genuinely invested in my success. They reviewed my SOP multiple times until it was perfect. I highly recommend them to any serious applicant.",
    image: "https://images.pexels.com/photos/7446948/pexels-photo-7446948.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
    year: "2024",
  },
  {
    name: "Fatima Al-Hassan",
    university: "Georgia Institute of Technology",
    country: "United States",
    flag: "🇺🇸",
    program: "MSc Electrical Engineering",
    scholarship: "Merit Award — $12,000",
    quote: "From GRE prep guidance to visa support, they were with me every step of the way. Now I'm studying at my dream university in Atlanta.",
    image: "https://images.pexels.com/photos/9304685/pexels-photo-9304685.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
    year: "2023",
  },
  {
    name: "Chukwudi Eze",
    university: "University of Melbourne",
    country: "Australia",
    flag: "🇦🇺",
    program: "PhD Civil Engineering",
    scholarship: "Research Scholarship",
    quote: "I applied to five universities with MakeoverArena's help and received offers from three. The team's knowledge of the Australian system was exceptional.",
    image: "https://images.pexels.com/photos/9363531/pexels-photo-9363531.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
    year: "2023",
  },
  {
    name: "Ngozi Obi",
    university: "TU Munich",
    country: "Germany",
    flag: "🇩🇪",
    program: "MSc Mechanical Engineering",
    scholarship: "DAAD Scholarship",
    quote: "I was skeptical at first, but the team knew the German university system inside out. They helped me secure a DAAD scholarship I didn't even know I was eligible for.",
    image: "https://images.pexels.com/photos/29852895/pexels-photo-29852895.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
    year: "2024",
  },
  {
    name: "David Adeyemi",
    university: "University College London",
    country: "United Kingdom",
    flag: "🇬🇧",
    program: "LLM International Law",
    scholarship: null,
    quote: "The personal statement support was incredible. My advisor completely transformed my draft into something compelling and uniquely me.",
    image: "https://images.pexels.com/photos/9363116/pexels-photo-9363116.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
    year: "2023",
  },
];

const countryFilters = ["All", "United States", "United Kingdom", "Canada", "Australia", "Germany"];

export default function SuccessStoriesPage() {
  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-navy-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(212,168,83,0.5) 0%, transparent 50%)" }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-crimson-400" />
            <span className="text-crimson-400 text-xs font-semibold tracking-widest uppercase">Success Stories</span>
            <div className="h-px w-8 bg-crimson-400" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-white mb-4">
            Real students.{" "}
            <em className="text-crimson-400 not-italic">Real results.</em>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Over 2,400 students have trusted us with their study abroad journey. Here are just a few of their stories.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
            {[
              { num: "2,400+", label: "Students Helped" },
              { num: "92%", label: "Success Rate" },
              { num: "65%", label: "Received Scholarships" },
              { num: "200+", label: "Partner Universities" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl text-crimson-400">{s.num}</div>
                <div className="text-white/50 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {countryFilters.map((f) => (
              <button
                key={f}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  f === "All"
                    ? "bg-navy-900 text-white font-medium"
                    : "border border-border text-navy-600 hover:border-navy-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.name}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="p-6">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-crimson-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="text-navy-700 text-sm leading-relaxed italic mb-5">
                    &ldquo;{story.quote}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={story.image}
                        alt={story.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-navy-900 text-sm">{story.name}</div>
                      <div className="text-navy-500 text-xs">{story.program}</div>
                      <div className="text-navy-400 text-xs flex items-center gap-1">
                        <span>{story.flag}</span>
                        <span>{story.university}</span>
                      </div>
                    </div>
                    <span className="text-xs text-navy-400 shrink-0">{story.year}</span>
                  </div>
                </div>

                {story.scholarship && (
                  <div className="border-t border-crimson-100 bg-crimson-50 px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-crimson-600 text-sm">🏅</span>
                      <span className="text-crimson-700 text-xs font-medium">{story.scholarship}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-navy-900 mb-4">
            Your success story{" "}
            <em className="text-crimson-500 not-italic">starts here</em>
          </h2>
          <p className="text-navy-600 mb-8">
            Join thousands of students who have achieved their dream with MakeoverArena&apos;s expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-crimson-500 text-white rounded-xl font-semibold text-sm hover:bg-crimson-400 transition-colors"
            >
              Start Your Application →
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-7 py-3.5 border border-navy-200 text-navy-700 rounded-xl text-sm hover:bg-navy-50 transition-colors"
            >
              Book Free Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
