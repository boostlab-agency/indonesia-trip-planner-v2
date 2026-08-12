import { createClient } from "@/lib/supabase/server";
import { ConfigError } from "@/lib/env";
import type { ActionResult } from "@/lib/types";

// Generieke, herbruikbare CRUD-helpers die door alle 6 module-action-bestanden
// worden aangeroepen. Elke functie vangt alle fouten af en geeft altijd een
// { data, error } terug -- nooit een throw die een pagina laat crashen.

export async function listRows<T>(
  table: string,
  orderColumn: string,
  ascending = true
): Promise<ActionResult<T[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderColumn, { ascending, nullsFirst: false });

    if (error) return { data: null, error: error.message };
    return { data: (data ?? []) as T[], error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export async function createRow<T>(
  table: string,
  values: Record<string, unknown>
): Promise<ActionResult<T>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from(table).insert(values).select().single();

    if (error) return { data: null, error: error.message };
    return { data: data as T, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export async function updateRow<T>(
  table: string,
  id: string,
  values: Record<string, unknown>
): Promise<ActionResult<T>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(table)
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as T, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export async function deleteRow(table: string, id: string): Promise<ActionResult<true>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) return { data: null, error: error.message };
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
