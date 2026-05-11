import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requireSupabasePublicEnv } from "./env";

export async function createServerSupabase() {
  const { url, publicApiKey } = requireSupabasePublicEnv();
  const cookieStore = await cookies();
  return createServerClient(url, publicApiKey, {
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
          /* set from Server Component — refreshed via middleware */
        }
      },
    },
  });
}
