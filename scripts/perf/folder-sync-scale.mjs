// scripts/perf/folder-sync-scale.mjs — LARGE-FOLDER-SYNC-1 W1: cost of one per-file add and of removing 1,000 books
// from a 120,000-book library, through the real main/folder-sync.js. Not a test; run with:
//   node scripts/perf/folder-sync-scale.mjs
// The first add builds the path index (the worst figure). The library fakes copy main.js's own addDocToLibrary / removeDocFromLibrary (unshift; filter per id).
import { createRequire } from "module";
import { performance } from "perf_hooks";
import path from "path";

const require = createRequire(import.meta.url);
const { createFolderSync } = require("../../main/folder-sync.js");

const ROOT = "G:\\My Drive\\Personal\\Readings";
const N = 120000;
const RUNS = 50;
const REMOVE_COUNT = 1000;
const PAIRS = 1000;

const doc = (id, p) => ({ id, filepath: p, filename: path.basename(p), ext: ".epub", size: 1, modified: 1, source: "folder", position: 0 });

let lib = [];
for (let i = 0; i < N; i++) lib.push(doc(String(i), `${ROOT}\\Books\\Author ${i % 4000}\\Title ${i}.epub`));
const bigDir = `${ROOT}\\Books\\Big Dir`;
for (let i = 0; i < REMOVE_COUNT; i++) lib.push(doc("big" + i, `${bigDir}\\Item ${i}.epub`));

const disk = new Set([ROOT]);
const sync = createFolderSync({
  getSourceFolder: () => ROOT,
  getLibrary: () => lib,
  setLibrary: (d) => { lib = d; },
  addDoc: (d) => { lib.unshift(d); },
  scanFolderAsync: async () => [],
  statFile: (p) => (disk.has(p) ? Promise.resolve({ isDirectory: () => false, size: 1, mtimeMs: 1 }) : Promise.reject(new Error("ENOENT"))),
  extractNewFileDoc: async (f) => doc("new-" + f.filepath, f.filepath),
  extractContent: async () => "x",
  countWords: () => 1,
  isFailed: () => false,
  saveLibrary: () => {},
  saveLibraryNow: async () => {},
  broadcastLibrary: () => {},
  emitProgress: () => {},
});

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const fmt = (a) => `median ${median(a).toFixed(2)} ms, worst ${Math.max(...a).toFixed(2)} ms`;

// One per-file add: hasBook + findByPath over the whole library, then addDoc.
const addTimes = [];
for (let r = 0; r < RUNS; r++) {
  const p = `${ROOT}\\Books\\Author ${r}\\Brand New ${r}.epub`;
  disk.add(p);
  const t0 = performance.now();
  await sync.applyAdd(p);
  addTimes.push(performance.now() - t0);
  if (lib[0].filepath !== p) throw new Error("add did not land: " + p);
  // steady state: the added books stay, as they would in a running app
  disk.delete(p);
}

// Remove 1,000 books: a directory deleted from disk (removeUnder over the whole library).
const removeTimes = [];
for (let r = 0; r < RUNS; r++) {
  const t0 = performance.now();
  await sync.applyUnlink(bigDir);
  removeTimes.push(performance.now() - t0);
  if (lib.length !== N + RUNS) throw new Error("removal count wrong: " + (lib.length - N - RUNS));
  for (let i = 0; i < REMOVE_COUNT; i++) lib.push(doc("big" + i, `${bigDir}\\Item ${i}.epub`)); // untimed: restore
}

// Alternating pairs (F1): a watcher rename is an unlink then an add. Unlink an existing book, add a new file, 1,000 times.
const pairTimes = [];
const tAll = performance.now();
for (let r = 0; r < PAIRS; r++) {
  const victim = lib[lib.length - 1 - r]; // an existing book,
  const np = path.win32.join(ROOT, "Books", "Moved", `Moved ${r}.epub`);
  disk.add(np);
  const t0 = performance.now();
  await sync.applyUnlink(victim.filepath);
  await sync.applyAdd(np);
  pairTimes.push(performance.now() - t0);
  if (lib[0].filepath !== np) throw new Error("pair add did not land: " + np);
}
const pairTotal = performance.now() - tAll;

console.log(`library ${N} docs, ${RUNS} runs each`);
console.log(`one per-file add:          ${fmt(addTimes)}  (threshold: median > 16 ms)`);
console.log(`remove ${REMOVE_COUNT} books (dir):    ${fmt(removeTimes)}  (threshold: > 2000 ms)`);
console.log(`${PAIRS} unlink+add pairs:  ${fmt(pairTimes)}, total ${(pairTotal / 1000).toFixed(2)} s  (threshold: median > 16 ms or total > 20 s)`);
const over = median(addTimes) > 16 || median(removeTimes) > 2000 || median(pairTimes) > 16 || pairTotal > 20000;
console.log(over ? "OVER THRESHOLD" : "within thresholds");
