"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import type { FieldConfig } from "./types";
import type { ActionResult } from "@/lib/types";

interface CrudFormDialogProps<T> {
  open: boolean;
  title: string;
  fields: FieldConfig<T>[];
  initialValues: Partial<T> | null;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<ActionResult<T>>;
  onSuccess: (data: T) => void;
}

export function CrudFormDialog<T>({
  open,
  title,
  fields,
  initialValues,
  onClose,
  onSubmit,
  onSuccess,
}: CrudFormDialogProps<T>) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const next: Record<string, string> = {};
    for (const field of fields) {
      const raw = initialValues ? initialValues[field.name] : undefined;
      if (raw === null || raw === undefined) {
        next[field.name] = "";
        continue;
      }
      // Postgres geeft timestamptz/time terug met seconden en/of offset; de
      // <input type="datetime-local"/"time"> elementen verwachten een kortere,
      // niet-timezone vorm. We knippen alleen het prefix af (geen conversie),
      // zodat de weergegeven waarde exact overeenkomt met wat is opgeslagen.
      let display = String(raw);
      if (field.type === "datetime-local" && display.length >= 16) display = display.slice(0, 16);
      if (field.type === "time" && display.length >= 5) display = display.slice(0, 5);
      next[field.name] = display;
    }
    setValues(next);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const isEditing = initialValues !== null;
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = values[field.name] ?? "";
      if (raw === "") {
        // Bij aanmaken: optioneel + leeg -> veld weglaten zodat het
        // database-default (bv. valuta "EUR") van toepassing is, in plaats
        // van expliciet null te sturen naar een NOT NULL-kolom.
        if (isEditing || field.required) {
          payload[field.name] = null;
        }
        continue;
      }
      if (field.type === "number") {
        const parsed = Number(raw);
        payload[field.name] = Number.isNaN(parsed) ? null : parsed;
      } else {
        payload[field.name] = raw;
      }
    }

    const result = await onSubmit(payload);
    setIsSubmitting(false);

    if (result.error !== null) {
      setError(result.error);
      return;
    }

    onSuccess(result.data);
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
            {field.type === "textarea" ? (
              <Textarea
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                placeholder={field.placeholder}
              />
            ) : field.type === "select" ? (
              <Select
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              >
                <option value="">Kies...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                type={field.type}
                step={field.type === "number" ? "0.01" : undefined}
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Annuleren
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
