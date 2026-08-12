"use client";

import { useState } from "react";
import { CrudTable } from "./CrudTable";
import { CrudFormDialog } from "./CrudFormDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Button } from "@/components/ui/Button";
import type { ColumnConfig, FieldConfig, ResourceActions, WithId } from "./types";

interface ResourceManagerProps<T extends WithId> {
  title: string;
  description?: string;
  addButtonLabel: string;
  emptyMessage: string;
  initialItems: T[];
  initialError?: string | null;
  fields: FieldConfig<T>[];
  columns: ColumnConfig<T>[];
  actions: ResourceActions<T>;
}

export function ResourceManager<T extends WithId>({
  title,
  description,
  addButtonLabel,
  emptyMessage,
  initialItems,
  initialError = null,
  fields,
  columns,
  actions,
}: ResourceManagerProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [listError] = useState<string | null>(initialError);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openCreate() {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  function openEdit(item: T) {
    setEditingItem(item);
    setIsFormOpen(true);
  }

  function handleSubmit(values: Record<string, unknown>) {
    if (editingItem) {
      return actions.update(editingItem.id, values);
    }
    return actions.create(values);
  }

  function handleSuccess(data: T) {
    setItems((prev) => {
      if (editingItem) {
        return prev.map((item) => (item.id === data.id ? data : item));
      }
      return [...prev, data];
    });
    setIsFormOpen(false);
    setEditingItem(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const result = await actions.remove(deleteTarget.id);
    setIsDeleting(false);

    if (result.error !== null) {
      setDeleteError(result.error);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        <Button onClick={openCreate}>{addButtonLabel}</Button>
      </div>

      <ErrorBanner message={listError} />

      <CrudTable
        columns={columns}
        rows={items}
        emptyMessage={emptyMessage}
        onEdit={openEdit}
        onDelete={(row) => {
          setDeleteTarget(row);
          setDeleteError(null);
        }}
      />

      <CrudFormDialog
        open={isFormOpen}
        title={editingItem ? `${title} bewerken` : `${title} toevoegen`}
        fields={fields}
        initialValues={editingItem}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Verwijderen bevestigen"
        message="Weet je zeker dat je dit item wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
        isBusy={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
