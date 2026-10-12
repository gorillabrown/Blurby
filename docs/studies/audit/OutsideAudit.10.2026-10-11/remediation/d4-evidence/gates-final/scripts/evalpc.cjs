// Evaluate step 4 positive controls: each must exit 0, have empty stderr and print the stated number of lines, identically in every shell.
const fs = require("fs"); const read = require("./readres.cjs");
const gates = JSON.parse(fs.readFileSync("out/positive-controls.gates.json", "utf8"));
const shells = ["pwsh7", "ps51", "bash"]; const lines = []; let mism = 0;
for (const g of gates) {
  const r = Object.fromEntries(shells.map((s) => [s, read(`res/pc-${s}`, g.id)]));
  const k = (x) => JSON.stringify([x.exit, x.out.length, x.err]); // verdict fields; byte content is compared by the UTF-8 console rerun
  const same = shells.every((s) => k(r[s]) === k(r.pwsh7));
  const b = r.bash;
  let verdict = "info";
  if (g.expectLines != null) { const ok = b.exit === 0 && b.err === "" && b.out.length === g.expectLines && same; verdict = ok ? "MATCH" : "MISMATCH"; if (!ok) mism++; }
  else if (!same) { verdict = "SHELL-DIFF"; mism++; }
  lines.push(`${g.id} ROADMAP:${g.line} ${g.label}: ${shells.map((s) => `${s} exit=${r[s].exit} lines=${r[s].out.length} stderr=${r[s].err ? JSON.stringify(r[s].err) : "empty"}`).join("; ")}; stated=${g.expectLines ?? "-"}; shells-identical=${same}; ${verdict}`);
  lines.push(`    cmd: ${g.cmd}`);
  if (!same) for (const s of shells) lines.push(`    ${s} stdout: ${JSON.stringify(r[s].out.slice(0, 3))}`);
}
lines.push(`SUMMARY positive controls: ${gates.filter((g) => g.expectLines != null).length} checked, ${mism} mismatches`);
fs.writeFileSync("out/positive-controls.result.txt", lines.join("\n") + "\n"); console.log(lines.join("\n"));
for (const s of shells) { const dump = gates.flatMap((g) => { const x = read(`res/pc-${s}`, g.id); return [`### ${g.id} exit=${x.exit} stderr=${x.err ? JSON.stringify(x.err) : "empty"} lines=${x.out.length}`, ...x.out.map((l) => JSON.stringify(l))]; }); fs.writeFileSync(`out/positive-controls.stdout.${s}.txt`, dump.join("\n") + "\n"); }
