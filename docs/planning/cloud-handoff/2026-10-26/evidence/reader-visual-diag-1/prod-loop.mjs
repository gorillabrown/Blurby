// READER-VISUAL-DIAG-1: production-build loop probe (scratch; CDP-injected counters, no source edit).
// node prod-loop.mjs <port> <outJson>
import fs from "node:fs";
import path from "node:path";
const [port, outJson] = process.argv.slice(2);
const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const wrapSrc = fs.readFileSync(path.join(DIR, "ro-wrap.js"), "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = list.find((t) => t.type === "page");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
const click = (js) => ev(`(() => { const el = ${js}; if (!el) return false; el.click(); return true; })()`);
await send("Page.enable");
await send("Page.addScriptToEvaluateOnNewDocument", { source: wrapSrc });
await send("Page.reload", {});
await sleep(9000);
await click(`document.querySelector(".doc-card-wrapper .doc-card")`); await sleep(15000);
await click(`[...document.querySelectorAll("button")].find((x) => x.className.includes("rbb-chapter-name"))`); await sleep(1000);
await click(`[...document.querySelectorAll("li.rbb-chapter-option")].find((x) => x.textContent.trim() === "INTRODUCTION")`); await sleep(8000);
if (process.argv.includes("--via-focus")) { await click(`document.querySelector('[aria-label="Focus mode"]')`); await sleep(10000); }
const before = JSON.parse(await ev("JSON.stringify(window.__rvd)"));
await click(`document.querySelector('[aria-label="Flow mode"]')`);
await sleep(20000);
const geometry = await ev(`(async () => {
  const view = document.querySelector(".rm-flow-view"); const fv = view.querySelector("foliate-view"); const r = fv.renderer;
  const inner = r.shadowRoot ? [...r.shadowRoot.querySelectorAll("div")] : [];
  const all = [...document.querySelectorAll(".rm-focus-view, .rm-flow-view, .rm-focus-root, .rm-flow-root, foliate-view")];
  const snap = () => [view.clientWidth, view.scrollHeight, view.scrollTop, Math.round(fv.getBoundingClientRect().height * 10) / 10, r.getAttribute("max-block-size"), all.map((e) => (e.className || e.tagName).toString().split(" ")[0] + ":" + e.clientWidth + "x" + e.clientHeight).join(";"), inner.map((d) => d.clientWidth + "x" + d.clientHeight).join(",")].join("|");
  const seen = {}; const t0 = performance.now(); let frames = 0; let changes = 0; let last = snap();
  while (performance.now() - t0 < 3000) { await new Promise((res) => requestAnimationFrame(res)); frames++; const s = snap(); seen[s] = (seen[s] || 0) + 1; if (s !== last) changes++; last = s; }
  return JSON.stringify({ legend: "viewClientW|viewScrollH|viewScrollTop|foliateViewH|max-block-size|paginatorDivs", frames, changes, states: seen });
})()`);
const after = JSON.parse(await ev("JSON.stringify(window.__rvd)"));
const liveObservers = JSON.parse(await ev("JSON.stringify(window.__rvdLive())"));
const delta = {};
for (const [site, rec] of Object.entries(after.sites)) {
  const b = before.sites[site] || { calls: 0, sizes: {} };
  const sizes = {};
  for (const [k, v] of Object.entries(rec.sizes)) { const d = v - (b.sizes[k] || 0); if (d) sizes[k] = d; }
  if (rec.calls - b.calls) delta[site] = { calls: rec.calls - b.calls, sizes };
}
const out = { inFlow20s: { roErrors: after.errors - before.errors, observerCallbacks: delta }, liveObservers, geometry: JSON.parse(geometry) };
fs.writeFileSync(outJson, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1).slice(0, 3500));
ws.close();
