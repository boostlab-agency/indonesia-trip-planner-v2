import { ResourceManager } from "@/components/crud/ResourceManager";
import {
  createBudgetItem,
  deleteBudgetItem,
  listBudgetItems,
  updateBudgetItem,
} from "@/lib/actions/budget";
import type { BudgetItem } from "@/lib/types";
import type { ColumnConfig, FieldConfig } from "@/components/crud/types";

const fields: FieldConfig<BudgetItem>[] = [
  { name: "category", label: "Categorie", type: "text", required: true },
  { name: "description", label: "Omschrijving", type: "text" },
  { name: "amount", label: "Bedrag", type: "number", required: true },
  { name: "currency", label: "Valuta", type: "text", placeholder: "EUR" },
  { name: "paid_by", label: "Betaald door", type: "text" },
  { name: "item_date", label: "Datum", type: "date" },
  { name: "notes", label: "Notities", type: "textarea" },
];

const columns: ColumnConfig<BudgetItem>[] = [
  { key: "category", label: "Categorie" },
  { key: "description", label: "Omschrijving" },
  {
    key: "amount",
    label: "Bedrag",
    render: (row) => `${row.amount} ${row.currency ?? "EUR"}`,
  },
  { key: "paid_by", label: "Betaald door" },
];

export default async function BudgetPage() {
  const result = await listBudgetItems();

  return (
    <ResourceManager<BudgetItem>
      title="Budget"
      description="Alle kosten en uitgaven voor de reis."
      addButtonLabel="Post toevoegen"
      emptyMessage="Nog geen budgetposten toegevoegd."
      initialItems={result.data ?? []}
      initialError={result.error}
      fields={fields}
      columns={columns}
      actions={{
        create: createBudgetItem,
        update: updateBudgetItem,
        remove: deleteBudgetItem,
      }}
    />
  );
}
