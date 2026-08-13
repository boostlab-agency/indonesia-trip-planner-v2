"use client";

import { useRef, useState } from "react";
import { WizardShell } from "./WizardShell";
import { FieldInput } from "@/components/crud/FieldInput";
import type { LocationFieldHandle } from "@/components/crud/LocationField";
import { Input } from "@/components/ui/Input";
import { createDestination, listDestinations } from "@/lib/actions/destinations";
import { createPhoto, setCoverPhoto } from "@/lib/actions/photos";
import { createClient } from "@/lib/supabase/client";
import { getPhotoPublicUrl } from "@/lib/storage";
import type { FieldConfig } from "@/components/crud/types";
import type { Destination } from "@/lib/types";

const LOCATION_FIELD: FieldConfig<Destination> = {
  name: "location",
  label: "Locatie",
  type: "location",
  required: true,
  placeholder: "bv. Bali, of plak een Google Maps-link",
  locationTarget: { latField: "lat", lngField: "lng" },
};

type Step = "location" | "start_date" | "end_date" | "cover";
const STEPS: Step[] = ["location", "start_date", "end_date", "cover"];

interface DestinationWizardProps {
  onClose: () => void;
  onCreated: (destination: Destination) => void;
}

export function DestinationWizard({ onClose, onCreated }: DestinationWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [locationText, setLocationText] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locationRef = useRef<LocationFieldHandle | null>(null);

  const step = STEPS[stepIndex];

  function goBack() {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function handleNext() {
    setError(null);

    if (step === "location") {
      setIsSubmitting(true);
      const resolved = await locationRef.current?.resolve();
      setIsSubmitting(false);

      if (resolved && "error" in resolved) {
        setError(resolved.error);
        return;
      }
      if (!resolved) {
        setError("Vul een locatie in.");
        return;
      }
      setLocationText(resolved.text);
      setCoords({ lat: resolved.lat, lng: resolved.lng });
      setStepIndex((i) => i + 1);
      return;
    }

    if (step === "cover") {
      await finish();
      return;
    }

    setStepIndex((i) => i + 1);
  }

  function handleSkip() {
    setError(null);
    if (step === "cover") {
      finish();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  async function finish() {
    setIsSubmitting(true);
    setError(null);

    const existing = await listDestinations();
    const maxOrder = (existing.data ?? []).reduce((max, d) => Math.max(max, d.sort_order), -1);
    const name = locationText.split(",")[0].trim() || locationText;

    const result = await createDestination({
      name,
      location: locationText,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      start_date: startDate || null,
      end_date: endDate || null,
      sort_order: maxOrder + 1,
    });

    if (result.error !== null) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    let destination = result.data;

    if (coverFile) {
      try {
        const supabase = createClient();
        const safeName = coverFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const path = `${destination.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("trip-photos")
          .upload(path, coverFile, { cacheControl: "3600", upsert: false });

        if (!uploadError) {
          const publicUrl = getPhotoPublicUrl(path);
          const photoResult = await createPhoto({ destination_id: destination.id, storage_path: path });
          if (photoResult.error === null) {
            await setCoverPhoto(destination.id, publicUrl);
            destination = { ...destination, cover_photo_url: publicUrl };
          }
        }
        // Foto-upload mislukt? De bestemming zelf is al opgeslagen -- niet
        // blokkeren, de foto kan later via de bestemming-hub toegevoegd worden.
      } catch {
        // zelfde: stil negeren
      }
    }

    setIsSubmitting(false);
    onCreated(destination);
  }

  return (
    <WizardShell
      title="Nieuwe bestemming"
      stepIndex={stepIndex}
      totalSteps={STEPS.length}
      question={
        step === "location"
          ? "Waar ga je heen?"
          : step === "start_date"
            ? "Aankomstdatum"
            : step === "end_date"
              ? "Vertrekdatum"
              : "Omslagfoto"
      }
      description={
        step === "location"
          ? "Typ een plaatsnaam of plak een Google Maps-link."
          : step === "cover"
            ? "Kies een foto die deze bestemming vertegenwoordigt (optioneel)."
            : undefined
      }
      onBack={goBack}
      onNext={handleNext}
      onCancel={onClose}
      onSkip={step === "start_date" || step === "end_date" || step === "cover" ? handleSkip : undefined}
      isFirstStep={stepIndex === 0}
      isLastStep={step === "cover"}
      isSubmitting={isSubmitting}
      error={error}
    >
      {step === "location" && (
        <FieldInput
          field={LOCATION_FIELD}
          value={locationText}
          onChange={setLocationText}
          locationRef={(el) => {
            locationRef.current = el;
          }}
          hideLabel
        />
      )}
      {step === "start_date" && (
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} autoFocus />
      )}
      {step === "end_date" && (
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} autoFocus />
      )}
      {step === "cover" && (
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
          />
          {coverFile && <p className="text-xs text-slate-500">Gekozen: {coverFile.name}</p>}
        </div>
      )}
    </WizardShell>
  );
}
