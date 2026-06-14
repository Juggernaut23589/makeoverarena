# MakeoverArena — Go-Live Checklist & Fix Report
*Prepared 9 June 2026 — QA, mobile-responsiveness & functional hardening pass*

This document covers (1) what was fixed in this pass, (2) how it was verified, and
(3) the exact actions **you (the business owner)** must take to make the platform
fully operational and income-generating. The code is built and verified; what
remains is infrastructure/credentials only you can provide.

---

## 1. Fixes Applied This Pass

### Mobile responsiveness
| Area | Problem | Fix |
|---|---|---|
| **Admin dashboard** | Fixed 240px sidebar, no hamburger/drawer — nav was unreachable on phones | New responsive shell: desktop sidebar (lg+) unchanged; mobile gets a top bar + slide-out drawer with backdrop (`components/admin/admin-shell.tsx`, `components/admin/sidebar.tsx`) |
| **Admin tables** (inquiries, consultations, documents, settings) | Bare tables clipped/overflowed on mobile | Wrapped each in `overflow-x-auto`; documents filter pills now wrap |
| **Floating buttons** | Collided with the chat widget; "Staff Portal" linked to a **deleted** `/staff/login` (404); theme toggle broke the (light-only) public site when switched to dark | Moved to bottom-left, fixed link → `/staff/dashboard`, removed the broken dark-mode toggle |
| **Cookie banner** | Rendered over the admin/client/staff dashboards (mounted in root layout) | Scoped to the public marketing site only |

Already mobile-correct (verified, no change needed): public navbar (hamburger + collapsible Services), homepage, multi-step apply form, client dashboard (scrollable tabs), staff dashboard, WhatsApp inbox (list/chat view-swap), chatbot widget.

### Functional / graceful degradation
| Area | Problem | Fix |
|---|---|---|
| **Rate limiter** | Placeholder Upstash URL caused every form/chatbot request to hang 10–26s on DNS timeout and **crashed the dev server** | Detects placeholder creds → disables cleanly; added fail-open `try/catch` so a Redis outage never blocks a real request (`lib/rate-limit.ts`) |
| **Chatbot API** | Placeholder OpenAI key → ugly HTTP 500 after a wasted API call | Detects placeholder key → clean HTTP 503 with a friendly message |
| **Payments API** | Placeholder Paystack key → HTTP 400 leaking "Invalid key" | Detects placeholder key → clean HTTP 503 "payment not available yet" |
| **Settings → Integrations panel** | Hardcoded statuses (showed OpenAI as "Connected" when it was a placeholder) | Now reflects **real** env state per integration |

### Verification performed
- ✅ Production build: `✓ Compiled successfully`, 41/41 pages, **zero type/lint errors**
- ✅ All 16 public routes return 200; admin routes correctly gated (307 → login)
- ✅ Mobile (390px) + desktop (1366px) screenshots of home, apply, and all admin pages incl. the drawer open
- ✅ Chatbot/payments now return fast, clean 503s (were 10s+ / crashing)

> Note: the local `@next/swc-darwin-arm64` code-signature warning is a machine-only
> toolchain quirk (the reason the repo pins `--webpack`). It does **not** affect
> Vercel's Linux builds.

---

## 2. 🚨 CRITICAL BLOCKER — The database is gone

The configured Supabase project (`NEXT_PUBLIC_SUPABASE_URL`) **no longer resolves
in DNS (NXDOMAIN)** — the project appears to have been deleted or expired. **Until
a live Supabase project exists, nothing persists**: no inquiries, accounts,
payments, documents, or WhatsApp history. (The app degrades gracefully — pages
still load with empty data instead of crashing — but it cannot transact.)

**Action:**
1. Open [supabase.com](https://supabase.com) → confirm whether the MakeoverArena
   project still exists. If it's paused, resume it. If it's gone, **create a new
   project**.
2. Update `.env.local` with the new `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Push the schema: `supabase db push --linked --password <DB_PASSWORD>`
   (creates all 11 tables, RLS, views).
4. Create a **private** Storage bucket named `documents` (Storage → New Bucket).

---

## 3. Owner-Action Checklist (credentials only you can provide)

Set these in `.env.local` (and later in Vercel → Settings → Environment Variables).
Each is currently a placeholder; the app now degrades cleanly until they're real.

| # | Service | Env var(s) | Why | Without it |
|---|---|---|---|---|
| 1 | **Supabase** ⚠️ | `NEXT_PUBLIC_SUPABASE_URL`, `*_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Database — everything | **Nothing works** (see §2) |
| 2 | **Admin password** | `ADMIN_PASSWORD`, `ADMIN_EMAIL` | Admin login | Currently `change-me-before-deploy` — anyone could guess it |
| 3 | **Paystack** | `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Collect payments = **your revenue** | "Payment not available" message |
| 4 | **OpenAI** | `OPENAI_API_KEY` | AI chatbot | Chatbot shows "offline" fallback |
| 5 | **Cal.com** | `NEXT_PUBLIC_CALCOM_URL`, `CALCOM_WEBHOOK_SECRET` | Consultation booking | Booking page shows setup notice |
| 6 | **WhatsApp Cloud API** | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER` | Live inbox | Inbox stays empty |
| 7 | **Upstash Redis** | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Spam rate-limiting | Limiting disabled (now safely) |
| 8 | **Google Analytics** | `NEXT_PUBLIC_GA_ID` | Traffic analytics | No analytics |
| 9 | **Resend domain** | `EMAIL_FROM` | Emails from your domain | Emails may land in spam (key itself works) |

Step-by-step setup instructions for each service are in `DEVELOPMENT-REPORT.md` (Part 2).

---

## 4. Suggested go-live order
1. Supabase (recreate + push migrations + bucket) — **unblocks everything**
2. Change `ADMIN_PASSWORD`
3. Paystack test keys → test a payment (card `4084 0840 8408 4081`) → switch to live
4. Cal.com + OpenAI + WhatsApp + Upstash + GA
5. Resend verified domain
6. Deploy to Vercel (`vercel --prod`) + custom domain
7. Deploy Supabase Edge Functions (follow-ups, reminders, no-shows)

A full pre-launch test script is in `DEVELOPMENT-REPORT.md` (Part 3, Step 10).
