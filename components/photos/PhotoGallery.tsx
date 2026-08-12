"use client";

import { useState } from "react";
import { deletePhoto } from "@/lib/actions/photos";
import { getPhotoPublicUrl } from "@/lib/storage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Photo } from "@/lib/types";

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  onSetCover?: (photo: Photo) => void;
  emptyMessage?: string;
}

export function PhotoGallery({
  photos,
  onPhotosChange,
  onSetCover,
  emptyMessage = "Nog geen foto's toegevoegd.",
}: PhotoGalleryProps) {
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deletePhoto(deleteTarget.id);
    setIsDeleting(false);

    if (result.error !== null) {
      setDeleteError(result.error);
      return;
    }

    onPhotosChange(photos.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  if (photos.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
          >
            <img
              src={getPhotoPublicUrl(photo.storage_path)}
              alt={photo.caption ?? "Reisfoto"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5">
              {onSetCover && (
                <button
                  type="button"
                  onClick={() => onSetCover(photo)}
                  className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white"
                  aria-label="Als hoofdfoto instellen"
                >
                  ★
                </button>
              )}
              <button
                type="button"
                onClick={() => setDeleteTarget(photo)}
                className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-red-600 hover:bg-white"
                aria-label="Foto verwijderen"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Foto verwijderen"
        message="Weet je zeker dat je deze foto wilt verwijderen?"
        isBusy={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
      />
    </>
  );
}
