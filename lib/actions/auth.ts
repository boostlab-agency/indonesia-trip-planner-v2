"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ConfigError } from "@/lib/env";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Eén gedeeld wachtwoord voor de hele app. Onder water blijft dit een echte
// Supabase Auth-sessie (voor een vast, verborgen account) zodat alle
// bestaande RLS-policies en de directe browser-upload van foto's ongewijzigd
// blijven werken -- de gebruiker ziet alleen ooit een wachtwoordveld, nooit
// een e-mailadres.
export async function signInWithSharedPassword(
  password: string
): Promise<{ error: string | null }> {
  const email = process.env.APP_LOGIN_EMAIL;
  const expectedPassword = process.env.APP_LOGIN_PASSWORD;

  if (!email || !expectedPassword) {
    return {
      error:
        "Inloggen is niet geconfigureerd. Zet APP_LOGIN_EMAIL en APP_LOGIN_PASSWORD in de environment variables.",
    };
  }

  if (password !== expectedPassword) {
    return { error: "Wachtwoord is onjuist." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return {
        error:
          "Inloggen is mislukt. Controleer of APP_LOGIN_EMAIL/APP_LOGIN_PASSWORD overeenkomen met een bestaand Supabase-account.",
      };
    }
  } catch (err) {
    if (err instanceof ConfigError) return { error: err.message };
    if (err instanceof Error) return { error: err.message };
    return { error: "Er is een onbekende fout opgetreden." };
  }

  // Zorgt dat de middleware/layout de net gezette sessie-cookie direct ziet
  // op de volgende navigatie, i.p.v. pas na een losse revalidatie.
  revalidatePath("/", "layout");
  return { error: null };
}
