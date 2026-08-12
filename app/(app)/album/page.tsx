import { listPhotos } from "@/lib/actions/photos";
import { PhotoSection } from "@/components/photos/PhotoSection";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export default async function AlbumPage() {
  const result = await listPhotos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reisalbum</h1>
        <p className="mt-1 text-sm text-slate-500">Alle foto&apos;s van de reis, op één plek.</p>
      </div>

      {result.error !== null ? (
        <ErrorBanner message={result.error} />
      ) : (
        <PhotoSection
          destinationId={null}
          initialPhotos={result.data}
          emptyMessage="Nog geen foto's. Voeg je eerste reisfoto toe!"
        />
      )}
    </div>
  );
}
