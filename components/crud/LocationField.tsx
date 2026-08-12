"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { geocodeLocation } from "@/lib/actions/geocode";
import { Input } from "@/components/ui/Input";
import { LocationPreviewMapLoader } from "@/components/geocode/LocationPreviewMapLoader";

export type LocationResolveResult =
  | { lat: number; lng: number; text: string }
  | { error: string }
  | null;

export interface LocationFieldHandle {
  // Geeft de huidige coördinaten + definitieve tekst terug. Geocodeert eerst
  // opnieuw als de tekst sinds de laatste geslaagde geocode is gewijzigd (bv.
  // gebruiker plakte een adres en drukte meteen op Opslaan zonder weg te
  // klikken uit het veld). Geeft null terug als het veld leeg is.
  resolve(): Promise<LocationResolveResult>;
}

interface LocationFieldProps {
  value: string;
  onChange: (value: string) => void;
  initialCoords: { lat: number; lng: number } | null;
  placeholder?: string;
  required?: boolean;
}

export const LocationField = forwardRef<LocationFieldHandle, LocationFieldProps>(
  ({ value, onChange, initialCoords, placeholder, required }, ref) => {
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(initialCoords);
    const [resolvedForText, setResolvedForText] = useState<string | null>(
      initialCoords ? value : null
    );
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const [resolvedLabel, setResolvedLabel] = useState<string | null>(null);

    async function geocode(
      text: string
    ): Promise<{ lat: number; lng: number; text: string } | { error: string }> {
      setStatus("loading");
      setError(null);

      const wasUrl = /^https?:\/\//i.test(text);
      const result = await geocodeLocation(text);

      if (result.error !== null) {
        setStatus("error");
        setError(result.error);
        setCoords(null);
        setResolvedForText(null);
        return { error: result.error };
      }

      setStatus("idle");
      const newCoords = { lat: result.data.lat, lng: result.data.lng };
      setCoords(newCoords);
      setResolvedLabel(result.data.displayName);

      // Een geplakte link is nooit een fijne weergavewaarde -- vervang die
      // door de gevonden naam. Getypte tekst (plaatsnaam/adres) laten we
      // ongemoeid; de gebruiker koos zelf die bewoording.
      const finalText = wasUrl ? result.data.displayName : text;
      if (wasUrl) onChange(finalText);
      setResolvedForText(finalText);

      return { ...newCoords, text: finalText };
    }

    useImperativeHandle(ref, () => ({
      async resolve() {
        const trimmed = value.trim();
        if (trimmed === "") return null;
        if (coords && resolvedForText === trimmed) return { ...coords, text: value };
        return geocode(trimmed);
      },
    }));

    async function handleBlur() {
      const trimmed = value.trim();
      if (trimmed === "" || trimmed === resolvedForText) return;
      await geocode(trimmed);
    }

    return (
      <div className="space-y-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
        />
        {status === "loading" && <p className="text-xs text-slate-400">Locatie zoeken...</p>}
        {status === "error" && error && <p className="text-xs text-red-600">{error}</p>}
        {coords && (
          <div className="space-y-1">
            {resolvedLabel && (
              <p className="text-xs text-slate-500">Gevonden: {resolvedLabel}</p>
            )}
            <div className="h-40 overflow-hidden rounded-lg border border-slate-200">
              <LocationPreviewMapLoader lat={coords.lat} lng={coords.lng} />
            </div>
          </div>
        )}
      </div>
    );
  }
);

LocationField.displayName = "LocationField";
