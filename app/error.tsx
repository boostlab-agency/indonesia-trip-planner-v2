"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Er ging iets mis</h1>
        <p className="mt-2 text-sm text-slate-600">
          Er is een onverwachte fout opgetreden. Je gegevens zijn niet verloren gegaan; probeer
          het opnieuw.
        </p>
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error.message || "Onbekende fout"}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={reset}>Opnieuw proberen</Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            Naar dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
