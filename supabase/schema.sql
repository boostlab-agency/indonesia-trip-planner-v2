-- Indonesia Trip Planner V2 -- database schema
-- Voer dit eenmalig volledig uit in de Supabase SQL Editor (project -> SQL Editor -> New query).
-- Idempotent: kan veilig opnieuw gedraaid worden zonder data te verliezen (gebruikt IF NOT EXISTS / OR REPLACE).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Generieke trigger die updated_at bijwerkt bij elke UPDATE
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- 1. destinations
-- ---------------------------------------------------------------------------
create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location text,
  start_date date,
  end_date date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.destinations;
create trigger set_updated_at
  before update on public.destinations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. accommodations
-- ---------------------------------------------------------------------------
create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete set null,
  name text not null,
  address text,
  check_in date,
  check_out date,
  price numeric(10, 2),
  booking_link text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.accommodations;
create trigger set_updated_at
  before update on public.accommodations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. transport
-- ---------------------------------------------------------------------------
create table if not exists public.transport (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'other' check (type in ('flight', 'train', 'bus', 'car', 'ferry', 'other')),
  from_location text,
  to_location text,
  departure_time timestamptz,
  arrival_time timestamptz,
  price numeric(10, 2),
  booking_reference text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.transport;
create trigger set_updated_at
  before update on public.transport
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. activities
-- ---------------------------------------------------------------------------
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete set null,
  name text not null,
  activity_date date,
  activity_time time,
  location text,
  price numeric(10, 2),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.activities;
create trigger set_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. budget_items
-- ---------------------------------------------------------------------------
create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text,
  amount numeric(10, 2) not null default 0,
  currency text not null default 'EUR',
  paid_by text,
  item_date date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.budget_items;
create trigger set_updated_at
  before update on public.budget_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. links
-- ---------------------------------------------------------------------------
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  category text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.links;
create trigger set_updated_at
  before update on public.links
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- App is voor precies 2 vertrouwde, ingelogde gebruikers die alles delen:
-- elke ingelogde gebruiker mag alles lezen/schrijven/bewerken/verwijderen.
-- ---------------------------------------------------------------------------
alter table public.destinations enable row level security;
alter table public.accommodations enable row level security;
alter table public.transport enable row level security;
alter table public.activities enable row level security;
alter table public.budget_items enable row level security;
alter table public.links enable row level security;

drop policy if exists "authenticated_full_access" on public.destinations;
create policy "authenticated_full_access" on public.destinations
  for all to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "authenticated_full_access" on public.accommodations;
create policy "authenticated_full_access" on public.accommodations
  for all to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "authenticated_full_access" on public.transport;
create policy "authenticated_full_access" on public.transport
  for all to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "authenticated_full_access" on public.activities;
create policy "authenticated_full_access" on public.activities
  for all to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "authenticated_full_access" on public.budget_items;
create policy "authenticated_full_access" on public.budget_items
  for all to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "authenticated_full_access" on public.links;
create policy "authenticated_full_access" on public.links
  for all to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- Tabel-level rechten (GRANT)
-- RLS-policies bepalen alleen welke RIJEN een rol mag zien/wijzigen; de rol
-- moet daarnaast tabel-rechten hebben, anders krijg je "permission denied
-- for table ..." (Postgres 42501) ook al staan de policies goed. Supabase
-- zet dit meestal automatisch goed, maar bij tabellen die via een los
-- SQL-script zijn aangemaakt kan dit missen -- daarom hier expliciet.
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;

grant select, insert, update, delete on public.destinations to authenticated;
grant select, insert, update, delete on public.accommodations to authenticated;
grant select, insert, update, delete on public.transport to authenticated;
grant select, insert, update, delete on public.activities to authenticated;
grant select, insert, update, delete on public.budget_items to authenticated;
grant select, insert, update, delete on public.links to authenticated;

-- ---------------------------------------------------------------------------
-- Indexen voor de meest gebruikte sorteer-/filtervelden
-- ---------------------------------------------------------------------------
create index if not exists idx_accommodations_destination_id on public.accommodations(destination_id);
create index if not exists idx_activities_destination_id on public.activities(destination_id);
create index if not exists idx_activities_activity_date on public.activities(activity_date);
create index if not exists idx_transport_departure_time on public.transport(departure_time);
create index if not exists idx_budget_items_item_date on public.budget_items(item_date);
