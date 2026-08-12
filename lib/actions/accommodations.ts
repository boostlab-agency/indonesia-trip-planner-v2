"use server";

import { revalidatePath } from "next/cache";
import { createRow, deleteRow, listRows, updateRow } from "./crud-helpers";
import type { Accommodation, ActionResult } from "@/lib/types";

const TABLE = "accommodations";
const PATH = "/accommodations";

export async function listAccommodations(): Promise<ActionResult<Accommodation[]>> {
  return listRows<Accommodation>(TABLE, "check_in");
}

export async function createAccommodation(
  values: Record<string, unknown>
): Promise<ActionResult<Accommodation>> {
  const result = await createRow<Accommodation>(TABLE, values);
  if (!result.error) revalidatePath(PATH);
  return result;
}

export async function updateAccommodation(
  id: string,
  values: Record<string, unknown>
): Promise<ActionResult<Accommodation>> {
  const result = await updateRow<Accommodation>(TABLE, id, values);
  if (!result.error) revalidatePath(PATH);
  return result;
}

export async function deleteAccommodation(id: string): Promise<ActionResult<true>> {
  const result = await deleteRow(TABLE, id);
  if (!result.error) revalidatePath(PATH);
  return result;
}
