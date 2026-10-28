import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import WebSocket from "ws";

export const MOSS_NANO_ELECTRON_LIVE_DRIVER_MODES = Object.freeze(["page", "focus", "flow", "narrate"]);

const DEFAULT_OUT_DIR = path.resolve("artifacts/tts-eval/moss-nano-13d-live-capture");
const DEFAULT_TRACE_DIR = path.join(DEFAULT_OUT_DIR, "traces");
const DEFAULT_PROFILE_DIR = path.join(DEFAULT_OUT_DIR, "electron-profile");
const DEFAULT_REMOTE_DEBUGGING_PORT = 9333;
const DEFAULT_VITE_PORT = 5173;
const DEFAULT_TITLE = "MOSS Nano 13d Automated Live Capture";
const DEFAULT_CONTENT = `
This automated live capture passage is deliberately plain prose so every reading
mode can start quickly and keep the Nano sidecar focused on real playback. The
driver opens the real Electron app, selects Nano in the visible settings UI, and
uses the reader controls to move through page, focus, flow, and narration paths.

The passage includes enough words for the scheduler to request an opening audio
segment and prepare the next segment. That gives the trace a chance to record
first audio, segment-following timing, word progress, flow cursor position, and
the cache continuity events required by the live evidence producer.

A careful test should prefer boring text over dramatic text. Boring text keeps
the measurement honest. It lets the user interface, the preload bridge, and the
sidecar protocol do their work without extra content surprises.
`.replace(/\s+/g, " ").trim();

function xhtmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function assertMode(mode) {
  if (!MOSS_NANO_ELECTRON_LIVE_DRIVER_MODES.includes(mode)) {
    throw new Error(`Unsupported MOSS Nano live driver mode: ${mode}`);
  }
}

export function buildTraceConfig(mode, {
  runIdPrefix = "moss-nano-13d",
  fixtureTitlePrefix = "Live",
} = {}) {
  assertMode(mode);
  const titleMode = mode.charAt(0).toUpperCase() + mode.slice(1);
  return {
    mode,
    runId: `${runIdPrefix}-${mode}`,
    scenarioId: `moss-nano-13c-${mode}-live-evidence`,
    fixture: {
      id: `live-${mode}`,
      title: `${fixtureTitlePrefix} ${titleMode}`,
      sourceType: "prose",
      expectedCoverage: [],
    },
  };
}

export function buildTraceEnv({
  mode,
  traceDir = DEFAULT_TRACE_DIR,
  baseEnv = process.env,
} = {}) {
  assertMode(mode);
  return {
    ...baseEnv,
    BLURBY_TTS_EVAL_TRACE_DIR: path.resolve(traceDir),
    BLURBY_TTS_EVAL_TRACE_CONFIG: JSON.stringify(buildTraceConfig(mode)),
  };
}

export function buildElectronLaunchArgs({
  appRoot = process.cwd(),
  remoteDebuggingPort = DEFAULT_REMOTE_DEBUGGING_PORT,
  userDataDir = DEFAULT_PROFILE_DIR,
} = {}) {
  return [
    `--remote-debugging-port=${remoteDebuggingPort}`,
    `--user-data-dir=${userDataDir}`,
    appRoot,
  ];
}

export function buildDriverSelectorContract() {
  return {
    addDocumentButton: '[aria-label="Add document"]',
    documentTitleInput: '[aria-label="Document title"]',
    documentContentInput: '[aria-label="Document content"]',
    openMenuButton: '[aria-label="Open menu"]',
    goToSettingsButton: '[aria-label="Go to settings"]',
    readerPlayButton: '[aria-label="Play"]',
    readerPauseButton: '[aria-label="Pause"]',
    pageModeButton: '[aria-label="Page mode"]',
    focusModeButton: '[aria-label="Focus mode"]',
    flowModeButton: '[aria-label="Flow mode"]',
    narrateModeButton: '[aria-label="Narrate mode"]',
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(1500, () => {
      req.destroy(new Error(`Timed out requesting ${url}`));
    });
  });
}

function requestOk(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();
      res.on("end", () => resolve(res.statusCode >= 200 && res.statusCode < 500));
    });
    req.on("error", reject);
    req.setTimeout(1500, () => {
      req.destroy(new Error(`Timed out requesting ${url}`));
    });
  });
}

async function waitForJson(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      return await requestJson(url);
    } catch (error) {
      lastError = error;
      await sleep(250);
    }
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError?.message ?? "no response"}`);
}

async function waitForHttp(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      if (await requestOk(url)) return true;
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError?.message ?? "no response"}`);
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.once("open", resolve);
      this.ws.once("error", reject);
    });
    this.ws.on("message", (raw) => {
      const message = JSON.parse(String(raw));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message || JSON.stringify(message.error)));
      else pending.resolve(message.result);
    });
  }

  send(method, params = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("CDP websocket is not open");
    }
    const id = this.nextId;
    this.nextId += 1;
    const payload = JSON.stringify({ id, method, params });
    const promise = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.ws.send(payload);
    return promise;
  }

  async evaluate(fn, ...args) {
    const expression = `(${fn})(...${JSON.stringify(args)})`;
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (result.exceptionDetails) {
      const description =
        result.exceptionDetails.exception?.description
        || result.exceptionDetails.text
        || "Runtime.evaluate failed";
      throw new Error(description);
    }
    return result.result?.value;
  }

  close() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.close();
  }
}

async function connectToRenderer(remoteDebuggingPort, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  let lastTargets = [];
  while (Date.now() < deadline) {
    const targets = await waitForJson(`http://127.0.0.1:${remoteDebuggingPort}/json/list`, 5000);
    lastTargets = targets;
    const target = targets.find((entry) =>
      entry.type === "page"
      && entry.webSocketDebuggerUrl
      && (String(entry.url).includes("localhost:5173") || String(entry.url).startsWith("file:"))
    );
    if (target) {
      const client = new CdpClient(target.webSocketDebuggerUrl);
      await client.connect();
      await client.send("Runtime.enable");
      await client.send("Page.enable");
      return client;
    }
    await sleep(300);
  }
  throw new Error(`Timed out waiting for Blurby renderer target. Targets: ${JSON.stringify(lastTargets)}`);
}

async function waitFor(client, label, predicate, timeoutMs = 15000, ...args) {
  const deadline = Date.now() + timeoutMs;
  let lastValue;
  while (Date.now() < deadline) {
    lastValue = await client.evaluate(predicate, ...args);
    if (lastValue) return lastValue;
    await sleep(250);
  }
  let diagnostics = null;
  try {
    diagnostics = await client.evaluate(() => ({
      href: window.location.href,
      title: document.title,
      bodyText: (document.body?.innerText || "").slice(0, 800),
      readyState: document.readyState,
    }));
  } catch {
    // Best-effort diagnostics only.
  }
  throw new Error(`Timed out waiting for ${label}. Last value: ${JSON.stringify(lastValue)}. DOM: ${JSON.stringify(diagnostics)}`);
}

async function waitForMaybe(client, predicate, timeoutMs = 15000, ...args) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await client.evaluate(predicate, ...args)) return true;
    await sleep(250);
  }
  return false;
}

export async function readRendererTraceEvents(client) {
  const events = await client.evaluate((trace) => {
    const target = trace || window.__BLURBY_TTS_EVAL_TRACE__;
    if (!target) return [];
    if (typeof target.getEvents === "function") return target.getEvents();
    return Array.isArray(target.events) ? target.events : [];
  });
  return Array.isArray(events) ? events : [];
}

function hasNanoPlaybackEvent(events) {
  return events.some((event) => event?.kind === "nano-segment" && event.phase === "playback");
}

function hasFlowPositionEvent(events) {
  return events.some((event) => event?.kind === "flow-position");
}

function hasModeSwitchAnchorPreservedEvent(events) {
  return events.some((event) =>
    event?.kind === "transition"
    && (event.context === "mode-switch-anchor-preserved" || event.transition === "handoff")
  );
}

function hasPauseResumeEvent(events, mode) {
  const lifecycle = events.filter((event) => event?.kind === "lifecycle");
  const pauses = lifecycle.filter((event) => event.state === "pause" && (event.mode ?? mode) === mode);
  const resumes = lifecycle.filter((event) => event.state === "resume" && (event.mode ?? mode) === mode);
  return pauses.length > 0 && pauses.length === resumes.length;
}

export function hasRequiredLiveCaptureDriverEvents(events, mode) {
  return {
    flowPosition: hasFlowPositionEvent(events),
    modeSwitchAnchorPreserved: hasModeSwitchAnchorPreservedEvent(events),
    pauseResumeSameMode: hasPauseResumeEvent(events, mode),
    nanoPlayback: hasNanoPlaybackEvent(events),
  };
}

export function shouldRetryNanoPlaybackStart({ hasPlayback, hasPlayButton, hasPauseButton }) {
  return hasPlayback !== true && hasPlayButton === true && hasPauseButton !== true;
}

async function waitForRendererTraceEvents(client, label, predicate, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  let lastEvents = [];
  while (Date.now() < deadline) {
    lastEvents = await readRendererTraceEvents(client);
    if (predicate(lastEvents)) return lastEvents;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${label}. Last trace events: ${JSON.stringify(lastEvents.slice(-10))}`);
}

async function clickSelector(client, selector, timeoutMs = 15000) {
  await waitFor(client, selector, (sel) => Boolean(document.querySelector(sel)), timeoutMs, selector);
  return client.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`Missing selector: ${sel}`);
    el.scrollIntoView?.({ block: "center", inline: "center" });
    el.click();
    return true;
  }, selector);
}

async function clickText(client, text, selector = "button,[role='button']", timeoutMs = 15000) {
  await waitFor(client, `text ${text}`, (needle, sel) => {
    const lower = needle.toLowerCase();
    return Array.from(document.querySelectorAll(sel)).some((el) =>
      (el.textContent || "").trim().toLowerCase().includes(lower)
      && !(el.disabled || el.getAttribute("aria-disabled") === "true")
    );
  }, timeoutMs, text, selector);
  return client.evaluate((needle, sel) => {
    const lower = needle.toLowerCase();
    const el = Array.from(document.querySelectorAll(sel)).find((candidate) =>
      (candidate.textContent || "").trim().toLowerCase().includes(lower)
      && !(candidate.disabled || candidate.getAttribute("aria-disabled") === "true")
    );
    if (!el) throw new Error(`Missing clickable text: ${needle}`);
    el.scrollIntoView?.({ block: "center", inline: "center" });
    el.click();
    return true;
  }, text, selector);
}

async function fillSelector(client, selector, value, timeoutMs = 15000) {
  await waitFor(client, selector, (sel) => Boolean(document.querySelector(sel)), timeoutMs, selector);
  return client.evaluate((sel, nextValue) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`Missing input selector: ${sel}`);
    el.focus();
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    setter?.call(el, nextValue);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }, selector, value);
}

async function skipOnboardingIfPresent(client) {
  await waitFor(client, "library or onboarding shell", () => {
    const text = document.body?.innerText || "";
    return text.includes("My reading list") || text.includes("Welcome to Blurby");
  }, 30000);
  const present = await client.evaluate(() =>
    Boolean(document.querySelector('[aria-label="Welcome to Blurby"]'))
    || (document.body?.innerText || "").includes("Welcome to Blurby")
  );
  if (present) {
    await clickText(client, "Skip tour", ".onboarding-overlay button");
    await waitFor(client, "onboarding dismissed", () =>
      Boolean(document.querySelector('[aria-label="Library"]'))
      && !(document.body?.innerText || "").includes("Welcome to Blurby")
    );
  }
}

async function selectNanoViaUi(client) {
  const selectors = buildDriverSelectorContract();
  await clickSelector(client, selectors.openMenuButton);
  await clickSelector(client, selectors.goToSettingsButton);
  await clickText(client, "Narration (TTS)", "[role='button']");
  await clickText(client, "Nano AI (Experimental)", "button");
  await waitFor(client, "Nano selected in UI", () => {
    const button = Array.from(document.querySelectorAll("button")).find((el) =>
      (el.textContent || "").includes("Nano AI")
    );
    return Boolean(button?.classList.contains("active"));
  }, 10000);
  await clickSelector(client, '[aria-label="Close menu"]');
}

async function ensureNanoSidecarReady(client, timeoutMs) {
  return waitFor(client, "real Nano sidecar ready via preload IPC", async () => {
    const api = window.electronAPI;
    if (!api?.nanoStatus) return { ready: false, detail: "nanoStatus unavailable" };
    const status = await api.nanoStatus();
    if (status?.ready === true && status?.status === "ready") {
      return { ready: true, status };
    }
    return false;
  }, timeoutMs);
}

async function ensureDocumentOpen(client, fixtureTitle) {
  await waitFor(client, "seeded EPUB fixture card", (title) =>
    Array.from(document.querySelectorAll("[data-doc-id]")).some((doc) =>
      (doc.textContent || "").includes(title)
    ), 30000, fixtureTitle);
  await client.evaluate((title) => {
    const doc = Array.from(document.querySelectorAll("[data-doc-id]")).find((candidate) =>
      (candidate.textContent || "").includes(title)
    );
    if (!doc) throw new Error("No document card found to open");
    doc.scrollIntoView?.({ block: "center", inline: "center" });
    doc.click();
    return true;
  }, fixtureTitle);
  await waitFor(client, "reader controls", () => Boolean(document.querySelector('[aria-label="Reader controls"]')), 30000);
}

async function seedEpubFixture({ appRoot, profileDir, mode }) {
  const require = createRequire(import.meta.url);
  const { buildEpubZip } = require(path.join(appRoot, "main", "epub-converter.js"));
  const now = Date.now();
  const id = `moss-nano-13d-${mode}-${now}`;
  const title = `${DEFAULT_TITLE} ${mode} ${now}`;
  const dataDir = path.join(profileDir, "blurby-data");
  const fixtureDir = path.join(dataDir, "live-fixtures");
  const epubPath = path.join(fixtureDir, `${id}.epub`);
  await fs.mkdir(fixtureDir, { recursive: true });
  await buildEpubZip({
    outputPath: epubPath,
    title,
    author: "Blurby Automation",
    chapters: [{
      title: "Live Capture",
      xhtml: `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head><title>${xhtmlEscape(title)}</title></head>
  <body>
    <h1>${xhtmlEscape(title)}</h1>
    <p>${xhtmlEscape(DEFAULT_CONTENT)}</p>
    <p>${xhtmlEscape(DEFAULT_CONTENT)}</p>
  </body>
</html>`,
    }],
  });

  await fs.mkdir(dataDir, { recursive: true });
  const libraryPath = path.join(dataDir, "library.json");
  let library = { schemaVersion: 6, docs: [] };
  try {
    library = JSON.parse(await fs.readFile(libraryPath, "utf8"));
    if (!Array.isArray(library.docs)) library.docs = [];
    library.schemaVersion = library.schemaVersion || 6;
  } catch {
    // First run in this isolated profile.
  }
  library.docs = [{
    id,
    title,
    filepath: epubPath,
    filename: path.basename(epubPath),
    ext: ".epub",
    size: (await fs.stat(epubPath)).size,
    modified: now,
    wordCount: 270,
    position: 0,
    created: now,
    source: "file",
    author: "Blurby Automation",
    lastReadAt: null,
  }, ...library.docs];
  await fs.writeFile(libraryPath, JSON.stringify(library, null, 2), "utf8");
  return { id, title, epubPath };
}

async function driveMode(client, mode, runMs) {
  const selectors = buildDriverSelectorContract();
  const modeSelector = {
    page: selectors.pageModeButton,
    focus: selectors.focusModeButton,
    flow: selectors.flowModeButton,
    narrate: selectors.narrateModeButton,
  }[mode];

  await clickSelector(client, modeSelector);
  await sleep(500);

  if (mode !== "flow") {
    await clickSelector(client, selectors.flowModeButton);
    await sleep(500);
  }
  await clickSelector(client, selectors.readerPlayButton);
  await waitForRendererTraceEvents(
    client,
    "real Flow cursor trace event",
    hasFlowPositionEvent,
    30000,
  );
  await clickSelector(client, selectors.narrateModeButton);
  await waitForRendererTraceEvents(
    client,
    "mode-switch anchor preservation trace event",
    hasModeSwitchAnchorPreservedEvent,
    30000,
  );
  await sleep(500);
  await clickSelector(client, selectors.readerPlayButton);
  const hasInitialNanoPlayback = await waitForMaybe(
    client,
    () => {
      const trace = window.__BLURBY_TTS_EVAL_TRACE__;
      const events = typeof trace?.getEvents === "function"
        ? trace.getEvents()
        : (Array.isArray(trace?.events) ? trace.events : []);
      return events.some((event) => event.kind === "nano-segment" && event.phase === "playback");
    },
    15000,
  );
  const playbackControlState = await client.evaluate((playSelector, pauseSelector) => ({
    hasPlayButton: Boolean(document.querySelector(playSelector)),
    hasPauseButton: Boolean(document.querySelector(pauseSelector)),
  }), selectors.readerPlayButton, selectors.readerPauseButton);
  if (shouldRetryNanoPlaybackStart({
    hasPlayback: hasInitialNanoPlayback,
    hasPlayButton: playbackControlState?.hasPlayButton,
    hasPauseButton: playbackControlState?.hasPauseButton,
  })) {
    console.log("[moss-nano-live-driver] retrying Narrate after EPUB word extraction warm-up");
    await clickSelector(client, selectors.narrateModeButton);
    await sleep(500);
    await clickSelector(client, selectors.readerPlayButton);
  } else if (!hasInitialNanoPlayback) {
    console.log("[moss-nano-live-driver] playback controls already active; waiting for Nano trace event");
  }
  await waitForRendererTraceEvents(
    client,
    "Nano playback trace event",
    hasNanoPlaybackEvent,
    120000,
  );
  await sleep(runMs);

  const hasPauseButton = await client.evaluate((sel) => Boolean(document.querySelector(sel)), selectors.readerPauseButton);
  if (hasPauseButton) {
    await clickSelector(client, selectors.readerPauseButton, 5000);
    await waitForRendererTraceEvents(
      client,
      "same-mode pause trace event",
      (events) => events.some((event) => event.kind === "lifecycle" && event.state === "pause" && (event.mode ?? mode) === mode),
      10000,
    );
    await sleep(800);
  }

  const hasPlayButton = await client.evaluate((sel) => Boolean(document.querySelector(sel)), selectors.readerPlayButton);
  if (hasPlayButton) {
    await clickSelector(client, selectors.readerPlayButton, 5000);
    await waitForRendererTraceEvents(
      client,
      "same-mode resume trace event",
      (events) => hasPauseResumeEvent(events, mode),
      10000,
    );
    await sleep(Math.min(runMs, 4000));
  }

  await waitForRendererTraceEvents(
    client,
    "complete per-mode live capture evidence",
    (events) => {
      const evidence = hasRequiredLiveCaptureDriverEvents(events, mode);
      return evidence.flowPosition
        && evidence.modeSwitchAnchorPreserved
        && evidence.pauseResumeSameMode
        && evidence.nanoPlayback;
    },
    30000,
  );

  await client.evaluate(async () => {
    const trace = window.__BLURBY_TTS_EVAL_TRACE__;
    if (trace?.flush) return trace.flush();
    return null;
  });
}

async function startVite({ appRoot, vitePort }) {
  try {
    if (await requestOk(`http://localhost:${vitePort}`)) {
      console.log(`[moss-nano-live-driver] reusing existing Vite server on localhost:${vitePort}`);
      return { existing: true };
    }
  } catch {
    // No reusable server yet.
  }
  const viteBin = path.join(appRoot, "node_modules", "vite", "bin", "vite.js");
  const child = spawn(process.execPath, [viteBin, "--host", "localhost", "--port", String(vitePort)], {
    cwd: appRoot,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
    windowsHide: true,
  });
  child.stdout.on("data", (chunk) => process.stdout.write(`[vite] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[vite] ${chunk}`));
  await waitForHttp(`http://localhost:${vitePort}`, 30000);
  return child;
}

async function stopChild(child) {
  if (!child || child.existing || child.killed) return;
  child.kill();
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    sleep(3000),
  ]);
}

async function runOneMode({
  mode,
  appRoot,
  traceDir,
  profileDir,
  remoteDebuggingPort,
  sidecarTimeoutMs,
  runMs,
}) {
  await fs.mkdir(traceDir, { recursive: true });
  await fs.mkdir(profileDir, { recursive: true });
  const fixture = await seedEpubFixture({ appRoot, profileDir, mode });
  const require = createRequire(import.meta.url);
  const electronPath = require("electron");
  const env = buildTraceEnv({ mode, traceDir });
  const args = buildElectronLaunchArgs({
    appRoot,
    remoteDebuggingPort,
    userDataDir: profileDir,
  });
  console.log(`[moss-nano-live-driver] launching Electron for ${mode}`);
  const child = spawn(electronPath, args, {
    cwd: appRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  child.stdout.on("data", (chunk) => process.stdout.write(`[electron:${mode}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[electron:${mode}] ${chunk}`));

  let client = null;
  try {
    client = await connectToRenderer(remoteDebuggingPort);
    await waitFor(client, "Blurby app body", () => Boolean(document.body && document.body.textContent), 30000);
    await skipOnboardingIfPresent(client);
    await selectNanoViaUi(client);
    const nanoReady = await ensureNanoSidecarReady(client, sidecarTimeoutMs);
    console.log(`[moss-nano-live-driver] Nano ready for ${mode}: ${nanoReady.status?.status}`);
    await ensureDocumentOpen(client, fixture.title);
    await driveMode(client, mode, runMs);
    const tracePath = path.join(traceDir, `${mode}.trace.json`);
    await waitForTrace(tracePath, 15000);
    return { mode, tracePath };
  } finally {
    client?.close();
    child.kill();
    await Promise.race([
      new Promise((resolve) => child.once("exit", resolve)),
      sleep(5000),
    ]);
  }
}

async function waitForTrace(tracePath, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const raw = await fs.readFile(tracePath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.events) && parsed.events.length > 0) return parsed;
    } catch {
      // Keep waiting.
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for trace file ${tracePath}`);
}

export async function runMossNanoElectronLiveDriver({
  modes = MOSS_NANO_ELECTRON_LIVE_DRIVER_MODES,
  appRoot = process.cwd(),
  traceDir = DEFAULT_TRACE_DIR,
  profileDir = DEFAULT_PROFILE_DIR,
  remoteDebuggingPort = DEFAULT_REMOTE_DEBUGGING_PORT,
  vitePort = DEFAULT_VITE_PORT,
  sidecarTimeoutMs = 120000,
  runMs = 7000,
} = {}) {
  for (const mode of modes) assertMode(mode);
  const vite = await startVite({ appRoot, vitePort });
  const results = [];
  try {
    for (const mode of modes) {
      results.push(await runOneMode({
        mode,
        appRoot,
        traceDir,
        profileDir,
        remoteDebuggingPort,
        sidecarTimeoutMs,
        runMs,
      }));
    }
  } finally {
    await stopChild(vite);
  }
  return results;
}

function parseArgs(argv) {
  const args = {
    modes: [...MOSS_NANO_ELECTRON_LIVE_DRIVER_MODES],
    appRoot: process.cwd(),
    traceDir: DEFAULT_TRACE_DIR,
    profileDir: DEFAULT_PROFILE_DIR,
    remoteDebuggingPort: DEFAULT_REMOTE_DEBUGGING_PORT,
    vitePort: DEFAULT_VITE_PORT,
    sidecarTimeoutMs: 120000,
    runMs: 7000,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--help" || token === "-h") args.help = true;
    else if (token === "--mode") args.modes = [argv[++i]];
    else if (token === "--modes") args.modes = String(argv[++i] || "").split(",").map((mode) => mode.trim()).filter(Boolean);
    else if (token === "--trace-dir") args.traceDir = argv[++i] || args.traceDir;
    else if (token === "--profile-dir") args.profileDir = argv[++i] || args.profileDir;
    else if (token === "--app-root") args.appRoot = argv[++i] || args.appRoot;
    else if (token === "--remote-debugging-port") args.remoteDebuggingPort = Number(argv[++i] || args.remoteDebuggingPort);
    else if (token === "--vite-port") args.vitePort = Number(argv[++i] || args.vitePort);
    else if (token === "--sidecar-timeout-ms") args.sidecarTimeoutMs = Number(argv[++i] || args.sidecarTimeoutMs);
    else if (token === "--run-ms") args.runMs = Number(argv[++i] || args.runMs);
  }
  return args;
}

function helpText() {
  return `
MOSS-NANO-13d automated Electron live-capture driver

Runs the real Electron app with BLURBY_TTS_EVAL_TRACE_DIR and a per-mode
BLURBY_TTS_EVAL_TRACE_CONFIG, then drives the visible UI through Nano selection
and reader controls. The resulting trace files are written by production preload
IPC/main-process capture code.

Options:
  --modes <list>                 Comma-separated modes: page,focus,flow,narrate.
  --mode <mode>                  Run a single mode.
  --trace-dir <dir>              Trace output directory.
  --profile-dir <dir>            Isolated Electron profile directory.
  --remote-debugging-port <port> CDP port for Electron.
  --sidecar-timeout-ms <ms>      Time to wait for real Nano sidecar readiness.
  --run-ms <ms>                  Playback dwell time per mode.
`.trim();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(helpText());
    return;
  }
  const results = await runMossNanoElectronLiveDriver(args);
  console.log("[moss-nano-live-driver] traces:");
  for (const result of results) {
    console.log(`  ${result.mode}: ${result.tracePath}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`[moss-nano-live-driver] ${error.stack || error.message}`);
    process.exitCode = 1;
  });
}
