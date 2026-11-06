-- ─────────────────────────────────────────────────────────────────────────────
-- Scholarship Sourcing Database — extends the existing lightweight
-- `scholarships` table (GPA-gated, public-readable) with the fields the
-- business's sourcing-database proposal calls for: institution/programme,
-- study level, funding type, eligibility notes, deadline, a listing status
-- separate from the public `is_active` flag, and a two-field verification
-- trail (who sourced it, who verified it, when it was last checked).
--
-- `is_active` stays the ONE column every public query gates on — unchanged
-- semantics, zero risk to the existing /api/scholarships consumer. The new
-- `listing_status` is an internal workflow state; a CHECK constraint (not
-- just UI convention) ensures `is_active` can never be true without a
-- verifier having signed off, so a future generic "edit all fields" admin
-- form can't silently republish an unverified entry.
-- ─────────────────────────────────────────────────────────────────────────────

alter table scholarships
  add column if not exists institution_name text,
  add column if not exists programme_name text,
  add column if not exists study_level text check (study_level in ('undergraduate', 'graduate', 'phd', 'other')),
  add column if not exists funding_type text check (funding_type in ('full', 'partial')),
  add column if not exists eligibility_notes text,
  add column if not exists application_deadline date,
  add column if not exists listing_status text not null default 'to_be_verified'
    check (listing_status in ('to_be_verified', 'open', 'upcoming', 'closed')),
  add column if not exists source_url text,
  add column if not exists last_checked_at date,
  add column if not exists last_checked_by uuid references staff_profiles(id),
  add column if not exists created_by uuid references staff_profiles(id),
  add column if not exists verified_by uuid references staff_profiles(id),
  add column if not exists verified_at timestamptz;

-- New inserts must go through the verify action to become public; existing
-- rows (created before this migration) default to 'to_be_verified' above,
-- so backfill them from their current is_active value instead, or they'd
-- vanish from the admin's new status filter despite already being live.
update scholarships
  set listing_status = case when is_active then 'open' else 'closed' end
  where listing_status = 'to_be_verified';

-- Going forward, a scholarship starts unpublished until verified — the old
-- default of `true` predates this workflow and would violate the
-- constraint below on every new insert that doesn't explicitly set it.
alter table scholarships alter column is_active set default false;

alter table scholarships add constraint scholarships_active_requires_verified
  check (not is_active or verified_by is not null);

create index if not exists scholarships_listing_status_idx on scholarships (listing_status);
create index if not exists scholarships_country_idx on scholarships (destination_country);
create index if not exists scholarships_study_level_idx on scholarships (study_level);

-- ─────────────────────────────────────────────────────────────────────────────
-- Forward-compatible hook for a future paid-tier model. Deliberately unused:
-- no query, RLS policy, or code in this change reads this column. Pricing,
-- tiers, and access method are explicitly left to management/pilot by the
-- sourcing-database proposal — this column exists so that decision doesn't
-- require a migration later, not to pre-decide it now.
-- ─────────────────────────────────────────────────────────────────────────────
alter table client_profiles
  add column if not exists subscription_tier text;
