const fs = require("fs"); const path = require("path");
const lines = fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/);
const writeSrc = lines.slice(54, 60).join("\n");
// 1) payload snapshot timing with a deferred fake
{
  let payload; let release;
  const fsPromises = { writeFile: (p, d) => { payload = d; return new Promise(r => release = r); }, rename: async () => {} };
  const writeJSON = new Function("fsPromises", writeSrc + "; return writeJSON;")(fsPromises);
  const s = { readingMode: "flow" };
  writeJSON("x", s); s.readingMode = "MUTATED-AFTER-CALL";
  console.log("payload serialized at call time:", JSON.parse(payload).readingMode);
  release();
}
// 2) real-fs concurrent writes to the same path (shared .tmp name)
(async () => {
  const fsPromises = require("fs/promises");
  const writeJSON = new Function("fsPromises", writeSrc + "; return writeJSON;")(fsPromises);
  const dir = process.argv[3]; await fsPromises.mkdir(dir, { recursive: true });
  const file = path.join(dir, "settings.json");
  let rejected = 0, ok = 0, codes = {}, corrupt = 0;
  for (let i = 0; i < 200; i++) {
    const big = { i, pad: "x".repeat(20000 + (i % 7) * 1000) };
    const rs = await Promise.allSettled([writeJSON(file, { a: 1, ...big }), writeJSON(file, { b: 2, ...big })]);
    for (const r of rs) { if (r.status === "rejected") { rejected++; codes[r.reason.code] = (codes[r.reason.code] || 0) + 1; } else ok++; }
    try { JSON.parse(await fsPromises.readFile(file, "utf8")); } catch { corrupt++; }
  }
  console.log(JSON.stringify({ ok, rejected, codes, corruptReads: corrupt }));
})();
