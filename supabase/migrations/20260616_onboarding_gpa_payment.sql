-- ─────────────────────────────────────────────────────────────────────────────
-- Client onboarding: auto-activated dashboard, GPA scale, scholarships,
-- low-tuition packages, agent assignment
-- ─────────────────────────────────────────────────────────────────────────────

-- client_profiles: link directly to auth user at signup, track GPA + onboarding steps
alter table client_profiles
  add column if not exists gpa numeric,
  add column if not exists gpa_scale text check (gpa_scale in ('4.0', '5.0')),
  add column if not exists is_pass_fail boolean not null default false,
  add column if not exists documents_completed boolean not null default false,
  add column if not exists consultation_booked boolean not null default false,
  add column if not exists onboarding_completed boolean not null default false;

-- user_id must be set + unique now that signup creates the profile directly
alter table client_profiles
  alter column user_id set not null;

create unique index if not exists client_profiles_user_id_unique_idx
  on client_profiles(user_id);

-- assigned agent contact details live on staff_profiles; add whatsapp number
alter table staff_profiles
  add column if not exists whatsapp text;

-- allow a freshly signed-up user to create their own client_profiles row
create policy "Users can create own profile"
  on client_profiles for insert to authenticated
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHOLARSHIPS (shown to clients above the low-GPA cutoff)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists scholarships (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  name text not null,
  description text,
  destination_country text,
  min_gpa_4_scale numeric not null default 2.5,
  min_gpa_5_scale numeric not null default 2.8,
  amount text,
  application_url text,
  is_active boolean not null default true
);

alter table scholarships enable row level security;

create policy "Public can view active scholarships"
  on scholarships for select to authenticated, anon
  using (is_active = true);

create policy "Staff can manage scholarships"
  on scholarships for all to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- LOW TUITION PACKAGES (shown to clients at/below the low-GPA cutoff)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists low_tuition_packages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  name text not null,
  description text,
  destination_country text,
  tuition_range text,
  application_url text,
  is_active boolean not null default true
);

alter table low_tuition_packages enable row level security;

create policy "Public can view active low tuition packages"
  on low_tuition_packages for select to authenticated, anon
  using (is_active = true);

create policy "Staff can manage low tuition packages"
  on low_tuition_packages for all to authenticated
  using (exists (select 1 from staff_profiles where id = auth.uid()));
