"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPhoto } from "@/lib/actions/photos";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import type { Photo } from "@/lib/types";

interface PhotoUploadProps {
  destinationId: string | null;
  onUploaded: (photo: Photo) => void;
  label?: string;
}

export function PhotoUpload({ destinationId, onUploaded, label = "Foto toevoegen" }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${destinationId ?? "trip"}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("trip-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        setIsUploading(false);
        return;
      }

      const result = await createPhoto({ destination_id: destinationId, storage_path: path });
      setIsUploading(false);

      if (result.error !== null) {
        setError(result.error);
        return;
      }

      onUploaded(result.data);
    } catch (err) {
      setIsUploading(false);
      setError(err instanceof Error ? err.message : "Uploaden mislukt.");
    }
  }

  return (
    <div className="space-y-2">
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading}>
        {isUploading ? "Bezig met uploaden..." : label}
      </Button>
    </div>
  );
}
