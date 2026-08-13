"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  BedDouble,
  Compass,
  Wallet,
  Camera,
  Plane,
  StickyNote,
  X,
  type LucideIcon,
} from "lucide-react";
import { DestinationWizard } from "@/components/wizard/DestinationWizard";
import type { Destination } from "@/lib/types";

interface QuickAddSheetProps {
  onClose: () => void;
}

interface Option {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  comingSoon?: boolean;
}

// "Bestemming" opent de nieuwe wizard-flow; de rest linkt (voor nu) door naar
// de bestaande beheerpagina met een werkend aanmaak-formulier -- niets is
// een dode knop. Eigen wizards voor deze volgen in latere fases.
const OPTIONS: Option[] = [
  { id: "destination", label: "Bestemming", icon: MapPin },
  { id: "accommodation", label: "Accommodatie", icon: BedDouble, href: "/accommodations" },
  { id: "activity", label: "Activiteit", icon: Compass, href: "/activities" },
  { id: "expense", label: "Uitgave", icon: Wallet, href: "/budget" },
  { id: "photo", label: "Foto", icon: Camera, href: "/album" },
  { id: "transport", label: "Vervoer", icon: Plane, href: "/transport" },
  { id: "note", label: "Notitie", icon: StickyNote, comingSoon: true },
];

export function QuickAddSheet({ onClose }: QuickAddSheetProps) {
  const router = useRouter();
  const [activeWizard, setActiveWizard] = useState<string | null>(null);

  function handleSelect(option: Option) {
    if (option.comingSoon) return;
    if (option.id === "destination") {
      setActiveWizard("destination");
      return;
    }
    if (option.href) {
      onClose();
      router.push(option.href);
    }
  }

  if (activeWizard === "destination") {
    return (
      <DestinationWizard
        onClose={() => setActiveWizard(null)}
        onCreated={(destination: Destination) => {
          onClose();
          router.push(`/destinations/${destination.id}`);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Wat wil je toevoegen?</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sluiten"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                disabled={option.comingSoon}
                className={`flex flex-col items-center gap-2 rounded-2xl border border-slate-100 p-4 text-center transition-colors ${
                  option.comingSoon
                    ? "cursor-not-allowed opacity-40"
                    : "hover:border-brand-200 hover:bg-brand-50"
                }`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-slate-700">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
