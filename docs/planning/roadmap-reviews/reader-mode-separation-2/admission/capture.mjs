// Test-only CDP observer. Controls are DOM-backed button clicks; no desktop cursor input.
// node <this file> --profile=<bootstrap profile> --fixture=epub|text --scenario=flow|focus|narrate|observe --run=<unique-name>
// Screenshots and screencast frames are visual evidence; trace/DOM events never prove heard audio.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import WebSocket from "ws";

const startedAtMs = Date.now();
const actionDeadline = startedAtMs + 55000;
const finalDeadline = startedAtMs + 60000;
let finalizing = false;
const remainingMs = () => (finalizing ? finalDeadline : actionDeadline) - Date.now();
const expectedRoot = "C:/Projects/Blurby/.worktrees/reader-mode-separation-2";
const samePath = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
if (!samePath(process.cwd(), expectedRoot)) throw new Error("Refusing unexpected working directory");
const arg = (name, fallback) => process.argv.find((v) => v.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const profileArg = arg("profile");
if (!profileArg || !path.isAbsolute(profileArg)) throw new Error("Explicit --profile is required");
const profile = path.resolve(profileArg);
const manifest = JSON.parse(await fs.readFile(path.join(profile, "isolation.json"), "utf8"));
if (!samePath(manifest.profile, profile) || !manifest.readyIsolationVerifiedAt || !manifest.rendererIdentityInstalledAt || !manifest.productionMatchesPin) throw new Error("Bootstrap has not positively verified isolation and renderer identity");
const fixture = arg("fixture", "epub");
const docId = { epub: "g0-public-epub", text: "g0-public-text" }[fixture];
if (!docId) throw new Error("Invalid fixture");
const scenario = arg("scenario", "flow");
if (!["flow", "focus", "narrate", "observe"].includes(scenario)) throw new Error("Invalid scenario");
const run = arg("run");
if (!run || !/^[a-z0-9-]+$/.test(run)) throw new Error("A unique lowercase --run is required");
const out = path.join(profile, "captures", run);
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.mkdir(out); // Refuse overwriting evidence from a previous run.
await fs.mkdir(path.join(out, "frames"));
const now = () => new Date().toISOString();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let writeQueue = Promise.resolve();
const append = (file, value) => { writeQueue = writeQueue.then(() => fs.appendFile(path.join(out, file), JSON.stringify(value) + "\n")); return writeQueue; };
let client;
let frameCount = 0;
let sampleCount = 0;
let stopped = false;
const report = { run, startedAt: now(), fixture: manifest.fixtures.find((entry) => entry.id === docId), scenario, profile, pid: manifest.pid, sourceManifestSha256: manifest.sourceManifestSha256, actions: [], heardAudio: "NOT OBSERVED by this harness", canonicalIndexPolicy: "Only raw existing DOM indices, section metadata, trace events, and persisted positions are recorded. No index is inferred from visible word text." };

class Cdp {
  constructor(url) { this.ws = new WebSocket(url); this.nextId = 1; this.pending = new Map(); }
  async connect() {
    this.ws.on("message", (raw) => {
      const message = JSON.parse(String(raw));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        clearTimeout(pending.timer); this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error))); else pending.resolve(message.result);
      } else if (["Runtime.consoleAPICalled", "Runtime.exceptionThrown", "Log.entryAdded", "Inspector.targetCrashed", "Page.frameNavigated"].includes(message.method)) {
        append("console.ndjson", { at: now(), ...message }).catch(() => {});
      } else if (message.method === "Page.screencastFrame") {
        const { data, metadata, sessionId } = message.params;
        const index = ++frameCount;
        if (index <= 1800) {
          const file = `frames/${String(index).padStart(5, "0")}.jpg`;
          writeQueue = writeQueue.then(() => fs.writeFile(path.join(out, file), Buffer.from(data, "base64")));
          append("frames.ndjson", { at: now(), index, file, metadata }).catch(() => {});
        }
        this.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
      }
    });
    this.ws.on("close", () => { for (const item of this.pending.values()) { clearTimeout(item.timer); item.reject(new Error("CDP closed")); } this.pending.clear(); });
    await new Promise((resolve, reject) => { this.ws.once("open", resolve); this.ws.once("error", reject); });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const remaining = remainingMs();
      if (remaining <= 0) { reject(new Error("Capture time budget exhausted")); return; }
      const id = this.nextId++;
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timed out: ${method}`)); }, Math.min(15000, remaining));
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }), (error) => { if (error) { clearTimeout(timer); this.pending.delete(id); reject(error); } });
    });
  }
  async evaluate(fn, ...args) {
    const response = await this.send("Runtime.evaluate", { expression: `(${fn.toString()})(...${JSON.stringify(args)})`, returnByValue: true, awaitPromise: true, userGesture: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
    return response.result?.value;
  }
}
async function click(selector) {
  const action = await client.evaluate((sel) => {
    const matches = [...document.querySelectorAll(sel)].filter((node) => node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0);
    if (matches.length !== 1) throw new Error(`Expected one visible target for ${sel}; got ${matches.length}`);
    const button = matches[0];
    if (button.disabled || button.getAttribute("aria-disabled") === "true") throw new Error(`Disabled target: ${sel}`);
    const observed = { selector: sel, text: button.textContent?.trim(), ariaLabel: button.getAttribute("aria-label"), className: button.className };
    button.click();
    return observed;
  }, selector);
  report.actions.push({ at: now(), ...action });
  await append("actions.ndjson", report.actions.at(-1));
}
async function waitFor(label, predicate, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) { if (await client.evaluate(predicate)) return; await sleep(200); }
  throw new Error(`Timed out waiting for ${label}`);
}
function readDom() {
  const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
  const word = (el) => ({ text: el.textContent?.trim(), fullWord: el.getAttribute("data-word-full"), rawWordIndex: el.getAttribute("data-word-index"), rawWidx: el.getAttribute("data-widx"), className: el.className, rect: rect(el) });
  const roots = [{ doc: document, sectionIndex: null, origin: "top-document" }];
  const seen = new Set([document]);
  const scan = (root) => {
    for (const view of root.querySelectorAll("foliate-view")) {
      for (const entry of view.renderer?.getContents?.() || []) {
        if (entry.doc && !seen.has(entry.doc)) { seen.add(entry.doc); roots.push({ doc: entry.doc, sectionIndex: typeof entry.index === "number" ? entry.index : null, origin: "foliate.renderer.getContents" }); }
      }
    }
    for (const el of root.querySelectorAll("*")) {
      if (el.shadowRoot) scan(el.shadowRoot);
      if (el.tagName === "IFRAME") { try { const doc = el.contentDocument; if (doc && !seen.has(doc)) { seen.add(doc); roots.push({ doc, sectionIndex: null, origin: "iframe" }); } } catch {} }
    }
  };
  scan(document);
  return {
    at: new Date().toISOString(), href: location.href, title: document.title, readyState: document.readyState,
    viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
    identity: window.__BLURBY_G0_ADMISSION__ || null,
    controls: [...document.querySelectorAll('[aria-label="Reader controls"] button, [aria-label="Reader controls"] input')].map((el) => ({ label: el.getAttribute("aria-label"), text: el.textContent?.trim(), className: el.className, disabled: Boolean(el.disabled), value: el.value ?? null })),
    selectedMode: document.querySelector(".rbb-mode-btn--active")?.getAttribute("aria-label") ?? null,
    chapter: document.querySelector(".rbb-chapter-name")?.textContent?.trim() ?? null,
    progressText: document.querySelector(".rbb-info-progress")?.textContent ?? null,
    focusText: document.querySelector(".reader-word-display")?.textContent?.trim() ?? null,
    bodyText: document.body?.innerText?.slice(0, 3500),
    loadedResourceUrls: performance.getEntriesByType("resource").map((entry) => entry.name),
    scriptUrls: [...document.scripts].map((entry) => entry.src).filter(Boolean),
    surfaces: roots.map(({ doc, sectionIndex, origin }) => {
      const all = [...doc.querySelectorAll("[data-word-index],[data-widx]")];
      const viewport = doc.defaultView;
      const visible = all.filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < (viewport?.innerWidth || 0) && r.top < (viewport?.innerHeight || 0); });
      return { origin, sectionIndex, url: doc.URL, wordCountInDom: all.length, visibleWithinOwnDocumentCount: visible.length, firstVisibleWords: visible.slice(0, 12).map(word), activeWords: [...doc.querySelectorAll(".flow-word-active,.page-word--flow-cursor,.page-word--narrate-cursor,.page-word--highlighted,.page-word--soft-selected")].slice(0, 20).map(word), headings: [...doc.querySelectorAll("h1,h2,h3")].map((el) => el.textContent?.trim()).slice(0, 8) };
    }),
    traceEvents: window.__BLURBY_TTS_EVAL_TRACE__?.getEvents?.() ?? [],
  };
}
async function sample(label, screenshot = false) {
  const state = await client.evaluate(readDom);
  await append("dom.ndjson", { label, sample: ++sampleCount, ...state });
  if (screenshot) { const shot = await client.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }); await fs.writeFile(path.join(out, `${String(sampleCount).padStart(3, "0")}-${label}.png`), Buffer.from(shot.data, "base64")); }
  return state;
}
async function observe(label, ms) {
  const deadline = Date.now() + ms;
  await sample(`${label}-start`, true);
  while (Date.now() < deadline) { await sleep(500); await sample(label); }
  await sample(`${label}-end`, true);
}
try {
  const response = await fetch(`http://127.0.0.1:${manifest.cdpPort}/json/list`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`CDP discovery HTTP ${response.status}`);
  const targets = (await response.json()).filter((t) => t.type === "page" && /^http:\/\/localhost:5173(?:\/|$)/.test(t.url) && t.webSocketDebuggerUrl);
  if (targets.length !== 1) throw new Error(`Expected one Blurby renderer; found ${targets.length}`);
  client = new Cdp(targets[0].webSocketDebuggerUrl);
  await client.connect();
  await client.send("Runtime.enable"); await client.send("Page.enable"); await client.send("Log.enable");
  const identity = await client.evaluate(() => window.__BLURBY_G0_ADMISSION__ || null);
  if (!identity || identity.runId !== manifest.runId || identity.pid !== manifest.pid || identity.sourceManifestSha256 !== manifest.sourceManifestSha256 || !samePath(identity.profile, profile)) throw new Error("Renderer identity does not match isolated bootstrap");
  report.rendererIdentity = identity;
  report.target = { id: targets[0].id, url: targets[0].url };
  report.loadedResourceUrlsAtStart = await client.evaluate(() => ({ scripts: [...document.scripts].map((entry) => entry.src).filter(Boolean), resources: performance.getEntriesByType("resource").map((entry) => entry.name), stylesheetAndPreloadLinks: [...document.querySelectorAll('link[rel="stylesheet"],link[rel="modulepreload"]')].map((entry) => entry.href) }));
  report.builtAssetVerification = [];
  if (!Array.isArray(manifest.buildFiles) || !manifest.buildFiles.length) throw new Error("Preserved build manifest is empty");
  for (const expected of manifest.buildFiles) {
    const relativePath = expected.path;
    if (path.isAbsolute(relativePath) || relativePath.split(/[\\/]/).includes("..")) throw new Error(`Unsafe build path: ${relativePath}`);
    const url = "http://localhost:5173/" + relativePath.split("/").map(encodeURIComponent).join("/");
    if (remainingMs() <= 0) throw new Error("Capture time budget exhausted verifying build");
    const assetResponse = await fetch(url, { signal: AbortSignal.timeout(Math.min(5000, remainingMs())) });
    if (!assetResponse.ok) throw new Error(`Renderer asset HTTP ${assetResponse.status}: ${url}`);
    const sha256 = crypto.createHash("sha256").update(Buffer.from(await assetResponse.arrayBuffer())).digest("hex");
    if (sha256 !== expected.sha256) throw new Error(`Served renderer asset differs from preserved build: ${relativePath}`);
    report.builtAssetVerification.push({ url, sha256, matchedArchive: true });
  }
  await client.send("Page.startScreencast", { format: "jpeg", quality: 75, maxWidth: 1100, maxHeight: 800, everyNthFrame: 1 });
  await sample("initial", true);
  if (scenario !== "observe") {
    // Reload the library shell before opening the fixture, if a reader is already open.
    if (await client.evaluate(() => Boolean(document.querySelector('[aria-label="Reader controls"]')))) {
      await client.send("Page.navigate", { url: "http://localhost:5173/" });
      await waitFor("renderer identity after reload", () => Boolean(window.__BLURBY_G0_ADMISSION__));
    }
    await waitFor("fixture library cards", () => Boolean(document.querySelector('[data-doc-id="g0-public-epub"]')));
    await click(`[data-doc-id="${docId}"]`);
    await waitFor("reader controls", () => Boolean(document.querySelector('[aria-label="Reader controls"]')));
    await click('[aria-label="Page mode"]');
    await observe("page-paused", 5000);
    const modeLabel = scenario.charAt(0).toUpperCase() + scenario.slice(1);
    await click(`[aria-label="${modeLabel} mode"]`);
    await observe(`${scenario}-paused`, 5000);
    await click('[aria-label="Play"]');
    await observe(`${scenario}-playing`, scenario === "narrate" ? 12000 : 8000);
    if (await client.evaluate(() => Boolean(document.querySelector('[aria-label="Pause"]')))) await click('[aria-label="Pause"]');
    else { report.pauseControlMissingAfterPlay = true; throw new Error("Pause control missing after Play; playback transition unverified"); }
    await observe(`${scenario}-after-pause`, 5000);
  } else await observe("observation-only", 10000);
  report.captureCompleted = true;
} catch (error) {
  report.captureCompleted = false; report.error = error.stack;
  if (client) { try { await sample("failure", true); } catch (diagnosticError) { report.diagnosticError = diagnosticError.message; } }
  process.exitCode = 1;
} finally {
  finalizing = true;
  if (client) {
    try {
      if (scenario !== "observe" && await client.evaluate(() => Boolean(document.querySelector('[aria-label="Pause"]')))) await click('[aria-label="Pause"]');
      stopped = !(await client.evaluate(() => Boolean(document.querySelector('[aria-label="Pause"]'))));
      report.persistedAppState = await client.evaluate(async () => {
        const state = await window.electronAPI.getState();
        return { settings: state.settings, library: state.library.map(({ id, title, position, cfi, ext, filepath, convertedEpubPath, wordCount }) => ({ id, title, position, cfi, ext, filepath, convertedEpubPath, wordCount })) };
      });
      await client.send("Page.stopScreencast");
    } catch (error) { report.finalizationError = error.message; report.captureCompleted = false; process.exitCode = 1; }
    client.ws.close();
  }
  report.finishedAt = now(); report.playbackStopped = stopped; report.samples = sampleCount; report.screencastFrames = frameCount; report.frameLimitReached = frameCount > 1800;
  report.elapsedMs = Date.now() - startedAtMs;
  if (!stopped || report.elapsedMs > 60000) { report.captureCompleted = false; process.exitCode = 1; }
  await writeQueue;
  await fs.writeFile(path.join(out, "capture.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ out, captureCompleted: report.captureCompleted, playbackStopped: stopped, samples: sampleCount, frames: frameCount, error: report.error }, null, 2));
}
