"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "E-mailadres of wachtwoord is onjuist."
            : signInError.message
        );
        setIsSubmitting(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een onbekende fout opgetreden.");
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #134536, #18855f 55%, #48c090)" }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-white p-7 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Reisplanner</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Indonesië Reis</h1>
        <p className="mt-1 text-sm text-slate-500">Log in om de reisplanner te bekijken.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              E-mailadres
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Wachtwoord</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Bezig met inloggen..." : "Inloggen"}
          </Button>
        </form>
      </div>
    </div>
  );
}
