"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="nl">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">De applicatie kon niet laden</h1>
          <p className="mt-2 text-sm text-slate-600">
            Er is een onverwachte fout opgetreden. Probeer de pagina opnieuw te laden.
          </p>
          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error.message || "Onbekende fout"}
          </p>
          <button
            onClick={reset}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Opnieuw proberen
          </button>
        </div>
      </body>
    </html>
  );
}
