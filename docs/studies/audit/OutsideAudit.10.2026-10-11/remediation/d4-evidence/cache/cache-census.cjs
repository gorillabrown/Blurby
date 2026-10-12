// OutsideAudit.10 D4 evidence: read-only census of the Blurby TTS cache.
// Usage: node cache-census.cjs [cacheRoot]   (default %APPDATA%\Blurby\tts-cache)
// Prints COUNTS ONLY as JSON: no text, paths, hashes or audio. Opens files read-only;
// never writes, renames or deletes anything under cacheRoot.
// Sidecar naming and fields follow main/tts-cache.js: chunk-<startIdx>.opus audio,
// chunk-<startIdx>.timing.json sidecar (TTS_TIMING_SIDECAR_EXTENSION) carrying
// schemaVersion, timingTruth, timingClassification and, when trusted, wordTimestamps.
"use strict";

const fs = require("fs/promises");
const path = require("path");

const SIDECAR_EXT = ".timing.json";

function bump(map, key) {
  const k = key === undefined ? "(absent)" : key === null ? "(null)" : String(key);
  map[k] = (map[k] || 0) + 1;
}

function sorted(map) {
  return Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
}

async function walk(dir, onFile) {
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(p, onFile);
    else if (ent.isFile()) await onFile(p, ent.name);
  }
}

async function census(root) {
  const c = {
    opusFiles: { total: 0, v2: 0, legacy: 0 },
    timingSidecars: {
      total: 0,
      unparseable: 0,
      bySchemaVersion: {},
      byTimingClassification: {},
      byTimingTruth: {},
      byTruthAndClassification: {},
      withNonEmptyWordTimestamps: 0,
    },
    otherFiles: { manifestTmp: 0, other: 0 },
    manifest: null,
  };
  const v2Root = path.join(root, "v2") + path.sep;

  await walk(root, async (p, name) => {
    if (name.endsWith(SIDECAR_EXT)) {
      const s = c.timingSidecars;
      s.total++;
      let j;
      try {
        j = JSON.parse(await fs.readFile(p, "utf-8"));
      } catch {
        s.unparseable++;
        return;
      }
      bump(s.bySchemaVersion, j.schemaVersion);
      bump(s.byTimingClassification, j.timingClassification);
      bump(s.byTimingTruth, j.timingTruth);
      bump(s.byTruthAndClassification, `${j.timingTruth}|${j.timingClassification}`);
      if (Array.isArray(j.wordTimestamps) && j.wordTimestamps.length > 0) s.withNonEmptyWordTimestamps++;
    } else if (name.endsWith(".opus")) {
      c.opusFiles.total++;
      c.opusFiles[p.startsWith(v2Root) ? "v2" : "legacy"]++;
    } else if (name === "manifest.json" && path.dirname(p) === root) {
      const m = JSON.parse(await fs.readFile(p, "utf-8"));
      const books = Object.values(m.books || {});
      c.manifest = {
        schemaVersion: m.schemaVersion ?? null,
        bookEntries: books.length,
        bookEntriesBySchemaVersion: {},
        chunkEntries: books.reduce((n, b) => n + Object.keys(b.chunks || {}).length, 0),
        contentIndexEntries: Object.keys(m.contentIndex || {}).length,
      };
      for (const b of books) bump(c.manifest.bookEntriesBySchemaVersion, b.schemaVersion ?? 1);
      c.manifest.bookEntriesBySchemaVersion = sorted(c.manifest.bookEntriesBySchemaVersion);
    } else if (/^manifest\.json\..*\.tmp$/.test(name)) {
      c.otherFiles.manifestTmp++;
    } else {
      c.otherFiles.other++;
    }
  });

  const s = c.timingSidecars;
  for (const k of ["bySchemaVersion", "byTimingClassification", "byTimingTruth", "byTruthAndClassification"]) s[k] = sorted(s[k]);
  return c;
}

async function main() {
  const root = path.resolve(process.argv[2] || path.join(process.env.APPDATA || "", "Blurby", "tts-cache"));
  const counts = await census(root);
  const now = new Date();
  const out = {
    censusDate: now.toLocaleDateString("en-CA"), // local YYYY-MM-DD
    censusAtUtc: now.toISOString(),
    source: "owner TTS cache (%APPDATA%\\Blurby\\tts-cache), read-only",
    script: "cache-census.cjs",
    ...counts,
  };
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
}

main().catch((err) => {
  console.error("cache-census failed:", err.message);
  process.exit(1);
});
