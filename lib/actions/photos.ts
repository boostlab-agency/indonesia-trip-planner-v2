"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ConfigError } from "@/lib/env";
import { PHOTOS_BUCKET } from "@/lib/storage";
import type { ActionResult, Photo } from "@/lib/types";

// Het uploaden van de bestandsbytes zelf gebeurt client-side, rechtstreeks
// naar Supabase Storage (zie components/photos/PhotoUpload.tsx) -- dat
// omzeilt de request-bodylimiet van Vercel serverless functions voor grote
// telefoonfoto's. Deze server actions beheren alleen de (kleine) metadata-rij.

export async function listPhotos(destinationId?: string): Promise<ActionResult<Photo[]>> {
  try {
    const supabase = await createClient();
    let query = supabase.from("photos").select("*").order("created_at", { ascending: false });
    if (destinationId) {
      query = query.eq("destination_id", destinationId);
    }
    const { data, error } = await query;
    if (error) return { data: null, error: error.message };
    return { data: (data ?? []) as Photo[], error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export async function createPhoto(input: {
  destination_id: string | null;
  activity_id?: string | null;
  accommodation_id?: string | null;
  storage_path: string;
  caption?: string | null;
}): Promise<ActionResult<Photo>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("photos")
      .insert({
        destination_id: input.destination_id,
        activity_id: input.activity_id ?? null,
        accommodation_id: input.accommodation_id ?? null,
        storage_path: input.storage_path,
        caption: input.caption ?? null,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    if (input.destination_id) revalidatePath(`/destinations/${input.destination_id}`);
    revalidatePath("/album");
    revalidatePath("/");
    return { data: data as Photo, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export async function deletePhoto(id: string): Promise<ActionResult<true>> {
  try {
    const supabase = await createClient();

    const { data: photo, error: fetchError } = await supabase
      .from("photos")
      .select("storage_path, destination_id")
      .eq("id", id)
      .single();

    if (fetchError) return { data: null, error: fetchError.message };

    await supabase.storage.from(PHOTOS_BUCKET).remove([photo.storage_path]);

    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) return { data: null, error: error.message };

    if (photo.destination_id) revalidatePath(`/destinations/${photo.destination_id}`);
    revalidatePath("/album");
    return { data: true, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export async function setCoverPhoto(
  destinationId: string,
  publicUrl: string
): Promise<ActionResult<true>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("destinations")
      .update({ cover_photo_url: publicUrl })
      .eq("id", destinationId);

    if (error) return { data: null, error: error.message };

    revalidatePath(`/destinations/${destinationId}`);
    revalidatePath("/");
    revalidatePath("/route");
    return { data: true, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

function toErrorMessage(err: unknown): string {
  if (err instanceof ConfigError) return err.message;
  if (err instanceof Error) return err.message;
  return "Er is een onbekende fout opgetreden.";
}
