import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildMossNanoLiveEvidenceArtifact } from "./tts_eval_runner.mjs";

export const MOSS_NANO_LIVE_CAPTURE_MODES = Object.freeze(["page", "focus", "flow", "narrate"]);
const DEFAULT_OUT_DIR = path.resolve("artifacts/tts-eval/moss-nano-13d-live-capture");
const DEFAULT_EVIDENCE_NAME = "moss-nano-13d-live-evidence.json";
const EVIDENCE_SOURCE = "real-app-selected-nano";

function isObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function eventList(trace) {
  return Array.isArray(trace?.events) ? trace.events : [];
}

function observedEngineSelection(trace) {
  return eventList(trace).find(
    (event) => event.kind === "engine-selection" && event.selectedEngine === "nano",
  ) ?? null;
}

function observedExplicitFallbackPolicy(trace) {
  return eventList(trace).find(
    (event) => event.kind === "fallback-policy" && event.policy === "explicit-only",
  ) ?? null;
}

function runtimeFromTrace(trace) {
  const runtimeEvent = eventList(trace).find(
    (event) => event.kind === "nano-runtime" || event.kind === "nano-synthesis",
  );
  return {
    backend: runtimeEvent?.backend ?? trace?.runtime?.backend ?? null,
    modelVariant: runtimeEvent?.modelVariant ?? trace?.runtime?.modelVariant ?? null,
    syntheticAudio: runtimeEvent?.syntheticAudio ?? trace?.runtime?.syntheticAudio ?? null,
  };
}

function hasEvent(trace, predicate) {
  return eventList(trace).some(predicate);
}

function observedPauseResumeSameMode(trace, mode) {
  const lifecycle = eventList(trace).filter((event) => event.kind === "lifecycle");
  const pauses = lifecycle.filter((event) => event.state === "pause");
  const resumes = lifecycle.filter((event) => event.state === "resume");
  if (!pauses.length || pauses.length !== resumes.length) return false;
  return pauses.every((pause, index) => {
    const resume = resumes[index];
    const pauseMode = pause.mode ?? mode;
    const resumeMode = resume?.mode ?? mode;
    return pauseMode === mode && resumeMode === mode;
  });
}

function maxCursorDrift(trace) {
  const words = eventList(trace).filter((event) => event.kind === "word");
  const flow = eventList(trace).filter((event) => event.kind === "flow-position");
  return flow.reduce((max, flowEvent) => {
    const nearby = words
      .filter((wordEvent) => Math.abs((wordEvent.ts ?? 0) - (flowEvent.ts ?? 0)) <= 300)
      .map((wordEvent) => Math.abs((wordEvent.wordIndex ?? 0) - (flowEvent.wordIndex ?? 0)));
    return Math.max(max, nearby.length ? Math.max(...nearby) : 0);
  }, 0);
}

function hasSegmentFollowingOnly(trace) {
  const segments = eventList(trace).filter((event) => event.kind === "nano-segment");
  return segments.length > 0
    && segments.every((event) => event.timingTruth === "segment-following" && event.wordTimestamps === null);
}

export function validateMossNanoLiveCaptureTrace(mode, trace) {
  const issues = [];
  if (!MOSS_NANO_LIVE_CAPTURE_MODES.includes(mode)) issues.push(`unsupported mode: ${mode}`);
  if (!isObject(trace)) return { valid: false, issues: ["trace must be an object"] };
  if (trace.schemaVersion !== "1.0") issues.push("trace schemaVersion must be 1.0");
  if (trace.evidenceSource !== EVIDENCE_SOURCE && trace.provenance?.source !== EVIDENCE_SOURCE) {
    issues.push("trace source must be real-app-selected-nano");
  }
  if (!observedEngineSelection(trace)) issues.push("missing observed engine-selection selectedEngine nano");

  const runtime = runtimeFromTrace(trace);
  if (runtime.syntheticAudio !== false) issues.push("runtime.syntheticAudio must be false");
  const runtimeAssertions = [
    trace.runtime?.syntheticAudio,
    ...eventList(trace)
      .filter((event) => event.kind === "nano-runtime" || event.kind === "nano-synthesis")
      .map((event) => event.syntheticAudio),
  ].filter((value) => value !== undefined && value !== null);
  if (!runtimeAssertions.length || runtimeAssertions.some((value) => value !== false)) {
    if (!issues.includes("runtime.syntheticAudio must be false")) {
      issues.push("runtime.syntheticAudio must be false");
    }
  }

  const events = eventList(trace);
  if (!events.length) issues.push("trace must include events");
  if (!hasEvent(trace, (event) => event.kind === "lifecycle" && event.state === "start")) {
    issues.push("missing observed startable lifecycle:start");
  }
  if (!hasEvent(trace, (event) => event.kind === "lifecycle" && event.state === "first-audio")) {
    issues.push("missing observed startable lifecycle:first-audio");
  }
  if (!hasSegmentFollowingOnly(trace)) {
    issues.push("nano-segment timing must be segment-following with wordTimestamps null");
  }
  if (!hasEvent(trace, (event) => event.kind === "word" && event.source === "audio")) {
    issues.push("missing observed segment progress audio word event");
  }
  if (!hasEvent(trace, (event) => event.kind === "flow-position")) {
    issues.push("missing observed noUnderlineRace flow-position event");
  } else if (maxCursorDrift(trace) > 12) {
    issues.push("observed underline race/cursor drift");
  }
  if (!hasEvent(trace, (event) => event.kind === "nano-segment" && event.phase === "prefetch-ready")) {
    issues.push("missing observed cache/prefetch continuity");
  }
  if (!hasEvent(trace, (event) => event.kind === "nano-segment" && event.phase === "playback")) {
    issues.push("missing observed Nano playback segment");
  }
  if (hasEvent(trace, (event) => event.kind === "nano-segment" && ["prefetch-stale", "prefetch-cancelled"].includes(event.phase))) {
    issues.push("observed stale or cancelled playback/prefetch");
  }
  if (!observedPauseResumeSameMode(trace, mode)) issues.push("missing observed pause/resume in same mode");
  if (!hasEvent(trace, (event) =>
    event.kind === "transition"
    && (event.context === "mode-switch-anchor-preserved" || event.transition === "handoff")
  )) {
    issues.push("missing observed mode-switch anchor preservation");
  }
  if (!observedExplicitFallbackPolicy(trace)) {
    issues.push("missing observed explicit fallback policy");
  }
  if (!isObject(trace.recycleObservations)) issues.push("missing recycleObservations provenance");

  return { valid: issues.length === 0, issues };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(path.resolve(filePath), "utf8"));
}

async function writeJsonAtomic(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tmpPath, filePath);
}

export async function collectMossNanoLiveCapture({
  appCommit,
  tracePaths,
  evidencePath = path.join(DEFAULT_OUT_DIR, DEFAULT_EVIDENCE_NAME),
  generatedAt = new Date().toISOString(),
} = {}) {
  if (!appCommit) throw new Error("appCommit is required.");
  if (!isObject(tracePaths)) throw new Error("tracePaths are required.");

  const modeConfigs = {};
  for (const mode of MOSS_NANO_LIVE_CAPTURE_MODES) {
    const tracePath = tracePaths[mode];
    if (!tracePath) throw new Error(`${mode} trace path is required.`);
    const trace = await readJson(tracePath);
    const validation = validateMossNanoLiveCaptureTrace(mode, trace);
    if (!validation.valid) {
      throw new Error(`${mode} live trace failed validation: ${validation.issues.join("; ")}`);
    }
    modeConfigs[mode] = {
      runArtifactPath: path.resolve(tracePath),
      scenarioId: trace.scenarioId ?? `moss-nano-13c-${mode}-live-evidence`,
      recordedAt: trace.createdAt ?? generatedAt,
      segmentProgressUnderstandable: true,
    };
  }

  const evidence = await buildMossNanoLiveEvidenceArtifact({
    appCommit,
    modes: modeConfigs,
    generatedAt,
    generatedBy: "scripts/moss_nano_live_capture.mjs",
  });
  await writeJsonAtomic(path.resolve(evidencePath), evidence);
  return {
    evidence,
    evidencePath,
    tracePaths,
  };
}

function parseArgs(argv) {
  const args = {
    appCommit: process.env.GITHUB_SHA || process.env.APP_COMMIT || "unknown",
    traceDir: path.join(DEFAULT_OUT_DIR, "traces"),
    evidencePath: path.join(DEFAULT_OUT_DIR, DEFAULT_EVIDENCE_NAME),
    tracePaths: {},
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }
    if (token === "--app-commit") {
      args.appCommit = argv[++i] || args.appCommit;
      continue;
    }
    if (token === "--trace-dir") {
      args.traceDir = argv[++i] || args.traceDir;
      continue;
    }
    if (token === "--out") {
      args.evidencePath = argv[++i] || args.evidencePath;
      continue;
    }
    if (token === "--trace") {
      const value = argv[++i] || "";
      const separator = value.indexOf("=");
      if (separator > 0) args.tracePaths[value.slice(0, separator)] = value.slice(separator + 1);
    }
  }
  for (const mode of MOSS_NANO_LIVE_CAPTURE_MODES) {
    if (!args.tracePaths[mode]) {
      args.tracePaths[mode] = path.join(args.traceDir, `${mode}.trace.json`);
    }
  }
  return args;
}

function helpText() {
  return `
MOSS-NANO-13d live capture producer

Persist real app traces by launching Blurby with:
  $env:BLURBY_TTS_EVAL_TRACE_DIR="${path.join("artifacts", "tts-eval", "moss-nano-13d-live-capture", "traces")}"
  $env:BLURBY_TTS_EVAL_TRACE_CONFIG='{"mode":"flow","runId":"moss-nano-13d-flow","scenarioId":"moss-nano-13c-flow-live-evidence","fixture":{"id":"live-flow","title":"Live Flow","sourceType":"prose","expectedCoverage":[]}}'
  npm start

Drive the real app with Nano selected for each mode, then collect:
  node scripts/moss_nano_live_capture.mjs --trace-dir artifacts/tts-eval/moss-nano-13d-live-capture/traces --out artifacts/tts-eval/moss-nano-13d-live-capture/${DEFAULT_EVIDENCE_NAME} --app-commit <commit>

Options:
  --trace-dir <dir>       Directory containing page/focus/flow/narrate .trace.json files.
  --trace <mode=path>     Override one trace path. Repeat for each mode if needed.
  --out <path>            v2 evidence JSON output path.
  --app-commit <sha>      App commit provenance.
`.trim();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(helpText());
    return;
  }
  const result = await collectMossNanoLiveCapture({
    appCommit: args.appCommit,
    tracePaths: args.tracePaths,
    evidencePath: args.evidencePath,
  });
  console.log(`MOSS-NANO-13d live evidence written: ${result.evidencePath}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`[moss_nano_live_capture] ${error.message}`);
    process.exitCode = 1;
  });
}
