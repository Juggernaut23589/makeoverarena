import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us | MakeoverArena",
  description:
    "Nigeria's #1 study-abroad consultancy. Our story, our mission, and the team that has helped 2,400+ students reach top universities worldwide.",
  openGraph: {
    title: "About MakeoverArena",
    description:
      "Nigeria's #1 study-abroad consultancy — 2,400+ students, 92% success rate.",
  },
};

const stats = [
  { number: "2,400+", label: "Students Placed", icon: "🎓" },
  { number: "92%", label: "Admission Success Rate", icon: "📈" },
  { number: "200+", label: "Partner Universities", icon: "🏛️" },
  { number: "15+", label: "Countries", icon: "🌍" },
  { number: "8", label: "Years in Operation", icon: "📅" },
  { number: "65%", label: "Scholarship Win Rate", icon: "🏅" },
];

const values = [
  {
    title: "Student-First",
    desc: "Every decision we make is filtered through a single question: what is best for this student's future? We never push programmes that don't fit.",
    icon: "🎯",
  },
  {
    title: "Radical Transparency",
    desc: "No hidden fees. No inflated success rate claims. We tell you honestly which universities you can get into and which you cannot — before you pay us anything.",
    icon: "🔍",
  },
  {
    title: "Outcome-Obsessed",
    desc: "We measure ourselves by one metric: did our students get in and thrive? A 92% success rate is not a marketing line — it's what we wake up to maintain.",
    icon: "📊",
  },
  {
    title: "Nigerian Pride",
    desc: "We are built by Nigerians, for Nigerians. We understand the unique challenges Nigerian students face — from funding to visa refusals — and we've built systems to beat them.",
    icon: "🇳🇬",
  },
];

const team = [
  {
    name: "Amara Obi",
    role: "Founder & Lead Consultant",
    bio: "Former international student at University of Edinburgh. Personally helped place 800+ students before founding MakeoverArena in 2016.",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
    schools: "Edinburgh · LSE · UCL",
  },
  {
    name: "Chidi Nwosu",
    role: "Head of Graduate Admissions",
    bio: "Masters from Columbia University. Specialises in STEM graduate applications and research-heavy PhD programmes in the US and Europe.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    schools: "Columbia · MIT · ETH Zurich",
  },
  {
    name: "Zara Al-Hassan",
    role: "Scholarships Specialist",
    bio: "Chevening alumna. Has helped students win over ₦2bn in scholarship funding across Chevening, Commonwealth, Fulbright, and DAAD.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    schools: "Oxford · Chevening · DAAD",
  },
];

const milestones = [
  { year: "2016", event: "MakeoverArena founded in Lagos with 3 consultants and 12 students." },
  { year: "2018", event: "Crossed 500 successful placements. Expanded to UK and Canadian applications." },
  { year: "2020", event: "Launched full digital application process and remote consultations during COVID." },
  { year: "2021", event: "Helped students win ₦500m+ in scholarship funding in a single year." },
  { year: "2023", event: "Reached 2,000 students placed. Expanded team to 12 full-time consultants." },
  { year: "2024", event: "Launched AI-assisted application platform. 2,400+ students and growing." },
];

export default function AboutPage() {
  return (
    <div className="pt-20 overflow-x-hidden">
      {/* Hero */}
      <section className="relative h-80 md:h-[28rem] bg-navy-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1600&q=80"
          alt="Team collaboration"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/70 to-navy-900/40" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold-400" />
            <span className="text-gold-400 text-xs font-semibold tracking-widest uppercase">
              Our Story
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-tight max-w-2xl">
            Built for Nigerian{" "}
            <em className="text-gold-400 not-italic">ambition</em>
          </h1>
          <p className="text-white/60 mt-4 text-lg max-w-xl leading-relaxed">
            We started because we knew how hard it was for Nigerian students to
            navigate a system not built for them. Eight years and 2,400 students
            later, we&apos;re still at it.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-navy-950 py-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-display text-2xl font-light text-gold-400 mb-0.5">
                  {s.number}
                </div>
                <div className="text-white/50 text-xs leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-6 bg-gold-500" />
                <span className="text-gold-600 text-xs font-semibold tracking-widest uppercase">
                  Our Mission
                </span>
              </div>
              <h2 className="font-display text-4xl text-navy-900 mb-6 leading-tight">
                We believe every Nigerian student deserves a fair shot at the
                world&apos;s best universities
              </h2>
              <p className="text-navy-600 leading-relaxed mb-5">
                The international admissions process was not designed with
                Nigerian students in mind. The language is different, the
                systems are opaque, and the stakes are high. One wrong document
                or missed deadline can cost you an entire year.
              </p>
              <p className="text-navy-600 leading-relaxed mb-5">
                MakeoverArena was founded to level that playing field. We are
                former international students who learned the hard way —
                and now we pass that knowledge on so you don&apos;t have to.
              </p>
              <p className="text-navy-600 leading-relaxed">
                Our 92% success rate isn&apos;t luck. It&apos;s process, expertise,
                and a refusal to accept anything less than the best outcome
                for every student we work with.
              </p>
            </div>
            <div className="relative pb-6 sm:pb-0">
              <div className="relative h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-elevated">
                <Image
                  src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80"
                  alt="Students celebrating graduation"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 left-4 sm:-left-5 bg-white rounded-2xl shadow-elevated p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-xl shrink-0">
                  🏅
                </div>
                <div>
                  <div className="font-display text-lg text-navy-900 font-medium leading-none">
                    ₦2bn+
                  </div>
                  <div className="text-navy-500 text-xs mt-0.5">
                    Scholarship funding won
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold-500" />
              <span className="text-gold-600 text-xs font-semibold tracking-widest uppercase">
                What We Stand For
              </span>
              <div className="h-px w-8 bg-gold-500" />
            </div>
            <h2 className="font-display text-4xl text-navy-900">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-cream rounded-2xl p-8 border border-border hover:shadow-card transition-all duration-300"
              >
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-display text-2xl text-navy-900 mb-3">
                  {v.title}
                </h3>
                <p className="text-navy-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold-500" />
              <span className="text-gold-600 text-xs font-semibold tracking-widest uppercase">
                The Team
              </span>
              <div className="h-px w-8 bg-gold-500" />
            </div>
            <h2 className="font-display text-4xl text-navy-900">
              Former students. Now your guides.
            </h2>
            <p className="text-navy-600 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Every consultant on our team is a former international student
              themselves. We&apos;ve sat the IELTS, written the SOPs, and waited
              for those email notifications.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-xs text-white/70 bg-navy-900/60 backdrop-blur-sm px-2 py-1 rounded-full">
                      {member.schools}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-navy-900 mb-0.5">
                    {member.name}
                  </h3>
                  <div className="text-gold-600 text-xs font-semibold uppercase tracking-wide mb-3">
                    {member.role}
                  </div>
                  <p className="text-navy-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-navy-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-white/20" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold-400" />
              <span className="text-gold-400 text-xs font-semibold tracking-widest uppercase">
                Our Journey
              </span>
              <div className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="font-display text-4xl font-light text-white">
              Eight years of milestones
            </h2>
          </div>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-8 rounded-lg bg-gold-500 text-navy-900 text-sm font-bold flex items-center justify-center shrink-0">
                    {m.year}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="w-px flex-1 bg-white/10 mt-2" />
                  )}
                </div>
                <div className="pb-6 pt-1">
                  <p className="text-white/70 text-sm leading-relaxed">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-gold-500" />
            <span className="text-gold-600 text-xs font-semibold tracking-widest uppercase">
              Get Started
            </span>
            <div className="h-px w-8 bg-gold-500" />
          </div>
          <h2 className="font-display text-4xl text-navy-900 mb-4">
            Ready to be our next success story?
          </h2>
          <p className="text-navy-600 mb-8 leading-relaxed">
            Start your application — it takes 5 minutes and our team responds
            within 24 hours with a personalised plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-500 text-navy-900 rounded-xl font-semibold text-base hover:bg-gold-400 transition-colors"
            >
              Start Application — Free
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-navy-300 text-navy-700 rounded-xl font-medium text-base hover:bg-navy-50 transition-colors"
            >
              Book a Free Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
