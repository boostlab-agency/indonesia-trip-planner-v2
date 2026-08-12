import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Pagina niet gevonden</h1>
        <p className="mt-2 text-sm text-slate-600">
          Deze pagina bestaat niet (meer). Ga terug naar het dashboard.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Naar dashboard
        </Link>
      </div>
    </div>
  );
}
