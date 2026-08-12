import { ResourceManager } from "@/components/crud/ResourceManager";
import { createLink, deleteLink, listLinks, updateLink } from "@/lib/actions/links";
import { listDestinations } from "@/lib/actions/destinations";
import type { LinkItem } from "@/lib/types";
import type { ColumnConfig, FieldConfig } from "@/components/crud/types";

const columns: ColumnConfig<LinkItem>[] = [
  { key: "title", label: "Titel" },
  { key: "url", label: "URL" },
  { key: "category", label: "Categorie" },
];

export default async function LinksPage() {
  const [result, destinationsResult] = await Promise.all([listLinks(), listDestinations()]);

  const fields: FieldConfig<LinkItem>[] = [
    { name: "title", label: "Titel", type: "text", required: true },
    { name: "url", label: "URL", type: "url", required: true },
    {
      name: "destination_id",
      label: "Bestemming (optioneel)",
      type: "select",
      options: (destinationsResult.data ?? []).map((d) => ({ value: d.id, label: d.name })),
    },
    { name: "category", label: "Categorie", type: "text" },
    { name: "notes", label: "Notities", type: "textarea" },
  ];

  return (
    <ResourceManager<LinkItem>
      title="Link-verzameling"
      description="Handige links: boekingen, kaarten, inspiratie."
      addButtonLabel="Link toevoegen"
      emptyMessage="Nog geen links toegevoegd."
      initialItems={result.data ?? []}
      initialError={result.error}
      fields={fields}
      columns={columns}
      actions={{
        create: createLink,
        update: updateLink,
        remove: deleteLink,
      }}
    />
  );
}
