/** Parses `v0.1.2.md` → `0.1.2`. Requires at least major.minor.patch. */
export function parseSlugFromReleaseFilename(name: string): string | null {
  const match = /^v(\d+\.\d+\.\d+(?:\.\d+)*)\.md$/i.exec(name.trim());
  return match?.[1] ?? null;
}
