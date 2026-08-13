"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { LocationField, type LocationFieldHandle } from "./LocationField";
import type { FieldConfig } from "./types";

interface FieldInputProps<T> {
  field: FieldConfig<T>;
  value: string;
  onChange: (value: string) => void;
  locationRef?: (handle: LocationFieldHandle | null) => void;
  initialCoords?: { lat: number; lng: number } | null;
  hideLabel?: boolean;
}

// Rendert precies één veld (label + invoer) op basis van een FieldConfig.
// Wordt gedeeld door CrudFormDialog (alle velden tegelijk in een modal) en
// Wizard (één veld per scherm) zodat het per-veldtype gedrag -- met name de
// geocoding-flow van het "location"-type -- maar op één plek hoeft te staan.
export function FieldInput<T>({
  field,
  value,
  onChange,
  locationRef,
  initialCoords = null,
  hideLabel = false,
}: FieldInputProps<T>) {
  return (
    <div>
      {!hideLabel && (
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {field.type === "textarea" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          placeholder={field.placeholder}
        />
      ) : field.type === "select" ? (
        <Select value={value} onChange={(e) => onChange(e.target.value)} required={field.required}>
          <option value="">Kies...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      ) : field.type === "location" ? (
        <LocationField
          ref={locationRef}
          value={value}
          onChange={onChange}
          initialCoords={initialCoords}
          placeholder={field.placeholder}
          required={field.required}
        />
      ) : (
        <Input
          type={field.type}
          step={field.type === "number" ? "0.01" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
}
