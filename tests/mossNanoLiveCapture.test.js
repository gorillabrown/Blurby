import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  MOSS_NANO_LIVE_CAPTURE_MODES,
  collectMossNanoLiveCapture,
  validateMossNanoLiveCaptureTrace,
} from "../scripts/moss_nano_live_capture.mjs";

const tempDirs = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "blurby-moss-nano-live-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  while (tempDirs.length) {
    const dir = tempDirs.pop();
    await fs.rm(dir, { recursive: true, force: true });
  }
});

function completeTrace(mode, overrides = {}) {
  const now = Date.now();
  return {
    schemaVersion: "1.0",
    evidenceSource: "real-app-selected-nano",
    selectedEngine: "nano",
    explicitFallback: true,
    runId: `moss-nano-13d-${mode}`,
    scenarioId: `moss-nano-13c-${mode}-live-evidence`,
    createdAt: new Date(now).toISOString(),
    fixture: { id: `live-${mode}`, title: `Live ${mode}`, sourceType: "prose", expectedCoverage: [] },
    runtime: { backend: "moss-nano-onnx", modelVariant: "moss-tts-nano-onnx", syntheticAudio: false },
    recycleObservations: { restarts: 0, cleanShutdowns: 1 },
    events: [
      { ts: now, kind: "engine-selection", selectedEngine: "nano", source: "app-settings" },
      { ts: now, kind: "fallback-policy", policy: "explicit-only", selectedEngine: "nano" },
      { ts: now + 1, kind: "lifecycle", state: "start", wordIndex: 0, mode, isNarrating: true },
      { ts: now + 2, kind: "nano-runtime", backend: "moss-nano-onnx", modelVariant: "moss-tts-nano-onnx", syntheticAudio: false },
      {
        ts: now + 3,
        kind: "nano-segment",
        phase: "request",
        startIdx: 0,
        endIdx: 4,
        cacheHit: false,
        prefetchReady: false,
        timingTruth: "segment-following",
        wordTimestamps: null,
      },
      {
        ts: now + 4,
        kind: "nano-segment",
        phase: "prefetch-start",
        startIdx: 4,
        endIdx: 8,
        cacheHit: false,
        prefetchReady: false,
        timingTruth: "segment-following",
        wordTimestamps: null,
        reason: "next-segment",
      },
      {
        ts: now + 5,
        kind: "nano-segment",
        phase: "prefetch-ready",
        startIdx: 4,
        endIdx: 8,
        latencyMs: 120,
        cacheHit: false,
        prefetchReady: true,
        timingTruth: "segment-following",
        wordTimestamps: null,
        reason: "next-segment",
      },
      {
        ts: now + 6,
        kind: "nano-segment",
        phase: "playback",
        startIdx: 0,
        endIdx: 4,
        latencyMs: 210,
        cacheHit: false,
        prefetchReady: false,
        timingTruth: "segment-following",
        wordTimestamps: null,
      },
      { ts: now + 7, kind: "lifecycle", state: "first-audio", wordIndex: 0, latencyMs: 207 },
      { ts: now + 8, kind: "word", source: "audio", wordIndex: 0 },
      { ts: now + 9, kind: "flow-position", lineIndex: 0, totalLines: 1, wordIndex: 0, totalWords: 4, bookPct: 0 },
      { ts: now + 10, kind: "lifecycle", state: "pause", wordIndex: 1, mode, isNarrating: true },
      { ts: now + 11, kind: "lifecycle", state: "resume", wordIndex: 1, mode, isNarrating: true },
      { ts: now + 12, kind: "transition", transition: "handoff", from: mode, to: mode, context: "mode-switch-anchor-preserved", latencyMs: 0 },
      { ts: now + 13, kind: "lifecycle", state: "stop", wordIndex: 4, mode, isNarrating: false },
    ],
    ...overrides,
  };
}

async function writeTraceSet(outDir, traceFactory = (mode) => completeTrace(mode)) {
  const tracesDir = path.join(outDir, "traces");
  await fs.mkdir(tracesDir, { recursive: true });
  const tracePaths = {};
  for (const mode of MOSS_NANO_LIVE_CAPTURE_MODES) {
    const tracePath = path.join(tracesDir, `${mode}.trace.json`);
    await fs.writeFile(tracePath, JSON.stringify(traceFactory(mode), null, 2), "utf8");
    tracePaths[mode] = tracePath;
  }
  return tracePaths;
}

describe("MOSS Nano 13d live capture producer", () => {
  it("accepts a complete real app-selected Nano trace", () => {
    const result = validateMossNanoLiveCaptureTrace("flow", completeTrace("flow"));

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("fails closed when a required live observation was not recorded", () => {
    const trace = completeTrace("flow", {
      events: completeTrace("flow").events.filter(
        (event) => !(event.kind === "nano-segment" && event.phase === "prefetch-ready"),
      ),
    });

    const result = validateMossNanoLiveCaptureTrace("flow", trace);

    expect(result.valid).toBe(false);
    expect(result.issues).toContain("missing observed cache/prefetch continuity");
  });

  it("does not accept top-level selectedEngine without an observed engine-selection event", () => {
    const baseTrace = completeTrace("flow");
    const trace = completeTrace("flow", {
      events: [
        ...baseTrace.events.filter((event) => event.kind !== "engine-selection"),
        { ts: Date.now() + 20, kind: "fallback-policy", policy: "explicit-only" },
      ],
    });

    const result = validateMossNanoLiveCaptureTrace("flow", trace);

    expect(result.valid).toBe(false);
    expect(result.issues).toContain("missing observed engine-selection selectedEngine nano");
  });

  it("does not accept top-level explicitFallback without an observed fallback-policy event", () => {
    const baseTrace = completeTrace("flow");
    const result = validateMossNanoLiveCaptureTrace("flow", completeTrace("flow", {
      events: baseTrace.events.filter((event) => event.kind !== "fallback-policy"),
    }));

    expect(result.valid).toBe(false);
    expect(result.issues).toContain("missing observed explicit fallback policy");
  });

  it("fails closed when runtime truth does not prove real Nano audio", () => {
    const result = validateMossNanoLiveCaptureTrace("flow", completeTrace("flow", {
      runtime: { backend: "moss-nano-onnx", syntheticAudio: true },
    }));

    expect(result.valid).toBe(false);
    expect(result.issues).toContain("runtime.syntheticAudio must be false");
  });

  it("writes trace JSON and v2 evidence only when every mode has valid real traces", async () => {
    const outDir = await makeTempDir();
    const tracePaths = await writeTraceSet(outDir);
    const evidencePath = path.join(outDir, "moss-nano-13d-live-evidence.json");

    const result = await collectMossNanoLiveCapture({
      appCommit: "abc1234",
      tracePaths,
      evidencePath,
    });

    expect(result.evidencePath).toBe(evidencePath);
    expect(result.tracePaths).toEqual(tracePaths);

    const evidence = JSON.parse(await fs.readFile(evidencePath, "utf8"));
    expect(evidence.schemaVersion).toBe("moss-nano-live-evidence.v2");
    expect(evidence.modes.page.traceEventCount).toBe(15);
    expect(evidence.modes.page.traceEventCount).toBe(completeTrace("page").events.length);
    expect(evidence.modes.page.nanoSelected).toBe(true);
    expect(evidence.modes.page.runtime.syntheticAudio).toBe(false);
  });

  it("does not write positive evidence when any mode is missing required events", async () => {
    const outDir = await makeTempDir();
    const tracePaths = await writeTraceSet(outDir, (mode) => mode === "focus"
      ? completeTrace(mode, {
        events: completeTrace(mode).events.filter(
          (event) => !(event.kind === "lifecycle" && event.state === "resume"),
        ),
      })
      : completeTrace(mode));
    const evidencePath = path.join(outDir, "moss-nano-13d-live-evidence.json");

    await expect(collectMossNanoLiveCapture({
      appCommit: "abc1234",
      tracePaths,
      evidencePath,
    })).rejects.toThrow("focus live trace failed validation");
    await expect(fs.access(evidencePath)).rejects.toThrow();
  });
});
