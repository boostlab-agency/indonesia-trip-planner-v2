import Link from "next/link";
import { getDestination, listDestinations } from "@/lib/actions/destinations";
import { listAccommodations } from "@/lib/actions/accommodations";
import { listActivities } from "@/lib/actions/activities";
import { listTransport } from "@/lib/actions/transport";
import { listBudgetItems } from "@/lib/actions/budget";
import { listLinks } from "@/lib/actions/links";
import { listPhotos } from "@/lib/actions/photos";
import { computeBudgetSummary } from "@/lib/budget";
import { PhotoSection } from "@/components/photos/PhotoSection";
import { RouteMapLoader } from "@/components/route/RouteMapLoader";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("nl-NL", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("nl-NL", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value)
  );
}

export default async function DestinationHubPage({ params }: PageProps) {
  const { id } = await params;

  const [
    destinationResult,
    allDestinationsResult,
    accommodationsResult,
    activitiesResult,
    transportResult,
    budgetResult,
    linksResult,
    photosResult,
  ] = await Promise.all([
    getDestination(id),
    listDestinations(),
    listAccommodations(),
    listActivities(),
    listTransport(),
    listBudgetItems(),
    listLinks(),
    listPhotos(id),
  ]);

  if (destinationResult.error !== null) {
    return (
      <div className="space-y-4">
        <Link href="/route" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ← Terug naar de route
        </Link>
        <ErrorBanner message={destinationResult.error} />
      </div>
    );
  }

  const destination = destinationResult.data;
  const allDestinations = [...(allDestinationsResult.data ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const currentIndex = allDestinations.findIndex((d) => d.id === id);
  const prev = currentIndex > 0 ? allDestinations[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < allDestinations.length - 1
      ? allDestinations[currentIndex + 1]
      : null;

  const accommodations = (accommodationsResult.data ?? []).filter(
    (a) => a.destination_id === id
  );
  const activities = (activitiesResult.data ?? []).filter((a) => a.destination_id === id);
  const transport = (transportResult.data ?? []).filter((t) => t.destination_id === id);
  const budgetItems = (budgetResult.data ?? []).filter((b) => b.destination_id === id);
  const links = (linksResult.data ?? []).filter((l) => l.destination_id === id);
  const budgetSummary = computeBudgetSummary(budgetItems);

  return (
    <div className="space-y-6">
      <Link href="/route" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← Terug naar de route
      </Link>

      <div
        className="relative overflow-hidden rounded-2xl"
        style={
          destination.cover_photo_url
            ? undefined
            : { background: "linear-gradient(135deg, #18855f, #25a677 60%, #7cd8b0)" }
        }
      >
        {destination.cover_photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={destination.cover_photo_url}
            alt={destination.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="relative flex min-h-[220px] flex-col justify-end gap-1 p-6 text-white sm:min-h-[280px]">
          <h1 className="text-3xl font-semibold sm:text-4xl">{destination.name}</h1>
          {destination.location && <p className="text-white/90">{destination.location}</p>}
          {(destination.start_date || destination.end_date) && (
            <p className="text-sm text-white/80">
              {formatDate(destination.start_date) ?? "?"}
              {destination.end_date ? ` – ${formatDate(destination.end_date)}` : ""}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        {prev ? (
          <Link href={`/destinations/${prev.id}`} className="font-medium text-brand-600 hover:text-brand-700">
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/destinations/${next.id}`} className="font-medium text-brand-600 hover:text-brand-700">
            {next.name} →
          </Link>
        )}
      </div>

      {destination.description && (
        <p className="text-slate-600">{destination.description}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Accommodaties</h2>
            <Link href="/accommodations" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Beheren →
            </Link>
          </div>
          {accommodations.length === 0 ? (
            <p className="text-sm text-slate-500">Nog geen accommodatie gekoppeld.</p>
          ) : (
            <ul className="space-y-3">
              {accommodations.map((a) => (
                <li key={a.id} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-medium text-slate-800">{a.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(a.check_in) ?? "?"}
                    {a.check_out ? ` – ${formatDate(a.check_out)}` : ""}
                  </p>
                  {a.price != null && (
                    <p className="text-xs text-slate-500">{formatCurrency(a.price, "EUR")}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Activiteiten</h2>
            <Link href="/activities" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Beheren →
            </Link>
          </div>
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500">Nog geen activiteiten gekoppeld.</p>
          ) : (
            <ul className="space-y-3">
              {activities.map((a) => (
                <li key={a.id} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-medium text-slate-800">{a.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(a.activity_date) ?? "?"} {a.activity_time ?? ""}
                  </p>
                  {a.location && <p className="text-xs text-slate-500">{a.location}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Vervoer</h2>
            <Link href="/transport" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Beheren →
            </Link>
          </div>
          {transport.length === 0 ? (
            <p className="text-sm text-slate-500">Nog geen vervoer gekoppeld.</p>
          ) : (
            <ul className="space-y-3">
              {transport.map((t) => (
                <li key={t.id} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-medium text-slate-800">
                    {t.from_location ?? "?"} → {t.to_location ?? "?"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.type} · {formatDate(t.departure_time) ?? "?"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Budget hier</h2>
            <Link href="/budget" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Beheren →
            </Link>
          </div>
          <p className="text-2xl font-semibold text-slate-900">
            {formatCurrency(budgetSummary.total, budgetSummary.currency)}
          </p>
          {budgetItems.length === 0 && (
            <p className="mt-1 text-sm text-slate-500">Nog geen kosten gekoppeld aan deze bestemming.</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Links</h2>
            <Link href="/links" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Beheren →
            </Link>
          </div>
          {links.length === 0 ? (
            <p className="text-sm text-slate-500">Nog geen links gekoppeld.</p>
          ) : (
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.id}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm font-medium text-brand-600 underline hover:text-brand-700"
                  >
                    {l.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="h-72 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <RouteMapLoader destinations={[destination]} />
        </section>
      </div>

      {destination.notes && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-semibold text-slate-900">Notities</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{destination.notes}</p>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-900">Foto&apos;s</h2>
        <PhotoSection
          destinationId={id}
          initialPhotos={photosResult.data ?? []}
          allowSetCover
          emptyMessage="Nog geen foto's van deze bestemming."
        />
      </section>
    </div>
  );
}
