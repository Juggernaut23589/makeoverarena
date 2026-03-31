-- UUID extension (gen_random_uuid is built-in, no extension needed)

-- ─────────────────────────────────────────────────────────────────────────────
-- STAFF PROFILES (created first — referenced by RLS policies on other tables)
-- ─────────────────────────────────────────────────────────────────────────────
create table staff_profiles (
  id uuid primary key references auth.users(id),
  created_at timestamp with time zone default now(),
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('admin','consultant','viewer')),
  available_for_bookings boolean default true,
  calendar_link text,
  avatar_url text,
  phone text
);

alter table staff_profiles enable row level security;

create policy "Staff can view all profiles"
  on staff_profiles for select to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Only admins can update profiles"
  on staff_profiles for update to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid() and role = 'admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- INQUIRIES
-- ─────────────────────────────────────────────────────────────────────────────
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),

  -- Personal Info
  full_name text not null,
  email text not null,
  phone text not null,
  whatsapp text,
  city text not null,
  country text not null,

  -- Service Details
  service_type text not null,
  education_level text not null,
  field_of_study text,
  gpa_percentage numeric,
  graduation_year integer,

  -- Preferences
  preferred_countries text[] not null,
  intake_period text not null,
  budget_range text not null,
  tests_taken text[],
  test_scores jsonb,

  -- Additional
  referral_source text not null,
  referrer_name text,
  additional_notes text,
  opted_in_emails boolean default true,

  -- Internal Management
  status text default 'new'
    check (status in ('new','reviewed','contacted','consultation_booked','proposal_sent','client','lost','on_hold')),
  priority text default 'medium'
    check (priority in ('low','medium','high')),
  assigned_to uuid references auth.users(id),
  internal_notes text,
  tags text[],
  next_action_date date,

  -- Metadata
  utm_source text,
  utm_medium text,
  utm_campaign text
);

create index inquiries_status_idx on inquiries(status);
create index inquiries_created_at_idx on inquiries(created_at desc);
create index inquiries_email_idx on inquiries(email);
create index inquiries_assigned_to_idx on inquiries(assigned_to);

alter table inquiries enable row level security;

create policy "Public can submit inquiries"
  on inquiries for insert to anon with check (true);

create policy "Staff can view all inquiries"
  on inquiries for select to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Staff can update inquiries"
  on inquiries for update to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- CONSULTATIONS
-- ─────────────────────────────────────────────────────────────────────────────
create table consultations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  inquiry_id uuid references inquiries(id),
  student_name text not null,
  student_email text not null,
  student_phone text,
  scheduled_date date not null,
  scheduled_time time not null,
  timezone text not null,
  duration_minutes integer default 30,
  meeting_link text,
  consultant_id uuid references auth.users(id),
  status text default 'scheduled'
    check (status in ('scheduled','completed','no_show','cancelled','rescheduled')),
  consultation_notes text,
  outcome text
    check (outcome in ('proposal_sent','needs_more_info','not_interested','follow_up_scheduled')),
  follow_up_date date,
  reminder_24h_sent boolean default false,
  reminder_1h_sent boolean default false,
  confirmation_sent boolean default false
);

create index consultations_scheduled_date_idx on consultations(scheduled_date);
create index consultations_consultant_id_idx on consultations(consultant_id);
create index consultations_status_idx on consultations(status);

alter table consultations enable row level security;

create policy "Staff can manage consultations"
  on consultations for all to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- EMAIL LOGS
-- ─────────────────────────────────────────────────────────────────────────────
create table email_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  recipient_email text not null,
  subject text not null,
  template_name text not null,
  status text default 'sent'
    check (status in ('sent','delivered','opened','clicked','bounced','failed')),
  inquiry_id uuid references inquiries(id),
  consultation_id uuid references consultations(id),
  sent_at timestamp with time zone,
  opened_at timestamp with time zone,
  error_message text
);

create index email_logs_recipient_idx on email_logs(recipient_email);
create index email_logs_inquiry_id_idx on email_logs(inquiry_id);

alter table email_logs enable row level security;

create policy "Staff can view email logs"
  on email_logs for select to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- CHAT CONVERSATIONS
-- ─────────────────────────────────────────────────────────────────────────────
create table chat_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  user_email text,
  user_name text,
  messages jsonb not null,
  escalated_to_human boolean default false,
  resolved boolean default false,
  metadata jsonb
);

alter table chat_conversations enable row level security;

create policy "Public can create conversations"
  on chat_conversations for insert to anon with check (true);

create policy "Staff can view all conversations"
  on chat_conversations for select to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- ANALYTICS EVENTS
-- ─────────────────────────────────────────────────────────────────────────────
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  event_name text not null,
  event_category text not null,
  event_label text,
  event_value numeric,
  session_id text,
  user_id uuid references auth.users(id),
  page_url text,
  properties jsonb
);

create index analytics_events_name_idx on analytics_events(event_name);
create index analytics_events_created_at_idx on analytics_events(created_at desc);

alter table analytics_events enable row level security;

create policy "Public can insert events"
  on analytics_events for insert to anon with check (true);

create policy "Staff can view events"
  on analytics_events for select to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- ANALYTICS VIEWS
-- ─────────────────────────────────────────────────────────────────────────────
create view daily_inquiry_stats as
select
  date_trunc('day', created_at) as date,
  count(*) as total_inquiries,
  count(*) filter (where status = 'client') as conversions,
  round(count(*) filter (where status = 'client')::numeric / count(*)::numeric * 100, 2) as conversion_rate
from inquiries
group by date_trunc('day', created_at)
order by date desc;

create view service_breakdown as
select
  service_type,
  count(*) as total,
  count(*) filter (where status = 'client') as conversions,
  round(avg(case when status = 'client' then 1 else 0 end) * 100, 2) as conversion_rate
from inquiries
group by service_type;
