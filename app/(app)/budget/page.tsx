import { ResourceManager } from "@/components/crud/ResourceManager";
import {
  createBudgetItem,
  deleteBudgetItem,
  listBudgetItems,
  updateBudgetItem,
} from "@/lib/actions/budget";
import { listDestinations } from "@/lib/actions/destinations";
import { computeBudgetSummary } from "@/lib/budget";
import { BudgetSummaryCard } from "@/components/budget/BudgetSummaryCard";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import type { BudgetItem } from "@/lib/types";
import type { ColumnConfig, FieldConfig } from "@/components/crud/types";

const columns: ColumnConfig<BudgetItem>[] = [
  { key: "category", label: "Categorie" },
  { key: "description", label: "Omschrijving" },
  { key: "amount", label: "Bedrag", format: "currency" },
  { key: "paid_by", label: "Betaald door" },
  { key: "paid_for", label: "Voor wie" },
];

export default async function BudgetPage() {
  const [result, destinationsResult] = await Promise.all([
    listBudgetItems(),
    listDestinations(),
  ]);

  const fields: FieldConfig<BudgetItem>[] = [
    { name: "category", label: "Categorie", type: "text", required: true },
    { name: "description", label: "Omschrijving", type: "text" },
    { name: "amount", label: "Bedrag", type: "number", required: true },
    { name: "currency", label: "Valuta", type: "text", placeholder: "EUR" },
    { name: "paid_by", label: "Betaald door", type: "text", placeholder: "bv. Jip" },
    {
      name: "paid_for",
      label: "Voor wie",
      type: "text",
      placeholder: "leeg = samen gedeeld, of typ een naam voor 100% eigen kosten",
    },
    {
      name: "destination_id",
      label: "Bestemming (optioneel)",
      type: "select",
      options: (destinationsResult.data ?? []).map((d) => ({ value: d.id, label: d.name })),
    },
    { name: "item_date", label: "Datum", type: "date" },
    { name: "notes", label: "Notities", type: "textarea" },
  ];

  const items = result.data ?? [];
  const summary = computeBudgetSummary(items);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Budget</h1>
        <p className="mt-1 text-sm text-slate-500">
          Wie betaalde wat, voor wie, en wie staat er nog bij wie in het krijt.
        </p>
      </div>

      {result.error !== null ? (
        <ErrorBanner message={result.error} />
      ) : (
        <BudgetSummaryCard summary={summary} />
      )}

      <ResourceManager<BudgetItem>
        title="Budgetpost"
        description="Alle kosten van de reis."
        addButtonLabel="Post toevoegen"
        emptyMessage="Nog geen budgetposten toegevoegd."
        initialItems={items}
        initialError={result.error}
        fields={fields}
        columns={columns}
        actions={{
          create: createBudgetItem,
          update: updateBudgetItem,
          remove: deleteBudgetItem,
        }}
      />
    </div>
  );
}
