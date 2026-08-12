import { getSupabaseEnv } from "@/lib/env";

const PHOTOS_BUCKET = "trip-photos";

// De trip-photos bucket is publiek leesbaar, dus de publieke URL is een pure
// functie van projectgegevens + pad -- geen netwerkaanroep nodig, werkt zowel
// server- als client-side (NEXT_PUBLIC_-vars zijn in de browserbundel aanwezig).
export function getPhotoPublicUrl(storagePath: string): string {
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/${PHOTOS_BUCKET}/${storagePath}`;
}

export { PHOTOS_BUCKET };
