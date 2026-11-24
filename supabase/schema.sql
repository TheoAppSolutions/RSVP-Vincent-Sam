-- Preserve existing responses when upgrading from the original table name.
do $$
begin
  if to_regclass('public.vincent_krystel') is null and to_regclass('public.rsvp') is not null then
    alter table public.rsvp rename to vincent_krystel;
  end if;
end;
$$;

create table if not exists public.vincent_krystel (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text,
  attending boolean not null,
  created_at timestamptz not null default now()
);

-- Only the server (service role key) touches this table.
alter table public.vincent_krystel enable row level security;

create index if not exists rsvp_created_at_id_idx on public.vincent_krystel (created_at desc, id desc);
revoke all on public.vincent_krystel from anon, authenticated;
grant select, insert, update, delete on public.vincent_krystel to service_role;
