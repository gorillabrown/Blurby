// Tabulate a gate list's results per tree across the three shells (no verdict; the result file is compared with the spec by reading).
// usage: node evalsimple.cjs <gates.json> <resPrefix> <outFile> <label...>
const fs = require("fs"); const read = require("./readres.cjs");
const [gatesFile, prefix, outFile, ...labels] = process.argv.slice(2);
const gates = JSON.parse(fs.readFileSync(gatesFile, "utf8")); const shells = ["pwsh7", "ps51", "bash"]; const L = [];
for (const t of labels) for (const g of gates) {
  const r = shells.map((s) => read(`res/${prefix}${t ? t + "-" : ""}${s}`, g.id)); const k = (y) => JSON.stringify([y.exit, y.out, y.err === ""]); // Windows PowerShell 5.1 wraps native stderr text in error records, so stderr is compared as empty or not
  const same = r.every((y) => k(y) === k(r[0]));
  L.push(`${t || "worktree"} ${g.id} ROADMAP:${g.line} ${g.label}: exit=${r[2].exit} stdout=${JSON.stringify(r[2].out)} stderr(bash)=${r[2].err ? JSON.stringify(r[2].err) : "empty"} shells-identical=${same}  [${g.cmd}]`);
}
fs.writeFileSync(outFile, L.join("\n") + "\n"); console.log(L.join("\n"));
