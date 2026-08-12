"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createRow, deleteRow, listRows, updateRow } from "./crud-helpers";
import { ConfigError } from "@/lib/env";
import type { ActionResult, Destination } from "@/lib/types";

const TABLE = "destinations";
const PATH = "/destinations";

function revalidateAll(id?: string) {
  revalidatePath(PATH);
  revalidatePath("/route");
  revalidatePath("/");
  if (id) revalidatePath(`/destinations/${id}`);
}

export async function listDestinations(): Promise<ActionResult<Destination[]>> {
  return listRows<Destination>(TABLE, "sort_order");
}

export async function getDestination(id: string): Promise<ActionResult<Destination>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
    if (error) return { data: null, error: error.message };
    return { data: data as Destination, error: null };
  } catch (err) {
    if (err instanceof ConfigError) return { data: null, error: err.message };
    if (err instanceof Error) return { data: null, error: err.message };
    return { data: null, error: "Er is een onbekende fout opgetreden." };
  }
}

export async function createDestination(
  values: Record<string, unknown>
): Promise<ActionResult<Destination>> {
  const result = await createRow<Destination>(TABLE, values);
  if (!result.error) revalidateAll();
  return result;
}

export async function updateDestination(
  id: string,
  values: Record<string, unknown>
): Promise<ActionResult<Destination>> {
  const result = await updateRow<Destination>(TABLE, id, values);
  if (!result.error) revalidateAll(id);
  return result;
}

export async function deleteDestination(id: string): Promise<ActionResult<true>> {
  const result = await deleteRow(TABLE, id);
  if (!result.error) revalidateAll(id);
  return result;
}
