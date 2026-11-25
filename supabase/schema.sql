-- Preserve existing responses when upgrading from an earlier table name.
do $$
begin
  if to_regclass('public.vincent_sam') is not null and (to_regclass('public.vincent_krystel') is not null or to_regclass('public.rsvp') is not null) then
    raise exception 'Multiple RSVP tables exist; reconcile them before running this migration';
  elsif to_regclass('public.vincent_krystel') is not null and to_regclass('public.rsvp') is not null then
    raise exception 'Multiple RSVP tables exist; reconcile them before running this migration';
  elsif to_regclass('public.vincent_sam') is null and to_regclass('public.vincent_krystel') is not null then
    alter table public.vincent_krystel rename to vincent_sam;
  elsif to_regclass('public.vincent_sam') is null and to_regclass('public.rsvp') is not null then
    alter table public.rsvp rename to vincent_sam;
  end if;
end;
$$;

create table if not exists public.vincent_sam (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text,
  attending boolean not null,
  created_at timestamptz not null default now()
);

-- Only the server (service role key) touches this table.
alter table public.vincent_sam enable row level security;

create index if not exists rsvp_created_at_id_idx on public.vincent_sam (created_at desc, id desc);
revoke all on public.vincent_sam from anon, authenticated;
grant select, insert, update, delete on public.vincent_sam to service_role;
