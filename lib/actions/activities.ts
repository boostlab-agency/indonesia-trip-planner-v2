"use server";

import { revalidatePath } from "next/cache";
import { createRow, deleteRow, listRows, updateRow } from "./crud-helpers";
import type { ActionResult, Activity } from "@/lib/types";

const TABLE = "activities";
const PATH = "/activities";

export async function listActivities(): Promise<ActionResult<Activity[]>> {
  return listRows<Activity>(TABLE, "activity_date");
}

export async function createActivity(
  values: Record<string, unknown>
): Promise<ActionResult<Activity>> {
  const result = await createRow<Activity>(TABLE, values);
  if (!result.error) revalidatePath(PATH);
  return result;
}

export async function updateActivity(
  id: string,
  values: Record<string, unknown>
): Promise<ActionResult<Activity>> {
  const result = await updateRow<Activity>(TABLE, id, values);
  if (!result.error) revalidatePath(PATH);
  return result;
}

export async function deleteActivity(id: string): Promise<ActionResult<true>> {
  const result = await deleteRow(TABLE, id);
  if (!result.error) revalidatePath(PATH);
  return result;
}
