import { z } from "zod";

const urlSchema = z.string().url();
const publicKeySchema = z.string().trim().min(20, "public API key too short");

function resolvePublicApiKey(): string | null {
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (publishable && publicKeySchema.safeParse(publishable).success) {
    return publishable;
  }
  if (anon && publicKeySchema.safeParse(anon).success) {
    return anon;
  }
  return null;
}

export interface SupabasePublicEnv {
  url: string;
  /** New `sb_publishable_*` key preferred; legacy anon JWT works the same for `createClient`. */
  publicApiKey: string;
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const urlParsed = urlRaw ? urlSchema.safeParse(urlRaw) : null;
  const publicApiKey = resolvePublicApiKey();
  if (!urlParsed?.success || !publicApiKey) return null;
  return { url: urlParsed.data, publicApiKey };
}

export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or a public API key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (recommended) or NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy).",
    );
  }
  return env;
}
