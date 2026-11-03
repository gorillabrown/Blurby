// FOLIATE-DISPLAY-LIFETIME-1 RodneySr job, route 5: product defaults. Captures, without any input, what a fresh unseeded
// profile shows (onboarding, the built-in sample, effective settings), then runs the supplied session.mjs unchanged.
// node route5.mjs <port> <errorLogPath> <outDir>
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { page, sleep } from "./cdp.mjs";
const [port, errorLog, outDir] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const p = await page(port);
for (let i = 0; i < 60 && !(await p.ev(`!!document.querySelector(".library-container, [role='dialog'], .onboarding")`)); i++) await sleep(500);
await sleep(1500);
const defaults = {
  state: await p.ev(`window.electronAPI.getState().then((s) => ({ settings: s.settings, library: s.library.map((d) => ({ id: d.id, title: d.title, ext: d.ext, source: d.source, wordCount: d.wordCount })) }))`),
  dialogs: await p.ev(`[...document.querySelectorAll("[role='dialog'], [aria-modal='true']")].map((e) => (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 200))`),
  firstCard: await p.ev(`document.querySelector(".doc-card-wrapper .doc-card")?.textContent?.trim().slice(0, 120) ?? null`),
  theme: await p.ev(`document.documentElement.getAttribute("data-theme")`),
  bodyClass: await p.ev(`document.body.className`),
};
await p.shot(path.join(outDir, "defaults-library.png"));
fs.writeFileSync(path.join(outDir, "defaults.json"), JSON.stringify(defaults, null, 2));
console.log("defaults", JSON.stringify(defaults).slice(0, 1500));
p.ws.close();
const r = spawnSync(process.execPath, [path.join(here, "session.mjs"), port, errorLog, path.join(outDir, "session.json")], { stdio: "inherit" });
console.log(`session.mjs exit ${r.status}`);
