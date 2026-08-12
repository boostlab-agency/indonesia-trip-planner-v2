import type { BudgetSummary } from "@/lib/types";

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("nl-NL", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function BudgetSummaryCard({ summary }: { summary: BudgetSummary }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-slate-500">Totaal uitgegeven</h2>
        <p className="text-2xl font-semibold text-slate-900">
          {formatCurrency(summary.total, summary.currency)}
        </p>
      </div>

      {summary.people.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {summary.people.map((person) => (
            <div key={person.name} className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">{person.name}</p>
              <p className="text-lg font-semibold text-slate-900">
                {formatCurrency(person.paid, summary.currency)}
              </p>
              <p className="text-xs text-slate-500">betaald</p>
            </div>
          ))}
        </div>
      )}

      {summary.settlement && (
        <div className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <span className="font-semibold">{summary.settlement.from}</span> moet nog{" "}
          <span className="font-semibold">
            {formatCurrency(summary.settlement.amount, summary.currency)}
          </span>{" "}
          aan <span className="font-semibold">{summary.settlement.to}</span> betalen.
        </div>
      )}

      {summary.settlement === null && summary.people.length === 2 && (
        <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Jullie staan quitte.
        </div>
      )}
    </div>
  );
}
