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

export type ColumnFormat = "currency";

export interface ColumnConfig<T> {
  key: keyof T & string;
  label: string;
  // Let op: geen functies hier (bv. render(row) => ...). Kolommen worden
  // gedefinieerd in Server Component pages en als prop doorgegeven aan de
  // Client Component ResourceManager -- functies mogen die grens niet over,
  // alleen serialiseerbare data zoals deze format-vlag.
  format?: ColumnFormat;
}

export interface ResourceActions<T> {
  create: (values: Record<string, unknown>) => Promise<ActionResult<T>>;
  update: (id: string, values: Record<string, unknown>) => Promise<ActionResult<T>>;
  remove: (id: string) => Promise<ActionResult<true>>;
}

export interface WithId {
  id: string;
}
