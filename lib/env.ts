export class ConfigError extends Error {}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new ConfigError(
      "Supabase-configuratie ontbreekt. Zet NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in je omgevingsvariabelen (.env.local of Vercel project settings)."
    );
  }

  return { url, anonKey };
}
