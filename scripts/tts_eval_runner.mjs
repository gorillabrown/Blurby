import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { calculateAggregateMetrics, formatAggregateSummary } from "./tts_eval_metrics.mjs";
import { getSoakProfile } from "./tts_eval_profiles.mjs";
import { formatGateReport, runGateEvaluation } from "./tts_eval_gate.mjs";

const DEFAULT_FIXTURE_MANIFEST = "tests/fixtures/narration/manifest.json";
const DEFAULT_MATRIX_MANIFEST = "tests/fixtures/narration/matrix.manifest.json";
const DEFAULT_GATES_PATH = "docs/testing/tts_quality_gates.v1.json";

export function parseArgs(argv) {
  const args = {
    fixtures: [],
    fixtureManifestPath: DEFAULT_FIXTURE_MANIFEST,
    matrixManifestPath: DEFAULT_MATRIX_MANIFEST,
    outDir: "artifacts/tts-eval",
    mode: "flow",
    rate: 1,
    runId: "run",
    matrix: false,
    soakProfile: null,
    checkpointEvery: null,
    tags: [],
    gates: false,
    streaming: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--fixture" || token === "--fixtures") {
      args.fixtures = argv[i + 1] ? argv[i + 1].split(",").map((s) => s.trim()).filter(Boolean) : [];
      i += 1;
      continue;
    }
    if (token === "--fixture-manifest") {
      args.fixtureManifestPath = argv[i + 1] || args.fixtureManifestPath;
      i += 1;
      continue;
    }
    if (token === "--matrix-manifest") {
      args.matrixManifestPath = argv[i + 1] || args.matrixManifestPath;
      i += 1;
      continue;
    }
    if (token === "--out") {
      args.outDir = argv[i + 1] || args.outDir;
      i += 1;
      continue;
    }
    if (token === "--mode") {
      args.mode = argv[i + 1] || args.mode;
      i += 1;
      continue;
    }
    if (token === "--rate") {
      args.rate = Number(argv[i + 1] || "1");
      i += 1;
      continue;
    }
    if (token === "--run-id") {
      args.runId = argv[i + 1] || args.runId;
      i += 1;
      continue;
    }
    if (token === "--matrix") {
      args.matrix = true;
      continue;
    }
    if (token === "--soak-profile") {
      args.soakProfile = argv[i + 1] || "short";
      i += 1;
      continue;
    }
    if (token === "--checkpoint-every") {
      args.checkpointEvery = Number(argv[i + 1] || "0") || null;
      i += 1;
      continue;
    }
    if (token === "--tag" || token === "--tags") {
      args.tags = argv[i + 1] ? argv[i + 1].split(",").map((s) => s.trim()).filter(Boolean) : [];
      i += 1;
      continue;
    }
    if (token === "--gates") {
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args.gates = next;
        i += 1;
      } else {
        args.gates = true;
      }
      continue;
    }
    if (token === "--streaming") {
      args.streaming = true;
      continue;
    }
  }

  return args;
}

export function summarizeTrace(trace) {
  const lifecycle = trace.events.filter((e) => e.kind === "lifecycle");
  const words = trace.events.filter((e) => e.kind === "word");
  const flow = trace.events.filter((e) => e.kind === "flow-position");
  const transitions = trace.events.filter((e) => e.kind === "transition");
  const start = lifecycle.find((e) => e.state === "start");
  const firstAudio = lifecycle.find((e) => e.state === "first-audio");
  const pauses = lifecycle.filter((e) => e.state === "pause").length;
  const resumes = lifecycle.filter((e) => e.state === "resume").length;

  const transitionCounts = {
    section: transitions.filter((e) => e.transition === "section").length,
    chapter: transitions.filter((e) => e.transition === "chapter").length,
    book: transitions.filter((e) => e.transition === "book").length,
    handoff: transitions.filter((e) => e.transition === "handoff").length,
  };
  const sectionHandoffLatencyMs =
    transitions.find((e) => e.transition === "section" && typeof e.latencyMs === "number")?.latencyMs ?? null;
  const crossBookResumeLatencyMs =
    transitions.find(
      (e) =>
        e.transition === "handoff"
        && typeof e.latencyMs === "number"
        && e.context?.includes("cross-book"),
    )?.latencyMs
    ?? transitions.find(
      (e) =>
        e.transition === "book"
        && typeof e.latencyMs === "number"
        && e.context?.includes("cross-book"),
    )?.latencyMs
    ?? null;
  const rateResponseLatencyMs =
    transitions.find(
      (e) =>
        e.transition === "rate-response"
        && typeof e.latencyMs === "number"
        && e.context?.includes("same-bucket"),
    )?.latencyMs
    ?? null;

  const failureClasses = [];
  const startLatencyMs =
    typeof firstAudio?.latencyMs === "number"
      ? firstAudio.latencyMs
      : start && firstAudio
        ? Math.max(0, firstAudio.ts - start.ts)
        : null;
  const warmPreviewLatencyMs =
    start && typeof start.previewLatencyMs === "number"
      ? start.previewLatencyMs
      : null;
  const warmFirstAudioLatencyMs = startLatencyMs;
  const startupSpikeThresholdMs =
    start && typeof start.spikeWarningThresholdMs === "number"
      ? start.spikeWarningThresholdMs
      : null;
  const startupSpikeCount = startupSpikeThresholdMs == null
    ? 0
    : [warmPreviewLatencyMs, warmFirstAudioLatencyMs].filter(
        (latency) => typeof latency === "number" && latency > startupSpikeThresholdMs,
      ).length;
  const startupCacheMode = start?.cacheMode ?? null;
  const openingChunkWordCounts = Array.isArray(start?.openingChunkWordCounts)
    ? [...start.openingChunkWordCounts]
    : [];

  if (startLatencyMs != null && startLatencyMs > 2500) failureClasses.push("start-latency");
  if (pauses !== resumes) failureClasses.push("pause-resume-error");
  if (transitionCounts.book > 0 && transitionCounts.handoff === 0) failureClasses.push("handoff-error");

  const maxDrift = flow.reduce((max, f) => {
    const nearby = words
      .filter((w) => Math.abs(w.ts - f.ts) <= 300)
      .map((w) => Math.abs(w.wordIndex - f.wordIndex));
    const drift = nearby.length ? Math.max(...nearby) : 0;
    return Math.max(max, drift);
  }, 0);
  if (maxDrift > 12) failureClasses.push("cursor-highlight-drift");

  return {
    fixtureId: trace.fixture.id,
    scenarioId: trace.scenarioId || null,
    runId: trace.runId,
    startLatencyMs,
    warmPreviewLatencyMs,
    warmFirstAudioLatencyMs,
    startupSpikeThresholdMs,
    startupSpikeCount,
    maxDrift,
    wordEventCount: words.length,
    flowEventCount: flow.length,
    startupCacheMode,
    openingChunkWordCounts,
    pauseResumeIntegrity: { pauses, resumes, balanced: pauses === resumes },
    transitionCounts,
    sectionHandoffLatencyMs,
    crossBookResumeLatencyMs,
    rateResponseLatencyMs,
    failureClasses,
  };
}

export function simulateTrace({ fixture, mode, rate, runId, scenarioId, runOrdinal }) {
  const words = fixture.text.split(/\s+/).filter(Boolean);
  const now = 1_700_000_000_000 + runOrdinal * 10_000;
  const baseStep = Math.max(40, Math.round(160 / Math.max(0.5, rate)));
  const startupCacheMode =
    scenarioId?.includes("startup-parity-cached")
      ? "cached"
      : scenarioId?.includes("startup-parity-uncached")
        ? "uncached"
        : null;
  const openingChunkWordCounts = startupCacheMode ? [13, 26, 52, 104, 148] : null;
  const spikeWarningThresholdMs = 3000;
  const warmPreviewLatencyMs = startupCacheMode === "cached"
    ? 820 + Math.min(180, words.length * 12)
    : startupCacheMode === "uncached"
      ? 980 + Math.min(200, words.length * 14)
      : 900 + Math.min(220, words.length * 13);
  const startLatencyMs = startupCacheMode === "cached"
    ? 180 + Math.min(200, words.length * 5)
    : startupCacheMode === "uncached"
      ? 280 + Math.min(240, words.length * 6)
      : 220 + Math.min(1400, words.length * 7);
  const sectionHandoffLatencyMs = 90 + Math.min(220, Math.max(1, words.length) * 6);
  const crossBookResumeLatencyMs = 240 + Math.min(480, Math.max(1, words.length) * 9);
  const rateResponseLatencyMs = 70 + Math.min(140, Math.max(1, words.length) * 4);
  const events = [];

  events.push({
    ts: now,
    kind: "lifecycle",
    state: "start",
    wordIndex: 0,
    mode,
    isNarrating: true,
    previewLatencyMs: warmPreviewLatencyMs,
    spikeWarningThresholdMs,
    spikeWarning: warmPreviewLatencyMs > spikeWarningThresholdMs,
    ...(startupCacheMode ? { cacheMode: startupCacheMode, openingChunkWordCounts } : {}),
  });
  events.push({
    ts: now + startLatencyMs,
    kind: "lifecycle",
    state: "first-audio",
    wordIndex: 0,
    latencyMs: startLatencyMs,
    spikeWarningThresholdMs,
    spikeWarning: startLatencyMs > spikeWarningThresholdMs,
    mode,
    isNarrating: true,
  });

  let pauseInserted = false;
  for (let i = 0; i < words.length; i += 1) {
    const ts = now + startLatencyMs + i * baseStep;
    events.push({ ts, kind: "word", source: "audio", wordIndex: i });
    if (i % 3 === 0) {
      events.push({
        ts: ts + 20,
        kind: "flow-position",
        lineIndex: Math.floor(i / 8),
        totalLines: Math.max(1, Math.ceil(words.length / 8)),
        wordIndex: i,
        totalWords: words.length,
        bookPct: words.length > 1 ? i / (words.length - 1) : 1,
      });
    }
    if (!pauseInserted && fixture.id === "pause-resume" && i > Math.floor(words.length / 2)) {
      events.push({ ts: ts + 30, kind: "lifecycle", state: "pause", wordIndex: i, mode, isNarrating: true });
      events.push({ ts: ts + 420, kind: "lifecycle", state: "resume", wordIndex: i, mode, isNarrating: true });
      pauseInserted = true;
    }
  }

  if (fixture.id.includes("section")) {
    events.push({
      ts: now + startLatencyMs + words.length * baseStep + 20,
      kind: "transition",
      transition: "section",
      from: 0,
      to: 1,
      context: "flow-narration-section-handoff",
      latencyMs: sectionHandoffLatencyMs,
    });
  }
  if (fixture.id.includes("chapter")) {
    events.push({ ts: now + startLatencyMs + words.length * baseStep + 20, kind: "transition", transition: "chapter", from: 1, to: 2, context: "fixture-chapter" });
  }
  if (fixture.id.includes("queued-handoff")) {
    events.push({
      ts: now + startLatencyMs + words.length * baseStep + 20,
      kind: "transition",
      transition: "book",
      from: "book-a",
      to: "book-b",
      context: "cross-book-flow-narration",
    });
    events.push({
      ts: now + startLatencyMs + words.length * baseStep + 25,
      kind: "transition",
      transition: "handoff",
      from: "book-a",
      to: "book-b",
      context: "cross-book-flow-narration",
      latencyMs: crossBookResumeLatencyMs,
    });
  }
  if (scenarioId?.includes("rate-edit")) {
    events.push({
      ts: now + startLatencyMs + Math.max(baseStep * 2, 120),
      kind: "transition",
      transition: "rate-response",
      from: Math.max(1, Number((rate - 0.1).toFixed(1))),
      to: rate,
      context: "same-bucket-segmented-live-rate",
      latencyMs: rateResponseLatencyMs,
    });
  }

  events.push({
    ts: now + startLatencyMs + words.length * baseStep + 60,
    kind: "lifecycle",
    state: "stop",
    wordIndex: Math.max(0, words.length - 1),
    mode,
    isNarrating: false,
  });

  return {
    schemaVersion: "1.0",
    runId,
    scenarioId: scenarioId || null,
    createdAt: new Date(now).toISOString(),
    fixture: {
      id: fixture.id,
      title: fixture.title,
      sourceType: fixture.sourceType,
      expectedCoverage: fixture.expectedCoverage,
      notes: fixture.notes || "",
    },
    events,
  };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(path.resolve(filePath), "utf8"));
}

async function writeJsonAtomic(filePath, value) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}

function slug(value) {
  return String(value || "value")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatRunArtifactBase({ runLabel, scenarioId, iteration }) {
  return `${slug(runLabel)}__${slug(scenarioId)}__it${String(iteration).padStart(3, "0")}`;
}

function createFixtureLookup(fixtureManifest, fixtureRoot) {
  const map = new Map();
  for (const fixture of fixtureManifest.fixtures || []) {
    map.set(fixture.id, {
      ...fixture,
      textPath: path.resolve(fixtureRoot, fixture.file),
    });
  }
  return map;
}

async function readFixtureText(fixtureInfo) {
  const text = await fs.readFile(fixtureInfo.textPath, "utf8");
  return { ...fixtureInfo, text };
}

function filterScenariosByTags(scenarios, tags) {
  if (!tags.length) return scenarios;
  return scenarios.filter((scenario) => tags.every((tag) => (scenario.tags || []).includes(tag)));
}

async function writeRunArtifacts({ outDir, runBase, trace, summary }) {
  const tracePath = path.join(outDir, "traces", `${runBase}.trace.json`);
  const summaryPath = path.join(outDir, "summaries", `${runBase}.summary.json`);
  await writeJsonAtomic(tracePath, trace);
  await writeJsonAtomic(summaryPath, summary);
  return { tracePath, summaryPath };
}

async function loadRuntimeInputs(args) {
  const fixtureManifest = await readJson(args.fixtureManifestPath);
  const matrixManifest = await readJson(args.matrixManifestPath);
  const fixtureRoot = path.dirname(path.resolve(args.fixtureManifestPath));
  const fixtureLookup = createFixtureLookup(fixtureManifest, fixtureRoot);
  return { fixtureManifest, matrixManifest, fixtureLookup };
}

async function ensureOutLayout(outDir) {
  await fs.mkdir(path.join(outDir, "traces"), { recursive: true });
  await fs.mkdir(path.join(outDir, "summaries"), { recursive: true });
  await fs.mkdir(path.join(outDir, "checkpoints"), { recursive: true });
}

export async function executeMatrix({
  args,
  scenarios,
  fixtureLookup,
  outDir,
  runLabel,
  shouldStop = () => false,
}) {
  await ensureOutLayout(outDir);
  if (!scenarios.length) throw new Error("No scenarios matched the matrix selection.");

  const summaries = [];
  const runIndex = { value: 0 };

  for (const scenario of scenarios) {
    if (shouldStop()) break;
    runIndex.value += 1;
    const fixture = fixtureLookup.get(scenario.fixtureId);
    if (!fixture) throw new Error(`Scenario "${scenario.id}" references unknown fixture "${scenario.fixtureId}"`);
    const fixtureWithText = await readFixtureText(fixture);
    const runBase = formatRunArtifactBase({
      runLabel,
      scenarioId: scenario.id,
      iteration: runIndex.value,
    });

    const trace = simulateTrace({
      fixture: fixtureWithText,
      mode: args.mode,
      rate: scenario.requestedRate ?? args.rate,
      runId: runBase,
      scenarioId: scenario.id,
      runOrdinal: runIndex.value,
    });
    const summary = {
      ...summarizeTrace(trace),
      scenario: {
        id: scenario.id,
        voiceId: scenario.voiceId,
        requestedRate: scenario.requestedRate,
        durationClass: scenario.durationClass,
        tags: scenario.tags || [],
      },
    };
    summaries.push(summary);
    await writeRunArtifacts({ outDir, runBase, trace, summary });
  }

  return {
    summaries,
    interrupted: shouldStop(),
  };
}

export async function executeSoak({
  args,
  profile,
  baseScenarios,
  fixtureLookup,
  outDir,
  runLabel,
  shouldStop = () => false,
  checkpointEvery = null,
}) {
  await ensureOutLayout(outDir);
  const scenarios = baseScenarios.slice(0, profile.scenarioLimit);
  if (!scenarios.length) throw new Error(`Soak profile "${profile.name}" has no scenarios to execute.`);

  const summaries = [];
  let runCounter = 0;
  const effectiveCheckpointEvery = checkpointEvery || profile.checkpointEvery;
  let interrupted = false;

  for (let iteration = 1; iteration <= profile.iterations; iteration += 1) {
    for (const scenario of scenarios) {
      if (shouldStop()) {
        interrupted = true;
        break;
      }
      runCounter += 1;
      const fixture = fixtureLookup.get(scenario.fixtureId);
      if (!fixture) throw new Error(`Scenario "${scenario.id}" references unknown fixture "${scenario.fixtureId}"`);
      const fixtureWithText = await readFixtureText(fixture);

      const runBase = formatRunArtifactBase({
        runLabel,
        scenarioId: `${scenario.id}-loop${String(iteration).padStart(2, "0")}`,
        iteration: runCounter,
      });

      const trace = simulateTrace({
        fixture: fixtureWithText,
        mode: args.mode,
        rate: scenario.requestedRate ?? args.rate,
        runId: runBase,
        scenarioId: scenario.id,
        runOrdinal: runCounter,
      });
      const summary = {
        ...summarizeTrace(trace),
        scenario: {
          id: scenario.id,
          voiceId: scenario.voiceId,
          requestedRate: scenario.requestedRate,
          durationClass: scenario.durationClass,
          tags: scenario.tags || [],
        },
        soakIteration: iteration,
      };
      summaries.push(summary);
      await writeRunArtifacts({ outDir, runBase, trace, summary });

      if (effectiveCheckpointEvery && runCounter % effectiveCheckpointEvery === 0) {
        const aggregate = calculateAggregateMetrics(summaries);
        await writeJsonAtomic(
          path.join(outDir, "checkpoints", `${slug(runLabel)}__checkpoint_${String(runCounter).padStart(4, "0")}.json`),
          {
            runCount: runCounter,
            profile: profile.name,
            interrupted: false,
            aggregate,
          }
        );
      }
    }
    if (interrupted) break;
  }

  return { summaries, interrupted };
}

export async function runHarness(args, runtime = null) {
  const { fixtureManifest, matrixManifest, fixtureLookup } = runtime ?? await loadRuntimeInputs(args);
  const outDir = path.resolve(args.outDir);
  await ensureOutLayout(outDir);

  const state = { interrupted: false };
  const onSigint = () => {
    state.interrupted = true;
  };
  process.on("SIGINT", onSigint);

  try {
    let summaries = [];
    let interrupted = false;
    let runMode = "fixtures";

    if (args.soakProfile) {
      runMode = "soak";
      const profile = getSoakProfile(args.soakProfile);
      const taggedScenarios = filterScenariosByTags(matrixManifest.scenarios || [], args.tags);
      const result = await executeSoak({
        args,
        profile,
        baseScenarios: taggedScenarios,
        fixtureLookup,
        outDir,
        runLabel: `${args.runId}-soak-${profile.name}`,
        shouldStop: () => state.interrupted,
        checkpointEvery: args.checkpointEvery,
      });
      summaries = result.summaries;
      interrupted = result.interrupted;
    } else if (args.matrix) {
      runMode = "matrix";
      const allScenarios = filterScenariosByTags(matrixManifest.scenarios || [], args.tags);
      const scenarios = allScenarios.filter(
        (s) => s.engine !== "qwen-streaming" && s.fixtureId != null
      );
      const result = await executeMatrix({
        args,
        scenarios,
        fixtureLookup,
        outDir,
        runLabel: `${args.runId}-matrix`,
        shouldStop: () => state.interrupted,
      });
      summaries = result.summaries;
      interrupted = result.interrupted;
    } else {
      const selectedFixtures = args.fixtures.length
        ? fixtureManifest.fixtures.filter((fixture) => args.fixtures.includes(fixture.id))
        : fixtureManifest.fixtures;
      if (!selectedFixtures.length) throw new Error("No fixtures matched the requested ids.");

      let ordinal = 0;
      for (const fixture of selectedFixtures) {
        if (state.interrupted) break;
        ordinal += 1;
        const fixtureWithText = await readFixtureText(fixtureLookup.get(fixture.id));
        const runBase = formatRunArtifactBase({
          runLabel: `${args.runId}-fixture`,
          scenarioId: fixture.id,
          iteration: ordinal,
        });
        const trace = simulateTrace({
          fixture: fixtureWithText,
          mode: args.mode,
          rate: args.rate,
          runId: runBase,
          scenarioId: fixture.id,
          runOrdinal: ordinal,
        });
        const summary = summarizeTrace(trace);
        summaries.push(summary);
        await writeRunArtifacts({ outDir, runBase, trace, summary });
      }
      interrupted = state.interrupted;
    }

    const aggregate = calculateAggregateMetrics(summaries);
    const aggregateText = formatAggregateSummary(aggregate);
    const rollup = {
      generatedAt: new Date().toISOString(),
      mode: runMode,
      interrupted,
      fixtureCount: summaries.length,
      summaries,
      aggregate,
    };

    await writeJsonAtomic(path.join(outDir, "summary.json"), rollup);
    await writeJsonAtomic(path.join(outDir, "aggregate-summary.json"), aggregate);

    let gate = null;
    if (args.gates) {
      const gatePath = typeof args.gates === "string" ? args.gates : DEFAULT_GATES_PATH;
      const { report, jsonPath, textPath } = await runGateEvaluation({
        aggregatePath: path.join(outDir, "aggregate-summary.json"),
        gatePath,
        outDir,
        reportBaseName: "gate-report",
      });
      gate = {
        pass: report.pass,
        hardFailures: report.counts.hardFailures,
        warnings: report.counts.warnings,
        jsonPath,
        textPath,
      };
      rollup.gateReport = report;
      await writeJsonAtomic(path.join(outDir, "summary.json"), rollup);
    }

    const lines = [
      `TTS eval ${runMode} run complete (${summaries.length} run${summaries.length === 1 ? "" : "s"})${interrupted ? " [INTERRUPTED]" : ""}`,
      ...summaries.map(
        (s) =>
          `- ${s.scenario?.id || s.fixtureId}: latency=${s.startLatencyMs ?? "n/a"}ms drift=${s.maxDrift ?? "n/a"} failures=${s.failureClasses.join(",") || "none"}`
      ),
      "",
      aggregateText,
    ];
    if (gate) {
      lines.push("", formatGateReport(rollup.gateReport).trim(), `Gate artifacts: ${gate.jsonPath} | ${gate.textPath}`);
    }
    await fs.writeFile(path.join(outDir, "summary.txt"), `${lines.join("\n")}\n`, "utf8");
    return { rollup, lines, gate };
  } finally {
    process.off("SIGINT", onSigint);
  }
}

export async function runStreamingScenarios(args) {
  const matrixManifest = await readJson(args.matrixManifestPath);
  const gatesDoc = await readJson(DEFAULT_GATES_PATH);
  const gateThresholds = gatesDoc.streaming || {};

  const streamingScenarios = (matrixManifest.scenarios || []).filter(
    (s) => s.engine === "qwen-streaming",
  );

  if (!streamingScenarios.length) {
    throw new Error("No qwen-streaming scenarios found in matrix manifest.");
  }

  const outDir = path.resolve(args.outDir, "streaming-baseline");
  await fs.mkdir(outDir, { recursive: true });

  const results = [];

  for (const scenario of streamingScenarios) {
    const wordsAchieved = (scenario.text || "").split(/\s+/).filter(Boolean).length;

    // Determine which gate keys this scenario expects to validate.
    const expectedGates = scenario.expectedGates || [];

    // Build gate results — mark pending because actual sidecar metrics are not
    // available in the eval runner context (no live sidecar process).
    const gateResults = {};
    for (const gateKey of expectedGates) {
      const gateDef = gateThresholds[gateKey];
      gateResults[gateKey] = {
        gate: gateDef || null,
        status: "pending_live_data",
      };
    }

    results.push({
      id: scenario.id,
      label: scenario.label || scenario.id,
      metrics: {
        firstAudioLatencyMs: null,
        interSegmentGapMs: null,
        totalStreamDurationMs: null,
        wordsAchieved,
        stallCount: 0,
      },
      gateResults,
    });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const artifactPath = path.join(outDir, `streaming-summary-${timestamp}.json`);
  const artifact = {
    generatedAt: new Date().toISOString(),
    scenarioCount: results.length,
    scenarios: results,
    gateThresholds,
    note: "Metrics are placeholders — populate with live sidecar run data",
  };

  await writeJsonAtomic(artifactPath, artifact);

  // eslint-disable-next-line no-console
  console.log("\nStreaming scenario baseline:");
  // eslint-disable-next-line no-console
  console.table(
    results.map((r) => ({
      id: r.id,
      wordsAchieved: r.metrics.wordsAchieved,
      firstAudioLatencyMs: r.metrics.firstAudioLatencyMs,
      stallCount: r.metrics.stallCount,
      gateStatuses: Object.values(r.gateResults)
        .map((g) => g.status)
        .join(", ") || "none",
    })),
  );
  // eslint-disable-next-line no-console
  console.log(`Streaming artifact written: ${artifactPath}`);

  return { artifact, artifactPath };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.streaming) {
    const { artifactPath } = await runStreamingScenarios(args);
    // eslint-disable-next-line no-console
    console.log(`Streaming baseline complete. Artifact: ${artifactPath}`);
    return;
  }

  const { lines, gate } = await runHarness(args);
  // eslint-disable-next-line no-console
  console.log(lines.join("\n"));
  if (gate && !gate.pass) {
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("[tts_eval_runner] failed:", error.message);
    process.exitCode = 1;
  });
}
