// FOLIATE-DISPLAY-LIFETIME-1 RodneySr job, route 4: the owned91 All/Archive grid/list/open/return/reopen route, AUTHORED
// from the spec ("actual owned91 All/Archive grid/list/open/return/reopen (initial fields preserved; existing 90/91
// archived=true exit policy distinguished)") and the LIBRARY-COMPLETION-VISIBILITY-1 staging memo's steps. Fixed delays,
// no retry. Records what each step shows; asserts nothing itself. node owned91.mjs <port> <outDir>
import fs from "node:fs";
import path from "node:path";
import { page, sleep } from "./cdp.mjs";
const [port, outDir] = process.argv.slice(2);
const p = await page(port);
const lib = () => p.ev(`window.electronAPI.getState().then((s) => s.library.filter((d) => d.id.startsWith("owned-")).map((d) => ({ id: d.id, position: d.position, wordCount: d.wordCount, archived: !!d.archived, archivedAt: d.archivedAt ?? null })))`);
const cards = () => p.ev(`[...document.querySelectorAll("[data-doc-id]")].map((e) => e.getAttribute("data-doc-id")).filter((x) => x.startsWith("owned-"))`);
const tab = (name) => p.click(`[...document.querySelectorAll(".library-tab")].find((b) => b.textContent.trim().toLowerCase().startsWith(${JSON.stringify(name)}))`);
const toggle = () => p.ev(`document.querySelector(".view-toggle-btn")?.getAttribute("aria-label") ?? null`);
const tokens = () => p.ev(`(() => { const fv = document.querySelector("foliate-view"); const t = new Set();
  for (const c of fv?.renderer?.getContents?.() || []) for (const m of (c.doc?.body?.textContent || "").matchAll(/ownedword\\d+/g)) t.add(m[0]); return t.size; })()`);
const inLibrary = () => p.ev(`!!document.querySelector(".library-container")`);
const out = { steps: [] };
const step = (name, data) => { out.steps.push({ t: new Date().toISOString(), name, data }); console.log(name, JSON.stringify(data)); };
for (let i = 0; i < 60 && !(await inLibrary()); i++) await sleep(500);
await sleep(2000);
step("initial-fields", await lib());
step("initial-toggle", await toggle());
// The toggle's label names the view it switches TO; the seed's viewMode is "list".
if ((await toggle()) === "Grid view") { await p.click(`document.querySelector(".view-toggle-btn")`); await sleep(1000); }
step("grid-toggle", await toggle());
await tab("all"); await sleep(800); step("grid-all", await cards()); await p.shot(path.join(outDir, "owned91-grid-all.png"));
await tab("archived"); await sleep(800); step("grid-archive", await cards()); await p.shot(path.join(outDir, "owned91-grid-archive.png"));
await p.click(`document.querySelector(".view-toggle-btn")`); await sleep(1000);
step("list-toggle", await toggle());
step("list-archive", await cards()); await p.shot(path.join(outDir, "owned91-list-archive.png"));
await tab("all"); await sleep(800); step("list-all", await cards());
// Open the complete card where it is shown: All first, else Archive.
let where = "all";
if (!(await cards()).includes("owned-complete")) { await tab("archived"); await sleep(800); where = "archived"; }
step("open", { where, clicked: await p.click(`document.querySelector('[data-doc-id="owned-complete"]')`) });
await sleep(12000); step("open-tokens", await tokens()); await p.shot(path.join(outDir, "owned91-open.png"));
await p.key("Escape", 27); await sleep(4000);
step("return", { library: await inLibrary() });
await tab("archived"); await sleep(800); const arch = await cards();
step("after-return-archive", { cards: arch, completeCount: arch.filter((x) => x === "owned-complete").length });
await tab("all"); await sleep(800); step("after-return-all", await cards());
const reopenTab = arch.includes("owned-complete") ? "archived" : "all"; await tab(reopenTab); await sleep(800);
step("reopen", { where: reopenTab, clicked: await p.click(`document.querySelector('[data-doc-id="owned-complete"]')`) });
await sleep(12000); step("reopen-tokens", await tokens()); await p.shot(path.join(outDir, "owned91-reopen.png"));
await p.key("Escape", 27); await sleep(4000);
step("exit-library", await inLibrary());
step("exit-fields", await lib());
fs.writeFileSync(path.join(outDir, "owned91.json"), JSON.stringify(out, null, 2));
p.ws.close();
