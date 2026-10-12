"use strict";
// C6b: which overlapping write's snapshot survives? Uses verbatim main.js:55-60.
const fs = require("fs"), path = require("path");
const lines = fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/);
const writeJSON = new Function("fsPromises", lines.slice(54, 60).join("\n") + "\nreturn writeJSON;")(require("fs/promises"));
const target = path.join(process.argv[3], "settings.json");
(async () => {
  const survivors = {};
  for (let round = 0; round < 30; round++) {
    const big = "x".repeat(200000);
    await Promise.allSettled(Array.from({ length: 8 }, (_, i) => writeJSON(target, { round, i, big })));
    const f = JSON.parse(fs.readFileSync(target, "utf8"));
    survivors[f.i] = (survivors[f.i] || 0) + 1;
  }
  console.log("C6b surviving write index (0=first issued, 7=last issued) over 30 rounds:", JSON.stringify(survivors));
  // two-write case, the realistic shape: an older snapshot issued first, newer second
  const t2 = {};
  for (let round = 0; round < 30; round++) {
    const r = await Promise.allSettled([writeJSON(target, { v: "older", big: "y".repeat(200000) }), writeJSON(target, { v: "newer", big: "y".repeat(200000) })]);
    const k = JSON.parse(fs.readFileSync(target, "utf8")).v + ":" + r.map((x) => x.status === "fulfilled" ? "ok" : x.reason.code).join("/");
    t2[k] = (t2[k] || 0) + 1;
  }
  console.log("C6b two overlapping writes (final content:outcomes):", JSON.stringify(t2));
})();
