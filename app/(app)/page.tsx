import Link from "next/link";
import { getDashboardSummary } from "@/lib/actions/dashboard";
import { listDestinations } from "@/lib/actions/destinations";
import { listBudgetItems } from "@/lib/actions/budget";
import { listPhotos } from "@/lib/actions/photos";
import { computeBudgetSummary } from "@/lib/budget";
import { getTripDateRange, getCountdownLabel } from "@/lib/trip";
import { getPhotoPublicUrl } from "@/lib/storage";
import { RouteTimeline } from "@/components/route/RouteTimeline";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("nl-NL", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("nl-NL", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value)
  );
}

export default async function DashboardPage() {
  const [summaryResult, destinationsResult, budgetItemsResult, photosResult] = await Promise.all([
    getDashboardSummary(),
    listDestinations(),
    listBudgetItems(),
    listPhotos(),
  ]);

  const firstError = summaryResult.error ?? destinationsResult.error;
  if (firstError !== null) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <ErrorBanner message={firstError} />
      </div>
    );
  }

  const summary = summaryResult.data;
  const destinations = destinationsResult.data;
  const budgetSummary = computeBudgetSummary(budgetItemsResult.data ?? []);
  const photos = (photosResult.data ?? []).slice(0, 8);
  const range = getTripDateRange(destinations);
  const countdown = getCountdownLabel(range);
  const heroPhoto = destinations.find((d) => d.cover_photo_url)?.cover_photo_url ?? null;

  return (
    <div className="space-y-8">
      <div
        className="relative overflow-hidden rounded-2xl text-white"
        style={
          heroPhoto
            ? undefined
            : { background: "linear-gradient(135deg, #134536, #18855f 55%, #48c090)" }
        }
      >
        {heroPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroPhoto} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="relative flex min-h-[240px] flex-col justify-end gap-2 p-6 sm:min-h-[300px] sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-white/80">Reisplanner</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Indonesië Reis</h1>
          <p className="text-white/90">{countdown}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link
          href="/route"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-400"
        >
          <p className="text-2xl font-semibold text-slate-900">{destinations.length}</p>
          <p className="mt-1 text-sm text-slate-500">Bestemmingen</p>
        </Link>
        <Link
          href="/budget"
          className="rounded-2xl border border-brand-200 bg-brand-50 p-4 shadow-sm transition-colors hover:border-brand-400"
        >
          <p className="text-2xl font-semibold text-brand-900">
            {formatCurrency(budgetSummary.total, budgetSummary.currency)}
          </p>
          <p className="mt-1 text-sm text-brand-700">Totaal budget</p>
        </Link>
        <Link
          href="/activities"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-400"
        >
          <p className="text-2xl font-semibold text-slate-900">{summary.activityCount}</p>
          <p className="mt-1 text-sm text-slate-500">Activiteiten</p>
        </Link>
        <Link
          href="/album"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-400"
        >
          <p className="text-2xl font-semibold text-slate-900">{photos.length}</p>
          <p className="mt-1 text-sm text-slate-500">Foto's</p>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">De route</h2>
            <Link href="/route" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Volledige route →
            </Link>
          </div>
          <RouteTimeline destinations={destinations} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Komende activiteiten</h2>
            <Link href="/activities" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Alles →
            </Link>
          </div>
          {summary.upcomingActivities.length === 0 ? (
            <p className="text-sm text-slate-500">Geen geplande activiteiten.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {summary.upcomingActivities.map((activity) => (
                <li key={activity.id} className="flex justify-between gap-2">
                  <span className="text-slate-700">{activity.name}</span>
                  <span className="text-slate-400">{formatDate(activity.activity_date)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Reisalbum</h2>
          <Link href="/album" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            Volledig album →
          </Link>
        </div>
        {photos.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nog geen foto's. Voeg je eerste reisfoto toe via het album.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {photos.map((photo) => (
              <div key={photo.id} className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPhotoPublicUrl(photo.storage_path)}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
