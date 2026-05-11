import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { listReleaseEntries, readReleaseDocument } from "./io";

const tmpBase = path.join(process.cwd(), "tmp-test-releases");

afterEach(async () => {
  vi.unstubAllGlobals();
  await rm(tmpBase, { recursive: true, force: true });
});

describe("listReleaseEntries", () => {
  it("returns empty when directory missing", async () => {
    const cwd = path.join(tmpBase, "empty");
    expect(await listReleaseEntries(cwd)).toEqual([]);
  });

  it("lists and sorts release files", async () => {
    const cwd = path.join(tmpBase, "proj");
    const rel = path.join(cwd, "notes", "releases");
    await mkdir(rel, { recursive: true });
    await writeFile(
      path.join(rel, "v0.0.1.md"),
      "# Patch\n\n- Fix a\n",
      "utf8",
    );
    await writeFile(
      path.join(rel, "v0.1.0.md"),
      "# Minor\n\n- Feature b\n",
      "utf8",
    );
    const entries = await listReleaseEntries(cwd);
    expect(entries.map((e) => e.slug)).toEqual(["0.1.0", "0.0.1"]);
  });
});

describe("readReleaseDocument", () => {
  it("returns null when file missing", async () => {
    expect(await readReleaseDocument("9.9.9", tmpBase)).toBeNull();
  });

  it("reads markdown body", async () => {
    const cwd = path.join(tmpBase, "r2");
    const rel = path.join(cwd, "notes", "releases");
    await mkdir(rel, { recursive: true });
    await writeFile(path.join(rel, "v0.0.0.md"), "# T\n\nHello", "utf8");
    const doc = await readReleaseDocument("0.0.0", cwd);
    expect(doc?.title).toBe("T");
    expect(doc?.bodyMarkdown).toContain("Hello");
  });
});
