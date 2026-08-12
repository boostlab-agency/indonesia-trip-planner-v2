"use server";

import { revalidatePath } from "next/cache";
import { createRow, deleteRow, listRows, updateRow } from "./crud-helpers";
import type { ActionResult, Transport } from "@/lib/types";

const TABLE = "transport";
const PATH = "/transport";

export async function listTransport(): Promise<ActionResult<Transport[]>> {
  return listRows<Transport>(TABLE, "departure_time");
}

export async function createTransport(
  values: Record<string, unknown>
): Promise<ActionResult<Transport>> {
  const result = await createRow<Transport>(TABLE, values);
  if (!result.error) revalidatePath(PATH);
  return result;
}

export async function updateTransport(
  id: string,
  values: Record<string, unknown>
): Promise<ActionResult<Transport>> {
  const result = await updateRow<Transport>(TABLE, id, values);
  if (!result.error) revalidatePath(PATH);
  return result;
}

export async function deleteTransport(id: string): Promise<ActionResult<true>> {
  const result = await deleteRow(TABLE, id);
  if (!result.error) revalidatePath(PATH);
  return result;
}
