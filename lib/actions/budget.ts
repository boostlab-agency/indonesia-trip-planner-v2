"use server";

import { revalidatePath } from "next/cache";
import { createRow, deleteRow, listRows, updateRow } from "./crud-helpers";
import type { ActionResult, BudgetItem } from "@/lib/types";

const TABLE = "budget_items";
const PATH = "/budget";

export async function listBudgetItems(): Promise<ActionResult<BudgetItem[]>> {
  return listRows<BudgetItem>(TABLE, "item_date");
}

export async function createBudgetItem(
  values: Record<string, unknown>
): Promise<ActionResult<BudgetItem>> {
  const result = await createRow<BudgetItem>(TABLE, values);
  if (!result.error) revalidatePath(PATH);
  return result;
}

export async function updateBudgetItem(
  id: string,
  values: Record<string, unknown>
): Promise<ActionResult<BudgetItem>> {
  const result = await updateRow<BudgetItem>(TABLE, id, values);
  if (!result.error) revalidatePath(PATH);
  return result;
}

export async function deleteBudgetItem(id: string): Promise<ActionResult<true>> {
  const result = await deleteRow(TABLE, id);
  if (!result.error) revalidatePath(PATH);
  return result;
}
