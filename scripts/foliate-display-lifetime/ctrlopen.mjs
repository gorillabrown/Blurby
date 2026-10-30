// LIBRARY-COMPLETION-VISIBILITY-1 base defect control: the complete card is absent, so open the visible owned-control
// card (same owned91 EPUB) and read the body through renderer.getContents. node ctrlopen.mjs <port> <outDir>
import fs from "node:fs";
import path from "node:path";
import { page, sleep } from "./cdp.mjs";
const [port, outDir] = process.argv.slice(2);
const p = await page(port);
for (let i = 0; i < 60 && !(await p.ev(`!!document.querySelector(".library-container")`)); i++) await sleep(500);
await sleep(2000);
const out = { allCards: await p.ev(`[...document.querySelectorAll("[data-doc-id]")].map((e) => e.getAttribute("data-doc-id"))`) };
out.clicked = await p.click(`document.querySelector('[data-doc-id="owned-control"]')`);
await sleep(12000);
out.tokens = await p.ev(`(() => { const fv = document.querySelector("foliate-view"); const t = new Set();
  for (const c of fv?.renderer?.getContents?.() || []) for (const m of (c.doc?.body?.textContent || "").matchAll(/ownedword\\d+/g)) t.add(m[0]); return t.size; })()`);
out.probe = await p.ev(`(() => { const fvs = [...document.querySelectorAll("foliate-view")]; return fvs.map((fv) => ({ connected: fv.isConnected, contents: (fv.renderer?.getContents?.() || []).length, text: (fv.renderer?.getContents?.() || []).map((c) => (c.doc?.body?.textContent || "").length) })); })()`);
await sleep(8000);
out.tokensAt20s = await p.ev(`(() => { const t = new Set(); for (const fv of document.querySelectorAll("foliate-view")) for (const c of fv.renderer?.getContents?.() || []) for (const m of (c.doc?.body?.textContent || "").matchAll(/ownedword\\d+/g)) t.add(m[0]); return t.size; })()`);
await p.shot(path.join(outDir, "control-reader.png"));
await p.key("Escape", 27); await sleep(4000);
console.log(JSON.stringify(out)); fs.writeFileSync(path.join(outDir, "ctrlopen.json"), JSON.stringify(out, null, 2));
p.ws.close();
