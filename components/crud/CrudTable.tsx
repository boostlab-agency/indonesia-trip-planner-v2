"use client";

import type { ColumnConfig, WithId } from "./types";
import { Button } from "@/components/ui/Button";

interface CrudTableProps<T extends WithId> {
  columns: ColumnConfig<T>[];
  rows: T[];
  emptyMessage: string;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}

export function CrudTable<T extends WithId>({
  columns,
  rows,
  emptyMessage,
  onEdit,
  onDelete,
}: CrudTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-2 text-left font-medium text-slate-600">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-2 text-right font-medium text-slate-600">Acties</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-2 text-slate-700">
                  {col.render ? col.render(row) : String(row[col.key] ?? "-")}
                </td>
              ))}
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => onEdit(row)}>
                    Bewerken
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(row)}>
                    Verwijderen
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
