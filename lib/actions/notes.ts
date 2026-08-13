"use server";

import { revalidatePath } from "next/cache";
import { createRow, deleteRow, listRows, updateRow } from "./crud-helpers";
import type { ActionResult, Note } from "@/lib/types";

const TABLE = "notes";

function revalidateAll(destinationId?: string | null) {
  revalidatePath("/");
  revalidatePath("/route");
  if (destinationId) revalidatePath(`/destinations/${destinationId}`);
}

export async function listNotes(destinationId?: string): Promise<ActionResult<Note[]>> {
  const result = await listRows<Note>(TABLE, "created_at", false);
  if (result.error !== null || !destinationId) return result;
  return { data: result.data.filter((n) => n.destination_id === destinationId), error: null };
}

export async function createNote(values: Record<string, unknown>): Promise<ActionResult<Note>> {
  const result = await createRow<Note>(TABLE, values);
  if (!result.error) revalidateAll(result.data?.destination_id);
  return result;
}

export async function updateNote(
  id: string,
  values: Record<string, unknown>
): Promise<ActionResult<Note>> {
  const result = await updateRow<Note>(TABLE, id, values);
  if (!result.error) revalidateAll(result.data?.destination_id);
  return result;
}

export async function deleteNote(id: string): Promise<ActionResult<true>> {
  const result = await deleteRow(TABLE, id);
  if (!result.error) revalidateAll();
  return result;
}
