-- =========================
-- Whoof Apps — Migration progressive
-- =========================

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists postgis;

-- Types enum
do $$ begin
  create type friendship_status as enum ('pending','accepted','rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type verification_type as enum ('dog_chip','id_card');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type verification_status as enum ('pending','verified','rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type pro_status as enum ('pending','approved','rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type report_kind as enum ('lost_dog','hazard');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type hazard_status as enum ('open','resolved','expired');
exception when duplicate_object then null;
end $$;

-- Migration profiles : ajouter colonnes manquantes
alter table public.profiles add column if not exists gender text check (gender in ('male','female','other') or gender is null);
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists avatar text;

-- Migration dogs : ajouter colonnes manquantes
alter table public.dogs add column if not exists vaccinations text[];
alter table public.dogs add column if not exists photo text;
alter table public.dogs add column if not exists anecdote text;

-- Migration pro_accounts : ajouter location en PostGIS
alter table public.pro_accounts add column if not exists location geometry(Point, 4326);
create index if not exists pro_accounts_loc_gix on public.pro_accounts using gist (location);

-- Nouvelle table walk_events
create table if not exists public.walk_events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  place_name text,
  place_point geometry(Point, 4326),
  starts_at timestamptz not null,
  capacity int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists walk_events_point_gix on public.walk_events using gist (place_point);

-- Nouvelle table walk_participants
create table if not exists public.walk_participants (
  event_id uuid references public.walk_events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (event_id, user_id)
);

-- Nouvelle table direct_threads
create table if not exists public.direct_threads (
  id uuid primary key default gen_random_uuid(),
  a uuid not null references public.profiles(id) on delete cascade,
  b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (a,b),
  check (a <> b)
);

-- Nouvelle table direct_messages
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.direct_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- Nouvelle table reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  kind report_kind not null,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  dog_id uuid references public.dogs(id) on delete set null,
  title text,
  details text,
  point geometry(Point, 4326),
  status hazard_status default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists reports_point_gix on public.reports using gist (point);

-- Migration verifications : ajouter dog_id et v_type
alter table public.verifications add column if not exists dog_id uuid references public.dogs(id) on delete set null;
alter table public.verifications add column if not exists v_type verification_type;

-- Fonction timestamps
create or replace function public.set_timestamps()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.created_at = coalesce(new.created_at, now());
    new.updated_at = now();
  else
    new.updated_at = now();
  end if;
  return new;
end $$;

-- Triggers timestamps
drop trigger if exists t_walk_ts on public.walk_events;
create trigger t_walk_ts before insert or update on public.walk_events
for each row execute function public.set_timestamps();

drop trigger if exists t_reports_ts on public.reports;
create trigger t_reports_ts before insert or update on public.reports
for each row execute function public.set_timestamps();

-- RLS activation
alter table public.walk_events enable row level security;
alter table public.walk_participants enable row level security;
alter table public.direct_threads enable row level security;
alter table public.direct_messages enable row level security;
alter table public.reports enable row level security;

-- Politiques RLS pour walk_events
drop policy if exists walk_public_read on public.walk_events;
create policy walk_public_read on public.walk_events for select using (true);

drop policy if exists walk_host_insert on public.walk_events;
create policy walk_host_insert on public.walk_events for insert to authenticated with check (auth.uid() = host_id);

drop policy if exists walk_host_update on public.walk_events;
create policy walk_host_update on public.walk_events for update using (auth.uid() = host_id);

-- Politiques RLS pour walk_participants
drop policy if exists wp_read on public.walk_participants;
create policy wp_read on public.walk_participants for select
using (auth.uid() = user_id or auth.uid() in (
  select host_id from public.walk_events we where we.id = walk_participants.event_id
));

drop policy if exists wp_insert on public.walk_participants;
create policy wp_insert on public.walk_participants for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists wp_delete on public.walk_participants;
create policy wp_delete on public.walk_participants for delete using (auth.uid() = user_id);

-- Politiques RLS pour direct_threads
drop policy if exists dt_read on public.direct_threads;
create policy dt_read on public.direct_threads for select using (auth.uid() in (a,b));

drop policy if exists dt_insert on public.direct_threads;
create policy dt_insert on public.direct_threads for insert to authenticated with check (auth.uid() in (a,b));

-- Politiques RLS pour direct_messages
drop policy if exists dm_read on public.direct_messages;
create policy dm_read on public.direct_messages for select
using (auth.uid() in (
  select a from public.direct_threads t where t.id = direct_messages.thread_id
) or auth.uid() in (
  select b from public.direct_threads t where t.id = direct_messages.thread_id
));

drop policy if exists dm_send on public.direct_messages;
create policy dm_send on public.direct_messages for insert to authenticated with check (auth.uid() = sender_id);

-- Politiques RLS pour reports
drop policy if exists rep_public_read on public.reports;
create policy rep_public_read on public.reports for select using (true);

drop policy if exists rep_owner_write on public.reports;
create policy rep_owner_write on public.reports for insert to authenticated with check (auth.uid() = reporter_id);

drop policy if exists rep_owner_update on public.reports;
create policy rep_owner_update on public.reports for update using (auth.uid() = reporter_id);

-- Politique INSERT pour profiles
drop policy if exists profiles_owner_insert on public.profiles;
create policy profiles_owner_insert on public.profiles for insert with check (auth.uid() = id);