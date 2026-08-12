-- Migration 002: van CRUD-dashboard naar reisplanner
-- Voer dit eenmalig uit in de Supabase SQL Editor van je BESTAANDE project.
-- Idempotent: veilig opnieuw te draaien.

-- ---------------------------------------------------------------------------
-- destinations: route-volgorde, geocoördinaten, headerfoto
-- ---------------------------------------------------------------------------
alter table public.destinations
  add column if not exists sort_order integer not null default 0,
  add column if not exists lat numeric(9, 6),
  add column if not exists lng numeric(9, 6),
  add column if not exists cover_photo_url text;

create index if not exists idx_destinations_sort_order on public.destinations(sort_order);

-- ---------------------------------------------------------------------------
-- transport: koppelen aan de bestemming waar het vervoer aankomt (voor de hub-pagina)
-- ---------------------------------------------------------------------------
alter table public.transport
  add column if not exists destination_id uuid references public.destinations(id) on delete set null;

create index if not exists idx_transport_destination_id on public.transport(destination_id);

-- ---------------------------------------------------------------------------
-- links: optioneel koppelen aan een specifieke bestemming (trip-brede links blijven mogelijk)
-- ---------------------------------------------------------------------------
alter table public.links
  add column if not exists destination_id uuid references public.destinations(id) on delete set null;

create index if not exists idx_links_destination_id on public.links(destination_id);

-- ---------------------------------------------------------------------------
-- budget_items: Splitwise-achtige split ("voor wie") + koppeling aan bestemming ("locatie")
-- paid_for: null/leeg = kosten gedeeld tussen alle betalers ("samen"); anders exact
-- de naam (uit paid_by) van degene voor wie de kosten volledig zijn.
-- ---------------------------------------------------------------------------
alter table public.budget_items
  add column if not exists paid_for text,
  add column if not exists destination_id uuid references public.destinations(id) on delete set null;

create index if not exists idx_budget_items_destination_id on public.budget_items(destination_id);

-- ---------------------------------------------------------------------------
-- photos: reisalbum, per bestemming
-- ---------------------------------------------------------------------------
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

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.photos to authenticated;

create index if not exists idx_photos_destination_id on public.photos(destination_id);
create index if not exists idx_photos_created_at on public.photos(created_at);

-- ---------------------------------------------------------------------------
-- Storage: publieke bucket voor reisfoto's + policies
-- (publiek leesbaar zodat foto's direct te tonen zijn zonder signed URLs;
-- uploaden/wijzigen/verwijderen alleen voor ingelogde gebruikers)
-- ---------------------------------------------------------------------------
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
