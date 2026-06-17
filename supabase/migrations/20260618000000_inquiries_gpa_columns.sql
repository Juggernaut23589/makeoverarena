alter table inquiries
  add column if not exists gpa numeric,
  add column if not exists gpa_scale text check (gpa_scale in ('4.0', '5.0')),
  add column if not exists is_pass_fail boolean not null default false;
