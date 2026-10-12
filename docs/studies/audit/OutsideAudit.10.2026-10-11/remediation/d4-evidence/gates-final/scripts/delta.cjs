// Inventory delta against the previous replay (its out/commands.json and out/roadmap.sha256.txt as committed at HEAD):
// commands added and removed (by text, longest common subsequence), each added one with the gates that run it.
// usage (from the run dir, after mkchanged.cjs): node delta.cjs <previous commands.json> <previous roadmap.sha256.txt>
const fs = require("fs");
const [prevFile, prevHashFile] = process.argv.slice(2);
const o = JSON.parse(fs.readFileSync(prevFile, "utf8")), n = JSON.parse(fs.readFileSync("out/commands.json", "utf8"));
const gates = JSON.parse(fs.readFileSync("out/changed.gates.json", "utf8"));
const prevSha = (/sha256 at start ([0-9a-f]{64})/.exec(fs.readFileSync(prevHashFile, "utf8")) || [])[1] ?? "unknown";
const a = o.rows.map((r) => r.raw), b = n.rows.map((r) => r.raw);
const T = Array.from({ length: a.length + 1 }, () => new Int32Array(b.length + 1));
for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) T[i][j] = a[i] === b[j] ? T[i + 1][j + 1] + 1 : Math.max(T[i + 1][j], T[i][j + 1]);
const pad = (r) => String(r.id).padStart(3, "0");
const runs = (r) => { const g = gates.filter((x) => x.inv === r.id).map((x) => x.id); return g.length ? ` -- run in three shells by ${g.join(", ")}` : " -- parsed and argv-checked only"; };
const D = []; let i = 0, j = 0;
while (i < a.length || j < b.length) {
  if (i < a.length && j < b.length && a[i] === b[j]) { i++; j++; }
  else if (i < a.length && (j === b.length || T[i + 1][j] >= T[i][j + 1])) { const r = o.rows[i++]; D.push(`- previous ${pad(r)} ROADMAP:${r.line} [${r.zone}] ${r.raw}`); }
  else { const r = n.rows[j++]; D.push(`+ ${pad(r)} ROADMAP:${r.line} [${r.zone}] ${r.raw}${runs(r)}`); }
}
const L = [`previous replay: ROADMAP.md sha256 ${prevSha}, ${o.count} commands (section lines ${o.section.join("-")})`,
  `this replay: ${n.count} commands (section lines ${n.section.join("-")}); ${T[0][0]} unchanged, ${D.filter((x) => x[0] === "+").length} added, ${D.filter((x) => x[0] === "-").length} removed`, ...D];
fs.writeFileSync("out/commands.delta.txt", L.join("\n") + "\n"); console.log(L.join("\n"));
