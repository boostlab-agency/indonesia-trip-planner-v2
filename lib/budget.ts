import type { BudgetItem, BudgetSummary, PersonBalance } from "@/lib/types";

// Splitwise-lite: elke uitgave is standaard gelijk verdeeld ("samen") over
// alle bekende betalers, tenzij paid_for een specifieke naam bevat -- dan telt
// het volledige bedrag als "eerlijk aandeel" van die ene persoon.
export function computeBudgetSummary(items: BudgetItem[]): BudgetSummary {
  const currency = items.find((i) => i.currency)?.currency ?? "EUR";
  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const payers = new Set<string>();
  for (const item of items) {
    if (item.paid_by?.trim()) payers.add(item.paid_by.trim());
  }
  const payerNames = Array.from(payers);

  const paid = new Map<string, number>(payerNames.map((name) => [name, 0]));
  const fairShare = new Map<string, number>(payerNames.map((name) => [name, 0]));

  for (const item of items) {
    const amount = Number(item.amount) || 0;

    if (item.paid_by?.trim()) {
      const payer = item.paid_by.trim();
      paid.set(payer, (paid.get(payer) ?? 0) + amount);
    }

    const beneficiary = item.paid_for?.trim();
    if (beneficiary && payers.has(beneficiary)) {
      fairShare.set(beneficiary, (fairShare.get(beneficiary) ?? 0) + amount);
    } else if (payerNames.length > 0) {
      const share = amount / payerNames.length;
      for (const name of payerNames) {
        fairShare.set(name, (fairShare.get(name) ?? 0) + share);
      }
    }
  }

  const people: PersonBalance[] = payerNames
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const p = paid.get(name) ?? 0;
      const f = fairShare.get(name) ?? 0;
      return { name, paid: p, fairShare: f, balance: p - f };
    });

  let settlement: BudgetSummary["settlement"] = null;
  if (people.length === 2) {
    const [a, b] = people;
    if (a.balance > b.balance) {
      settlement = { from: b.name, to: a.name, amount: Math.abs(a.balance) };
    } else if (b.balance > a.balance) {
      settlement = { from: a.name, to: b.name, amount: Math.abs(b.balance) };
    }
    // Bij precies gelijke balans (quitte) blijft settlement null.
  }

  return { total, currency, people, settlement };
}
