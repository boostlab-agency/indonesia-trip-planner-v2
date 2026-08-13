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

-- =============================================================================
-- V2: van CRUD-dashboard naar reisplanner (route, kaart, fotoalbum, budgetsplit)
-- Zie ook supabase/migration_002_travel_app.sql voor een losse migratie op een
-- bestaand project. Deze sectie is idempotent en hoort ook bij een verse setup.
-- =============================================================================

-- destinations: route-volgorde, geocoördinaten, headerfoto
alter table public.destinations
  add column if not exists sort_order integer not null default 0,
  add column if not exists lat numeric(9, 6),
  add column if not exists lng numeric(9, 6),
  add column if not exists cover_photo_url text;

create index if not exists idx_destinations_sort_order on public.destinations(sort_order);

-- transport: koppeling aan de bestemming waar het vervoer aankomt
alter table public.transport
  add column if not exists destination_id uuid references public.destinations(id) on delete set null;

create index if not exists idx_transport_destination_id on public.transport(destination_id);

-- links: optionele koppeling aan een specifieke bestemming
alter table public.links
  add column if not exists destination_id uuid references public.destinations(id) on delete set null;

create index if not exists idx_links_destination_id on public.links(destination_id);

-- budget_items: Splitwise-achtige split ("voor wie") + koppeling aan bestemming
alter table public.budget_items
  add column if not exists paid_for text,
  add column if not exists destination_id uuid references public.destinations(id) on delete set null;

create index if not exists idx_budget_items_destination_id on public.budget_items(destination_id);

-- photos: reisalbum, per bestemming
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

drop policy if exists "authenticated_full_access" on public.photos;
create policy "authenticated_full_access" on public.photos
  for all to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

grant select, insert, update, delete on public.photos to authenticated;

create index if not exists idx_photos_destination_id on public.photos(destination_id);
create index if not exists idx_photos_created_at on public.photos(created_at);

-- Storage: publieke bucket voor reisfoto's + policies
insert into storage.buckets (id, name, public)
values ('trip-photos', 'trip-photos', true)
on conflict (id) do nothing;

drop policy if exists "trip_photos_public_read" on storage.objects;
create policy "trip_photos_public_read" on storage.objects
  for select
  using (bucket_id = 'trip-photos');

drop policy if exists "trip_photos_authenticated_insert" on storage.objects;
create policy "trip_photos_authenticated_insert" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'trip-photos');

drop policy if exists "trip_photos_authenticated_update" on storage.objects;
create policy "trip_photos_authenticated_update" on storage.objects
  for update
  to authenticated
  using (bucket_id = 'trip-photos')
  with check (bucket_id = 'trip-photos');

drop policy if exists "trip_photos_authenticated_delete" on storage.objects;
create policy "trip_photos_authenticated_delete" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'trip-photos');

-- =============================================================================
-- V3: Polarsteps-stijl uitbreidingen (zie ook supabase/migration_003_polarsteps.sql
-- voor een losse migratie op een bestaand project)
-- =============================================================================

alter table public.accommodations
  add column if not exists lat numeric(9, 6),
  add column if not exists lng numeric(9, 6),
  add column if not exists cover_photo_url text;

alter table public.activities
  add column if not exists lat numeric(9, 6),
  add column if not exists lng numeric(9, 6);

alter table public.budget_items
  add column if not exists activity_id uuid references public.activities(id) on delete set null;

create index if not exists idx_budget_items_activity_id on public.budget_items(activity_id);

alter table public.photos
  add column if not exists activity_id uuid references public.activities(id) on delete cascade,
  add column if not exists accommodation_id uuid references public.accommodations(id) on delete cascade;

create index if not exists idx_photos_activity_id on public.photos(activity_id);
create index if not exists idx_photos_accommodation_id on public.photos(accommodation_id);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete cascade,
  body text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

drop policy if exists "authenticated_full_access" on public.notes;
create policy "authenticated_full_access" on public.notes
  for all to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

grant select, insert, update, delete on public.notes to authenticated;

create index if not exists idx_notes_destination_id on public.notes(destination_id);
create index if not exists idx_notes_created_at on public.notes(created_at);
