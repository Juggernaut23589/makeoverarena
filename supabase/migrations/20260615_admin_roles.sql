-- ─────────────────────────────────────────────────────────────────────────────
-- Admin role-based access control
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop existing role constraint and replace with updated enum
alter table staff_profiles
  drop constraint if exists staff_profiles_role_check;

alter table staff_profiles
  add constraint staff_profiles_role_check
  check (role in ('super_admin', 'admin', 'consultant', 'viewer'));

-- Add is_active flag for soft-deactivation
alter table staff_profiles
  add column if not exists is_active boolean not null default true;

-- Index for fast role lookups
create index if not exists staff_profiles_role_idx on staff_profiles(role);
create index if not exists staff_profiles_email_idx on staff_profiles(email);
