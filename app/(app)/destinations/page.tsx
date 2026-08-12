import { ResourceManager } from "@/components/crud/ResourceManager";
import {
  createDestination,
  deleteDestination,
  listDestinations,
  updateDestination,
} from "@/lib/actions/destinations";
import type { Destination } from "@/lib/types";
import type { ColumnConfig, FieldConfig } from "@/components/crud/types";

const fields: FieldConfig<Destination>[] = [
  { name: "name", label: "Naam", type: "text", required: true },
  { name: "sort_order", label: "Volgorde in route", type: "number", required: true, placeholder: "1" },
  { name: "location", label: "Locatie", type: "text" },
  { name: "lat", label: "Breedtegraad (lat)", type: "number", placeholder: "-7.797068" },
  { name: "lng", label: "Lengtegraad (lng)", type: "number", placeholder: "110.370529" },
  { name: "start_date", label: "Startdatum", type: "date" },
  { name: "end_date", label: "Einddatum", type: "date" },
  { name: "description", label: "Beschrijving", type: "textarea" },
  { name: "notes", label: "Notities", type: "textarea" },
];

const columns: ColumnConfig<Destination>[] = [
  { key: "sort_order", label: "#" },
  { key: "name", label: "Naam" },
  { key: "location", label: "Locatie" },
  { key: "start_date", label: "Start" },
  { key: "end_date", label: "Eind" },
];

export default async function DestinationsPage() {
  const result = await listDestinations();

  return (
    <ResourceManager<Destination>
      title="Bestemmingen beheren"
      description="Voeg bestemmingen toe en stel de volgorde en coördinaten in voor de route en kaart. Bekijk de reis zelf op de Route-pagina."
      addButtonLabel="Bestemming toevoegen"
      emptyMessage="Nog geen bestemmingen toegevoegd."
      initialItems={result.data ?? []}
      initialError={result.error}
      fields={fields}
      columns={columns}
      actions={{
        create: createDestination,
        update: updateDestination,
        remove: deleteDestination,
      }}
    />
  );
}
