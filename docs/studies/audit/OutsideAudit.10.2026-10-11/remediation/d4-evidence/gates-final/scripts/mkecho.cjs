// Build one echo script per shell: every extracted command, with its program name passed to echo.cjs instead of run.
const fs = require("fs");
const [jsonFile, echoWin, echoPosix, outDir] = process.argv.slice(2);
const { rows } = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
const runnable = rows.filter((r) => !r.raw.startsWith("& "));
const id = (r) => String(r.id).padStart(3, "0");
const ps = runnable.map((r) => `node '${echoWin}' ${id(r)} ${r.substituted}`).join("\r\n") + "\r\n";
fs.writeFileSync(`${outDir}/echo.ps1`, "﻿" + ps); // BOM so Windows PowerShell 5.1 reads UTF-8
fs.writeFileSync(`${outDir}/echo.sh`, runnable.map((r) => `node '${echoPosix}' ${id(r)} ${r.substituted}`).join("\n") + "\n");
console.log(`${runnable.length} echo lines (skipped the & call)`);
