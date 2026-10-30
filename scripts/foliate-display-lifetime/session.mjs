// READER-VISUAL-DIAG-1 scripted live session (scratch; not committed).
// node session.mjs <port> <errorLogPath> <outJson> [--instrument] [--minutes 5]
// Script: open the first library card (Meditations); Focus mode 60 s (paused); Flow mode, Play, 180 s; pause; 60 s.
// Samples the band probe once a second in Flow; counts error.log lines added during the session.
import fs from "node:fs";
import path from "node:path";

const [port, errorLog, outJson, ...flags] = process.argv.slice(2);
const instrument = flags.includes("--instrument");
const minutes = Number(flags[flags.indexOf("--minutes") + 1]) || 5;
const scale = minutes / 5;
const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const probeSrc = fs.readFileSync(path.join(DIR, "band-probe.js"), "utf8");
const wrapSrc = fs.readFileSync(path.join(DIR, "ro-wrap.js"), "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const logLines = () => { try { return fs.readFileSync(errorLog, "utf8").split(/\r?\n/).filter(Boolean); } catch { return []; } };

const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = list.find((t) => t.type === "page" && !t.url.startsWith("devtools"));
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value;
};
const click = (selectorJs) => ev(`(() => { const el = ${selectorJs}; if (!el) return false; el.click(); return true; })()`);
const byLabel = (label) => `document.querySelector('[aria-label="${label}"]')`;

const out = { port, errorLog, instrument, minutes, steps: [], flowSamples: [], startedAt: new Date().toISOString() };
const step = (name, data) => { out.steps.push({ t: new Date().toISOString(), name, data }); console.log(name, JSON.stringify(data ?? "")); };

await send("Page.enable");
if (instrument) {
  await send("Page.addScriptToEvaluateOnNewDocument", { source: wrapSrc });
  await send("Page.reload", { ignoreCache: false });
  await sleep(8000);
}
const log0 = logLines().length;
step("start", { errorLogLines: log0, url: target.url });

// Open the first library card.
step("open-book", await click(`document.querySelector(".doc-card-wrapper .doc-card")`));
await sleep(15000);
step("page-probe", await ev(`!!document.querySelector("foliate-view")`));
// Jump to the INTRODUCTION chapter so the cursor sits in body text (the cover has no words).
step("toc-open", await click(`[...document.querySelectorAll("button")].find((x) => x.className.includes("rbb-chapter-name"))`));
await sleep(1000);
step("toc-jump", await click(`[...document.querySelectorAll("li.rbb-chapter-option")].find((x) => x.textContent.trim() === "INTRODUCTION")`));
await sleep(8000);

// Focus, paused.
step("focus", await click(byLabel("Focus mode")));
await sleep(5000);
step("focus-probe", JSON.parse((await ev(probeSrc)) || "{}"));
await sleep(55000 * scale);

// Flow, playing.
step("flow", await click(byLabel("Flow mode")));
await sleep(4000);
step("flow-probe-paused", JSON.parse((await ev(probeSrc)) || "{}"));
step("play", await click(byLabel("Play")));
const flowEnd = Date.now() + 180000 * scale;
while (Date.now() < flowEnd) {
  const p = JSON.parse((await ev(probeSrc)) || "{}");
  out.flowSamples.push({ t: Date.now(), wordIndex: p.cursor?.wordIndex ?? null, cursorTop: p.cursor?.top ?? null, bandTop: p.bandTop, bandBottom: p.bandBottom, inBand: p.cursorInBand, visible: p.visible });
  await sleep(1000);
}
step("pause", await click(byLabel("Pause")) || await click(byLabel("Play")));
await sleep(60000 * scale);

const log1 = logLines();
const added = log1.slice(log0);
const roLines = added.filter((l) => l.includes("ResizeObserver")).length;
out.errorLog = { before: log0, after: log1.length, added: added.length, resizeObserverLines: roLines, perMinute: +(roLines / minutes).toFixed(1), sample: added.slice(0, 3) };
if (instrument) out.instrumentation = JSON.parse((await ev("JSON.stringify(window.__rvd || null)")) || "null");
const fs2 = out.flowSamples.filter((s) => s.inBand !== null);
out.flowSummary = { samples: out.flowSamples.length, withCursor: fs2.length, outsideBand: fs2.filter((s) => !s.inBand).length, hiddenSamples: out.flowSamples.filter((s) => s.visible !== "visible").length };
out.finishedAt = new Date().toISOString();
fs.writeFileSync(outJson, JSON.stringify(out, null, 2));
step("done", { errorLog: out.errorLog, flowSummary: out.flowSummary });
ws.close();
