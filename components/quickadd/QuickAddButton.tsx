"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { QuickAddSheet } from "./QuickAddSheet";

export function QuickAddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Toevoegen"
        className="fixed bottom-20 left-1/2 z-[55] flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg ring-4 ring-white transition-transform hover:scale-105 sm:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 sm:flex"
      >
        <Plus className="h-4 w-4" />
        Toevoegen
      </button>
      {open && <QuickAddSheet onClose={() => setOpen(false)} />}
    </>
  );
}
