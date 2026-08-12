"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import Link from "next/link";
import { markerIcon } from "@/components/map/markerIcon";
import type { Destination } from "@/lib/types";

interface RouteMapProps {
  destinations: Destination[];
}

export function RouteMap({ destinations }: RouteMapProps) {
  const withCoords = destinations.filter(
    (d): d is Destination & { lat: number; lng: number } => d.lat != null && d.lng != null
  );

  if (withCoords.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-1 rounded-2xl bg-slate-100 p-6 text-center text-sm text-slate-500">
        <p>Nog geen coördinaten ingesteld.</p>
        <p>Vul een adres of locatie in bij een bestemming om &apos;m op de kaart te zien.</p>
      </div>
    );
  }

  const center: [number, number] = [withCoords[0].lat, withCoords[0].lng];
  const positions: [number, number][] = withCoords.map((d) => [d.lat, d.lng]);

  return (
    <MapContainer
      center={center}
      zoom={withCoords.length > 1 ? 6 : 11}
      scrollWheelZoom={false}
      className="h-full min-h-[300px] w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {positions.length > 1 && (
        <Polyline positions={positions} pathOptions={{ color: "#18855f", weight: 3, dashArray: "6 8" }} />
      )}
      {withCoords.map((d) => (
        <Marker key={d.id} position={[d.lat, d.lng]} icon={markerIcon}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{d.name}</p>
              <Link href={`/destinations/${d.id}`} className="text-brand-600 underline">
                Bekijk bestemming
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
