"use server";

import { ConfigError } from "@/lib/env";
import type { ActionResult } from "@/lib/types";

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Geocodeert een plaatsnaam, adres, of Google Maps-link naar coördinaten.
// Gebruikt Nominatim (OpenStreetMap) -- gratis, geen API-key nodig. De
// aanroep gebeurt server-side zodat we een correcte identificerende
// User-Agent kunnen zetten (vereist door Nominatim's gebruiksvoorwaarden en
// door browsers niet overschrijfbaar).
export async function geocodeLocation(query: string): Promise<ActionResult<GeocodeResult>> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { data: null, error: "Vul een adres of locatie in." };
  }

  try {
    const directCoords = extractCoordsFromMapsUrl(trimmed);
    if (directCoords) {
      return {
        data: { ...directCoords, displayName: extractSearchText(trimmed) },
        error: null,
      };
    }

    const searchText = extractSearchText(trimmed);
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("format", "json");
    url.searchParams.set("q", searchText);
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "IndonesiaTripPlanner/1.0 (persoonlijke reisplanner, 2 gebruikers)",
        "Accept-Language": "nl",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { data: null, error: `Geocoding-service gaf een fout (status ${response.status}).` };
    }

    const results = (await response.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (!results || results.length === 0) {
      return {
        data: null,
        error: `Locatie "${searchText}" niet gevonden. Probeer een preciezere naam, bv. "Ubud, Bali, Indonesië".`,
      };
    }

    const [first] = results;
    const lat = Number(first.lat);
    const lng = Number(first.lon);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return { data: null, error: "Geocoding-service gaf ongeldige coördinaten terug." };
    }

    return { data: { lat, lng, displayName: first.display_name }, error: null };
  } catch (err) {
    if (err instanceof ConfigError) return { data: null, error: err.message };
    if (err instanceof Error) return { data: null, error: err.message };
    return { data: null, error: "Geocoding is mislukt door een onbekende fout." };
  }
}

function extractCoordsFromMapsUrl(input: string): { lat: number; lng: number } | null {
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      const lat = Number(match[1]);
      const lng = Number(match[2]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { lat, lng };
      }
    }
  }

  return null;
}

function extractSearchText(input: string): string {
  if (!/^https?:\/\//i.test(input)) {
    return input;
  }

  // Haal de plaatsnaam uit een Google Maps-link, bv.
  // https://www.google.com/maps/place/Ubud,+Bali/@... -> "Ubud, Bali"
  const placeMatch = input.match(/\/place\/([^/@]+)/);
  if (placeMatch) {
    return decodeURIComponent(placeMatch[1]).replace(/\+/g, " ");
  }

  return input;
}
