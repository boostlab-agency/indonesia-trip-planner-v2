"use client";

import { useState } from "react";
import { PhotoUpload } from "./PhotoUpload";
import { PhotoGallery } from "./PhotoGallery";
import { setCoverPhoto } from "@/lib/actions/photos";
import { getPhotoPublicUrl } from "@/lib/storage";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import type { Photo } from "@/lib/types";

interface PhotoSectionProps {
  destinationId: string | null;
  initialPhotos: Photo[];
  allowSetCover?: boolean;
  emptyMessage?: string;
}

export function PhotoSection({
  destinationId,
  initialPhotos,
  allowSetCover = false,
  emptyMessage,
}: PhotoSectionProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [coverError, setCoverError] = useState<string | null>(null);

  async function handleSetCover(photo: Photo) {
    if (!destinationId) return;
    setCoverError(null);
    const result = await setCoverPhoto(destinationId, getPhotoPublicUrl(photo.storage_path));
    if (result.error !== null) setCoverError(result.error);
  }

  return (
    <div className="space-y-4">
      <PhotoUpload
        destinationId={destinationId}
        onUploaded={(photo) => setPhotos((prev) => [photo, ...prev])}
      />
      <ErrorBanner message={coverError} onDismiss={() => setCoverError(null)} />
      <PhotoGallery
        photos={photos}
        onPhotosChange={setPhotos}
        onSetCover={allowSetCover && destinationId ? handleSetCover : undefined}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
