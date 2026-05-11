/** Uses the first line only when it is markdown H1; otherwise a generic label. */
export function extractTitleFromMarkdown(markdown: string): string {
  const lines = markdown.trimStart().split(/\r?\n/u);
  const firstLine = lines[0]!;
  if (!/^#\s+/u.test(firstLine)) return "Release";
  const stripped = firstLine.replace(/^#\s+/u, "").trim();
  return stripped.length > 0 ? stripped : "Release";
}
