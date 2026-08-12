"use client";

import dynamic from "next/dynamic";
import type { Destination } from "@/lib/types";

// Leaflet raakt `window`/`document` aan tijdens het opbouwen van de kaart,
// dus deze mag nooit server-side gerenderd worden.
const RouteMap = dynamic(() => import("./RouteMap").then((mod) => mod.RouteMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">
      Kaart laden...
    </div>
  ),
});

interface RouteMapLoaderProps {
  destinations: Destination[];
}

export function RouteMapLoader({ destinations }: RouteMapLoaderProps) {
  return <RouteMap destinations={destinations} />;
}
