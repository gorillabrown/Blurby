"use strict";
// NARRATE-REBUILD-1 P6b — the epic's checkers run under the app's own Electron (ELECTRON_RUN_AS_NODE), never plain Node:
// book words come from Intl.Segmenter, whose ICU differs by runtime (Meditations is 80,493 words under Electron 41's
// ICU 77.1, as the app numbers them, and 80,426 under plain Node 24's ICU 78.2). Refusal exits 3.
const fs = require("fs");
const path = require("path");
const APP_ELECTRON = require("electron"); // the repo's resolved binary (node_modules/electron/path.txt)
const HOW = "run it as: pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 <script> [args]";

/** Why this process is not the app's Electron running as Node, or null when it is. */
function checkAppIcu({ versions = process.versions, execPath = process.execPath, electronPath = APP_ELECTRON } = {}) {
  if (!versions.electron) return `plain Node ${versions.node} (ICU ${versions.icu}) numbers book words differently from the app; ${HOW}`;
  const real = (p) => { try { return fs.realpathSync.native(p).toLowerCase(); } catch { return path.resolve(p).toLowerCase(); } };
  if (real(execPath) !== real(electronPath)) return `Electron ${versions.electron} at ${execPath} is not the app's binary ${electronPath}; ${HOW}`;
  return null;
}

function assertAppIcu() {
  const why = checkAppIcu();
  if (why) { process.stderr.write(`refused: ${why}\n`); process.exit(3); }
}

module.exports = { checkAppIcu, assertAppIcu, APP_ELECTRON };
