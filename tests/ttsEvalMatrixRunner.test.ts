import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { calculateAggregateMetrics, formatAggregateSummary } from "../scripts/tts_eval_metrics.mjs";
import { getSoakProfile } from "../scripts/tts_eval_profiles.mjs";
import {
  evaluateMossNanoLiveEvidenceGate,
  evaluateMossNanoProductGate,
  executeSoak,
  parseArgs,
  runHarness,
  simulateTrace,
  summarizeTrace,
} from "../scripts/tts_eval_runner.mjs";

const tempDirs: string[] = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "blurby-tts-eval-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  while (tempDirs.length) {
    const dir = tempDirs.pop();
    if (dir) {
      await fs.rm(dir, { recursive: true, force: true });
    }
  }
});

async function createRuntimeWithFiles(baseDir: string) {
  const fixtureDir = path.join(baseDir, "fixtures");
  await fs.mkdir(fixtureDir, { recursive: true });
  const prosePath = path.join(fixtureDir, "prose-basic.txt");
  const pausePath = path.join(fixtureDir, "pause-resume.txt");
  await fs.writeFile(prosePath, "one two three four five", "utf8");
  await fs.writeFile(pausePath, "one two three four five six seven", "utf8");

  const fixtureManifest = {
    fixtures: [
      { id: "prose-basic", title: "Prose", sourceType: "prose", expectedCoverage: [], notes: "", file: "prose-basic.txt" },
      { id: "pause-resume", title: "Pause", sourceType: "pause-resume", expectedCoverage: [], notes: "", file: "pause-resume.txt" },
    ],
  };
  const matrixManifest = {
    scenarios: [
      { id: "smoke-1", fixtureId: "prose-basic", voiceId: "af_bella", requestedRate: 1.0, durationClass: "short", tags: ["smoke"] },
      { id: "smoke-2", fixtureId: "pause-resume", voiceId: "af_bella", requestedRate: 1.1, durationClass: "short", tags: ["smoke", "pause"] },
      { id: "rate-edit-live-response", fixtureId: "prose-basic", voiceId: "af_bella", requestedRate: 1.3, durationClass: "short", tags: ["rate-response"] },
    ],
  };
  const fixtureLookup = new Map([
    [
      "prose-basic",
      {
        id: "prose-basic",
        title: "Prose",
        sourceType: "prose",
        expectedCoverage: [],
        notes: "",
        textPath: prosePath,
      },
    ],
    [
      "pause-resume",
      {
        id: "pause-resume",
        title: "Pause",
        sourceType: "pause-resume",
        expectedCoverage: [],
        notes: "",
        textPath: pausePath,
      },
    ],
  ]);
  return { fixtureManifest, matrixManifest, fixtureLookup };
}

describe("tts eval matrix/soak runner", () => {
  it("parses matrix and soak args", () => {
    const args = parseArgs(["--matrix", "--soak-profile", "short", "--run-id", "nightly"]);
    expect(args.matrix).toBe(true);
    expect(args.soakProfile).toBe("short");
    expect(args.runId).toBe("nightly");
  });

  it("fails matrix mode when no scenarios matched", async () => {
    const outDir = await makeTempDir();
    const runtime = await createRuntimeWithFiles(outDir);
    const args = parseArgs(["--matrix", "--out", outDir]);
    runtime.matrixManifest.scenarios = [];
    await expect(runHarness(args, runtime as any)).rejects.toThrow("No scenarios matched");
  });

  it("writes deterministic artifact names in matrix mode", async () => {
    const outDir = await makeTempDir();
    const runtime = await createRuntimeWithFiles(outDir);
    const args = parseArgs(["--matrix", "--run-id", "deterministic", "--out", outDir]);
    await runHarness(args, runtime as any);
    const first = await fs.readdir(path.join(outDir, "summaries"));
    await runHarness(args, runtime as any);
    const second = await fs.readdir(path.join(outDir, "summaries"));
    expect(first.sort()).toEqual(second.sort());
    expect(first.some((name) => name.includes("deterministic-matrix__smoke-1__it001"))).toBe(true);
  });

  it("keeps experimental Nano product-gate scenarios out of untagged matrix runs", async () => {
    const outDir = await makeTempDir();
    const runtime = await createRuntimeWithFiles(outDir);
    runtime.matrixManifest.scenarios.push({
      id: "moss-nano-11-page-live-book",
      engine: "nano",
      readingMode: "page",
      fixtureId: "prose-basic",
      voiceId: "af_bella",
      requestedRate: 1.0,
      durationClass: "medium",
      tags: ["moss-nano-11", "nano-product-gate", "live-book", "page"],
      nanoGate: {
        selectedEngine: "nano",
        readiness: "required",
        settingsPreviewTruth: true,
        sidecarLifecycle: true,
        cachePrefetchContinuity: true,
        segmentTiming: "segment-following",
        wordTimestamps: false,
        fallback: "explicit-only",
        runtimeReadiness: "documented",
        kokoroAvailable: true,
      },
    } as any);
    const args = parseArgs(["--matrix", "--run-id", "no-nano-drift", "--out", outDir]);
    const { rollup } = await runHarness(args, runtime as any);
    expect(rollup.summaries.map((summary: any) => summary.scenario.id)).toEqual([
      "smoke-1",
      "smoke-2",
      "rate-edit-live-response",
    ]);
  });

  it("runs experimental Nano product-gate scenarios only when explicitly tagged", async () => {
    const outDir = await makeTempDir();
    const runtime = await createRuntimeWithFiles(outDir);
    runtime.matrixManifest.scenarios.push({
      id: "moss-nano-11-page-live-book",
      engine: "nano",
      readingMode: "page",
      fixtureId: "prose-basic",
      voiceId: "af_bella",
      requestedRate: 1.0,
      durationClass: "medium",
      tags: ["moss-nano-11", "nano-product-gate", "live-book", "page"],
      nanoGate: {
        selectedEngine: "nano",
        readiness: "required",
        settingsPreviewTruth: true,
        sidecarLifecycle: true,
        cachePrefetchContinuity: true,
        segmentTiming: "segment-following",
        wordTimestamps: false,
        fallback: "explicit-only",
        runtimeReadiness: "documented",
        kokoroAvailable: true,
      },
    } as any);
    const args = parseArgs(["--matrix", "--tag", "moss-nano-11", "--run-id", "nano-gate", "--out", outDir]);
    const { rollup } = await runHarness(args, runtime as any);
    expect(rollup.summaries.map((summary: any) => summary.scenario.id)).toEqual([
      "moss-nano-11-page-live-book",
    ]);
    expect((rollup as any).mossNanoProductGate.maxDecision).toBe("NANO_EXPERIMENTAL_ONLY");
    expect((rollup as any).mossNanoProductGate.reasons).toContain("Missing selected-Nano live-book matrix mode: focus");
  });

  it("supports interrupted soak runs and returns partial results", async () => {
    const outDir = await makeTempDir();
    const runtime = await createRuntimeWithFiles(outDir);
    const profile = getSoakProfile("short");

    let called = 0;
    const result = await executeSoak({
      args: parseArgs(["--run-id", "interrupt"]),
      profile,
      baseScenarios: runtime.matrixManifest.scenarios,
      fixtureLookup: runtime.fixtureLookup,
      outDir,
      runLabel: "interrupt-soak-short",
      shouldStop: () => {
        called += 1;
        return called > 1;
      },
    });
    expect(result.interrupted).toBe(true);
    expect(result.summaries.length).toBe(1);
  });

  it("computes aggregate p50/p95 and failure counts", () => {
    const aggregate = calculateAggregateMetrics([
      { startLatencyMs: 100, maxDrift: 2, failureClasses: [] },
      { startLatencyMs: 200, maxDrift: 5, failureClasses: ["pause-resume-error"] },
      { startLatencyMs: 300, maxDrift: 8, failureClasses: ["handoff-error"] },
      { startLatencyMs: 400, maxDrift: 12, failureClasses: [] },
    ]);
    expect(aggregate.startupLatency.p50).toBe(250);
    expect(aggregate.startupLatency.p95).toBe(385);
    expect(aggregate.failureCounts.pauseResumeFailures).toBe(1);
    expect(aggregate.failureCounts.handoffFailures).toBe(1);
  });

  it("surfaces rate-response latency in aggregate summaries for release evidence", () => {
    const aggregate = calculateAggregateMetrics([
      { startLatencyMs: 100, maxDrift: 2, failureClasses: [], rateResponseLatencyMs: 95 },
      { startLatencyMs: 200, maxDrift: 5, failureClasses: ["pause-resume-error"], rateResponseLatencyMs: 125 },
      { startLatencyMs: 300, maxDrift: 8, failureClasses: ["handoff-error"], rateResponseLatencyMs: null },
    ] as any);

    expect((aggregate as any).rateResponseLatency).toEqual({
      p50: 110,
      p95: 123.5,
      min: 95,
      max: 125,
    });
    expect(formatAggregateSummary(aggregate)).toContain("Rate response latency p50/p95: 110 / 123.5 ms");
  });

  it("surfaces startup cache mode and opening ramp shape from trace start events", () => {
    const summary = summarizeTrace({
      runId: "startup-parity-run",
      scenarioId: "startup-parity-cached",
      fixture: { id: "prose-basic" },
      events: [
        {
          ts: 1,
          kind: "lifecycle",
          state: "start",
          cacheMode: "cached",
          openingChunkWordCounts: [13, 26, 52, 104, 148],
        },
        { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 180 },
      ],
    } as any);

    expect((summary as any).startupCacheMode).toBe("cached");
    expect((summary as any).openingChunkWordCounts).toEqual([13, 26, 52, 104, 148]);
  });

  it("computes cached-vs-uncached startup parity aggregates and reports ramp matches", () => {
    const aggregate = calculateAggregateMetrics([
      {
        startLatencyMs: 280,
        maxDrift: 2,
        failureClasses: [],
        startupCacheMode: "uncached",
        openingChunkWordCounts: [13, 26, 52, 104, 148],
      },
      {
        startLatencyMs: 180,
        maxDrift: 1,
        failureClasses: [],
        startupCacheMode: "cached",
        openingChunkWordCounts: [13, 26, 52, 104, 148],
      },
    ] as any);

    expect((aggregate as any).startupParity).toEqual({
      cachedStartLatencyMs: 180,
      uncachedStartLatencyMs: 280,
      deltaMs: 100,
      cachedOpeningChunkWordCounts: [13, 26, 52, 104, 148],
      uncachedOpeningChunkWordCounts: [13, 26, 52, 104, 148],
      openingRampMatches: true,
    });
    expect(formatAggregateSummary(aggregate)).toContain("Startup parity cached/uncached: 180 / 280 ms (delta 100 ms)");
    expect(formatAggregateSummary(aggregate)).toContain("Opening ramp parity: match");
  });

  it("marks opening-ramp parity as a mismatch when cached and uncached shapes diverge", () => {
    const aggregate = calculateAggregateMetrics([
      {
        startLatencyMs: 280,
        maxDrift: 2,
        failureClasses: [],
        startupCacheMode: "uncached",
        openingChunkWordCounts: [13, 26, 52, 104, 148],
      },
      {
        startLatencyMs: 180,
        maxDrift: 1,
        failureClasses: [],
        startupCacheMode: "cached",
        openingChunkWordCounts: [13, 26, 52, 148],
      },
    ] as any);

    expect((aggregate as any).startupParity.openingRampMatches).toBe(false);
    expect(formatAggregateSummary(aggregate)).toContain("Opening ramp parity: mismatch");
  });

  it("includes section and cross-book latency fields in per-run summaries", () => {
    const summary = summarizeTrace({
      runId: "latency-run",
      scenarioId: "handoff-queue",
      fixture: { id: "queued-handoff" },
      events: [
        { ts: 1, kind: "lifecycle", state: "start" },
        { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 220 },
        {
          ts: 3,
          kind: "transition",
          transition: "section",
          from: 0,
          to: 1,
          context: "flow-narration-section-handoff",
          latencyMs: 110,
        },
        {
          ts: 4,
          kind: "transition",
          transition: "handoff",
          from: "book-a",
          to: "book-b",
          context: "cross-book-flow-narration",
          latencyMs: 470,
        },
      ],
    });
    expect(summary.sectionHandoffLatencyMs).toBe(110);
    expect(summary.crossBookResumeLatencyMs).toBe(470);
  });

  it("emits section handoff latency in simulated section-transition traces", () => {
    const trace = simulateTrace({
      fixture: {
        id: "section-transition",
        title: "Section",
        sourceType: "transition",
        expectedCoverage: [],
        text: "one two three four five six",
      },
      mode: "flow",
      rate: 1.2,
      runId: "section-run",
      scenarioId: "section-transition",
      runOrdinal: 1,
    });
    const summary = summarizeTrace(trace);
    expect(summary.sectionHandoffLatencyMs).toEqual(expect.any(Number));
  });

  it("emits cross-book resume latency in simulated queued-handoff traces", () => {
    const trace = simulateTrace({
      fixture: {
        id: "queued-handoff",
        title: "Queued",
        sourceType: "transition",
        expectedCoverage: [],
        text: "one two three four five six",
      },
      mode: "flow",
      rate: 1.4,
      runId: "handoff-run",
      scenarioId: "handoff-queue",
      runOrdinal: 1,
    });
    const summary = summarizeTrace(trace);
    expect(summary.crossBookResumeLatencyMs).toEqual(expect.any(Number));
  });

  it("emits same-bucket rate-response latency in simulated rate-edit traces", () => {
    const trace = simulateTrace({
      fixture: {
        id: "prose-basic",
        title: "Rate",
        sourceType: "prose",
        expectedCoverage: [],
        text: "one two three four five six",
      },
      mode: "flow",
      rate: 1.3,
      runId: "rate-run",
      scenarioId: "rate-edit-live-response",
      runOrdinal: 1,
    });
    const summary = summarizeTrace(trace);
    expect(summary.rateResponseLatencyMs).toEqual(expect.any(Number));
  });

  it("emits cached startup metadata in simulated startup-parity traces", () => {
    const trace = simulateTrace({
      fixture: {
        id: "prose-basic",
        title: "Startup",
        sourceType: "prose",
        expectedCoverage: [],
        text: "one two three four five six",
      },
      mode: "flow",
      rate: 1.0,
      runId: "startup-run",
      scenarioId: "startup-parity-cached",
      runOrdinal: 1,
    });

    const startEvent = trace.events.find((event) => event.kind === "lifecycle" && event.state === "start");
    expect((startEvent as any)?.cacheMode).toBe("cached");
    expect((startEvent as any)?.openingChunkWordCounts).toEqual([13, 26, 52, 104, 148]);
  });

  it("includes Nano segment latency, cache, and prefetch fields in per-run summaries", () => {
    const summary = summarizeTrace({
      runId: "nano-continuity-run",
      scenarioId: "nano-continuity",
      fixture: { id: "nano-continuity" },
      events: [
        { ts: 1, kind: "lifecycle", state: "start" },
        { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 180 },
        {
          ts: 3,
          kind: "nano-segment",
          phase: "prefetch-ready",
          startIdx: 4,
          endIdx: 8,
          latencyMs: 70,
          cacheHit: false,
          prefetchReady: true,
          timingTruth: "segment-following",
          wordTimestamps: null,
        },
        {
          ts: 4,
          kind: "nano-segment",
          phase: "playback",
          startIdx: 4,
          endIdx: 8,
          latencyMs: 10,
          cacheHit: true,
          prefetchReady: true,
          timingTruth: "segment-following",
          wordTimestamps: null,
        },
      ],
    } as any);

    expect((summary as any).nanoSegmentLatencyMs).toEqual({
      p50: 40,
      p95: 67,
      min: 10,
      max: 70,
    });
    expect((summary as any).nanoCache.hitRate).toBe(0.5);
    expect((summary as any).nanoPrefetch.ready).toBe(2);
  });

  it("recognizes a full MOSS-NANO-11 selected-Nano product matrix across all reading modes", () => {
    const result = evaluateMossNanoProductGate({
      matrixManifest: {
        scenarios: ["page", "focus", "flow", "narrate"].map((mode) => ({
          id: `moss-nano-11-${mode}`,
          engine: "nano",
          readingMode: mode,
          fixtureId: "prose-basic",
          voiceId: "af_bella",
          requestedRate: 1,
          tags: ["moss-nano-11", "nano-product-gate", mode],
          nanoGate: {
            selectedEngine: "nano",
            readiness: "required",
            settingsPreviewTruth: true,
            sidecarLifecycle: true,
            cachePrefetchContinuity: true,
            segmentTiming: "segment-following",
            wordTimestamps: false,
            fallback: "explicit-only",
            runtimeReadiness: "documented",
            kokoroAvailable: true,
          },
        })),
      },
      evidence: {
        liveBookMatrix: "pass",
        settingsPreviewTruth: "pass",
        sidecarLifecycle: "pass",
        cachePrefetchContinuity: "pass",
        segmentFollowingProgress: "pass",
        fakeWordTimestamps: "absent",
        explicitFallbackOnly: "pass",
        packageRuntimeReadiness: "pass",
        kokoroAvailable: "pass",
      },
    } as any);

    expect(result.requiredModesPresent).toEqual({
      page: true,
      focus: true,
      flow: true,
      narrate: true,
    });
    expect(result.maxDecision).toBe("NANO_DEFAULT_CANDIDATE");
    expect(result.reasons).toEqual([]);
  });

  it("caps MOSS-NANO-11 at experimental-only when any selected-Nano live-book mode is missing", () => {
    const result = evaluateMossNanoProductGate({
      matrixManifest: {
        scenarios: ["page", "focus", "flow"].map((mode) => ({
          id: `moss-nano-11-${mode}`,
          engine: "nano",
          readingMode: mode,
          fixtureId: "prose-basic",
          tags: ["moss-nano-11", "nano-product-gate", mode],
          nanoGate: {
            selectedEngine: "nano",
            readiness: "required",
            settingsPreviewTruth: true,
            sidecarLifecycle: true,
            cachePrefetchContinuity: true,
            segmentTiming: "segment-following",
            wordTimestamps: false,
            fallback: "explicit-only",
            runtimeReadiness: "documented",
            kokoroAvailable: true,
          },
        })),
      },
      evidence: {
        liveBookMatrix: "pass",
        settingsPreviewTruth: "pass",
        sidecarLifecycle: "pass",
        cachePrefetchContinuity: "pass",
        segmentFollowingProgress: "pass",
        fakeWordTimestamps: "absent",
        explicitFallbackOnly: "pass",
        packageRuntimeReadiness: "pass",
        kokoroAvailable: "pass",
      },
    } as any);

    expect(result.maxDecision).toBe("NANO_EXPERIMENTAL_ONLY");
    expect(result.reasons).toContain("Missing selected-Nano live-book matrix mode: narrate");
  });

  it("keeps the canonical matrix manifest eligible for the MOSS-NANO-11 four-mode gate", async () => {
    const matrixManifest = JSON.parse(
      await fs.readFile(path.resolve("tests/fixtures/narration/matrix.manifest.json"), "utf8"),
    );
    const result = evaluateMossNanoProductGate({
      matrixManifest,
      evidence: {
        liveBookMatrix: "pass",
        settingsPreviewTruth: "pass",
        sidecarLifecycle: "pass",
        cachePrefetchContinuity: "pass",
        segmentFollowingProgress: "pass",
        fakeWordTimestamps: "absent",
        explicitFallbackOnly: "pass",
        packageRuntimeReadiness: "pass",
        kokoroAvailable: "pass",
      },
    } as any);

    expect(result.requiredModesPresent).toEqual({
      page: true,
      focus: true,
      flow: true,
      narrate: true,
    });
    expect(result.scenarioCount).toBe(4);
  });

  it("keeps the canonical matrix manifest eligible for the MOSS-NANO-12 four-mode live evidence gate", async () => {
    const matrixManifest = JSON.parse(
      await fs.readFile(path.resolve("tests/fixtures/narration/matrix.manifest.json"), "utf8"),
    );
    const result = evaluateMossNanoLiveEvidenceGate({
      matrixManifest,
      liveEvidence: { modes: {} },
    } as any);

    expect(result.requiredModesPresent).toEqual({
      page: true,
      focus: true,
      flow: true,
      narrate: true,
    });
    expect(result.scenarioCount).toBe(4);
    expect(result.decision).toBe("NANO_EXPERIMENTAL_ONLY");
  });

  it("allows MOSS-NANO-12 recommended opt-in only with complete passing live evidence", () => {
    const evidenceByMode = Object.fromEntries(
      ["page", "focus", "flow", "narrate"].map((mode) => [
        mode,
        {
          live: true,
          nanoSelected: true,
          startable: true,
          segmentProgressUnderstandable: true,
          noUnderlineRace: true,
          cachePrefetchContinuity: true,
          noStalePlayback: true,
          pauseResumeSameMode: true,
          modeSwitchAnchorPreserved: true,
          explicitFallback: true,
          sidecarLifecycleStable: true,
        },
      ]),
    );

    const result = evaluateMossNanoLiveEvidenceGate({
      matrixManifest: {
        scenarios: ["page", "focus", "flow", "narrate"].map((mode) => ({
          id: `moss-nano-12-${mode}`,
          engine: "nano",
          readingMode: mode,
          fixtureId: "prose-basic",
          tags: ["moss-nano-12", "nano-live-evidence", mode],
          nanoGate: { selectedEngine: "nano", readiness: "required" },
        })),
      },
      liveEvidence: { modes: evidenceByMode },
    } as any);

    expect(result.decision).toBe("NANO_RECOMMENDED_OPT_IN");
    expect(result.reasons).toEqual([]);
  });

  it("caps MOSS-NANO-12 at experimental-only when a live mode is missing", () => {
    const result = evaluateMossNanoLiveEvidenceGate({
      matrixManifest: {
        scenarios: ["page", "focus", "flow"].map((mode) => ({
          id: `moss-nano-12-${mode}`,
          engine: "nano",
          readingMode: mode,
          fixtureId: "prose-basic",
          tags: ["moss-nano-12", "nano-live-evidence", mode],
          nanoGate: { selectedEngine: "nano", readiness: "required" },
        })),
      },
      liveEvidence: { modes: {} },
    } as any);

    expect(result.decision).toBe("NANO_EXPERIMENTAL_ONLY");
    expect(result.reasons).toContain("Missing selected-Nano live evidence mode: narrate");
  });

  it("pauses MOSS-NANO-12 productization when segment-following progress is not understandable", () => {
    const evidenceByMode = Object.fromEntries(
      ["page", "focus", "flow", "narrate"].map((mode) => [
        mode,
        {
          live: true,
          nanoSelected: true,
          startable: true,
          segmentProgressUnderstandable: mode !== "focus",
          noUnderlineRace: true,
          cachePrefetchContinuity: true,
          noStalePlayback: true,
          pauseResumeSameMode: true,
          modeSwitchAnchorPreserved: true,
          explicitFallback: true,
          sidecarLifecycleStable: true,
        },
      ]),
    );

    const result = evaluateMossNanoLiveEvidenceGate({
      matrixManifest: {
        scenarios: ["page", "focus", "flow", "narrate"].map((mode) => ({
          id: `moss-nano-12-${mode}`,
          engine: "nano",
          readingMode: mode,
          fixtureId: "prose-basic",
          tags: ["moss-nano-12", "nano-live-evidence", mode],
          nanoGate: { selectedEngine: "nano", readiness: "required" },
        })),
      },
      liveEvidence: { modes: evidenceByMode },
    } as any);

    expect(result.decision).toBe("PAUSE_NANO_PRODUCTIZATION");
    expect(result.reasons).toContain("Segment-following progress was not understandable in focus");
  });

  it("writes MOSS-NANO-12 live evidence gate state into explicitly tagged rollups", async () => {
    const outDir = await makeTempDir();
    const runtime = await createRuntimeWithFiles(outDir);
    runtime.matrixManifest.scenarios.push({
      id: "moss-nano-12-page-live-evidence",
      engine: "nano",
      readingMode: "page",
      fixtureId: "prose-basic",
      voiceId: "af_bella",
      requestedRate: 1.0,
      durationClass: "medium",
      tags: ["moss-nano-12", "nano-live-evidence", "page"],
      nanoGate: { selectedEngine: "nano", readiness: "required" },
    } as any);

    const args = parseArgs(["--matrix", "--tag", "moss-nano-12", "--run-id", "nano12", "--out", outDir]);
    const { rollup } = await runHarness(args, runtime as any);

    expect((rollup as any).mossNanoLiveEvidenceGate.decision).toBe("NANO_EXPERIMENTAL_ONLY");
    expect((rollup as any).mossNanoLiveEvidenceGate.reasons).toContain("Missing selected-Nano live evidence mode: focus");
  });

  it("loads MOSS-NANO-12 live evidence from an explicit evidence artifact", async () => {
    const outDir = await makeTempDir();
    const evidencePath = path.join(outDir, "nano12-live-evidence.json");
    const runtime = await createRuntimeWithFiles(outDir);
    runtime.matrixManifest.scenarios.push(
      ...["page", "focus", "flow", "narrate"].map((mode) => ({
        id: `moss-nano-12-${mode}-live-evidence`,
        engine: "nano",
        readingMode: mode,
        fixtureId: "prose-basic",
        voiceId: "af_bella",
        requestedRate: 1.0,
        durationClass: "medium",
        tags: ["moss-nano-12", "nano-live-evidence", mode],
        nanoGate: { selectedEngine: "nano", readiness: "required" },
      })),
    );
    const passingModeEvidence = {
      live: true,
      nanoSelected: true,
      startable: true,
      segmentProgressUnderstandable: true,
      noUnderlineRace: true,
      cachePrefetchContinuity: true,
      noStalePlayback: true,
      pauseResumeSameMode: true,
      modeSwitchAnchorPreserved: true,
      explicitFallback: true,
      sidecarLifecycleStable: true,
    };
    await fs.writeFile(
      evidencePath,
      JSON.stringify({
        modes: {
          page: passingModeEvidence,
          focus: passingModeEvidence,
          flow: passingModeEvidence,
          narrate: passingModeEvidence,
        },
      }),
      "utf8",
    );

    const args = parseArgs([
      "--matrix",
      "--tag",
      "moss-nano-12",
      "--nano-live-evidence",
      evidencePath,
      "--run-id",
      "nano12-passing",
      "--out",
      outDir,
    ]);
    const { rollup } = await runHarness(args, runtime as any);

    expect((rollup as any).mossNanoLiveEvidenceGate.decision).toBe("NANO_RECOMMENDED_OPT_IN");
    expect((rollup as any).mossNanoLiveEvidenceGate.reasons).toEqual([]);
  });
});
