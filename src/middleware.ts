import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/middleware-session";

export async function middleware(request: NextRequest) {
  const env = getSupabasePublicEnv();
  if (!env) {
    if (
      request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/onboarding")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("config", "missing");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  return updateSession(request, env);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
