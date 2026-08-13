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
    console.log(`[auth] signInWithSharedPassword: probeer in te loggen als ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Nooit het wachtwoord zelf loggen -- de rest van de Supabase-foutmelding
      // (bv. "Invalid login credentials", "Email not confirmed") is niet
      // gevoelig en helpt enorm bij het diagnosticeren van een verkeerd
      // geconfigureerd account.
      console.error(
        `[auth] Supabase signInWithPassword faalde voor ${email}: status=${error.status} message=${error.message}`
      );
      return {
        error: `Inloggen bij Supabase mislukt (${email}): ${error.message}. Controleer of dit exact het wachtwoord van dit Supabase-account is (niet alleen van APP_LOGIN_PASSWORD).`,
      };
    }

    console.log(`[auth] Supabase login geslaagd, user id=${data.user?.id}`);
  } catch (err) {
    console.error("[auth] Onverwachte fout tijdens signInWithSharedPassword:", err);
    if (err instanceof ConfigError) return { error: err.message };
    if (err instanceof Error) return { error: err.message };
    return { error: "Er is een onbekende fout opgetreden." };
  }

  // Zorgt dat de middleware/layout de net gezette sessie-cookie direct ziet
  // op de volgende navigatie, i.p.v. pas na een losse revalidatie.
  revalidatePath("/", "layout");
  return { error: null };
}
