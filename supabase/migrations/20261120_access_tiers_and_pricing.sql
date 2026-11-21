-- ─────────────────────────────────────────────────────────────────────────────
-- Scholarship access tiers & pricing. The business has now made the pricing
-- decision 20260619's `subscription_tier` placeholder deliberately deferred:
-- scholarship access is sold in admin-configurable classes (e.g.
-- Basic/Standard/Premium), each purchasable for an admin-configurable period
-- (1/3/6/12 months, also fully editable), at an admin-set price per
-- class × period. Which scholarships a class unlocks is hierarchical by
-- `rank` — a higher-ranked class sees everything lower ranks see, plus its
-- own exclusives.
-- ─────────────────────────────────────────────────────────────────────────────

-- Access classes (tiers). `rank` orders the hierarchy and must be unique so
-- "does class X's access cover scholarship Y's requirement" is a single
-- integer comparison, never ambiguous.
create table access_classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  rank integer not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Access periods (durations). Fully admin-configurable — not a fixed menu,
-- so a trial length or a new cadence can be added without a migration.
create table access_periods (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  duration_days integer not null check (duration_days > 0),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Price matrix: one row per (class, period). Amount in naira, matching
-- payments.amount's existing convention (Paystack's kobo conversion happens
-- only at the point of calling their API, same as every other charge here).
create table access_class_prices (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references access_classes(id) on delete cascade,
  period_id uuid not null references access_periods(id) on delete cascade,
  price_naira numeric not null check (price_naira >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references staff_profiles(id),
  unique (class_id, period_id)
);

-- Which class a scholarship requires. NULL = free/public — identical to
-- every existing row's current behavior. Purely additive: nothing becomes
-- hidden until a staff member with manage_scholarships explicitly wires it.
alter table scholarships
  add column if not exists required_class_id uuid references access_classes(id);
create index if not exists scholarships_required_class_idx on scholarships(required_class_id);

-- Replace the dormant, never-wired 20260619 placeholder with real fields a
-- read path can act on directly (avoids a join on every scholarship fetch).
-- A bare text column couldn't hold an expiry date or a proper FK anyway.
alter table client_profiles
  drop column if exists subscription_tier;
alter table client_profiles
  add column if not exists current_access_class_id uuid references access_classes(id),
  add column if not exists subscription_expires_at timestamptz;

-- Full purchase/renewal history — never mutated in place, so "current
-- access" is always derivable from client_profiles' fast-path fields above,
-- while past purchases stay auditable. price_naira is a snapshot at
-- purchase time: a later price change must never alter history.
create table client_subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_profiles(id),
  class_id uuid not null references access_classes(id),
  period_id uuid not null references access_periods(id),
  payment_id uuid references payments(id),
  price_naira numeric not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists client_subscriptions_client_idx on client_subscriptions(client_id);

alter table access_classes enable row level security;
alter table access_periods enable row level security;
alter table access_class_prices enable row level security;
alter table client_subscriptions enable row level security;

-- Classes/periods/prices are public-readable (a pricing page needs this for
-- logged-out visitors) but staff-managed — same shape as the existing
-- scholarships "Public can view" / "Staff can manage" policy pair.
create policy "Public can view access classes"
  on access_classes for select to authenticated, anon
  using (is_active = true);
create policy "Staff can manage access classes"
  on access_classes for all to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Public can view access periods"
  on access_periods for select to authenticated, anon
  using (is_active = true);
create policy "Staff can manage access periods"
  on access_periods for all to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Public can view access class prices"
  on access_class_prices for select to authenticated, anon
  using (true);
create policy "Staff can manage access class prices"
  on access_class_prices for all to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

-- client_subscriptions is owner- and staff-readable only, matching the
-- payments table's existing policy pair exactly.
create policy "Clients can view own subscriptions"
  on client_subscriptions for select to authenticated
  using (exists (select 1 from client_profiles where id = client_id and user_id = auth.uid())
         or exists (select 1 from staff_profiles where id = auth.uid()));
create policy "Staff can manage subscriptions"
  on client_subscriptions for all to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));
