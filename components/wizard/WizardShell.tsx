"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

interface WizardShellProps {
  title: string;
  stepIndex: number;
  totalSteps: number;
  question: string;
  description?: string;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  onSkip?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  error?: string | null;
}

// Generieke, domme full-screen "één vraag per scherm"-shell. Kent niets van
// velden/waarden -- de aanroepende wizard (bv. DestinationWizard) beheert
// zijn eigen stap-state en geeft per stap de content + navigatiehandlers mee.
export function WizardShell({
  title,
  stepIndex,
  totalSteps,
  question,
  description,
  children,
  onBack,
  onNext,
  onCancel,
  onSkip,
  isFirstStep,
  isLastStep,
  isSubmitting = false,
  nextDisabled = false,
  nextLabel,
  error,
}: WizardShellProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Sluiten"
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-slate-500">{title}</span>
      </div>

      <div className="flex gap-1 px-4 pt-3">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? "bg-brand-600" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">{question}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        <div className="mt-6">{children}</div>
      </div>

      <div className="space-y-3 border-t border-slate-100 px-5 py-4">
        <ErrorBanner message={error ?? null} />
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={onBack} disabled={isFirstStep || isSubmitting}>
            Vorige
          </Button>
          <div className="flex items-center gap-2">
            {onSkip && (
              <Button type="button" variant="ghost" onClick={onSkip} disabled={isSubmitting}>
                Overslaan
              </Button>
            )}
            <Button type="button" onClick={onNext} disabled={nextDisabled || isSubmitting}>
              {isSubmitting ? "Bezig..." : nextLabel ?? (isLastStep ? "Klaar" : "Volgende")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
