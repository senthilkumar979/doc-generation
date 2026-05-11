import { readdir, readFile } from "node:fs/promises";

import type { ReleaseDocument, ReleaseEntry } from "./types";
import { parseSlugFromReleaseFilename } from "./filename";
import { getReleaseFilePath, getReleasesDir } from "./paths";
import { compareSemverDesc } from "./sortSemverDesc";
import { extractTitleFromMarkdown } from "./title";

export async function listReleaseEntries(cwd?: string): Promise<ReleaseEntry[]> {
  const dir = getReleasesDir(cwd);
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }
  const slugs = names
    .map((n) => parseSlugFromReleaseFilename(n))
    .filter((s): s is string => s !== null);
  slugs.sort(compareSemverDesc);
  const entries: ReleaseEntry[] = [];
  for (const slug of slugs) {
    const bodyMarkdown = await readFile(getReleaseFilePath(slug, cwd), "utf8");
    entries.push({ slug, title: extractTitleFromMarkdown(bodyMarkdown) });
  }
  return entries;
}

export async function readReleaseDocument(
  slug: string,
  cwd?: string,
): Promise<ReleaseDocument | null> {
  const filePath = getReleaseFilePath(slug, cwd);
  let bodyMarkdown: string;
  try {
    bodyMarkdown = await readFile(filePath, "utf8");
  } catch {
    return null;
  }
  return {
    slug,
    title: extractTitleFromMarkdown(bodyMarkdown),
    bodyMarkdown,
  };
}
