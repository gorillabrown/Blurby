// FOLIATE-OBSERVER-LEAK-1 DW5 live part (scratch): the packaged app opens a book in all four modes. node modes.mjs <port> <outDir>
import fs from "node:fs";
import path from "node:path";
const [port, outDir] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = list.find((t) => t.type === "page" && !t.url.startsWith("devtools"));
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
const click = (js) => { fs.appendFileSync(path.join(outDir,'clicks.jsonl'),JSON.stringify({at:new Date().toISOString(),selector:js})+'\n'); return ev(`(() => { const el = ${js}; if (!el) return false; el.click(); return true; })()`); };
const state = () => ev(`(() => {
  const root = document.querySelector("[class*='rm-'][class*='-root']");
  const fv = document.querySelector("foliate-view");
  const words = (fv?.renderer?.getContents?.() || []).reduce((n, c) => n + (c.doc?.querySelectorAll?.("[data-word-index]")?.length || 0), 0);
  return { root: root ? root.className.split(" ").find((c) => /^rm-.*-root$/.test(c)) : null, foliateView: !!fv, words };
})()`);
for (let i = 0; i < 60 && !(await ev(`!!document.querySelector(".doc-card-wrapper .doc-card")`)); i++) await sleep(500);
const out = {};
out.open = await click(`document.querySelector(".doc-card-wrapper .doc-card")`);
await sleep(12000);
await click(`[...document.querySelectorAll("button")].find((x) => x.className.includes("rbb-chapter-name"))`); await sleep(1000);
await click(`[...document.querySelectorAll("li.rbb-chapter-option")].find((x) => x.textContent.trim() === "INTRODUCTION")`); await sleep(6000);
for (const mode of ["Page", "Focus", "Flow", "Narrate"]) {
  out[mode] = { clicked: await click(`document.querySelector('[aria-label="${mode} mode"]')`) };
  await sleep(5000);
  Object.assign(out[mode], await state());
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(outDir, `dw5-${mode.toLowerCase()}.png`), Buffer.from(shot.result.data, "base64"));
}
await sleep(5000);fs.writeFileSync(path.join(outDir,'runtime-events.json'),JSON.stringify(await ev('window.__preciseEvents||[]'),null,2));console.log(JSON.stringify(out));
fs.writeFileSync(path.join(outDir, "dw5-modes.json"), JSON.stringify(out, null, 2));
ws.close();
