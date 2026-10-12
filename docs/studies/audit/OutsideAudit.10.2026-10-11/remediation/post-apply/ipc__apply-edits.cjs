// Applies the NARRATE-REMOVE-1 Edit-sites text for main/migrations.js and main/ipc/state.js
// to the scratch roots. Every anchor must match exactly once.
"use strict";
const fs = require("fs");
const path = require("path");

function replaceOnce(file, oldText, newText) {
  const src = fs.readFileSync(file, "utf8");
  const n = src.split(oldText).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor matched ${n} times: ${JSON.stringify(oldText.slice(0, 60))}`);
  fs.writeFileSync(file, src.replace(oldText, () => newText));
}

const root = __dirname;

// --- main/migrations.js (modeled on ROADMAP Edit sites, Wave B, and D12) ---
function editMigrations(file) {
  replaceOnce(file, "const CURRENT_SETTINGS_SCHEMA = 12;", "const CURRENT_SETTINGS_SCHEMA = 13;");
  replaceOnce(
    file,
    "/** Count words without creating intermediate arrays. */",
    [
      "/** Map a saved narrate reading mode to flow; return true only when something changed. */",
      "function normalizeReaderModes(data) {",
      "  let changed = false;",
      "  for (const key of [\"readingMode\", \"lastReadingMode\"]) {",
      "    if (data[key] === \"narrate\") {",
      "      data[key] = \"flow\";",
      "      changed = true;",
      "    }",
      "  }",
      "  return changed;",
      "}",
      "",
      "/** Count words without creating intermediate arrays. */",
    ].join("\n"),
  );
  replaceOnce(
    file,
    "    data.schemaVersion = 12;\n    return data;\n  },\n];\n",
    "    data.schemaVersion = 12;\n    return data;\n  },\n" +
      "  // v12 → v13: Narrate removed (NARRATE-REMOVE-1) — a saved narrate mode becomes flow\n" +
      "  (data) => { normalizeReaderModes(data); data.schemaVersion = 13; return data; },\n];\n",
  );
  replaceOnce(
    file,
    "module.exports = {\n",
    "function loadSettingsData(raw) { const s = runMigrations(raw, settingsMigrations, CURRENT_SETTINGS_SCHEMA); normalizeReaderModes(s); return s; }\n\n" +
      "module.exports = {\n  normalizeReaderModes,\n  loadSettingsData,\n",
  );
}

// --- main/ipc/state.js: the spec's two-line edit ---
const REQUIRE_ANCHOR = 'const fsPromises = require("fs/promises");';
const REQUIRE_LINE = 'const { normalizeReaderModes } = require("../migrations");';
const ASSIGN_ANCHOR = "    Object.assign(settings, newSettings);";
const NORMALIZE_LINE = "    normalizeReaderModes(settings); // D12: the settings IPC is an ingress (NARRATE-REBUILD-1 revisits)";

function editState(file, variant) {
  replaceOnce(file, REQUIRE_ANCHOR, `${REQUIRE_ANCHOR}\n${REQUIRE_LINE}`);
  if (variant === "edited") {
    replaceOnce(file, ASSIGN_ANCHOR, `${ASSIGN_ANCHOR}\n${NORMALIZE_LINE}`);
  } else if (variant === "omit") {
    // Omission control: the normalize call removed, the require kept.
  } else if (variant === "mut-in-timer") {
    // Mutation: normalize moved inside the debounce, before the save.
    replaceOnce(file, "      ctx.saveSettings();\n\n      // Enqueue update-settings for sync", "      normalizeReaderModes(settings);\n      ctx.saveSettings();\n\n      // Enqueue update-settings for sync");
  } else {
    throw new Error(`unknown variant ${variant}`);
  }
}

for (const variant of ["edited", "omit", "mut-in-timer"]) {
  editMigrations(path.join(root, variant, "main", "migrations.js"));
  editState(path.join(root, variant, "main", "ipc", "state.js"), variant);
}

// Self-check of the modeled helper (Done-when 7 (d) shape) and the v13 migration.
const m = require(path.join(root, "edited", "main", "migrations.js"));
const a = { readingMode: "narrate", lastReadingMode: "narrate", ttsEngine: "kokoro" };
if (m.normalizeReaderModes(a) !== true || a.readingMode !== "flow" || a.lastReadingMode !== "flow" || a.ttsEngine !== "kokoro") throw new Error("normalize self-check failed");
if (m.normalizeReaderModes({ readingMode: "page", lastReadingMode: "focus" }) !== false) throw new Error("normalize no-op self-check failed");
const l = m.loadSettingsData({ schemaVersion: 13, readingMode: "narrate", lastReadingMode: "narrate", wpm: 300 });
if (JSON.stringify(l) !== JSON.stringify({ schemaVersion: 13, readingMode: "flow", lastReadingMode: "flow", wpm: 300 })) throw new Error("loadSettingsData self-check failed: " + JSON.stringify(l));
console.log("edits applied; helper self-checks passed");
