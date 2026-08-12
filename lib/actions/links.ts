"use server";

import { revalidatePath } from "next/cache";
import { createRow, deleteRow, listRows, updateRow } from "./crud-helpers";
import type { ActionResult, LinkItem } from "@/lib/types";

const TABLE = "links";
const PATH = "/links";

export async function listLinks(): Promise<ActionResult<LinkItem[]>> {
  return listRows<LinkItem>(TABLE, "created_at", false);
}

export async function createLink(
  values: Record<string, unknown>
): Promise<ActionResult<LinkItem>> {
  const result = await createRow<LinkItem>(TABLE, values);
  if (!result.error) revalidatePath(PATH);
  return result;
}

export async function updateLink(
  id: string,
  values: Record<string, unknown>
): Promise<ActionResult<LinkItem>> {
  const result = await updateRow<LinkItem>(TABLE, id, values);
  if (!result.error) revalidatePath(PATH);
  return result;
}

export async function deleteLink(id: string): Promise<ActionResult<true>> {
  const result = await deleteRow(TABLE, id);
  if (!result.error) revalidatePath(PATH);
  return result;
}
