import { ResourceManager } from "@/components/crud/ResourceManager";
import {
  createAccommodation,
  deleteAccommodation,
  listAccommodations,
  updateAccommodation,
} from "@/lib/actions/accommodations";
import type { Accommodation } from "@/lib/types";
import type { ColumnConfig, FieldConfig } from "@/components/crud/types";

const fields: FieldConfig<Accommodation>[] = [
  { name: "name", label: "Naam", type: "text", required: true },
  { name: "address", label: "Adres", type: "text" },
  { name: "check_in", label: "Check-in", type: "date" },
  { name: "check_out", label: "Check-out", type: "date" },
  { name: "price", label: "Prijs", type: "number" },
  { name: "booking_link", label: "Boekingslink", type: "url" },
  { name: "notes", label: "Notities", type: "textarea" },
];

const columns: ColumnConfig<Accommodation>[] = [
  { key: "name", label: "Naam" },
  { key: "address", label: "Adres" },
  { key: "check_in", label: "Check-in" },
  { key: "check_out", label: "Check-out" },
  { key: "price", label: "Prijs", format: "currency" },
];

export default async function AccommodationsPage() {
  const result = await listAccommodations();

  return (
    <ResourceManager<Accommodation>
      title="Accommodaties"
      description="Overnachtingen tijdens de reis."
      addButtonLabel="Accommodatie toevoegen"
      emptyMessage="Nog geen accommodaties toegevoegd."
      initialItems={result.data ?? []}
      initialError={result.error}
      fields={fields}
      columns={columns}
      actions={{
        create: createAccommodation,
        update: updateAccommodation,
        remove: deleteAccommodation,
      }}
    />
  );
}
