"use server";

import { createClient } from "@/lib/supabase/server";
import { ConfigError } from "@/lib/env";
import type { ActionResult, Activity, Accommodation, Transport } from "@/lib/types";

export interface DashboardSummary {
  destinationCount: number;
  accommodationCount: number;
  transportCount: number;
  activityCount: number;
  linkCount: number;
  budgetTotal: number;
  upcomingActivities: Activity[];
  upcomingAccommodations: Accommodation[];
  upcomingTransport: Transport[];
}

export async function getDashboardSummary(): Promise<ActionResult<DashboardSummary>> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);

    const [
      destinations,
      accommodations,
      transport,
      activities,
      links,
      budgetItems,
      upcomingActivities,
      upcomingAccommodations,
      upcomingTransport,
    ] = await Promise.all([
      supabase.from("destinations").select("id", { count: "exact", head: true }),
      supabase.from("accommodations").select("id", { count: "exact", head: true }),
      supabase.from("transport").select("id", { count: "exact", head: true }),
      supabase.from("activities").select("id", { count: "exact", head: true }),
      supabase.from("links").select("id", { count: "exact", head: true }),
      supabase.from("budget_items").select("amount"),
      supabase
        .from("activities")
        .select("*")
        .gte("activity_date", today)
        .order("activity_date", { ascending: true })
        .limit(5),
      supabase
        .from("accommodations")
        .select("*")
        .gte("check_in", today)
        .order("check_in", { ascending: true })
        .limit(5),
      supabase
        .from("transport")
        .select("*")
        .gte("departure_time", new Date().toISOString())
        .order("departure_time", { ascending: true })
        .limit(5),
    ]);

    const firstError =
      destinations.error ||
      accommodations.error ||
      transport.error ||
      activities.error ||
      links.error ||
      budgetItems.error ||
      upcomingActivities.error ||
      upcomingAccommodations.error ||
      upcomingTransport.error;

    if (firstError) return { data: null, error: firstError.message };

    const budgetTotal = (budgetItems.data ?? []).reduce(
      (sum, row) => sum + (Number(row.amount) || 0),
      0
    );

    return {
      data: {
        destinationCount: destinations.count ?? 0,
        accommodationCount: accommodations.count ?? 0,
        transportCount: transport.count ?? 0,
        activityCount: activities.count ?? 0,
        linkCount: links.count ?? 0,
        budgetTotal,
        upcomingActivities: (upcomingActivities.data ?? []) as Activity[],
        upcomingAccommodations: (upcomingAccommodations.data ?? []) as Accommodation[],
        upcomingTransport: (upcomingTransport.data ?? []) as Transport[],
      },
      error: null,
    };
  } catch (err) {
    if (err instanceof ConfigError) return { data: null, error: err.message };
    if (err instanceof Error) return { data: null, error: err.message };
    return { data: null, error: "Er is een onbekende fout opgetreden." };
  }
}
