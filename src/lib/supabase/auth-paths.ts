/** Paths that require a signed-in Supabase user. */
export function isAuthRequiredPath(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding")
  );
}

export function isAuthPagePath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/signup";
}
