-- Migration 003: Polarsteps-stijl uitbreidingen
-- Voer dit eenmalig uit in de Supabase SQL Editor van je BESTAANDE project.
-- Idempotent: veilig opnieuw te draaien.

-- ---------------------------------------------------------------------------
-- accommodations: geocoördinaten (voor mini-kaart/hub) + headerfoto
-- ---------------------------------------------------------------------------
alter table public.accommodations
  add column if not exists lat numeric(9, 6),
  add column if not exists lng numeric(9, 6),
  add column if not exists cover_photo_url text;

-- ---------------------------------------------------------------------------
-- activities: optionele geocoördinaten (bv. exacte verzamelplek)
-- ---------------------------------------------------------------------------
alter table public.activities
  add column if not exists lat numeric(9, 6),
  add column if not exists lng numeric(9, 6);

-- ---------------------------------------------------------------------------
-- budget_items: koppeling aan een specifieke activiteit
-- ---------------------------------------------------------------------------
alter table public.budget_items
  add column if not exists activity_id uuid references public.activities(id) on delete set null;

create index if not exists idx_budget_items_activity_id on public.budget_items(activity_id);

-- ---------------------------------------------------------------------------
-- photos: kunnen nu ook aan een activiteit of accommodatie hangen (naast bestemming)
-- ---------------------------------------------------------------------------
alter table public.photos
  add column if not exists activity_id uuid references public.activities(id) on delete cascade,
  add column if not exists accommodation_id uuid references public.accommodations(id) on delete cascade;

create index if not exists idx_photos_activity_id on public.photos(activity_id);
create index if not exists idx_photos_accommodation_id on public.photos(accommodation_id);

-- ---------------------------------------------------------------------------
-- notes: losse, vrije notities -- optioneel gekoppeld aan een bestemming
-- ---------------------------------------------------------------------------
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
