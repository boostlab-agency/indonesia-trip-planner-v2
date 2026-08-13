# Indonesia Trip Planner V2

Gedeelde reisplanner voor 2 gebruikers. Next.js (App Router) + TypeScript + Tailwind + Supabase, gedeployed op Vercel.

## Fase 1 (MVP) — scope

7 modules, elk met volledige CRUD (aanmaken, bekijken, bewerken, verwijderen):

1. Dashboard (overzicht/totals)
2. Bestemmingen
3. Accommodaties
4. Vervoer
5. Activiteiten
6. Budget
7. Link-verzameling

Alle fouten (ontbrekende configuratie, mislukte database-acties, onverwachte render-fouten) worden zichtbaar in de UI getoond en leiden nooit tot een blanco crash-pagina — zie `app/error.tsx`, `app/global-error.tsx` en de foutafhandeling in elke server action.

## 1. Supabase-project voorbereiden

1. Open je Supabase project → **SQL Editor** → **New query**.
2. Plak de volledige inhoud van [`supabase/schema.sql`](supabase/schema.sql) en voer uit. Dit maakt alle tabellen, triggers, storage-bucket en Row Level Security-policies aan. Het script is idempotent (veilig opnieuw te draaien). Op een bestaand project: draai in plaats daarvan de losse migratiebestanden (`supabase/migration_00x_*.sql`) die je nog niet eerder hebt uitgevoerd.
3. Ga naar **Authentication → Users** en zorg dat er **minstens 1 account** bestaat (e-mail + wachtwoord). De app gebruikt dit account server-side achter één gedeeld reiswachtwoord — zie hieronder. Er is geen publieke registratiepagina.
4. Ga naar **Settings → API** en noteer:
   - **Project URL**
   - **anon public key**

### Inloggen: één gedeeld wachtwoord

Gebruikers zien alleen een wachtwoordveld, nooit een e-mailadres. Dit werkt via twee environment variables die verwijzen naar het Supabase-account uit stap 3:

- `APP_LOGIN_EMAIL` — het e-mailadres van dat account.
- `APP_LOGIN_PASSWORD` — het wachtwoord van dat account. Dit is exact het wachtwoord dat gebruikers in de app intypen, dus zet dit account in Supabase op het gewenste gedeelde wachtwoord.

Beide zijn **server-only** (geen `NEXT_PUBLIC_`-prefix) en horen dus nooit in de browser terecht te komen.

## 2. Lokale configuratie (optioneel, alleen als je wél lokaal Node.js hebt)

```bash
cp .env.local.example .env.local
# vul NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in
npm install
npm run dev
```

Dit project is zo gebouwd dat lokale Node.js **niet** verplicht is — Vercel voert `npm install`/`npm run build` uit vanuit GitHub (zie hieronder).

## 3. Deployen via GitHub → Vercel

1. Push deze repository naar GitHub.
2. Ga naar [vercel.com](https://vercel.com) → **New Project** → importeer de GitHub-repo.
3. Zet bij **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `APP_LOGIN_EMAIL`
   - `APP_LOGIN_PASSWORD`
4. Deploy. Vercel detecteert Next.js automatisch (build command `next build`, output `.next`).
5. Na de deploy: log in op de live URL met het gedeelde wachtwoord en loop de modules door als laatste check.

## Architectuur (kort)

- `supabase/schema.sql` — volledig databaseschema (6 tabellen + triggers + RLS).
- `lib/supabase/` — Supabase server-/browserclient + middleware-sessieverversing.
- `lib/actions/` — Server Actions per module (list/create/update/delete), elk met try/catch en een `{ data, error }`-resultaat i.p.v. een throw.
- `components/crud/ResourceManager.tsx` — generieke, herbruikbare CRUD-UI (tabel + formulier-modal + verwijderbevestiging) die door alle 7 modules wordt geconfigureerd met hun eigen velden/kolommen.
- `middleware.ts` — beschermt alle routes behalve `/login`.
- `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx` — vangnetten zodat de app nooit crasht op een blanco pagina.

## Database-model

Zie `supabase/schema.sql` voor het volledige script. Samengevat:

| Tabel | Belangrijkste velden |
|---|---|
| `destinations` | name, description, location, start_date, end_date, notes |
| `accommodations` | destination_id, name, address, check_in, check_out, price, booking_link, notes |
| `transport` | type, from_location, to_location, departure_time, arrival_time, price, booking_reference, notes |
| `activities` | destination_id, name, activity_date, activity_time, location, price, notes |
| `budget_items` | category, description, amount, currency, paid_by, item_date, notes |
| `links` | title, url, category, notes |

Alle tabellen hebben Row Level Security aan staan met één policy: elke ingelogde gebruiker mag alles lezen/schrijven (de app is voor precies 2 vertrouwde, gedeelde gebruikers — geen aparte per-gebruiker afscherming nodig).

## Gebruikte versies

Vastgepind op geverifieerde, stabiele releases (npm registry gecontroleerd) om een betrouwbare Vercel-build te garanderen zonder lokale Node.js:

- Next.js 15.5.23 (App Router), React 19.2.8
- @supabase/ssr 0.12.x, @supabase/supabase-js 2.112.x
- Tailwind CSS 3.4.x, TypeScript 5.9.x

## Na de MVP

Voeg pas nieuwe functionaliteit toe (bijv. kaartweergave, notificaties, uitgebreidere budgetsplitsing) nadat is bevestigd dat alle CRUD-acties in Fase 1 daadwerkelijk werken tegen de productie-Supabase-database.
