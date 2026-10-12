// Compare the UTF-8-console PowerShell reruns of the positive controls with bash byte-for-byte (stdout, stderr, exit).
const fs = require("fs"); const read = require("./readres.cjs");
const g = JSON.parse(fs.readFileSync("out/positive-controls.gates.json", "utf8")); const L = [];
for (const x of g) { const b = JSON.stringify(read("res/pc-bash", x.id)); for (const s of ["pwsh7", "ps51"]) if (JSON.stringify(read("res/pcu-" + s, x.id)) !== b) L.push(`DIFF ${s} ${x.id}`); }
L.push(L.length ? `utf8-console rerun: ${L.length} differences` : `utf8-console rerun: stdout, stderr and exit identical to bash for all ${g.length} gates in pwsh7 and ps51`);
fs.writeFileSync("out/positive-controls.utf8-console-check.txt", L.join("\n") + "\n"); console.log(L.join("\n"));
