"use server";

import { revalidatePath } from "next/cache";
import { createRow, deleteRow, listRows, updateRow } from "./crud-helpers";
import type { ActionResult, Destination } from "@/lib/types";

const TABLE = "destinations";
const PATH = "/destinations";

export async function listDestinations(): Promise<ActionResult<Destination[]>> {
  return listRows<Destination>(TABLE, "start_date");
}

export async function createDestination(
  values: Record<string, unknown>
): Promise<ActionResult<Destination>> {
  const result = await createRow<Destination>(TABLE, values);
  if (!result.error) revalidatePath(PATH);
  return result;
}

export async function updateDestination(
  id: string,
  values: Record<string, unknown>
): Promise<ActionResult<Destination>> {
  const result = await updateRow<Destination>(TABLE, id, values);
  if (!result.error) revalidatePath(PATH);
  return result;
}

export async function deleteDestination(id: string): Promise<ActionResult<true>> {
  const result = await deleteRow(TABLE, id);
  if (!result.error) revalidatePath(PATH);
  return result;
}
