import Link from "next/link";
import { getDashboardSummary } from "@/lib/actions/dashboard";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

const CARDS = [
  { key: "destinationCount", label: "Bestemmingen", href: "/destinations" },
  { key: "accommodationCount", label: "Accommodaties", href: "/accommodations" },
  { key: "transportCount", label: "Vervoer", href: "/transport" },
  { key: "activityCount", label: "Activiteiten", href: "/activities" },
  { key: "linkCount", label: "Links", href: "/links" },
] as const;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("nl-NL", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value)
  );
}

export default async function DashboardPage() {
  const result = await getDashboardSummary();

  if (result.error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <ErrorBanner message={result.error} />
      </div>
    );
  }

  const summary = result.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overzicht van jullie Indonesië-reis.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-400"
          >
            <p className="text-2xl font-semibold text-slate-900">{summary[card.key]}</p>
            <p className="mt-1 text-sm text-slate-500">{card.label}</p>
          </Link>
        ))}
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 shadow-sm">
          <p className="text-2xl font-semibold text-brand-900">
            {formatCurrency(summary.budgetTotal)}
          </p>
          <p className="mt-1 text-sm text-brand-700">Totaal budget</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Aankomende activiteiten</h2>
          {summary.upcomingActivities.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Geen geplande activiteiten.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {summary.upcomingActivities.map((activity) => (
                <li key={activity.id} className="flex justify-between gap-2">
                  <span className="text-slate-700">{activity.name}</span>
                  <span className="text-slate-500">{formatDate(activity.activity_date)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Aankomende accommodaties</h2>
          {summary.upcomingAccommodations.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Geen geplande accommodaties.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {summary.upcomingAccommodations.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-slate-500">{formatDate(item.check_in)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Aankomend vervoer</h2>
          {summary.upcomingTransport.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Geen gepland vervoer.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {summary.upcomingTransport.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span className="text-slate-700">
                    {item.from_location ?? "?"} → {item.to_location ?? "?"}
                  </span>
                  <span className="text-slate-500">{formatDate(item.departure_time)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
