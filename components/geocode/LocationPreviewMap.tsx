"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { markerIcon } from "@/components/map/markerIcon";

interface LocationPreviewMapProps {
  lat: number;
  lng: number;
}

export function LocationPreviewMap({ lat, lng }: LocationPreviewMapProps) {
  return (
    <MapContainer
      key={`${lat},${lng}`}
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={markerIcon} />
    </MapContainer>
  );
}
