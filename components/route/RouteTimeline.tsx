import Link from "next/link";
import type { Destination } from "@/lib/types";

interface RouteTimelineProps {
  destinations: Destination[];
}

type Status = "past" | "current" | "upcoming";

function getStatus(destination: Destination): Status {
  const today = new Date().toISOString().slice(0, 10);
  if (destination.end_date && destination.end_date < today) return "past";
  if (
    destination.start_date &&
    destination.start_date <= today &&
    (!destination.end_date || destination.end_date >= today)
  ) {
    return "current";
  }
  return "upcoming";
}

const STATUS_STYLES: Record<Status, { dot: string; text: string; label: string }> = {
  past: { dot: "bg-slate-300", text: "text-slate-400", label: "Geweest" },
  current: { dot: "bg-brand-600 ring-4 ring-brand-100", text: "text-brand-700", label: "Nu hier" },
  upcoming: { dot: "bg-white border-2 border-slate-300", text: "text-slate-500", label: "Nog te gaan" },
};

export function RouteTimeline({ destinations }: RouteTimelineProps) {
  if (destinations.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Nog geen bestemmingen toegevoegd aan de route.
      </p>
    );
  }

  return (
    <ol className="relative space-y-6 border-l-2 border-dashed border-slate-200 pl-6">
      {destinations.map((destination) => {
        const status = getStatus(destination);
        const style = STATUS_STYLES[status];
        return (
          <li key={destination.id} className="relative">
            <span
              className={`absolute -left-[1.85rem] top-1 h-3 w-3 rounded-full ${style.dot}`}
              aria-hidden="true"
            />
            <Link href={`/destinations/${destination.id}`} className="group block">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="font-semibold text-slate-900 group-hover:text-brand-700">
                  {destination.name}
                </span>
                <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
              </div>
              {(destination.start_date || destination.end_date) && (
                <p className="text-xs text-slate-400">
                  {destination.start_date ?? "?"}
                  {destination.end_date ? ` – ${destination.end_date}` : ""}
                </p>
              )}
              {destination.location && (
                <p className="mt-0.5 text-sm text-slate-500">{destination.location}</p>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export { getStatus };
export type { Status };
