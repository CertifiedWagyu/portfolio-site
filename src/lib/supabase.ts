import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * The anonymous key is safe to ship in the browser. It only grants what the
 * Row Level Security policies allow, so it can never be used to bypass admin
 * rules. The service-role key MUST never be used in this file.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const CERTIFICATE_BUCKET = "certificate-files";
export const GAME_BUCKET = "game-thumbnails";
export const PROFILE_BUCKET = "profile-photos";

export class SupabaseConfigError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file, then restart the dev server."
    );
    this.name = "SupabaseConfigError";
  }
}

export function requireClient(): SupabaseClient {
  if (!supabase) throw new SupabaseConfigError();
  return supabase;
}
