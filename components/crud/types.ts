import type { ActionResult } from "@/lib/types";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "time"
  | "datetime-local"
  | "url"
  | "select";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldConfig<T> {
  name: keyof T & string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
}

export interface ColumnConfig<T> {
  key: keyof T & string;
  label: string;
  render?: (row: T) => string;
}

export interface ResourceActions<T> {
  create: (values: Record<string, unknown>) => Promise<ActionResult<T>>;
  update: (id: string, values: Record<string, unknown>) => Promise<ActionResult<T>>;
  remove: (id: string) => Promise<ActionResult<true>>;
}

export interface WithId {
  id: string;
}
