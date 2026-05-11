import path from "node:path";

export function getReleasesDir(cwd: string = process.cwd()): string {
  return path.join(cwd, "notes", "releases");
}

export function getReleaseFilePath(slug: string, cwd: string = process.cwd()): string {
  return path.join(getReleasesDir(cwd), `v${slug}.md`);
}
