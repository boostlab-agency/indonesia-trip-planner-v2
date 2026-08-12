import Link from "next/link";
import { listDestinations } from "@/lib/actions/destinations";
import { RouteTimeline } from "@/components/route/RouteTimeline";
import { RouteMapLoader } from "@/components/route/RouteMapLoader";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export default async function RoutePage() {
  const result = await listDestinations();

  if (result.error !== null) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">De route</h1>
        <ErrorBanner message={result.error} />
      </div>
    );
  }

  const destinations = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">De route</h1>
          <p className="mt-1 text-sm text-slate-500">
            Van vertrek tot aankomst — waar we zijn geweest, waar we nu zijn en waar we nog naartoe gaan.
          </p>
        </div>
        <Link
          href="/destinations"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Bestemmingen beheren →
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="order-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:order-1">
          <RouteTimeline destinations={destinations} />
        </div>
        <div className="order-1 h-80 overflow-hidden rounded-2xl border border-slate-200 shadow-sm lg:order-2 lg:h-auto lg:min-h-[420px]">
          <RouteMapLoader destinations={destinations} />
        </div>
      </div>
    </div>
  );
}
