import type { Destination } from "@/lib/types";

export interface TripDateRange {
  start: string | null;
  end: string | null;
}

export function getTripDateRange(destinations: Destination[]): TripDateRange {
  const starts = destinations.map((d) => d.start_date).filter((d): d is string => !!d);
  const ends = destinations.map((d) => d.end_date).filter((d): d is string => !!d);
  return {
    start: starts.length > 0 ? starts.reduce((a, b) => (a < b ? a : b)) : null,
    end: ends.length > 0 ? ends.reduce((a, b) => (a > b ? a : b)) : null,
  };
}

export function getCountdownLabel(range: TripDateRange): string {
  const today = new Date().toISOString().slice(0, 10);

  if (range.start && today < range.start) {
    const days = Math.round(
      (new Date(range.start).getTime() - new Date(today).getTime()) / 86_400_000
    );
    return `Nog ${days} ${days === 1 ? "dag" : "dagen"} te gaan`;
  }

  if (range.end && today > range.end) {
    return "Reis voltooid";
  }

  if (range.start) {
    const dayNumber =
      Math.round((new Date(today).getTime() - new Date(range.start).getTime()) / 86_400_000) + 1;
    return `Dag ${dayNumber} van de reis`;
  }

  return "Reisdata nog niet ingesteld";
}
