/** Detects Next.js `redirect()` thrown from a Server Action (do not treat as failure). */
export function isNextRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if (!("digest" in error)) return false;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}
