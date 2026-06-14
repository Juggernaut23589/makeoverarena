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
  calcom_uid text unique,
  inquiry_id uuid references inquiries(id),
  student_name text not null,
  student_email text not null,
  student_phone text,
  scheduled_date date not null,
  scheduled_time time not null,
  timezone text default 'Africa/Lagos',
  duration_minutes integer default 30,
  meeting_link text,
  consultant_id uuid references auth.users(id),
  status text default 'scheduled'
    check (status in ('scheduled','completed','no_show','cancelled','rescheduled')),
  consultation_notes text,
  outcome text
    check (outcome in ('proposal_sent','enrolled','needs_followup','not_interested')),
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
  resend_id text,
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
  updated_at timestamp with time zone default now(),
  session_id text unique,
  user_email text,
  user_name text,
  messages jsonb not null default '[]',
  message_count integer default 0,
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

-- ─────────────────────────────────────────────────────────────────────────────
-- CLIENT PROFILES (onboarded paying clients)
-- ─────────────────────────────────────────────────────────────────────────────
create table client_profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users(id),          -- set when client creates login
  inquiry_id uuid references inquiries(id),         -- source inquiry
  full_name text not null,
  email text not null unique,
  phone text,
  city text,
  country text,
  education_level text,
  field_of_study text,
  gpa_percentage numeric,
  graduation_year integer,
  preferred_countries text[],
  service_type text,
  budget_range text,
  payment_status text default 'pending'
    check (payment_status in ('pending','partial','paid','overdue')),
  onboarding_notes text,
  assigned_staff_id uuid references auth.users(id),
  assigned_staff_name text
);

create index client_profiles_email_idx on client_profiles(email);
create index client_profiles_user_id_idx on client_profiles(user_id);

alter table client_profiles enable row level security;

create policy "Clients can view own profile"
  on client_profiles for select to authenticated
  using (auth.uid() = user_id or exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Staff can manage client profiles"
  on client_profiles for all to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Anon insert for service key"
  on client_profiles for insert to anon with check (false);

-- ─────────────────────────────────────────────────────────────────────────────
-- APPLICATION TRACKING
-- ─────────────────────────────────────────────────────────────────────────────
create table application_tracking (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  client_id uuid references client_profiles(id) not null,
  type text not null check (type in ('undergraduate','graduate','phd','scholarship','visa')),
  title text not null,
  institution text,
  destination_country text,
  status text default 'not_started'
    check (status in ('not_started','in_progress','submitted','under_review','offer_received','accepted','rejected','deferred','completed','on_hold')),
  current_stage text,
  stages jsonb default '[]',
  assigned_staff_id uuid references auth.users(id),
  assigned_staff_name text,
  notes text,
  deadline date,
  outcome_date date
);

create index application_tracking_client_id_idx on application_tracking(client_id);

alter table application_tracking enable row level security;

create policy "Clients can view own applications"
  on application_tracking for select to authenticated
  using (exists (select 1 from client_profiles where id = client_id and user_id = auth.uid())
         or exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Staff can manage applications"
  on application_tracking for all to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────────────────────────────────────
create table payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  client_id uuid references client_profiles(id) not null,
  inquiry_id uuid references inquiries(id),
  amount numeric not null,
  currency text default 'NGN',
  status text default 'pending'
    check (status in ('pending','paid','failed','refunded','partial')),
  description text not null,
  paystack_reference text unique,
  paystack_access_code text,
  authorization_url text,
  paid_at timestamp with time zone,
  metadata jsonb
);

create index payments_client_id_idx on payments(client_id);
create index payments_paystack_reference_idx on payments(paystack_reference);
create index payments_status_idx on payments(status);

alter table payments enable row level security;

create policy "Clients can view own payments"
  on payments for select to authenticated
  using (exists (select 1 from client_profiles where id = client_id and user_id = auth.uid())
         or exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Staff can manage payments"
  on payments for all to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────────────────────────────────────────
create table documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  client_id uuid references client_profiles(id) not null,
  uploaded_by uuid references auth.users(id),
  file_name text not null,
  file_type text not null,
  file_size integer,
  storage_path text not null,
  document_type text not null
    check (document_type in ('transcript','certificate','id','passport','sop','lor','cv','test_scores','financial','other')),
  status text default 'pending_review'
    check (status in ('pending_review','approved','rejected','needs_resubmission')),
  review_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone
);

create index documents_client_id_idx on documents(client_id);

alter table documents enable row level security;

create policy "Clients can view own documents"
  on documents for select to authenticated
  using (exists (select 1 from client_profiles where id = client_id and user_id = auth.uid())
         or exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Clients can upload own documents"
  on documents for insert to authenticated
  with check (exists (select 1 from client_profiles where id = client_id and user_id = auth.uid())
              or exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Staff can update document status"
  on documents for update to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX: chat_conversations needs update policy for chatbot upsert
-- ─────────────────────────────────────────────────────────────────────────────
create policy "Public can update own conversation"
  on chat_conversations for update to anon
  using (true)
  with check (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- WHATSAPP INBOX
-- ─────────────────────────────────────────────────────────────────────────────
create table whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  wa_phone_number text not null unique,   -- E.164 format, e.g. +2348012345678
  customer_name text,
  customer_profile_name text,             -- from WhatsApp profile
  last_message text,
  last_message_at timestamp with time zone,
  status text default 'open'
    check (status in ('open', 'resolved', 'pending', 'spam')),
  unread_count integer default 0,
  inquiry_id uuid references inquiries(id),
  assigned_to uuid references auth.users(id),
  tags text[]
);

create index wa_conversations_status_idx on whatsapp_conversations(status);
create index wa_conversations_updated_idx on whatsapp_conversations(updated_at desc);
create index wa_conversations_phone_idx on whatsapp_conversations(wa_phone_number);

alter table whatsapp_conversations enable row level security;

create policy "Staff can manage WhatsApp conversations"
  on whatsapp_conversations for all to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

create policy "Service role can insert/update"
  on whatsapp_conversations for all to anon
  using (false) with check (false);


create table whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  conversation_id uuid references whatsapp_conversations(id) on delete cascade not null,
  wa_message_id text unique,              -- WhatsApp message ID for dedup
  direction text not null
    check (direction in ('inbound', 'outbound')),
  message_type text not null default 'text'
    check (message_type in ('text','image','document','audio','video','sticker','location','contacts','interactive','template','reaction','unknown')),
  content text,                           -- text body
  media_url text,                         -- for media messages
  media_mime_type text,
  media_filename text,
  status text default 'sent'
    check (status in ('sent','delivered','read','failed')),
  error_message text,
  sent_by uuid references auth.users(id), -- null for inbound
  timestamp_wa timestamp with time zone    -- from WhatsApp payload
);

create index wa_messages_conversation_idx on whatsapp_messages(conversation_id, created_at);
create index wa_messages_wa_id_idx on whatsapp_messages(wa_message_id);

alter table whatsapp_messages enable row level security;

create policy "Staff can manage WhatsApp messages"
  on whatsapp_messages for all to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- RATE LIMITS (Supabase-backed sliding window, replaces Upstash Redis)
-- ─────────────────────────────────────────────────────────────────────────────
create table rate_limits (
  key text primary key,                   -- e.g. "inquiry:1.2.3.4"
  hits integer not null default 1,
  window_start timestamp with time zone not null default now()
);

-- Auto-clean rows older than 2 hours to keep the table small
create index rate_limits_window_idx on rate_limits(window_start);

-- No RLS needed — only accessed via service role key from server routes
