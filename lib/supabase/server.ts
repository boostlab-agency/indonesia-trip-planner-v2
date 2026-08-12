import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/env";

// Server client voor gebruik in Server Components en Server Actions.
// Leest/schrijft de auth-sessie via cookies (Next.js 15: cookies() is async).
export async function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll wordt soms aangeroepen vanuit een Server Component (niet een
          // Server Action/Route Handler), waar cookies niet geschreven mogen
          // worden. Dat mag genegeerd worden zolang de middleware de sessie
          // ververst.
        }
      },
    },
  });
}
