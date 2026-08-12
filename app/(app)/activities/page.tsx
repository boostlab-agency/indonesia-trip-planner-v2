import { ResourceManager } from "@/components/crud/ResourceManager";
import {
  createActivity,
  deleteActivity,
  listActivities,
  updateActivity,
} from "@/lib/actions/activities";
import { listDestinations } from "@/lib/actions/destinations";
import type { Activity } from "@/lib/types";
import type { ColumnConfig, FieldConfig } from "@/components/crud/types";

const columns: ColumnConfig<Activity>[] = [
  { key: "name", label: "Naam" },
  { key: "activity_date", label: "Datum" },
  { key: "activity_time", label: "Tijd" },
  { key: "location", label: "Locatie" },
];

export default async function ActivitiesPage() {
  const [result, destinationsResult] = await Promise.all([listActivities(), listDestinations()]);

  const fields: FieldConfig<Activity>[] = [
    { name: "name", label: "Naam", type: "text", required: true },
    {
      name: "destination_id",
      label: "Bestemming",
      type: "select",
      options: (destinationsResult.data ?? []).map((d) => ({ value: d.id, label: d.name })),
    },
    { name: "activity_date", label: "Datum", type: "date" },
    { name: "activity_time", label: "Tijd", type: "time" },
    { name: "location", label: "Locatie", type: "text" },
    { name: "price", label: "Prijs", type: "number" },
    { name: "notes", label: "Notities", type: "textarea" },
  ];

  return (
    <ResourceManager<Activity>
      title="Activiteiten"
      description="Uitjes, tours en andere activiteiten."
      addButtonLabel="Activiteit toevoegen"
      emptyMessage="Nog geen activiteiten toegevoegd."
      initialItems={result.data ?? []}
      initialError={result.error}
      fields={fields}
      columns={columns}
      actions={{
        create: createActivity,
        update: updateActivity,
        remove: deleteActivity,
      }}
    />
  );
}
