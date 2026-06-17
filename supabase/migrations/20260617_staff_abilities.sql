-- Add abilities jsonb column to staff_profiles
alter table staff_profiles
  add column if not exists abilities jsonb not null default '{}',
  add column if not exists job_title text,
  add column if not exists is_pending boolean not null default false;

-- Mark currently inactive non-super_admin staff as pending
-- (existing rows are fine as-is; new self-registrations will set is_pending = true)

-- Update role check to allow 'staff' in addition to existing values
alter table staff_profiles
  drop constraint if exists staff_profiles_role_check;

alter table staff_profiles
  add constraint staff_profiles_role_check
  check (role in ('super_admin', 'admin', 'staff'));

-- Allow authenticated users to insert their own staff_profiles row during registration
-- (row will be pending until super_admin activates)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'staff_profiles'
    and policyname = 'Staff can insert own pending profile'
  ) then
    execute $p$create policy "Staff can insert own pending profile"
      on staff_profiles for insert to authenticated
      with check (auth.uid() = id)$p$;
  end if;
end
$$;
