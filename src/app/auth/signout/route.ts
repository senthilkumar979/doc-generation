import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireSupabasePublicEnv } from "@/lib/supabase/env";

export async function POST(request: Request) {
  const { url, publicApiKey } = requireSupabasePublicEnv();
  const cookieStore = await cookies();
  const supabase = createServerClient(url, publicApiKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url));
}
