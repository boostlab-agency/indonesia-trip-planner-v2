"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { ErrorBanner } from "./ErrorBanner";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  isBusy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  isBusy,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{message}</p>
        <ErrorBanner message={error ?? null} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isBusy}>
            Annuleren
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={isBusy}>
            {isBusy ? "Bezig..." : "Verwijderen"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
