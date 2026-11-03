// READER-VISUAL-DIAG-1 causal test (scratch; CDP-injected; no source edit): does disconnecting the leaked
// foliate observers stop the per-frame "ResizeObserver loop" errors? node leak-test.mjs <port> <outJson>
import fs from "node:fs";
import path from "node:path";
const [port, outJson] = process.argv.slice(2);
const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const wrapSrc = fs.readFileSync(path.join(DIR, "ro-wrap.js"), "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
const click = (js) => ev(`(() => { const el = ${js}; if (!el) return false; el.click(); return true; })()`);
const errors = async () => Number(await ev("window.__rvd.errors"));
await send("Page.enable");
await send("Page.addScriptToEvaluateOnNewDocument", { source: wrapSrc });
await send("Page.reload", {}); await sleep(9000);
await click(`document.querySelector(".doc-card-wrapper .doc-card")`); await sleep(15000);
await click(`[...document.querySelectorAll("button")].find((x) => x.className.includes("rbb-chapter-name"))`); await sleep(1000);
await click(`[...document.querySelectorAll("li.rbb-chapter-option")].find((x) => x.textContent.trim() === "INTRODUCTION")`); await sleep(8000);
await click(`document.querySelector('[aria-label="Focus mode"]')`); await sleep(10000);
await click(`document.querySelector('[aria-label="Flow mode"]')`); await sleep(5000);
const e0 = await errors(); await sleep(5000); const e1 = await errors();
const base = { errors5s: e1 - e0, perSecond: +((e1 - e0) / 5).toFixed(1) };
const n = Number(await ev("window.__rvdLive().length")); console.log("live observers:", n);
const steps = [];
for (let k = 0; k < n; k++) {
  const label = await ev(`(() => { const o = window.__rvd.live.find(o => !o.disconnected); if (!o) return null; const d = o.site.split("assets").pop() + " -> " + [...o.targets].map(t => t.tagName.toLowerCase() + "." + String(t.className).split(" ")[0] + (t.isConnected ? "" : "(detached)") + " " + t.clientWidth + "x" + t.clientHeight).join(","); o.obs.disconnect(); return d; })()`);
  if (!label) break;
  await sleep(500); const a = await errors(); await sleep(3000); const b = await errors();
  steps.push({ disconnected: label, errorsPerSecondAfter: +((b - a) / 3).toFixed(1) });
}
const out = { base, steps };
fs.writeFileSync(outJson, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
ws.close();
