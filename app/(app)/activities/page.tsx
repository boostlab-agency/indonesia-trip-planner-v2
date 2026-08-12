import { ResourceManager } from "@/components/crud/ResourceManager";
import {
  createActivity,
  deleteActivity,
  listActivities,
  updateActivity,
} from "@/lib/actions/activities";
import type { Activity } from "@/lib/types";
import type { ColumnConfig, FieldConfig } from "@/components/crud/types";

const fields: FieldConfig<Activity>[] = [
  { name: "name", label: "Naam", type: "text", required: true },
  { name: "activity_date", label: "Datum", type: "date" },
  { name: "activity_time", label: "Tijd", type: "time" },
  { name: "location", label: "Locatie", type: "text" },
  { name: "price", label: "Prijs", type: "number" },
  { name: "notes", label: "Notities", type: "textarea" },
];

const columns: ColumnConfig<Activity>[] = [
  { key: "name", label: "Naam" },
  { key: "activity_date", label: "Datum" },
  { key: "activity_time", label: "Tijd" },
  { key: "location", label: "Locatie" },
];

export default async function ActivitiesPage() {
  const result = await listActivities();

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
