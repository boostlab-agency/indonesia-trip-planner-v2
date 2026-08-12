import { ResourceManager } from "@/components/crud/ResourceManager";
import {
  createTransport,
  deleteTransport,
  listTransport,
  updateTransport,
} from "@/lib/actions/transport";
import { listDestinations } from "@/lib/actions/destinations";
import type { Transport } from "@/lib/types";
import type { ColumnConfig, FieldConfig } from "@/components/crud/types";

const columns: ColumnConfig<Transport>[] = [
  { key: "type", label: "Type" },
  { key: "from_location", label: "Van" },
  { key: "to_location", label: "Naar" },
  { key: "departure_time", label: "Vertrek" },
];

export default async function TransportPage() {
  const [result, destinationsResult] = await Promise.all([listTransport(), listDestinations()]);

  const fields: FieldConfig<Transport>[] = [
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      options: [
        { value: "flight", label: "Vlucht" },
        { value: "train", label: "Trein" },
        { value: "bus", label: "Bus" },
        { value: "car", label: "Auto" },
        { value: "ferry", label: "Veerboot" },
        { value: "other", label: "Overig" },
      ],
    },
    {
      name: "destination_id",
      label: "Aankomst bij bestemming",
      type: "select",
      options: (destinationsResult.data ?? []).map((d) => ({ value: d.id, label: d.name })),
    },
    { name: "from_location", label: "Van", type: "text" },
    { name: "to_location", label: "Naar", type: "text" },
    { name: "departure_time", label: "Vertrektijd", type: "datetime-local" },
    { name: "arrival_time", label: "Aankomsttijd", type: "datetime-local" },
    { name: "price", label: "Prijs", type: "number" },
    { name: "booking_reference", label: "Boekingsreferentie", type: "text" },
    { name: "notes", label: "Notities", type: "textarea" },
  ];

  return (
    <ResourceManager<Transport>
      title="Vervoer"
      description="Vluchten, treinen en ander vervoer tussen bestemmingen."
      addButtonLabel="Vervoer toevoegen"
      emptyMessage="Nog geen vervoer toegevoegd."
      initialItems={result.data ?? []}
      initialError={result.error}
      fields={fields}
      columns={columns}
      actions={{
        create: createTransport,
        update: updateTransport,
        remove: deleteTransport,
      }}
    />
  );
}
