-- ─────────────────────────────────────────────────────────────────────────────
-- Scholarship approval workflow (Researcher -> Verifier -> Database Manager),
-- plus the client-facing/notification/reporting gaps identified against the
-- formal Product Requirements Brief: save/bookmark, structured eligibility
-- fields, notification idempotency tracking, and view/search tracking for
-- reporting. Billing model and flexible periods are explicitly unchanged.
-- ─────────────────────────────────────────────────────────────────────────────

-- Approval workflow: a new intermediate state between "to_be_verified" and
-- published, plus a second sign-off column. is_active can now only become
-- true once BOTH a verifier and a database manager have signed off — mirrors
-- the existing scholarships_active_requires_verified pattern, extended.
alter table scholarships
  add column if not exists approved_by uuid references staff_profiles(id),
  add column if not exists approved_at timestamptz,
  add column if not exists academic_qualifications text,
  add column if not exists field_of_study text,
  add column if not exists view_count integer not null default 0;

-- Grandfather already-published rows: they went live under the old
-- single-stage process, where the verifier's sign-off was the only gate.
-- Retroactively treat that same sign-off as the approval too, so the new
-- stricter constraint below doesn't reject real, already-live data.
update scholarships
set approved_by = verified_by, approved_at = verified_at
where is_active = true and verified_by is not null and approved_by is null;

alter table scholarships drop constraint if exists scholarships_active_requires_verified;
alter table scholarships add constraint scholarships_active_requires_verified
  check (not is_active or (verified_by is not null and approved_by is not null));

alter table scholarships drop constraint if exists scholarships_listing_status_check;
alter table scholarships add constraint scholarships_listing_status_check
  check (listing_status in ('to_be_verified','verified','open','upcoming','closed'));

-- Notification idempotency — "has this been sent" tracking, since none
-- exists on client_profiles/payments today.
alter table client_profiles
  add column if not exists renewal_reminder_7d_sent_at timestamptz,
  add column if not exists renewal_reminder_1d_sent_at timestamptz,
  add column if not exists expiry_notice_sent_at timestamptz;

alter table payments
  add column if not exists failure_notice_sent_at timestamptz;

-- Dedupe "new matching scholarship" alerts per client per scholarship.
create table if not exists scholarship_match_notifications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_profiles(id),
  scholarship_id uuid not null references scholarships(id),
  notified_at timestamptz not null default now(),
  unique (client_id, scholarship_id)
);

-- Saved/bookmarked scholarships.
create table if not exists saved_scholarships (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_profiles(id),
  scholarship_id uuid not null references scholarships(id),
  created_at timestamptz not null default now(),
  unique (client_id, scholarship_id)
);

-- Minimal search-query log for the "most searched" report metric.
create table if not exists scholarship_search_logs (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  created_at timestamptz not null default now()
);

alter table saved_scholarships enable row level security;
alter table scholarship_match_notifications enable row level security;
alter table scholarship_search_logs enable row level security;

create policy "Clients can manage own saved scholarships"
  on saved_scholarships for all to authenticated
  using (exists (select 1 from client_profiles where id = client_id and user_id = auth.uid())
         or exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Staff can view match notifications"
  on scholarship_match_notifications for select to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Staff can view search logs"
  on scholarship_search_logs for select to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

-- Reporting views — subscriber/revenue breakdowns computed from existing
-- data. "Most viewed/searched" and "awaiting verification" are queried
-- directly in the report loader instead, since they're simple aggregates.
create or replace view subscription_tier_stats as
select ac.id as class_id, ac.name as class_name, ac.rank,
  count(cp.id) filter (where cp.subscription_expires_at > now()) as active_subscribers
from access_classes ac
left join client_profiles cp on cp.current_access_class_id = ac.id
group by ac.id, ac.name, ac.rank;

create or replace view subscription_revenue_by_tier as
select ac.id as class_id, ac.name as class_name,
  date_trunc('month', cs.started_at) as month,
  sum(cs.price_naira) as revenue_naira, count(*) as purchase_count
from client_subscriptions cs
join access_classes ac on ac.id = cs.class_id
group by ac.id, ac.name, date_trunc('month', cs.started_at);

-- Atomic view counter — avoids a read-then-write race between concurrent
-- viewers under-counting.
create or replace function increment_scholarship_view(p_scholarship_id uuid)
returns void
language sql
as $$
  update scholarships set view_count = view_count + 1 where id = p_scholarship_id;
$$;

-- Migrate existing manage_scholarships holders to all three new abilities so
-- nobody loses capability on deploy; the business splits roles afterward via
-- the Team tab.
update staff_profiles
set abilities = abilities
  || jsonb_build_object('scholarship_research', true, 'scholarship_verify', true, 'scholarship_approve', true)
where abilities->>'manage_scholarships' = 'true';
