import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { calculateAggregateMetrics } from "../scripts/tts_eval_metrics.mjs";
import { getSoakProfile } from "../scripts/tts_eval_profiles.mjs";
import { executeSoak, parseArgs, runHarness, simulateTrace, summarizeTrace } from "../scripts/tts_eval_runner.mjs";

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
});
