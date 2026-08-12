"use client";

import dynamic from "next/dynamic";

const LocationPreviewMap = dynamic(
  () => import("./LocationPreviewMap").then((mod) => mod.LocationPreviewMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-slate-100 text-xs text-slate-400">
        Kaart laden...
      </div>
    ),
  }
);

interface LocationPreviewMapLoaderProps {
  lat: number;
  lng: number;
}

export function LocationPreviewMapLoader({ lat, lng }: LocationPreviewMapLoaderProps) {
  return <LocationPreviewMap lat={lat} lng={lng} />;
}
