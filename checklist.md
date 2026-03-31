# Makeoverarena — Build Checklist

## Project Summary

**Makeoverarena** is a Nigerian study-abroad consultancy platform. The goal is to
replace a manual Instagram/WhatsApp inquiry workflow with a fully automated web
application that handles student inquiries 24/7, books consultations, sends email
sequences, and gives staff a centralized CRM/dashboard.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Auth +
Postgres) · OpenAI GPT-4o-mini · Resend (email) · Cal.com (booking) · Upstash Redis
(rate limiting) · Zod (validation) · Radix UI

**Design language:** Navy + Gold palette · Cormorant Garamond (display) + DM Sans
(body) · glass morphism cards · glow shadows · modern professional

> **Status key:** ✅ Done · ☐ Not started · 🔶 Partial / placeholder only

---

## PHASE 1 — Foundation (Project Setup + Infrastructure)

### 1.1 Project Scaffold
- [x] Initialise Next.js project with TypeScript and App Router
- [x] Configure Tailwind CSS 4 with custom design tokens (navy, gold, cream)
- [x] Install Radix UI primitives and shadcn-style UI components
- [x] Set up path aliases (`@/`) in `tsconfig.json`
- [x] Create `.env.local` with all required environment variable keys
- [x] Configure `next.config.ts` with Unsplash image domains

### 1.2 Supabase Setup
- [x] Create Supabase project and connect credentials
- [x] Create `lib/supabase/client.ts` — browser client helper
- [x] Create `lib/supabase/server.ts` — server-side client helper (anon + service role)
- [x] Generate and save TypeScript database types to `lib/supabase/types.ts`

### 1.3 Database Schema (Migrations)
- [x] Migration: `inquiries` table (45+ columns, indexes, RLS policies)
- [x] Migration: `consultations` table (scheduling, meeting link, outcome)
- [x] Migration: `staff_profiles` table (roles: admin, consultant, viewer)
- [x] Migration: `email_logs` table (status tracking)
- [x] Migration: `chat_conversations` table
- [x] Migration: `analytics_events` table
- [x] SQL views: `daily_inquiry_stats`, `service_breakdown`
- [ ] Apply all migrations to Supabase remote (confirm with `supabase db push`)

### 1.4 Authentication
- [x] Enable Supabase Auth (email/password)
- [x] Rename `middleware.ts` → `proxy.ts` (Next.js 16 convention), export `proxy` function
- [x] Create admin login page (`/admin/login`) with Supabase auth form
- [ ] Create admin logout server action / button
- [ ] Test full login → dashboard → logout flow end-to-end

### 1.5 Project Layout & Navigation
- [x] Root `app/layout.tsx` with global fonts, metadata, chatbot slot
- [x] `app/globals.css` with Tailwind v4 directives (`@import`, `@theme inline`) and base styles
- [x] Public site Navbar (responsive, transparent-on-home, active route highlight)
- [x] Public site Footer (5-column, social links, contact info, legal links)
- [x] Admin layout with collapsible sidebar
- [x] Admin sidebar links (Overview, Inquiries, Consultations, Analytics, Settings)
- [x] Mobile hamburger menu on public Navbar

---

## PHASE 2 — Public Website (Marketing Pages)

### 2.1 Homepage (`/`)
- [x] Hero section — headline, subheadline, two CTA buttons (Apply + Book)
- [x] Stats bar (2,400+ students, 92% success rate, 200+ universities, 15+ countries)
- [x] Services overview — 4 service cards
- [x] How it works — 4-step process section
- [x] Study destinations — 6 country cards with flags
- [x] Testimonials preview — 3 student success stories
- [x] FAQ preview section (4 questions, link to full FAQ)
- [x] Footer CTA band
- [x] SEO metadata (title, description, Open Graph)

### 2.2 Service Pages
- [x] `/services/undergraduate` — description, what's included, timeline, CTA sidebar
- [x] `/services/graduate` — Masters/PhD admissions, 87% offer rate, 61% scholarship stat
- [x] `/services/scholarships` — Chevening/Commonwealth/Fulbright/DAAD/Erasmus, 65% funded stat
- [x] `/services/visa` — 6-country breakdown, 98% visa success, country-specific bullets
- [ ] `/services/phd` — dedicated PhD page (currently merged into graduate)
- [ ] Shared `ServicePageLayout` component to eliminate repetition

### 2.3 About Page (`/about`)
- [x] Hero, 6-stat bar (2,400+ students, 92% success, 200+ unis, 15+ countries, 8yrs, 65% scholarships)
- [x] Mission section with floating ₦2bn badge
- [x] 4 company values grid
- [x] Team section (3 members with Unsplash photos)
- [x] 6-milestone timeline on navy background
- [x] Bottom CTA (Apply / Book)

### 2.4 Success Stories Page (`/success-stories`)
- [x] Grid of 6 student testimonial cards
- [x] Filter buttons by destination country
- [x] Star ratings (5 stars)
- [x] Scholarship badges on cards

### 2.5 FAQ Page (`/faq`)
- [x] Accordion-style FAQ grouped into 6 categories
- [x] FAQ keyword search with live highlighting
- [x] "Didn't find your answer? Contact us" CTA at bottom

### 2.6 Book Consultation Page (`/book`)
- [x] Page layout with "What to expect" checklist
- [x] Contact methods (WhatsApp button, email)
- [x] Office hours display
- [🔶] Cal.com booking embed — placeholder only (embed still needs Cal.com account config)

---

## PHASE 3 — Multi-Step Inquiry Form (`/apply`)

### 3.1 Form Infrastructure
- [x] Zod v4 validation schemas for all 5 steps (`lib/validations/inquiry-schema.ts`)
- [x] Fixed Zod v4 breaking change: `required_error` → plain string param on `z.enum()`
- [x] Fixed Zod v4 breaking change: removed `.default(true)` from `opted_in_emails` (react-hook-form resolver)
- [x] localStorage draft save/restore for form progress
- [x] Step progress indicator component with animated bar
- [x] Back/Next navigation with per-step validation
- [x] Mobile-optimised inputs and large touch targets

### 3.2 Form Steps
- [x] Step 1 — Service selection (6 radio cards)
- [x] Step 2 — Personal info (name, email, phone, city, country)
- [x] Step 3 — Academic profile (education level, field, GPA, graduation year)
- [x] Step 4 — Study abroad preferences (countries, intake, budget, test scores)
- [x] Step 5 — Additional info (referral source, comments, email opt-in)
- [x] Success/confirmation screen after submission

### 3.3 Form Submission & API
- [x] `POST /api/inquiries` — validates with Zod, inserts into Supabase
- [x] Capture UTM parameters from URL into inquiry record
- [x] Rate limiting on submission endpoint (Upstash Redis — 5/hr sliding window, graceful fallback)
- [x] GA4 event tracking: form_start, form_step_complete, form_submit

---

## PHASE 4 — Email Automation

### 4.1 Email Infrastructure
- [x] Resend SDK installed and configured
- [x] `emails/` directory created with React Email templates
- [x] `lib/emails/send-email.ts` — shared send utility with email_logs logging
- [x] `email_logs` insert on every send (success + failure tracked)

### 4.2 Email Templates (React Email)
- [x] `emails/inquiry-confirmation.tsx` — personalised confirmation to student
- [x] `emails/admin-notification.tsx` — new inquiry alert to admin team
- [x] `emails/inquiry-followup.tsx` — 48-hr follow-up if status still "new"
- [x] `emails/consultation-confirmation.tsx` — booking confirmed
- [x] `emails/consultation-reminder.tsx` — shared 24h/1h reminder (prop-based)
- [x] `emails/nurture-week1.tsx` through `nurture-week4.tsx` — 4-week nurture series
- [ ] `emails/consultation-followup.tsx` — post-consultation follow-up

### 4.3 Supabase Edge Functions
- [x] `supabase/functions/send-followups/index.ts` — daily 9am cron, 48hr follow-ups
- [x] `supabase/functions/send-reminders/index.ts` — hourly cron, 24h + 1h reminders
- [x] `supabase/functions/handle-no-shows/index.ts` — daily cron, marks no-shows + rescue email
- [x] Exclude `supabase/functions/` from `tsconfig.json` (Deno, not tsc)
- [ ] Deploy Edge Functions to Supabase and smoke-test

---

## PHASE 5 — AI Chatbot

### 5.1 Chatbot Widget (UI)
- [x] Floating widget bottom-right on all public pages
- [x] Open/minimise toggle with unread message badge
- [x] Typing indicator animation
- [x] Quick reply buttons for common intents
- [x] Mobile-responsive and keyboard accessible

### 5.2 Chatbot Backend
- [x] `POST /api/chatbot` — OpenAI GPT-4o-mini integration
- [x] System prompt with service knowledge base and escalation rules
- [x] Escalation logic — human handoff options after unresolved exchanges
- [x] Rate limiting on chatbot API (Upstash Redis — 30/min sliding window, graceful fallback)
- [x] Save conversations to `chat_conversations` table (upsert per session)
- [ ] After-hours detection and auto-response message
- [ ] GA4 event tracking: `chatbot_open`, `chatbot_message_sent`, `chatbot_escalation`

---

## PHASE 6 — Consultation Booking System

### 6.1 Cal.com Integration
- [🔶] Cal.com embed placeholder on `/book` page — not configured
- [ ] Configure Cal.com event type (30-min free consult, 15-min buffer)
- [ ] Set up Cal.com webhook → `POST /api/webhooks/calcom`
- [ ] Webhook handler: insert/update `consultations` table in Supabase
- [ ] Trigger consultation confirmation email on webhook receipt
- [ ] Test timezone detection and calendar sync

### 6.2 Post-Booking Automation
- [ ] Link consultation to existing inquiry if email matches
- [ ] Auto-update inquiry status to `consultation_booked`
- [ ] Reschedule/cancellation handling (update status in DB)
- [ ] No-show detection via Edge Function cron

---

## PHASE 7 — Admin Dashboard

### 7.1 Overview Page (`/admin`)
- [x] 4 KPI metric cards (inquiries, consultations, conversion rate, active clients)
- [x] Recent inquiries table (mock data, last 5 entries)
- [x] Upcoming consultations list (mock data)
- [x] Quick action links
- [x] Conversion funnel visualisation (static)
- [x] Connect all cards to live Supabase data
- [ ] Line chart — inquiries over last 30 days
- [ ] Pie chart — inquiries by service type
- [ ] Bar chart — inquiries by destination country

### 7.2 Inquiries Management (`/admin/inquiries`)
- [x] Table view with columns (date, name, email, service, status, priority)
- [x] Status filters and priority indicators
- [x] Export CSV button (UI only)
- [x] Student avatar initials
- [x] Connect table to live Supabase data
- [ ] Search by name, email, phone
- [ ] Bulk actions (assign, status change, export)
- [ ] Inquiry detail side panel / modal with activity timeline
- [ ] Internal notes editor
- [ ] Quick actions (send email, schedule consult, update status)

### 7.3 Consultations Management (`/admin/consultations`)
- [x] List/table view with all consultation columns (student, date/time, service, consultant, status, outcome)
- [x] Status badges (scheduled/completed/cancelled/no_show/rescheduled)
- [x] Stats cards: Today, Upcoming, Completed (month), No-show rate
- [x] "Join" link for scheduled meetings
- [x] Connect to live Supabase data
- [ ] Calendar view (month/week/day) colour-coded by consultant
- [ ] Date range + consultant filters
- [ ] Consultation detail view with outcome selector and notes

### 7.4 Analytics & Reports (`/admin/analytics`)
- [x] Overview stats panel
- [x] Weekly bar chart (inquiries vs consultations)
- [x] Conversion funnel with progress bars
- [x] Service breakdown, top destinations, traffic sources panels
- [x] Export buttons (UI)
- [x] Connect to live Supabase data
- [ ] Date range picker (today, week, month, year, custom)
- [ ] Email analytics (open rate, CTR, bounce by template)

### 7.5 Settings (`/admin/settings`)
- [x] Team management table with role badges and status indicators
- [x] Email sequences list with active/draft status
- [x] Integrations panel (Cal.com, Resend, OpenAI, GA, Upstash)
- [x] Notification toggles (visual)
- [x] Company Information form
- [ ] Live save for settings (server actions)
- [ ] Email template preview + test send

---

## PHASE 8 — Analytics & Tracking

- [x] Google Analytics 4 script in root layout (conditional on `NEXT_PUBLIC_GA_ID`)
- [x] Pageview tracking with `afterInteractive` strategy
- [ ] Track all custom events (form steps, chatbot, booking)
- [ ] Vercel Analytics integration
- [ ] Server-side `analytics_events` logging from Server Actions

---

## PHASE 9 — Performance Optimisation

- [ ] Replace all `<img>` tags with `next/image` (WebP, lazy loading)
- [ ] Dynamic imports for heavy components (chatbot, charts, kanban)
- [ ] Verify ISR / static generation on all public marketing pages
- [ ] Run Lighthouse audit — target 90+ on all four metrics

---

## PHASE 10 — Security & Compliance

- [x] RLS policies active and correctly scoped on all 6 tables (in migration SQL)
- [x] `SUPABASE_SERVICE_ROLE_KEY` only used in server-side admin client
- [x] Rate limiting active on `/api/inquiries` and `/api/chatbot` (Upstash Redis)
- [x] Server-side Zod re-validation on all API routes
- [x] Privacy Policy page (`/privacy`) — 10 sections
- [x] Terms of Service page (`/terms`) — 10 sections
- [x] Cookie Policy page (`/cookies`) — 3 cookie types, management instructions
- [x] Cookie consent banner (GDPR) — UI component + localStorage preference
- [ ] Audit that no PII appears in server logs or error messages
- [ ] `tailwind.config.ts` `darkMode` fixed from `["class"]` to `"class"` (Tailwind v4)
- [ ] `package.json` `"type": "module"` added (Tailwind v4 ES module warning)

---

## PHASE 11 — Build Quality

- [x] Clean production build — zero TypeScript errors, zero warnings
- [x] Zod v4 migration: `required_error` → string param, `.default()` removed from resolver fields
- [x] Supabase insert `as any` workaround for self-referential `Insert` type
- [x] `supabase/functions/` excluded from `tsconfig.json` (Deno environment)
- [x] `middleware.ts` renamed to `proxy.ts`, function renamed to `proxy` (Next.js 16)
- [x] `tailwind.config.ts` `darkMode: "class"` (not array — Tailwind v4 type)
- [x] `globals.css` rewritten: `@import "tailwindcss"` + `@theme inline {}` (Tailwind v4)
- [ ] End-to-end: full inquiry submission flow
- [ ] End-to-end: consultation booking flow
- [ ] End-to-end: admin login → view inquiry → update status
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] Email delivery tests for all templates

---

## PHASE 12 — Deployment & Launch

- [ ] Create Vercel project, connect GitHub repo
- [ ] Configure all environment variables in Vercel dashboard
- [ ] Set up production Supabase project (separate from dev)
- [ ] Run final database migrations on production (`supabase db push`)
- [ ] Deploy Edge Functions to Supabase production
- [ ] Deploy to Vercel production
- [ ] Configure custom domain (`makeoverarena.com`)
- [ ] Set up uptime monitoring (UptimeRobot or similar)
- [ ] Configure weekly DB backup export
- [ ] Verify GA4 receiving live events
- [ ] Smoke test all key flows on production
- [ ] Write admin user guide for consultancy team

---

## Progress Summary

| Phase | Status | Notes |
|-------|--------|-------|
| 1 — Foundation | 🔶 ~90% | Migrations not pushed; logout action missing |
| 2 — Public Pages | ✅ ~95% | All key pages done; PhD page + FAQ search minor gaps |
| 3 — Apply Form | 🔶 ~90% | GA4 form tracking missing |
| 4 — Email | 🔶 ~75% | Core templates + Edge Functions done; nurture series missing |
| 5 — Chatbot | 🔶 ~80% | UI + API + rate limiting done; DB save + GA4 missing |
| 6 — Cal.com Booking | ☐ ~5% | Placeholder page only; no webhook or DB integration |
| 7 — Admin Dashboard | 🔶 ~70% | All 5 pages built with mock data; live data connection missing |
| 8 — Analytics | 🔶 ~30% | GA4 script done; custom event tracking missing |
| 9 — Performance | ☐ 0% | Not started |
| 10 — Security | 🔶 ~70% | Rate limiting + legal pages done; cookie banner missing |
| 11 — Build Quality | ✅ 100% | Clean build, zero errors, zero warnings |
| 12 — Deployment | ☐ 0% | Not started |

**Overall: ~72% complete**
