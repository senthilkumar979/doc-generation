import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { SupabasePublicEnv } from "./env";
import { getAuthRedirectPath } from "./redirect-for-auth";

export async function updateSession(
  request: NextRequest,
  env: SupabasePublicEnv,
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.publicApiKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = getAuthRedirectPath(request.nextUrl.pathname, Boolean(user));
  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return supabaseResponse;
}
