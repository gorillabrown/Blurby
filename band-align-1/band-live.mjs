// BAND-ALIGN-1 DW4 live check (scratch; not committed). node band-live.mjs <port> <outDir>
// Meditations, INTRODUCTION, paused. Focus and Flow at 100% and 120%: the zone height (READER-VISUAL-DIAG-1's band probe)
// against the body <p> line step measured independently here, and the line step the Flow engine's container inherits.
import fs from "node:fs";
import path from "node:path";
const [port, outDir] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const probeSrc = fs.readFileSync("C:/Projects/Blurby-artifacts/reader-visual-diag-1/band-probe.js", "utf8");
const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = list.find((t) => t.type === "page" && !t.url.startsWith("devtools"));
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
const click = (js) => ev(`(() => { const el = ${js}; if (!el) return false; el.click(); return true; })()`);
const byText = (t) => `[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === ${JSON.stringify(t)})`;
const sizeLabel = () => ev(`(() => { const b = ${byText("A+")}; const s = b && b.previousElementSibling; return s ? s.textContent.trim() : null; })()`);
const STEP = `(() => {
  const fv = document.querySelector("foliate-view");
  let step = null, inherited = null;
  for (const { doc } of fv?.renderer?.getContents?.() || []) {
    const p = [...doc.querySelectorAll("body p")].find((e) => e.textContent.trim());
    if (p && step === null) step = parseFloat(doc.defaultView.getComputedStyle(p).lineHeight);
  }
  if (fv?.renderer) inherited = getComputedStyle(fv.renderer).getPropertyValue("--zone-line-step-px").trim() || null;
  const host = document.querySelector(".rm-focus-view, .rm-flow-view");
  return { bodyLineStepPx: step, hostProperty: host ? host.style.getPropertyValue("--zone-line-step-px") : null, inheritedByRenderer: inherited };
})()`;
async function probe(label) {
  const band = JSON.parse((await ev(probeSrc)) || "{}");
  const step = await ev(STEP);
  const zone = band.zoneHeightPx ?? null;
  const row = { label, size: await sizeLabel(), zoneHeightPx: zone, ...step, ratio: zone && step.bodyLineStepPx ? Math.round((zone / step.bodyLineStepPx) * 100) / 100 : null };
  console.log(JSON.stringify(row));
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(outDir, `${label}.png`), Buffer.from(shot.result.data, "base64"));
  return row;
}
async function setSize(want) {
  for (let i = 0; i < 10; i++) {
    const now = parseInt(await sizeLabel(), 10);
    if (now === want) return now;
    await click(byText(now < want ? "A+" : "A-"));
    await sleep(2500);
  }
  return parseInt(await sizeLabel(), 10);
}
for (let i = 0; i < 60 && !(await ev(`!!document.querySelector(".doc-card-wrapper .doc-card")`)); i++) await sleep(500);
await click(`document.querySelector(".doc-card-wrapper .doc-card")`); await sleep(12000);
await click(`[...document.querySelectorAll("button")].find((x) => x.className.includes("rbb-chapter-name"))`); await sleep(1000);
await click(`[...document.querySelectorAll("li.rbb-chapter-option")].find((x) => x.textContent.trim() === "INTRODUCTION")`); await sleep(6000);
const rows = [];
await click(`document.querySelector('[aria-label="Focus mode"]')`); await sleep(5000);
await setSize(100); rows.push(await probe("focus-100"));
await setSize(120); rows.push(await probe("focus-120"));
await click(`document.querySelector('[aria-label="Flow mode"]')`); await sleep(5000);
rows.push(await probe("flow-120"));
await setSize(100); rows.push(await probe("flow-100"));
fs.writeFileSync(path.join(outDir, "band-live.json"), JSON.stringify(rows, null, 2));
ws.close();
