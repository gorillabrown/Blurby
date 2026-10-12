// Write one runner per shell that executes each gate command verbatim (stdout, stderr and exit code to files).
// usage: node mkrunner.cjs <gates.json> <cwdWin> <cwdPosix> <resDirWin> <resDirPosix> <outPrefix>
const fs = require("fs");
const [gatesFile, cwdW, cwdP, resW, resP, prefix, enc] = process.argv.slice(2);
const gates = JSON.parse(fs.readFileSync(gatesFile, "utf8"));
const ps = [`$ErrorActionPreference = 'Continue'`, `Set-Location -LiteralPath '${cwdW}'`];
if (enc === "utf8") ps.push("[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)");
const sh = [`cd '${cwdP}' || exit 99`];
for (const g of gates) {
  const f = (d, x) => `${d}${d.includes("\\") ? "\\" : "/"}${g.id}.${x}`;
  ps.push(`${g.cmd} 1>'${f(resW, "out")}' 2>'${f(resW, "err")}'`, `Set-Content -LiteralPath '${f(resW, "exit")}' -Value $LASTEXITCODE -Encoding ASCII`);
  sh.push(`${g.cmd} >'${f(resP, "out")}' 2>'${f(resP, "err")}'; echo $? >'${f(resP, "exit")}'`);
}
fs.writeFileSync(`${prefix}.ps1`, "﻿" + ps.join("\r\n") + "\r\n");
fs.writeFileSync(`${prefix}.sh`, sh.join("\n") + "\n");
