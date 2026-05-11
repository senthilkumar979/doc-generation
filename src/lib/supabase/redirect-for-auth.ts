import { isAuthPagePath, isAuthRequiredPath } from "./auth-paths";

/** Returns a relative redirect path, or null when no redirect applies. */
export function getAuthRedirectPath(
  pathname: string,
  hasUser: boolean,
): string | null {
  if (isAuthRequiredPath(pathname) && !hasUser) {
    return `/login?next=${encodeURIComponent(pathname)}`;
  }
  if (isAuthPagePath(pathname) && hasUser) {
    return "/dashboard";
  }
  return null;
}
