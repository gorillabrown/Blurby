import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";

const mossNanoProbeUrl = new URL("../scripts/moss_nano_probe.mjs", import.meta.url);
const pythonProbePath = path.resolve("scripts", "moss_nano_probe.py");
const execFileAsync = promisify(execFile);

async function importMossNanoProbe() {
  const module = await import(`${mossNanoProbeUrl.href}?case=${Date.now()}-${Math.random()}`);
  expect(module.parseArgs).toEqual(expect.any(Function));
  expect(module.runMossNanoProbe).toEqual(expect.any(Function));
  expect(module.main).toEqual(expect.any(Function));
  return module;
}

async function makeTempProject() {
  return fs.mkdtemp(path.join(os.tmpdir(), "blurby-moss-nano-probe-"));
}

async function readSummaryJson(outputRoot, runId) {
  const summaryPath = path.join(outputRoot, runId, "summary.json");
  return {
    summaryPath,
    summary: JSON.parse(await fs.readFile(summaryPath, "utf8")),
  };
}

async function makeReadyNanoRuntime(tempRoot, { inferScript, writeInfer = true } = {}) {
  const repoDir = path.join(tempRoot, ".runtime", "moss", "MOSS-TTS-Nano");
  const modelDir = path.join(tempRoot, ".runtime", "moss", "weights", "MOSS-TTS-Nano-ONNX");
  const modelSubdirs = [
    "MOSS-TTS-Nano-100M-ONNX",
    "MOSS-Audio-Tokenizer-Nano-ONNX",
  ];
  await fs.mkdir(repoDir, { recursive: true });
  await Promise.all(modelSubdirs.map(async (subdir) => {
    const target = path.join(modelDir, subdir);
    await fs.mkdir(target, { recursive: true });
    await fs.writeFile(path.join(target, "model.onnx"), "fake onnx\n", "utf8");
  }));
  await Promise.all(["onnxruntime", "numpy", "sentencepiece", "torch", "torchaudio"].map((moduleName) => (
    fs.writeFile(path.join(repoDir, `${moduleName}.py`), "# fake dependency\n", "utf8")
  )));
  if (writeInfer) {
    await fs.writeFile(
      path.join(repoDir, "infer_onnx.py"),
      inferScript ?? "# fake local source\n",
      "utf8",
    );
  }
  return { repoDir, modelDir };
}

function successfulNanoSummary(overrides = {}) {
  return {
    ok: true,
    status: "ok",
    runId: "nano-ok",
    passageId: "short-smoke",
    backend: "moss-nano-onnx",
    device: "cpu",
    modelVariant: "moss-tts-nano-onnx",
    outputWavPath: "output.wav",
    totalSec: 0.5,
    firstAudioSec: 0.2,
    audioDurationSec: 1,
    rtf: 0.5,
    peakMemoryMb: 64,
    failureClass: null,
    error: null,
    ...overrides,
  };
}

function residentRuntimeIdentity(overrides = {}) {
  return {
    pythonProcessIdentity: "python-pid:4242",
    loadedSessionIdentities: {
      semantic: "semantic-session:alpha",
      acoustic: "acoustic-session:alpha",
      audioTokenizer: "audio-tokenizer-session:alpha",
    },
    ...overrides,
  };
}

function internalFirstDecodedAudioObservation(overrides = {}) {
  return {
    kind: "internal-first-decoded-audio",
    sourceEvent: "firstDecodedAudio",
    internalFirstDecodedAudioMs: 120,
    internalFirstDecodedAudioSec: 0.12,
    internalFirstDecodedAudioSupported: true,
    fileObservedAudioSec: null,
    fileResetBeforeRun: true,
    reusedExistingOutputFile: false,
    ...overrides,
  };
}

function residentIteration(overrides = {}) {
  const firstAudioObservation = overrides.firstAudioObservation ?? internalFirstDecodedAudioObservation();
  return {
    iterationIndex: 0,
    processMode: "warm",
    runtimeReuseActual: true,
    runtimeIdentity: residentRuntimeIdentity(),
    totalSec: 0.4,
    firstAudioSec: 0.12,
    firstAudioObservedSec: null,
    internalFirstDecodedAudioMs: 120,
    firstAudioObservation,
    audioDurationSec: 1,
    rtf: 0.4,
    outputWavPath: "output-001.wav",
    outputPath: "output-001.wav",
    segments: [],
    ...overrides,
  };
}

function residentNanoSummary(overrides = {}) {
  return successfulNanoSummary({
    runId: "nano-resident-ok",
    runtimeMode: "resident",
    processMode: "warm",
    firstAudioSec: 0.12,
    firstAudioObservedSec: null,
    internalFirstDecodedAudioMs: 120,
    firstAudioObservation: internalFirstDecodedAudioObservation(),
    benchmark: {
      processMode: "warm",
      iterationsRequested: 2,
      warmupRunsRequested: 1,
      prewarm: "ort-sessions",
      runtimeReuseRequested: true,
      runtimeReuseSupported: true,
      runtimeReuseActual: true,
    },
    runtimeIdentity: residentRuntimeIdentity(),
    ortOptionsRequested: {
      providers: ["CPUExecutionProvider"],
      intraOpThreads: 2,
      interOpThreads: 1,
      executionMode: "sequential",
      graphOptimization: "basic",
      enableCpuMemArena: false,
      enableMemPattern: true,
      enableMemReuse: false,
      usePerSessionThreads: true,
    },
    ortOptionsApplied: {
      providers: ["CPUExecutionProvider"],
      intraOpThreads: 2,
      interOpThreads: 1,
      executionMode: "sequential",
      graphOptimization: "basic",
      enableCpuMemArena: false,
      enableMemPattern: true,
      enableMemReuse: false,
    },
    ortOptionsUnsupported: {
      usePerSessionThreads: {
        requested: true,
        reason: "The resident runtime shares the process thread pool.",
      },
    },
    warmups: [
      residentIteration({ iterationIndex: -1, phase: "warmup" }),
    ],
    iterations: [
      residentIteration({ iterationIndex: 0 }),
      residentIteration({ iterationIndex: 1 }),
    ],
    aggregate: {
      iterations: 2,
      warmupsExcluded: 1,
    },
    ...overrides,
  });
}

function optimizedResidentNanoSummary(overrides = {}) {
  return residentNanoSummary({
    runId: "nano-resident-optimized",
    promotionClass: true,
    optimizationProfile: "resident-cpu-low-latency",
    providerVariant: "cpu-threads-2-sequential",
    tokenizerReuseActual: true,
    promptReuseActual: true,
    shortPassageOverheadReduction: {
      requested: true,
      actual: true,
      strategy: "batch-short-passages",
      savedStartupMs: 80,
    },
    bookLikeRunStats: {
      requestedWarmRuns: 3,
      completedWarmRuns: 3,
      internalFirstDecodedAudioFreshRuns: 3,
      staleOutputReuseCount: 0,
      internalFirstDecodedAudioMs: [110, 116, 112],
    },
    optimizationEvidence: {
      status: "applied",
      profile: "resident-cpu-low-latency",
      providerVariant: "cpu-threads-2-sequential",
      requestedOnly: false,
      stale: false,
      evidenceRunId: "moss-nano-4-resident-optimization",
      evidenceGeneratedAt: "2026-04-29T00:00:00.000Z",
    },
    promotionDecision: {
      promote: true,
      target: "moss-nano-4-resident-optimized",
    },
    promotionThresholds: {
      shortRtfMax: 0.6,
      firstDecodedAudioSecMax: 0.25,
    },
    promotionMetrics: {
      shortRtf: 0.5,
      firstDecodedAudioSec: 0.12,
    },
    iterations: [
      residentIteration({ iterationIndex: 0, internalFirstDecodedAudioMs: 110, firstAudioSec: 0.11 }),
      residentIteration({ iterationIndex: 1, internalFirstDecodedAudioMs: 116, firstAudioSec: 0.116 }),
      residentIteration({ iterationIndex: 2, internalFirstDecodedAudioMs: 112, firstAudioSec: 0.112 }),
    ],
    aggregate: {
      iterations: 3,
      warmupsExcluded: 1,
    },
    ...overrides,
  });
}

function nano5AdjacentSegment(index, overrides = {}) {
  return {
    index,
    passageId: `book-segment-${index + 1}`,
    text: `Fresh adjacent segment ${index + 1} with enough words to be non-empty.`,
    empty: false,
    runtimeReuseActual: true,
    runtimeIdentity: residentRuntimeIdentity(),
    firstAudioObservation: internalFirstDecodedAudioObservation({
      internalFirstDecodedAudioMs: 180 + index * 10,
      internalFirstDecodedAudioSec: (180 + index * 10) / 1000,
      outputFileExistedBeforeRun: false,
      reusedExistingOutputFile: false,
    }),
    staleOutputReuse: false,
    sessionRestarted: false,
    outputWavPath: `segment-${index + 1}.wav`,
    audioDurationSec: 1,
    totalSec: 0.9 + index * 0.02,
    rtf: 0.9 + index * 0.02,
    ...overrides,
  };
}

function nano5AdjacentSegments(overridesByIndex = {}) {
  return Array.from({ length: 5 }, (_, index) => nano5AdjacentSegment(index, overridesByIndex[index] ?? {}));
}

function nano5PrecomputeRowEvidence(overrides = {}) {
  const components = {
    textNormalization: true,
    promptCodes: true,
    tokenization: true,
    requestRowsBuild: true,
    semanticInputs: true,
    acousticInputs: true,
    promptAudioCodes: true,
    ...(overrides.components ?? {}),
  };
  return {
    status: "actual",
    actual: true,
    preparedBeforeRun: true,
    consumedByMeasuredRun: true,
    requestRowCount: 5,
    textHash: "sha256:nano5-book-text-alpha",
    chunkHashes: [
      "sha256:nano5-chunk-1",
      "sha256:nano5-chunk-2",
      "sha256:nano5-chunk-3",
      "sha256:nano5-chunk-4",
      "sha256:nano5-chunk-5",
    ],
    components,
    ...overrides,
    components,
  };
}

function nano5FairAdjacentStats(overrides = {}) {
  return {
    requestedSegments: 5,
    completedSegments: 5,
    freshSegments: 5,
    emptySegments: 0,
    staleOutputReuseCount: 0,
    sessionRestartCount: 0,
    rtfTrendRatio: 0.1,
    rtfTrendMax: 0.15,
    rtfTrendMethod: "first-two-vs-last-two-median",
    fairRtfTrendRatio: 0.1,
    fairRtfTrendMax: 0.15,
    balancedSegments: true,
    tokenBudgetedSegments: true,
    tokenCounts: [112, 111, 113, 112, 111],
    audioDurationSecBySegment: [1.02, 1.01, 1.03, 1.02, 1.01],
    stableTrendGate: {
      method: "first-two-vs-last-two-median",
      ratio: 0.1,
      max: 0.15,
      stable: true,
    },
    crossSegmentStateActual: false,
    ...overrides,
  };
}

function validDecodeFullRethresholdEvidence(overrides = {}) {
  return {
    explicit: true,
    thresholdField: "decodeFullFirstAudioSecMax",
    firstAudioSecMax: 2.65,
    evidenceRunIds: [
      "nano5-decode-full-rethreshold-a",
      "nano5-decode-full-rethreshold-b",
      "nano5-decode-full-rethreshold-c",
    ],
    repeatedRuns: 9,
    p95FirstAudioSec: 2.48,
    p95UnderThreshold: true,
    memoryGrowthMbMax: 80,
    maxMemoryGrowthMb: 76,
    generatedAt: "2026-04-29T00:00:00.000Z",
    stale: false,
    ...overrides,
  };
}

function nano5SoakCandidateSummary(overrides = {}) {
  const segments = overrides.segments ?? nano5AdjacentSegments();
  const adjacentSegmentStats = overrides.adjacentSegmentStats ?? nano5FairAdjacentStats();
  return optimizedResidentNanoSummary({
    runId: "nano5-soak-candidate",
    promotionTarget: "nano5-soak",
    promotionDecision: {
      promote: true,
      target: "nano5-soak",
      decision: "PROMOTE_NANO_TO_SOAK_CANDIDATE",
    },
    precomputeInputsRequested: true,
    precomputeInputsActual: true,
    precomputeInputsPartial: false,
    precomputeInputsBlocker: null,
    precomputeInputsEvidence: nano5PrecomputeRowEvidence(),
    tokenizerIdentity: {
      modelPath: "weights/MOSS-Audio-Tokenizer-Nano-ONNX/model.onnx",
      sessionIdentity: "audio-tokenizer-session:alpha",
      vocabularyHash: "tok-hash-alpha",
    },
    promptAudioCodesEvidence: {
      status: "actual",
      promptAudioPath: "prompts/Junhao.wav",
      codeCount: 64,
      reusedAcrossSegments: true,
    },
    decodeFullEvidence: {
      status: "passed",
      firstAudioSec: 2.1,
      memoryGrowthMb: 70,
      gates: {
        firstAudioSecMax: 2.5,
        memoryGrowthMbMax: 80,
      },
    },
    acceptedDecodeStrategy: {
      strategy: "decode-full",
      accepted: true,
      replacementForDecodeFull: false,
    },
    adjacentSegmentStats,
    segments,
    promotionThresholds: {
      shortRtfMax: 1.5,
      firstDecodedAudioSecMax: 0.9,
      shortP95RtfMax: 1.55,
      shortFirstDecodedAudioSecMax: 0.9,
      shortMemoryGrowthMbMax: 60,
      punctuationRtfMax: 1.35,
      punctuationP95RtfMax: 1.45,
      punctuationFirstDecodedAudioSecMax: 1.2,
      decodeFullFirstAudioSecMax: 2.5,
      decodeFullMemoryGrowthMbMax: 80,
      adjacentMinFreshSegments: 5,
      adjacentRtfTrendMax: 0.15,
    },
    promotionMetrics: {
      shortRtf: 1.2,
      firstDecodedAudioSec: 0.5,
      shortP95Rtf: 1.3,
      shortFirstDecodedAudioSec: 0.5,
      shortMemoryGrowthMb: 42,
      punctuationRtf: 1.2,
      punctuationP95Rtf: 1.3,
      punctuationFirstDecodedAudioSec: 0.8,
      punctuationStaleOutputReuseCount: 0,
      decodeFullFirstAudioSec: 2.1,
      decodeFullMemoryGrowthMb: 70,
      adjacentFreshSegments: 5,
      adjacentEmptySegments: 0,
      adjacentStaleOutputReuseCount: 0,
      adjacentSessionRestartCount: 0,
      adjacentRtfTrendRatio: 0.1,
      adjacentFairRtfTrendRatio: 0.1,
    },
    ...overrides,
  });
}

function nano5cSegmentFirstSoakSummary(overrides = {}) {
  const precomputeInputsEvidence = Object.prototype.hasOwnProperty.call(overrides, "precomputeInputsEvidence")
    ? overrides.precomputeInputsEvidence
    : null;
  return {
    ...nano5SoakCandidateSummary(),
    runId: "nano5c-segment-first-soak",
    promotionTarget: "nano5c-segment-first-soak",
    promotionDecision: {
      promote: true,
      target: "nano5c-segment-first-soak",
      decision: "PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE",
    },
    precomputeInputsRequested: false,
    precomputeInputsActual: false,
    precomputeInputsPartial: false,
    precomputeInputsBlocker: null,
    precomputeRequiredForProductPath: false,
    precomputeInputsEvidence,
    decodeFullEvidence: {
      status: "failed",
      firstAudioSec: 3.2,
      memoryGrowthMb: 70,
      diagnosticOnly: true,
      productPath: false,
      requiredForProductPath: false,
      classification: "diagnostic-only-non-product-path",
      gates: {
        firstAudioSecMax: 2.5,
        memoryGrowthMbMax: 80,
      },
    },
    acceptedDecodeStrategy: {
      strategy: "segment-first",
      accepted: true,
      productPath: true,
      segmentFirst: true,
      diagnosticReplacementForDecodeFull: false,
      evidenceRunId: "moss-nano-5c-segment-first-product-path",
    },
    segmentFirstProductPathEvidence: {
      status: "passed",
      productPath: true,
      internalFirstAudioFreshSegments: 5,
      staleOutputReuseCount: 0,
      sessionRestartCount: 0,
      stableAdjacentTrend: true,
    },
    promotionThresholds: {
      segmentFirstInternalFirstDecodedAudioSecMax: 0.5,
      segmentFirstShortRtfMax: 1.5,
      adjacentFairRtfTrendMax: 0.15,
      segmentFirstMinFreshSegments: 5,
      segmentFirstStaleOutputReuseMax: 0,
      segmentFirstSessionRestartMax: 0,
    },
    promotionMetrics: {
      segmentFirstInternalFirstDecodedAudioSec: 0.2,
      segmentFirstShortRtf: 1.2,
      adjacentFairRtfTrendRatio: 0.1,
      segmentFirstInternalFirstAudioFreshSegments: 5,
      segmentFirstStaleOutputReuseCount: 0,
      segmentFirstSessionRestartCount: 0,
    },
    ...overrides,
  };
}

function nano6BookLikeSegment(index, overrides = {}) {
  return {
    index,
    passageId: `nano6-book-segment-${String(index + 1).padStart(3, "0")}`,
    text: `Adjacent book-like segment ${index + 1} carries a complete sentence with punctuation.`,
    empty: false,
    fresh: true,
    runtimeReuseActual: true,
    runtimeIdentity: residentRuntimeIdentity(),
    firstAudioObservation: internalFirstDecodedAudioObservation({
      internalFirstDecodedAudioMs: 420 + (index % 7) * 20,
      internalFirstDecodedAudioSec: (420 + (index % 7) * 20) / 1000,
      outputFileExistedBeforeRun: false,
      reusedExistingOutputFile: false,
    }),
    staleOutputReuse: false,
    sessionRestarted: false,
    outputWavPath: `nano6-segment-${String(index + 1).padStart(3, "0")}.wav`,
    audioDurationSec: 2,
    totalSec: 2.2,
    rtf: 1.1,
    punctuationRtf: 1.2,
    ...overrides,
  };
}

function nano6BookLikeSegments(overridesByIndex = {}) {
  return Array.from({ length: 100 }, (_, index) => nano6BookLikeSegment(index, overridesByIndex[index] ?? {}));
}

function nano6LifecycleClassEvidence(overridesByClass = {}) {
  return {
    cleanShutdown: { classification: "clean-shutdown", observed: true, evidenceSource: "measured-lifecycle-check" },
    forcedKill: { classification: "forced-kill", observed: true, evidenceSource: "measured-lifecycle-check" },
    zombieProcess: { classification: "zombie-process", observed: true, evidenceSource: "measured-lifecycle-check" },
    restartClean: { classification: "restart-clean", observed: true, evidenceSource: "measured-lifecycle-check" },
    restartFailed: { classification: "restart-failed", observed: true, evidenceSource: "measured-lifecycle-check" },
    inflightShutdown: {
      classification: "inflight-rejected",
      observed: true,
      evidenceSource: "measured-lifecycle-check",
      rejected: true,
      succeeded: false,
      wavReused: false,
    },
    ...overridesByClass,
  };
}

function nano6ReadinessSummary(overrides = {}) {
  const segments = overrides.segments ?? nano6BookLikeSegments();
  return residentNanoSummary({
    runId: "nano6-runtime-package-ready",
    promotionTarget: "app-prototype",
    promotionDecision: {
      promote: true,
      target: "app-prototype",
      decision: "PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE",
    },
    lifecycleEvidence: {
      status: "actual",
      requestedOnly: false,
      stale: false,
      runId: "nano6-runtime-package-ready",
      generatedAt: "2026-04-30T00:00:00.000Z",
      lifecycleClasses: nano6LifecycleClassEvidence(),
    },
    runtimeIdentity: residentRuntimeIdentity(),
    residentSoak: {
      durationSec: 1800,
      warmupExcluded: true,
      warmupEndAt: "2026-04-30T00:05:00.000Z",
      sampleIntervalSec: 30,
      rssSamples: [512, 514, 516, 515],
      currentRssMb: 515,
      memoryGrowthSlopeMbPerMin: 0.2,
      initialExpansionMb: 2,
      endpointGrowthMb: 3,
      endpointGrowthMbPerMin: 0.1,
      diagnosticEndpointSlopeMbPerMin: 0.1,
      postWarmupSlopeMbPerMin: 0.2,
      inferenceSlopeMbPerMin: 0.25,
      holdSlopeMbPerMin: 0.02,
      readinessMemorySlopeMbPerMin: 0.2,
      readinessMemorySlopeMethod: "post-warmup-phase-regression",
      memoryGrowthSlopeMethod: "endpoint-diagnostic-only",
      crashCount: 0,
      staleOutputReuseCount: 0,
      sessionRestartCount: 0,
    },
    bookLikeAdjacentRun: {
      requestedSegments: 100,
      completedSegments: 100,
      freshSegments: 100,
      emptySegments: 0,
      staleOutputReuseCount: 0,
      sessionRestartCount: 0,
      p95InternalFirstDecodedAudioMs: 540,
      p95FinalRtf: 1.1,
      p95PunctuationRtf: 1.2,
    },
    shutdownClassifications: [
      "clean-shutdown",
      "forced-kill",
      "zombie-process",
      "restart-clean",
      "restart-failed",
      "inflight-rejected",
    ],
    shutdownEvidence: nano6LifecycleClassEvidence(),
    promotionThresholds: {
      soakDurationSecMin: 1800,
      memoryGrowthSlopeMbPerMinMax: 1.5,
      adjacentRequiredSegments: 100,
      adjacentP95InternalFirstDecodedAudioMsMax: 1500,
      adjacentP95FinalRtfMax: 1.5,
      adjacentP95PunctuationRtfMax: 1.45,
      staleOutputReuseMax: 0,
      emptySegmentMax: 0,
      sessionRestartMax: 0,
      crashCountMax: 0,
    },
    promotionMetrics: {
      soakDurationSec: 1800,
      memoryGrowthSlopeMbPerMin: 0.2,
      diagnosticEndpointSlopeMbPerMin: 0.1,
      postWarmupSlopeMbPerMin: 0.2,
      inferenceSlopeMbPerMin: 0.25,
      holdSlopeMbPerMin: 0.02,
      readinessMemorySlopeMbPerMin: 0.2,
      crashCount: 0,
      staleOutputReuseCount: 0,
      sessionRestartCount: 0,
      adjacentRequestedSegments: 100,
      adjacentCompletedSegments: 100,
      adjacentFreshSegments: 100,
      adjacentEmptySegments: 0,
      adjacentStaleOutputReuseCount: 0,
      adjacentSessionRestartCount: 0,
      adjacentP95InternalFirstDecodedAudioMs: 540,
      adjacentP95FinalRtf: 1.1,
      adjacentP95PunctuationRtf: 1.2,
    },
    segments,
    ...overrides,
  });
}

function fakeInferScript() {
  return [
    "import argparse, wave",
    "parser = argparse.ArgumentParser()",
    "parser.add_argument('--text', required=True)",
    "parser.add_argument('--output-audio-path', required=True)",
    "parser.add_argument('--model-dir', required=True)",
    "parser.add_argument('--cpu-threads', required=True)",
    "parser.add_argument('--max-new-frames', required=True)",
    "parser.add_argument('--sample-mode', required=True)",
    "parser.add_argument('--voice', required=True)",
    "parser.add_argument('--prompt-audio-path')",
    "parser.add_argument('--realtime-streaming-decode', choices=['0', '1'], required=True)",
    "parser.add_argument('--disable-wetext-processing', action='store_true')",
    "args = parser.parse_args()",
    "with wave.open(args.output_audio_path, 'wb') as wav:",
    "    wav.setnchannels(1)",
    "    wav.setsampwidth(2)",
    "    wav.setframerate(48000)",
    "    wav.writeframes(b'\\0\\0' * 4800)",
  ].join("\n");
}

async function runMockedResidentSummary({
  projectRoot,
  outputRoot,
  runId,
  summary,
  options = {},
}) {
  const { runMossNanoProbe } = await importMossNanoProbe();
  const execFile = vi.fn(async () => ({
    stdout: `${JSON.stringify(summary)}\n`,
    stderr: "",
  }));

  const result = await runMossNanoProbe({
    projectRoot,
    runId,
    outputDir: outputRoot,
    runtimeMode: "resident",
    processMode: "warm",
    iterations: 5,
    warmupRuns: 1,
    prewarm: "ort-sessions",
    execFile,
    ...options,
  });
  const { summary: persisted } = await readSummaryJson(outputRoot, runId);
  return { result, summary: persisted.summary, persisted, execFile };
}

describe("MOSS Nano probe", () => {
  const tempDirs = [];

  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));
    tempDirs.length = 0;
    vi.restoreAllMocks();
  });

  it("prints Node CLI help without running the probe", async () => {
    const { main } = await importMossNanoProbe();
    const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    const result = await main(["--help"]);

    expect(result).toEqual({ status: "help" });
    expect(write).toHaveBeenCalledTimes(1);
    expect(write.mock.calls[0][0]).toContain("Usage: node scripts/moss_nano_probe.mjs [options]");
    expect(write.mock.calls[0][0]).toContain("--repo-dir <dir>");
    expect(write.mock.calls[0][0]).toContain("--model-dir <dir>");
    expect(write.mock.calls[0][0]).toContain("--process-mode <cold|warm>");
    expect(write.mock.calls[0][0]).toContain("--iterations <n>");
    expect(write.mock.calls[0][0]).toContain("--warmup-runs <n>");
    expect(write.mock.calls[0][0]).toContain("--prewarm <none|ort-sessions|synthetic-synth>");
    expect(write.mock.calls[0][0]).toContain("--profile-stages");
    expect(write.mock.calls[0][0]).toContain("--segment-policy <none|first-sentence|natural-break|token-window|char-window>");
    expect(write.mock.calls[0][0]).toContain("--ort-providers <csv>");
    expect(write.mock.calls[0][0]).toContain("--promotion-target <target>");
  });

  it("uses deterministic default run, passage, repo, model, and output arguments", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { buildPythonCommand } = await importMossNanoProbe();
    const outputDir = path.join(projectRoot, "artifacts", "moss", "moss-nano-1-probe");

    const commandInfo = buildPythonCommand({
      projectRoot,
      outputDir,
    });

    expect(commandInfo.args).toEqual(expect.arrayContaining([
      "--run-id",
      "moss-nano-1-probe",
      "--passage-id",
      "short-smoke",
      "--output-dir",
      outputDir,
      "--repo-dir",
      path.join(projectRoot, ".runtime", "moss", "MOSS-TTS-Nano"),
      "--model-dir",
      path.join(projectRoot, ".runtime", "moss", "weights", "MOSS-TTS-Nano-ONNX"),
      "--threads",
      "4",
      "--max-new-frames",
      "375",
      "--sample-mode",
      "fixed",
      "--voice",
      "Junhao",
      "--process-mode",
      "cold",
      "--iterations",
      "1",
      "--warmup-runs",
      "0",
      "--prewarm",
      "none",
      "--segment-policy",
      "none",
      "--segment-source",
      "raw",
    ]));
    expect(commandInfo.args).toEqual(expect.arrayContaining([
      "--passage-text",
      "The little probe spoke once, paused, and finished cleanly.",
    ]));
  });

  it("maps the short passage alias to the canonical built-in short smoke text", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { buildPythonCommand } = await importMossNanoProbe();

    const commandInfo = buildPythonCommand({
      projectRoot,
      outputDir: path.join(projectRoot, "out"),
      passageId: "short",
    });

    expect(commandInfo.args).toEqual(expect.arrayContaining([
      "--passage-id",
      "short-smoke",
      "--passage-text",
      "The little probe spoke once, paused, and finished cleanly.",
    ]));
  });

  it("maps the punctuation passage alias to the canonical punctuation-heavy built-in text", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { buildPythonCommand } = await importMossNanoProbe();

    const commandInfo = buildPythonCommand({
      projectRoot,
      outputDir: path.join(projectRoot, "out"),
      passageId: "punctuation",
    });

    expect(commandInfo.args).toEqual(expect.arrayContaining([
      "--passage-id",
      "punctuation-heavy-mid",
      "--passage-text",
      "Wait... really? Yes: commas, semicolons; dashes, quotes, and parentheses all need a calm voice.",
    ]));
  });

  it("lets explicit passage text override alias/default built-in text", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { buildPythonCommand } = await importMossNanoProbe();
    const passageText = "Custom text should win over the alias.";

    const commandInfo = buildPythonCommand({
      projectRoot,
      outputDir: path.join(projectRoot, "out"),
      passageId: "short",
      passageText,
    });

    expect(commandInfo.args).toEqual(expect.arrayContaining([
      "--passage-id",
      "short-smoke",
      "--passage-text",
      passageText,
    ]));
    expect(commandInfo.args).not.toEqual(expect.arrayContaining([
      "--passage-text",
      "The little probe spoke once, paused, and finished cleanly.",
    ]));
  });

  it("blocks direct Python probes with empty passage text before runtime validation", async () => {
    const tempRoot = await makeTempProject();
    tempDirs.push(tempRoot);
    const outputRoot = path.join(tempRoot, "artifacts", "nano");

    const { stdout } = await execFileAsync(process.env.PYTHON ?? "python", [
      pythonProbePath,
      "--json",
      "--run-id",
      "nano-empty-direct",
      "--passage-id",
      "unknown-empty",
      "--output-dir",
      outputRoot,
      "--repo-dir",
      path.join(tempRoot, "missing-source"),
      "--model-dir",
      path.join(tempRoot, "missing-model"),
    ]);
    const summary = JSON.parse(stdout);

    expect(summary).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
      passageId: "unknown-empty",
      error: expect.stringMatching(/Passage text is empty/i),
    });
    expect(summary.checks).toEqual([]);
    const persisted = JSON.parse(await fs.readFile(path.join(outputRoot, "nano-empty-direct", "summary.json"), "utf8"));
    expect(persisted).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
      error: expect.stringMatching(/Passage text is empty/i),
    });
  });

  it.each([
    ["short", "short-smoke", 9],
    ["punctuation", "punctuation-heavy-mid", 14],
  ])("resolves direct Python passage alias %s before runtime validation", async (alias, canonicalId, wordCount) => {
    const tempRoot = await makeTempProject();
    tempDirs.push(tempRoot);
    const outputRoot = path.join(tempRoot, "artifacts", "nano");

    const { stdout } = await execFileAsync(process.env.PYTHON ?? "python", [
      pythonProbePath,
      "--json",
      "--run-id",
      `nano-${alias}-direct`,
      "--passage",
      alias,
      "--output-dir",
      outputRoot,
      "--repo-dir",
      path.join(tempRoot, "missing-source"),
      "--model-dir",
      path.join(tempRoot, "missing-model"),
    ]);
    const summary = JSON.parse(stdout);

    expect(summary).toMatchObject({
      status: "blocked",
      failureClass: "source-download",
      passageId: canonicalId,
      wordCount,
    });
    expect(summary.error).toMatch(/Nano source repo is missing/i);
  });

  it("prefers the repo-local Nano venv Python when no override is provided", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const originalPython = process.env.PYTHON;
    const expectedPython = path.join(
      projectRoot,
      ".runtime",
      "moss",
      ".venv-nano",
      process.platform === "win32" ? "Scripts" : "bin",
      process.platform === "win32" ? "python.exe" : "python",
    );
    await fs.mkdir(path.dirname(expectedPython), { recursive: true });
    await fs.writeFile(expectedPython, "", "utf8");
    const { buildPythonCommand } = await importMossNanoProbe();

    try {
      delete process.env.PYTHON;

      const commandInfo = buildPythonCommand({
        projectRoot,
        outputDir: path.join(projectRoot, "out"),
      });

      expect(commandInfo.command).toBe(expectedPython);
      expect(commandInfo.pythonExecutable).toBe(expectedPython);
    } finally {
      if (originalPython === undefined) {
        delete process.env.PYTHON;
      } else {
        process.env.PYTHON = originalPython;
      }
    }
  });

  it("honors explicit Python and PYTHON env overrides before the Nano venv", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const originalPython = process.env.PYTHON;
    const venvPython = path.join(
      projectRoot,
      ".runtime",
      "moss",
      ".venv-nano",
      process.platform === "win32" ? "Scripts" : "bin",
      process.platform === "win32" ? "python.exe" : "python",
    );
    await fs.mkdir(path.dirname(venvPython), { recursive: true });
    await fs.writeFile(venvPython, "", "utf8");
    const envPython = path.join(projectRoot, "env-python");
    const explicitPython = path.join(projectRoot, "explicit-python");
    const { buildPythonCommand } = await importMossNanoProbe();

    try {
      process.env.PYTHON = envPython;

      expect(buildPythonCommand({
        projectRoot,
        outputDir: path.join(projectRoot, "out"),
      }).pythonExecutable).toBe(envPython);
      expect(buildPythonCommand({
        projectRoot,
        outputDir: path.join(projectRoot, "out"),
        python: explicitPython,
      }).pythonExecutable).toBe(explicitPython);
    } finally {
      if (originalPython === undefined) {
        delete process.env.PYTHON;
      } else {
        process.env.PYTHON = originalPython;
      }
    }
  });

  it("forwards runtime rescue and ORT tuning options to the Python probe command", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { buildPythonCommand } = await importMossNanoProbe();
    const profileEvents = path.join(projectRoot, "events.jsonl");

    const commandInfo = buildPythonCommand({
      projectRoot,
      outputDir: path.join(projectRoot, "out"),
      processMode: "warm",
      iterations: 3,
      warmupRuns: 1,
      prewarm: "ort-sessions",
      profileStages: true,
      profileEventsJsonl: profileEvents,
      segmentPolicy: "token-window",
      segmentMaxTokens: 12,
      segmentMaxChars: 240,
      segmentMinChars: 24,
      segmentSource: "prepared",
      writeSegmentWavs: true,
      ortProviders: "CPUExecutionProvider",
      ortIntraOpThreads: 2,
      ortInterOpThreads: 1,
      ortExecutionMode: "sequential",
      ortGraphOptimization: "basic",
      ortEnableCpuMemArena: false,
      ortEnableMemPattern: true,
      ortEnableMemReuse: false,
      ortUsePerSessionThreads: true,
      precomputeInputs: true,
    });

    expect(commandInfo.args).toEqual(expect.arrayContaining([
      "--process-mode",
      "warm",
      "--iterations",
      "3",
      "--warmup-runs",
      "1",
      "--prewarm",
      "ort-sessions",
      "--profile-stages",
      "--profile-events-jsonl",
      profileEvents,
      "--segment-policy",
      "token-window",
      "--segment-max-tokens",
      "12",
      "--segment-max-chars",
      "240",
      "--segment-min-chars",
      "24",
      "--segment-source",
      "prepared",
      "--write-segment-wavs",
      "--ort-providers",
      "CPUExecutionProvider",
      "--ort-intra-op-threads",
      "2",
      "--ort-inter-op-threads",
      "1",
      "--ort-execution-mode",
      "sequential",
      "--ort-graph-optimization",
      "basic",
      "--no-ort-enable-cpu-mem-arena",
      "--ort-enable-mem-pattern",
      "--no-ort-enable-mem-reuse",
      "--ort-use-per-session-threads",
      "--precompute-inputs",
    ]));
  });

  it("writes blocked source-download summary when the local source repo is missing", async () => {
    const tempRoot = await makeTempProject();
    tempDirs.push(tempRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(tempRoot, "artifacts", "nano");
    const runId = "nano-missing-source";

    const result = await runMossNanoProbe({
      projectRoot: process.cwd(),
      runId,
      outputDir: outputRoot,
      repoDir: path.join(tempRoot, ".runtime", "moss", "MOSS-TTS-Nano"),
      modelDir: path.join(tempRoot, ".runtime", "moss", "weights", "MOSS-TTS-Nano-ONNX"),
    });
    const { summaryPath, summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "source-download",
    });
    expect(summary).toMatchObject({
      status: "blocked",
      failureClass: "source-download",
    });
    expect(summary.summary).toMatchObject({
      firstAudioSec: null,
      firstAudioObservedSec: null,
      firstAudioObservation: {
        kind: "file-observed-wav-bytes",
        internalFirstDecodedAudioSec: null,
        internalFirstDecodedAudioSupported: false,
      },
      benchmark: {
        processMode: "cold",
        iterationsRequested: 1,
        warmupRunsRequested: 0,
        prewarm: "none",
        runtimeReuseSupported: false,
      },
      stageProfile: {
        enabled: false,
        supported: false,
      },
      segmentation: {
        policy: "none",
      },
    });
    expect(summary.summary.stageProfile.limitations).toMatch(/internal .*timings are unavailable/i);
    expect(summary.summary.checks).toContainEqual(expect.objectContaining({
      key: "sourceRepo",
      status: "fail",
      failureClass: "source-download",
    }));
    expect(summary.summary.commandMetadata).toBeNull();
    expect(result.pythonExecutable).toEqual(expect.any(String));
    expect(summary.pythonExecutable).toBe(result.pythonExecutable);
    expect(summary.summary.pythonExecutable).toEqual(expect.any(String));
    expect(JSON.stringify(summary)).not.toMatch(/git clone|curl|huggingface-cli|hf download/i);
    expect(summaryPath).toBe(path.join(outputRoot, runId, "summary.json"));
  });

  it("writes asset-download summary with expected Nano subdirs when assets are missing", async () => {
    const tempRoot = await makeTempProject();
    tempDirs.push(tempRoot);
    const repoDir = path.join(tempRoot, ".runtime", "moss", "MOSS-TTS-Nano");
    const modelDir = path.join(tempRoot, ".runtime", "moss", "weights", "MOSS-TTS-Nano-ONNX");
    await fs.mkdir(repoDir, { recursive: true });
    await fs.mkdir(modelDir, { recursive: true });
    await fs.writeFile(path.join(repoDir, "infer_onnx.py"), "# fake local source\n", "utf8");
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(tempRoot, "artifacts", "nano");
    const runId = "nano-missing-assets";

    const result = await runMossNanoProbe({
      projectRoot: process.cwd(),
      runId,
      outputDir: outputRoot,
      repoDir,
      modelDir,
    });
    const { summary } = await readSummaryJson(outputRoot, runId);
    const serialized = JSON.stringify(summary);

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "asset-download",
    });
    expect(summary).toMatchObject({
      status: "blocked",
      failureClass: "asset-download",
    });
    expect(summary.summary.expectedModelSubdirs).toEqual([
      "MOSS-TTS-Nano-100M-ONNX",
      "MOSS-Audio-Tokenizer-Nano-ONNX",
    ]);
    expect(serialized).toContain("MOSS-TTS-Nano-100M-ONNX");
    expect(serialized).toContain("MOSS-Audio-Tokenizer-Nano-ONNX");
  });

  it("invokes local infer_onnx.py with Nano ONNX CPU smoke flags", async () => {
    const tempRoot = await makeTempProject();
    tempDirs.push(tempRoot);
    const originalPythonPath = process.env.PYTHONPATH;
    const promptAudio = path.join(tempRoot, "prompt.wav");
    const { repoDir, modelDir } = await makeReadyNanoRuntime(tempRoot, {
      inferScript: [
        "import argparse, json, wave",
        "parser = argparse.ArgumentParser()",
        "parser.add_argument('--text', required=True)",
        "parser.add_argument('--output-audio-path', required=True)",
        "parser.add_argument('--model-dir', required=True)",
        "parser.add_argument('--cpu-threads', required=True)",
        "parser.add_argument('--max-new-frames', required=True)",
        "parser.add_argument('--sample-mode', required=True)",
        "parser.add_argument('--voice', required=True)",
        "parser.add_argument('--prompt-audio-path')",
        "parser.add_argument('--realtime-streaming-decode', choices=['0', '1'], required=True)",
        "parser.add_argument('--disable-wetext-processing', action='store_true')",
        "args = parser.parse_args()",
        "with wave.open(args.output_audio_path, 'wb') as wav:",
        "    wav.setnchannels(1)",
        "    wav.setsampwidth(2)",
        "    wav.setframerate(48000)",
        "    wav.writeframes(b'\\0\\0' * 48000)",
        "print(json.dumps(vars(args)))",
      ].join("\n"),
    });
    await fs.writeFile(promptAudio, "fake prompt\n", "utf8");
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(tempRoot, "artifacts", "nano");
    const runId = "nano-direct-infer-contract";

    let result;
    try {
      process.env.PYTHONPATH = originalPythonPath ? `${repoDir}${path.delimiter}${originalPythonPath}` : repoDir;
      result = await runMossNanoProbe({
        projectRoot: process.cwd(),
        runId,
        outputDir: outputRoot,
        repoDir,
        modelDir,
        threads: 2,
        promptAudio,
      });
    } finally {
      if (originalPythonPath === undefined) {
        delete process.env.PYTHONPATH;
      } else {
        process.env.PYTHONPATH = originalPythonPath;
      }
    }
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.summary.commandMetadata.cwd).toBe(path.resolve(repoDir));
    expect(summary.summary.commandMetadata.argv).toEqual(expect.arrayContaining([
      path.resolve(repoDir, "infer_onnx.py"),
      "--output-audio-path",
      summary.summary.outputWavPath,
      "--model-dir",
      modelDir,
      "--cpu-threads",
      "2",
      "--prompt-audio-path",
      promptAudio,
      "--realtime-streaming-decode",
      "1",
      "--disable-wetext-processing",
    ]));
    expect(summary.summary.commandMetadata.argv).not.toEqual(expect.arrayContaining([
      "--output",
      "--threads",
      "--prompt-audio",
    ]));
    expect(summary.summary.checks).toContainEqual(expect.objectContaining({
      key: "pythonDependency",
      status: "pass",
      detail: expect.stringContaining("sentencepiece"),
    }));
  });

  it("passes relative prompt audio to infer_onnx.py as an absolute path", async () => {
    const tempRoot = await makeTempProject();
    tempDirs.push(tempRoot);
    const originalPythonPath = process.env.PYTHONPATH;
    const promptAudio = path.join(tempRoot, "prompt-relative.wav");
    const relativePromptAudio = path.relative(process.cwd(), promptAudio);
    const { repoDir, modelDir } = await makeReadyNanoRuntime(tempRoot, {
      inferScript: [
        "import argparse, os, wave",
        "parser = argparse.ArgumentParser()",
        "parser.add_argument('--text', required=True)",
        "parser.add_argument('--output-audio-path', required=True)",
        "parser.add_argument('--model-dir', required=True)",
        "parser.add_argument('--cpu-threads', required=True)",
        "parser.add_argument('--max-new-frames', required=True)",
        "parser.add_argument('--sample-mode', required=True)",
        "parser.add_argument('--voice', required=True)",
        "parser.add_argument('--prompt-audio-path')",
        "parser.add_argument('--realtime-streaming-decode', choices=['0', '1'], required=True)",
        "parser.add_argument('--disable-wetext-processing', action='store_true')",
        "args = parser.parse_args()",
        "assert os.path.isabs(args.prompt_audio_path), args.prompt_audio_path",
        "with wave.open(args.output_audio_path, 'wb') as wav:",
        "    wav.setnchannels(1)",
        "    wav.setsampwidth(2)",
        "    wav.setframerate(48000)",
        "    wav.writeframes(b'\\0\\0' * 48000)",
      ].join("\n"),
    });
    await fs.writeFile(promptAudio, "fake prompt\n", "utf8");
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(tempRoot, "artifacts", "nano");
    const runId = "nano-relative-prompt";

    let result;
    try {
      process.env.PYTHONPATH = originalPythonPath ? `${repoDir}${path.delimiter}${originalPythonPath}` : repoDir;
      result = await runMossNanoProbe({
        projectRoot: process.cwd(),
        runId,
        outputDir: outputRoot,
        repoDir,
        modelDir,
        promptAudio: relativePromptAudio,
      });
    } finally {
      if (originalPythonPath === undefined) {
        delete process.env.PYTHONPATH;
      } else {
        process.env.PYTHONPATH = originalPythonPath;
      }
    }
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.summary.commandMetadata.argv).toEqual(expect.arrayContaining([
      "--prompt-audio-path",
      path.resolve(relativePromptAudio),
    ]));
    expect(summary.summary.commandMetadata.effective.promptAudio).toBe(path.resolve(relativePromptAudio));
  });

  it("removes a pre-existing output WAV before observing first audio", async () => {
    const tempRoot = await makeTempProject();
    tempDirs.push(tempRoot);
    const originalPythonPath = process.env.PYTHONPATH;
    const { repoDir, modelDir } = await makeReadyNanoRuntime(tempRoot, {
      inferScript: [
        "import argparse, os, wave",
        "parser = argparse.ArgumentParser()",
        "parser.add_argument('--text', required=True)",
        "parser.add_argument('--output-audio-path', required=True)",
        "parser.add_argument('--model-dir', required=True)",
        "parser.add_argument('--cpu-threads', required=True)",
        "parser.add_argument('--max-new-frames', required=True)",
        "parser.add_argument('--sample-mode', required=True)",
        "parser.add_argument('--voice', required=True)",
        "parser.add_argument('--prompt-audio-path')",
        "parser.add_argument('--realtime-streaming-decode', choices=['0', '1'], required=True)",
        "parser.add_argument('--disable-wetext-processing', action='store_true')",
        "args = parser.parse_args()",
        "if os.path.exists(args.output_audio_path):",
        "    raise SystemExit('stale output file was not reset')",
        "with wave.open(args.output_audio_path, 'wb') as wav:",
        "    wav.setnchannels(1)",
        "    wav.setsampwidth(2)",
        "    wav.setframerate(48000)",
        "    wav.writeframes(b'\\0\\0' * 4800)",
      ].join("\n"),
    });
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(tempRoot, "artifacts", "nano");
    const runId = "nano-reset-stale-output";
    const runDir = path.join(outputRoot, runId);
    const staleOutputWav = path.join(runDir, "output.wav");
    await fs.mkdir(runDir, { recursive: true });
    await fs.writeFile(staleOutputWav, Buffer.alloc(4096, 1));

    let result;
    try {
      process.env.PYTHONPATH = originalPythonPath ? `${repoDir}${path.delimiter}${originalPythonPath}` : repoDir;
      result = await runMossNanoProbe({
        projectRoot: process.cwd(),
        runId,
        outputDir: outputRoot,
        repoDir,
        modelDir,
      });
    } finally {
      if (originalPythonPath === undefined) {
        delete process.env.PYTHONPATH;
      } else {
        process.env.PYTHONPATH = originalPythonPath;
      }
    }
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.summary.outputWavPath).toBe(staleOutputWav);
    expect(summary.summary.outputPath).toBe(staleOutputWav);
    expect(summary.summary.firstAudioObservation).toMatchObject({
      kind: "file-observed-wav-bytes",
      fileResetBeforeRun: true,
      internalFirstDecodedAudioSec: null,
      internalFirstDecodedAudioSupported: false,
    });
    expect(summary.summary.iterations[0].segments[0].firstAudioObservation).toMatchObject({
      fileResetBeforeRun: true,
      internalFirstDecodedAudioSec: null,
    });
    expect(summary.summary.firstAudioSec).toBe(summary.summary.firstAudioObservedSec);
  });

  it("blocks instead of executing a global moss-tts-nano from PATH when local infer_onnx.py is absent", async () => {
    const tempRoot = await makeTempProject();
    tempDirs.push(tempRoot);
    const originalPath = process.env.PATH;
    const originalPythonPath = process.env.PYTHONPATH;
    const fakeBin = path.join(tempRoot, "bin");
    await fs.mkdir(fakeBin, { recursive: true });
    await fs.writeFile(path.join(fakeBin, "moss-tts-nano.cmd"), "@echo off\r\nexit /b 42\r\n", "utf8");
    const { repoDir, modelDir } = await makeReadyNanoRuntime(tempRoot, { writeInfer: false });
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(tempRoot, "artifacts", "nano");
    const runId = "nano-no-global-path-fallback";

    let result;
    try {
      process.env.PATH = `${fakeBin}${path.delimiter}${originalPath ?? ""}`;
      process.env.PYTHONPATH = originalPythonPath ? `${repoDir}${path.delimiter}${originalPythonPath}` : repoDir;
      result = await runMossNanoProbe({
        projectRoot: process.cwd(),
        runId,
        outputDir: outputRoot,
        repoDir,
        modelDir,
      });
    } finally {
      if (originalPath === undefined) {
        delete process.env.PATH;
      } else {
        process.env.PATH = originalPath;
      }
      if (originalPythonPath === undefined) {
        delete process.env.PYTHONPATH;
      } else {
        process.env.PYTHONPATH = originalPythonPath;
      }
    }
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.summary.commandMetadata).toBeNull();
    expect(summary.summary.checks).toContainEqual(expect.objectContaining({
      key: "entrypoint",
      status: "fail",
      failureClass: "runtime-contract",
    }));
    expect(summary.summary.error).toMatch(/No local Nano ONNX entrypoint was found/i);
    expect(JSON.stringify(summary)).not.toContain("moss-tts-nano.cmd");
  });

  it.each([
    {
      policy: "first-sentence",
      text: "Alpha one. Beta two should be omitted.",
      options: {},
      expectedSegments: 1,
    },
    {
      policy: "natural-break",
      text: "Alpha one. Beta two. Gamma three.",
      options: { segmentMaxChars: 14, segmentMinChars: 1 },
      expectedSegments: 3,
    },
    {
      policy: "token-window",
      text: "one two three four five six seven",
      options: { segmentMaxTokens: 3 },
      expectedSegments: 3,
    },
    {
      policy: "char-window",
      text: "abcdefghij klmnopqrst uvwxyz",
      options: { segmentMaxChars: 10 },
      expectedSegments: 3,
    },
  ])("records $policy segmentation metadata and aggregate timing fields", async ({
    policy,
    text,
    options,
    expectedSegments,
  }) => {
    const tempRoot = await makeTempProject();
    tempDirs.push(tempRoot);
    const originalPythonPath = process.env.PYTHONPATH;
    const { repoDir, modelDir } = await makeReadyNanoRuntime(tempRoot, {
      inferScript: fakeInferScript(),
    });
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(tempRoot, "artifacts", "nano");
    const runId = `nano-segment-${policy}`;

    let result;
    try {
      process.env.PYTHONPATH = originalPythonPath ? `${repoDir}${path.delimiter}${originalPythonPath}` : repoDir;
      result = await runMossNanoProbe({
        projectRoot: process.cwd(),
        runId,
        outputDir: outputRoot,
        repoDir,
        modelDir,
        passageText: text,
        segmentPolicy: policy,
        writeSegmentWavs: true,
        ...options,
      });
    } finally {
      if (originalPythonPath === undefined) {
        delete process.env.PYTHONPATH;
      } else {
        process.env.PYTHONPATH = originalPythonPath;
      }
    }
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.summary.segmentation).toMatchObject({
      policy,
      source: "raw",
      writeSegmentWavs: true,
    });
    expect(summary.summary.segmentation.segments).toHaveLength(expectedSegments);
    expect(summary.summary.segmentation.segments[0]).toEqual(expect.objectContaining({
      index: 0,
      charCount: expect.any(Number),
      wordCount: expect.any(Number),
    }));
    expect(summary.summary.commandMetadata.effective.segmentPolicy).toBe(policy);
    expect(summary.summary.iterations).toHaveLength(1);
    expect(summary.summary.iterations[0]).toMatchObject({
      processMode: "cold",
      runtimeReuseActual: false,
      segmentCount: expectedSegments,
    });
    expect(summary.summary.iterations[0].segments).toHaveLength(expectedSegments);
    expect(summary.summary.segmentOutputWavPaths).toHaveLength(expectedSegments);
    expect(summary.summary.iterations[0].segmentOutputWavPaths).toEqual(summary.summary.segmentOutputWavPaths);
    await Promise.all(summary.summary.segmentOutputWavPaths.map((wavPath) => fs.access(wavPath)));
    if (expectedSegments > 1) {
      expect(summary.summary.outputWavPath).toBeNull();
      expect(summary.summary.outputPath).toBeNull();
      await expect(fs.access(path.join(outputRoot, runId, "output.wav"))).rejects.toThrow();
    } else {
      expect(summary.summary.outputWavPath).toBe(summary.summary.segmentOutputWavPaths[0]);
      expect(summary.summary.outputPath).toBe(summary.summary.segmentOutputWavPaths[0]);
    }
    expect(summary.summary.aggregate).toMatchObject({
      iterations: 1,
      warmupsExcluded: 0,
      totalSec: expect.any(Object),
      firstAudioObservedSec: expect.any(Object),
      audioDurationSec: expect.any(Object),
      rtf: expect.any(Object),
    });
  });

  it("records benchmark, stage, ORT, and first-audio observation contract for warm multi-iteration runs", async () => {
    const tempRoot = await makeTempProject();
    tempDirs.push(tempRoot);
    const originalPythonPath = process.env.PYTHONPATH;
    const { repoDir, modelDir } = await makeReadyNanoRuntime(tempRoot, {
      inferScript: fakeInferScript(),
    });
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(tempRoot, "artifacts", "nano");
    const runId = "nano-runtime-rescue-contract";
    const profileEventsJsonl = path.join(tempRoot, "profile-events.jsonl");

    let result;
    try {
      process.env.PYTHONPATH = originalPythonPath ? `${repoDir}${path.delimiter}${originalPythonPath}` : repoDir;
      result = await runMossNanoProbe({
        projectRoot: process.cwd(),
        runId,
        outputDir: outputRoot,
        repoDir,
        modelDir,
        passageText: "one two three four five six seven eight",
        processMode: "warm",
        iterations: 2,
        warmupRuns: 1,
        prewarm: "ort-sessions",
        profileStages: true,
        profileEventsJsonl,
        segmentPolicy: "token-window",
        segmentMaxTokens: 4,
        writeSegmentWavs: true,
        ortProviders: "CPUExecutionProvider",
        ortIntraOpThreads: 2,
        ortInterOpThreads: 1,
        ortExecutionMode: "sequential",
        ortGraphOptimization: "basic",
        ortEnableCpuMemArena: false,
        ortEnableMemPattern: true,
        ortEnableMemReuse: false,
        ortUsePerSessionThreads: true,
        precomputeInputs: true,
      });
    } finally {
      if (originalPythonPath === undefined) {
        delete process.env.PYTHONPATH;
      } else {
        process.env.PYTHONPATH = originalPythonPath;
      }
    }
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.summary.benchmark).toMatchObject({
      processMode: "warm",
      iterationsRequested: 2,
      warmupRunsRequested: 1,
      prewarm: "ort-sessions",
      runtimeReuseRequested: true,
      runtimeReuseSupported: false,
      runtimeReuseActual: false,
      precomputeInputsRequested: true,
    });
    expect(summary.summary.commandMetadata.requested).toMatchObject({
      processMode: "warm",
      iterations: 2,
      warmupRuns: 1,
      prewarm: "ort-sessions",
      profileStages: true,
      segmentPolicy: "token-window",
      segmentMaxTokens: 4,
      writeSegmentWavs: true,
      precomputeInputs: true,
    });
    expect(summary.summary.commandMetadata.effective).toMatchObject({
      processMode: "warm",
      iterations: 2,
      warmupRuns: 1,
      prewarm: "ort-sessions",
      profileStages: true,
      segmentPolicy: "token-window",
      writeSegmentWavs: true,
      precomputeInputs: true,
    });
    expect(summary.summary.checks).toContainEqual(expect.objectContaining({
      key: "runtimeReuse",
      status: "warn",
      detail: expect.stringMatching(/can only launch .* subprocess/i),
    }));
    expect(summary.summary.checks).toContainEqual(expect.objectContaining({
      key: "prewarm",
      status: "warn",
      detail: expect.stringMatching(/unsupported .* subprocess boundary/i),
    }));
    expect(summary.summary.ort).toMatchObject({
      requested: {
        providers: ["CPUExecutionProvider"],
        intraOpThreads: 2,
        interOpThreads: 1,
        executionMode: "sequential",
        graphOptimization: "basic",
        enableCpuMemArena: false,
        enableMemPattern: true,
        enableMemReuse: false,
        usePerSessionThreads: true,
      },
      available: {
        directSessionConfiguration: false,
      },
      appliedToCommand: false,
      unsupported: true,
    });
    expect(summary.summary.ort.available.reason).toMatch(/cannot safely mutate .* SessionOptions/i);
    expect(summary.summary.stageProfile).toMatchObject({
      enabled: true,
      supported: false,
      stagesSec: {
        precomputeInputs: null,
        runtimeStartup: null,
        modelLoad: null,
        tokenize: null,
        prepareInputs: null,
        onnxInference: null,
        decode: null,
        writeWav: null,
        internalFirstDecodedAudio: null,
      },
    });
    expect(summary.summary.stageProfile.limitations).toMatch(/internal .*timings are unavailable/i);
    expect(summary.summary.warmups).toHaveLength(1);
    expect(summary.summary.iterations).toHaveLength(2);
    expect(summary.summary.aggregate).toMatchObject({
      iterations: 2,
      warmupsExcluded: 1,
    });
    expect(summary.summary.firstAudioObservation).toMatchObject({
      kind: "file-observed-wav-bytes",
      fileResetBeforeRun: true,
      fieldAliases: ["firstAudioSec"],
      internalFirstDecodedAudioSec: null,
      internalFirstDecodedAudioSupported: false,
    });
    expect(summary.summary.outputWavPath).toBeNull();
    expect(summary.summary.outputPath).toBeNull();
    expect(summary.summary.segmentOutputWavPaths).toHaveLength(2);
    await expect(fs.access(path.join(outputRoot, runId, "output.wav"))).rejects.toThrow();
    await Promise.all(summary.summary.segmentOutputWavPaths.map((wavPath) => fs.access(wavPath)));
    expect(summary.summary.firstAudioObservedSec).toEqual(expect.any(Number));
    expect(summary.summary.firstAudioSec).toBe(summary.summary.firstAudioObservedSec);
    expect(summary.summary.firstAudioObservation.internalFirstDecodedAudioSec).toBeNull();
    expect(summary.summary.firstAudioObservation.kind).not.toBe("internal-first-decoded-audio");
  });

  it("routes resident requests through a resident probe and preserves resident timing, reuse, and ORT evidence", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano-resident-route";
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(residentNanoSummary({ runId }))}\n`,
      stderr: "",
    }));

    const result = await runMossNanoProbe({
      projectRoot,
      runId,
      outputDir: outputRoot,
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 2,
      warmupRuns: 1,
      prewarm: "ort-sessions",
      profileStages: true,
      ortProviders: "CPUExecutionProvider",
      ortIntraOpThreads: 2,
      ortInterOpThreads: 1,
      ortExecutionMode: "sequential",
      ortGraphOptimization: "basic",
      ortEnableCpuMemArena: false,
      ortEnableMemPattern: true,
      ortEnableMemReuse: false,
      ortUsePerSessionThreads: true,
      execFile,
    });
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile.mock.calls[0][1][0]).toMatch(/moss_nano_resident_probe\.py$/);
    expect(execFile.mock.calls[0][1]).toEqual(expect.arrayContaining([
      "--runtime-mode",
      "resident",
    ]));
    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.summary).toMatchObject({
      runtimeMode: "resident",
      internalFirstDecodedAudioMs: 120,
      firstAudioObservedSec: null,
      benchmark: {
        runtimeReuseSupported: true,
        runtimeReuseActual: true,
      },
      firstAudioObservation: {
        kind: "internal-first-decoded-audio",
        sourceEvent: "firstDecodedAudio",
        reusedExistingOutputFile: false,
      },
      ortOptionsRequested: expect.any(Object),
      ortOptionsApplied: expect.any(Object),
      ortOptionsUnsupported: expect.any(Object),
    });
    expect(summary.summary.ortOptionsApplied).not.toEqual(summary.summary.ortOptionsRequested);
  });

  it("blocks resident summaries that claim runtime reuse without stable process and session identities", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano-resident-false-reuse";
    const changedSessionIdentity = residentRuntimeIdentity({
      loadedSessionIdentities: {
        semantic: "semantic-session:beta",
        acoustic: "acoustic-session:alpha",
        audioTokenizer: "audio-tokenizer-session:alpha",
      },
    });
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(residentNanoSummary({
        runId,
        iterations: [
          residentIteration({ iterationIndex: 0 }),
          residentIteration({ iterationIndex: 1, runtimeIdentity: changedSessionIdentity }),
        ],
      }))}\n`,
      stderr: "",
    }));

    const result = await runMossNanoProbe({
      projectRoot,
      runId,
      outputDir: outputRoot,
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 2,
      warmupRuns: 1,
      prewarm: "ort-sessions",
      execFile,
    });
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.summary.benchmark.runtimeReuseActual).toBe(false);
    expect(summary.summary.error).toMatch(/runtime reuse.*identity/i);
    expect(summary.summary.checks).toContainEqual(expect.objectContaining({
      key: "runtimeReuse",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("blocks promotion-class resident summaries that use WAV polling as first-audio evidence", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano-resident-file-polling-first-audio";
    const fileObservedFirstAudio = {
      kind: "file-observed-wav-bytes",
      thresholdBytes: 44,
      fileResetBeforeRun: true,
      internalFirstDecodedAudioMs: null,
      internalFirstDecodedAudioSupported: false,
      reusedExistingOutputFile: false,
    };
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(residentNanoSummary({
        runId,
        promotionClass: true,
        firstAudioSec: 0.03,
        firstAudioObservedSec: 0.03,
        internalFirstDecodedAudioMs: null,
        firstAudioObservation: fileObservedFirstAudio,
        iterations: [
          residentIteration({
            iterationIndex: 0,
            firstAudioSec: 0.03,
            firstAudioObservedSec: 0.03,
            internalFirstDecodedAudioMs: null,
            firstAudioObservation: fileObservedFirstAudio,
          }),
        ],
      }))}\n`,
      stderr: "",
    }));

    const result = await runMossNanoProbe({
      projectRoot,
      runId,
      outputDir: outputRoot,
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 1,
      prewarm: "ort-sessions",
      execFile,
    });
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.summary.error).toMatch(/internal first decoded audio/i);
    expect(summary.summary.firstAudioObservation.kind).not.toBe("file-observed-wav-bytes");
  });

  it("blocks resident summaries that collapse requested ORT options into unsupported subprocess metadata", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano-resident-ort-requested-only";
    const requestedOnlySummary = residentNanoSummary({ runId });
    delete requestedOnlySummary.ortOptionsRequested;
    delete requestedOnlySummary.ortOptionsApplied;
    delete requestedOnlySummary.ortOptionsUnsupported;
    requestedOnlySummary.ort = {
      requested: {
        providers: ["CPUExecutionProvider"],
        intraOpThreads: 2,
        usePerSessionThreads: true,
      },
      available: {
        directSessionConfiguration: false,
      },
      appliedToCommand: false,
      unsupported: true,
    };
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(requestedOnlySummary)}\n`,
      stderr: "",
    }));

    const result = await runMossNanoProbe({
      projectRoot,
      runId,
      outputDir: outputRoot,
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 2,
      prewarm: "ort-sessions",
      ortProviders: "CPUExecutionProvider",
      ortIntraOpThreads: 2,
      ortUsePerSessionThreads: true,
      execFile,
    });
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.summary.error).toMatch(/ortOptionsRequested.*ortOptionsApplied/i);
    expect(summary.summary.ortOptionsRequested).toMatchObject({
      providers: ["CPUExecutionProvider"],
      intraOpThreads: 2,
      usePerSessionThreads: true,
    });
    expect(summary.summary.ortOptionsApplied).toEqual(expect.any(Object));
    expect(summary.summary.ortOptionsUnsupported).toMatchObject({
      usePerSessionThreads: expect.any(Object),
    });
  });

  it("blocks repeated resident warm runs that reuse an existing output file as first-audio evidence", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano-resident-stale-output-evidence";
    const staleOutputObservation = internalFirstDecodedAudioObservation({
      kind: "file-observed-wav-bytes",
      outputFileExistedBeforeRun: true,
      reusedExistingOutputFile: true,
      internalFirstDecodedAudioMs: null,
      internalFirstDecodedAudioSec: null,
      internalFirstDecodedAudioSupported: false,
    });
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(residentNanoSummary({
        runId,
        firstAudioObservation: staleOutputObservation,
        iterations: [
          residentIteration({ iterationIndex: 0 }),
          residentIteration({
            iterationIndex: 1,
            firstAudioObservation: staleOutputObservation,
          }),
        ],
      }))}\n`,
      stderr: "",
    }));

    const result = await runMossNanoProbe({
      projectRoot,
      runId,
      outputDir: outputRoot,
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 2,
      warmupRuns: 1,
      prewarm: "ort-sessions",
      execFile,
    });
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.summary.error).toMatch(/existing output file.*first-audio/i);
    expect(summary.summary.iterations[1].firstAudioObservation).toMatchObject({
      outputFileExistedBeforeRun: true,
      reusedExistingOutputFile: true,
    });
  });

  it("passes MOSS-NANO-4 resident optimization tuning options through to Python", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { buildPythonCommand } = await importMossNanoProbe();

    const commandInfo = buildPythonCommand({
      projectRoot,
      outputDir: path.join(projectRoot, "out"),
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 3,
      warmupRuns: 1,
      optimizationProfile: "resident-cpu-low-latency",
      providerVariant: "cpu-threads-2-sequential",
      tokenizerReuse: true,
      promptReuse: true,
      shortPassageOverheadReduction: true,
      bookLikeWarmRuns: 3,
    });

    expect(commandInfo.args).toEqual(expect.arrayContaining([
      "--runtime-mode",
      "resident",
      "--optimization-profile",
      "resident-cpu-low-latency",
      "--provider-variant",
      "cpu-threads-2-sequential",
      "--reuse-tokenizer",
      "--reuse-prompt",
      "--short-passage-overhead-reduction",
      "--book-like-warm-runs",
      "3",
    ]));
  });

  it("normalizes resident optimization evidence into first-class summary fields", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano-resident-optimization-evidence";
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(residentNanoSummary({
        runId,
        promotionClass: true,
        optimization: {
          profile: "resident-cpu-low-latency",
          evidence: {
            status: "applied",
            evidenceRunId: "moss-nano-4-resident-optimization",
            requestedOnly: false,
            stale: false,
          },
          providerVariant: "cpu-threads-2-sequential",
          tokenizerReuseActual: true,
          promptReuseActual: true,
          shortPassageOverheadReduction: {
            requested: true,
            actual: true,
            strategy: "batch-short-passages",
          },
          bookLikeRunStats: {
            requestedWarmRuns: 3,
            completedWarmRuns: 3,
            internalFirstDecodedAudioFreshRuns: 3,
            staleOutputReuseCount: 0,
          },
        },
      }))}\n`,
      stderr: "",
    }));

    await runMossNanoProbe({
      projectRoot,
      runId,
      outputDir: outputRoot,
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 3,
      warmupRuns: 1,
      optimizationProfile: "resident-cpu-low-latency",
      providerVariant: "cpu-threads-2-sequential",
      tokenizerReuse: true,
      promptReuse: true,
      shortPassageOverheadReduction: true,
      bookLikeWarmRuns: 3,
      execFile,
    });
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(summary.summary).toMatchObject({
      optimizationProfile: "resident-cpu-low-latency",
      providerVariant: "cpu-threads-2-sequential",
      tokenizerReuseActual: true,
      promptReuseActual: true,
      shortPassageOverheadReduction: {
        requested: true,
        actual: true,
      },
      bookLikeRunStats: {
        requestedWarmRuns: 3,
        completedWarmRuns: 3,
        internalFirstDecodedAudioFreshRuns: 3,
        staleOutputReuseCount: 0,
      },
      optimizationEvidence: {
        status: "applied",
        evidenceRunId: "moss-nano-4-resident-optimization",
        requestedOnly: false,
        stale: false,
      },
    });
  });

  it.each([
    [
      "missing",
      (overrides) => {
        const summary = optimizedResidentNanoSummary(overrides);
        delete summary.optimizationEvidence;
        return summary;
      },
      /optimization evidence.*missing/i,
    ],
    [
      "requested-only",
      (overrides) => optimizedResidentNanoSummary({
        ...overrides,
        optimizationEvidence: {
          status: "requested",
          profile: "resident-cpu-low-latency",
          providerVariant: "cpu-threads-2-sequential",
          requestedOnly: true,
          stale: false,
        },
      }),
      /optimization evidence.*requested-only/i,
    ],
    [
      "stale",
      (overrides) => optimizedResidentNanoSummary({
        ...overrides,
        optimizationEvidence: {
          status: "applied",
          profile: "resident-cpu-low-latency",
          providerVariant: "cpu-threads-2-sequential",
          requestedOnly: false,
          stale: true,
          evidenceGeneratedAt: "2026-04-01T00:00:00.000Z",
        },
      }),
      /optimization evidence.*stale/i,
    ],
  ])("blocks promotion-class resident summaries with %s optimization evidence", async (_caseName, makeSummary, errorPattern) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano-resident-optimization-${_caseName}`;
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(makeSummary({ runId }))}\n`,
      stderr: "",
    }));

    const result = await runMossNanoProbe({
      projectRoot,
      runId,
      outputDir: outputRoot,
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 3,
      warmupRuns: 1,
      execFile,
    });
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.summary.error).toMatch(errorPattern);
    expect(summary.summary.checks).toContainEqual(expect.objectContaining({
      key: "optimizationEvidence",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("blocks promotion-class resident summaries when short RTF or first-decoded thresholds are missed", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano-resident-promotion-threshold-miss";
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(optimizedResidentNanoSummary({
        runId,
        totalSec: 1.2,
        audioDurationSec: 1,
        rtf: 1.2,
        firstAudioSec: 0.42,
        internalFirstDecodedAudioMs: 420,
        firstAudioObservation: internalFirstDecodedAudioObservation({
          internalFirstDecodedAudioMs: 420,
          internalFirstDecodedAudioSec: 0.42,
        }),
        promotionThresholds: {
          shortRtfMax: 0.6,
          firstDecodedAudioSecMax: 0.25,
        },
        promotionMetrics: {
          shortRtf: 1.2,
          firstDecodedAudioSec: 0.42,
        },
        promotionDecision: {
          promote: true,
          target: "moss-nano-4-resident-optimized",
        },
      }))}\n`,
      stderr: "",
    }));

    const result = await runMossNanoProbe({
      projectRoot,
      runId,
      outputDir: outputRoot,
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 3,
      warmupRuns: 1,
      execFile,
    });
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "performance",
    });
    expect(summary.summary.error).toMatch(/promotion.*threshold/i);
    expect(summary.summary.checks).toContainEqual(expect.objectContaining({
      key: "promotionThresholds",
      status: "fail",
      failureClass: "performance",
    }));
  });

  it.each([
    [
      "missing thresholds",
      (overrides) => {
        const summary = optimizedResidentNanoSummary(overrides);
        delete summary.promotionThresholds;
        return summary;
      },
      /promotion.*threshold.*missing/i,
    ],
    [
      "missing metrics",
      (overrides) => {
        const summary = optimizedResidentNanoSummary(overrides);
        delete summary.promotionMetrics;
        return summary;
      },
      /promotion.*metric.*missing/i,
    ],
    [
      "non-numeric threshold",
      (overrides) => optimizedResidentNanoSummary({
        ...overrides,
        promotionThresholds: {
          shortRtfMax: "fast-enough",
          firstDecodedAudioSecMax: 0.25,
        },
      }),
      /promotion.*threshold.*numeric/i,
    ],
    [
      "NaN metric",
      (overrides) => optimizedResidentNanoSummary({
        ...overrides,
        promotionMetrics: {
          shortRtf: "NaN",
          firstDecodedAudioSec: 0.12,
        },
      }),
      /promotion.*metric.*numeric/i,
    ],
  ])("blocks promotion-class resident summaries with %s promotion gates", async (_caseName, makeSummary, errorPattern) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano-resident-promotion-gate-${_caseName.replaceAll(" ", "-")}`;
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(makeSummary({ runId }))}\n`,
      stderr: "",
    }));

    const result = await runMossNanoProbe({
      projectRoot,
      runId,
      outputDir: outputRoot,
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 3,
      warmupRuns: 1,
      execFile,
    });
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "performance",
    });
    expect(summary.summary.error).toMatch(errorPattern);
    expect(summary.summary.checks).toContainEqual(expect.objectContaining({
      key: "promotionThresholds",
      status: "fail",
      failureClass: "performance",
    }));
  });

  it.each([
    [
      "precomputed inputs",
      {
        precomputeInputsRequested: true,
        precomputeInputsActual: false,
      },
      /precompute inputs.*requested.*not proven/i,
    ],
    [
      "tokenizer reuse",
      {
        tokenizerReuseRequested: true,
        tokenizerReuseActual: false,
      },
      /tokenizer reuse.*requested.*not proven/i,
    ],
    [
      "prompt reuse",
      {
        promptReuseRequested: true,
        promptReuseActual: false,
      },
      /prompt reuse.*requested.*not proven/i,
    ],
  ])("blocks promotion-class resident summaries when applied evidence contradicts requested %s", async (_caseName, contradiction, errorPattern) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano-resident-contradicted-${_caseName.replaceAll(" ", "-")}`;
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(optimizedResidentNanoSummary({
        runId,
        optimizationEvidence: {
          status: "applied",
          requestedOnly: false,
          stale: false,
        },
        ...contradiction,
      }))}\n`,
      stderr: "",
    }));

    const result = await runMossNanoProbe({
      projectRoot,
      runId,
      outputDir: outputRoot,
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 3,
      warmupRuns: 1,
      execFile,
    });
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.summary.error).toMatch(errorPattern);
    expect(summary.summary.checks).toContainEqual(expect.objectContaining({
      key: "optimizationEvidence",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("blocks book-like warm-run evidence unless repeated fresh internal first decoded audio is proven", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano-resident-book-like-stale-evidence";
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(optimizedResidentNanoSummary({
        runId,
        bookLikeRunStats: {
          requestedWarmRuns: 3,
          completedWarmRuns: 3,
          internalFirstDecodedAudioFreshRuns: 2,
          staleOutputReuseCount: 1,
          internalFirstDecodedAudioMs: [110, null, 112],
        },
      }))}\n`,
      stderr: "",
    }));

    const result = await runMossNanoProbe({
      projectRoot,
      runId,
      outputDir: outputRoot,
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 3,
      warmupRuns: 1,
      execFile,
    });
    const { summary } = await readSummaryJson(outputRoot, runId);

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.summary.error).toMatch(/book-like.*fresh internal first decoded audio/i);
    expect(summary.summary.checks).toContainEqual(expect.objectContaining({
      key: "bookLikeWarmRuns",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("forwards MOSS-NANO-5 resident precompute, decode, and adjacent-segment flags to Python", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { buildPythonCommand } = await importMossNanoProbe();

    const commandInfo = buildPythonCommand({
      projectRoot,
      outputDir: path.join(projectRoot, "out"),
      runtimeMode: "resident",
      processMode: "warm",
      iterations: 5,
      warmupRuns: 1,
      precomputeInputs: true,
      residentDecodeMode: "full",
      streamDecodeFrameBudget: 24,
      adjacentSegmentCount: 5,
      adjacentSegmentSource: "book-like",
      adjacentSegmentRtfTrendMax: 0.15,
    });

    expect(commandInfo.args).toEqual(expect.arrayContaining([
      "--runtime-mode",
      "resident",
      "--precompute-inputs",
      "--resident-decode-mode",
      "full",
      "--stream-decode-frame-budget",
      "24",
      "--adjacent-segment-count",
      "5",
      "--adjacent-segment-source",
      "book-like",
      "--adjacent-segment-rtf-trend-max",
      "0.15",
    ]));
  });

  it("forwards MOSS-NANO-6 soak, shutdown, adjacent, and app-prototype options through the wrapper path", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-wrapper-forwarding";
    const { parseArgs, runMossNanoProbe } = await importMossNanoProbe();
    const cliOptions = parseArgs([
      "--run-id",
      runId,
      "--out",
      outputRoot,
      "--runtime-mode",
      "resident",
      "--process-mode",
      "warm",
      "--resident-decode-mode",
      "stream",
      "--nano6-soak",
      "--soak-duration-sec",
      "1800",
      "--soak-sample-interval-sec",
      "30",
      "--shutdown-restart-evidence",
      "--adjacent-segment-count",
      "100",
      "--adjacent-segment-source",
      "book-like",
    ]);
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(nano6ReadinessSummary({ runId }))}\n`,
      stderr: "",
    }));

    const result = await runMossNanoProbe({
      projectRoot,
      ...cliOptions,
      execFile,
    });

    expect(cliOptions).toMatchObject({
      nano6Soak: true,
      soakDurationSec: 1800,
      soakSampleIntervalSec: 30,
      shutdownRestartEvidence: true,
      adjacentSegmentCount: 100,
      adjacentSegmentSource: "book-like",
      promotionTarget: "app-prototype",
    });
    const [, pythonArgs] = execFile.mock.calls[0];
    expect(pythonArgs[0]).toContain(path.join("scripts", "moss_nano_resident_probe.py"));
    expect(pythonArgs).toEqual(expect.arrayContaining([
      "--runtime-mode",
      "resident",
      "--resident-decode-mode",
      "stream",
      "--nano6-soak",
      "--soak-duration-sec",
      "1800",
      "--soak-sample-interval-sec",
      "30",
      "--shutdown-restart-evidence",
      "--adjacent-segment-count",
      "100",
      "--adjacent-segment-source",
      "book-like",
    ]));
    expect(result.summary).toMatchObject({
      promotionTarget: "app-prototype",
      promotionDecision: {
        target: "app-prototype",
        decision: expect.any(String),
      },
      nano6Readiness: {
        gate: "app-prototype",
      },
      residentSoak: {
        requestedDurationSec: 1800,
        sampleIntervalSec: 30,
      },
      bookLikeAdjacentRun: {
        requestedSegments: 100,
      },
    });
  });

  it("parses the MOSS-NANO-5C segment-first soak target without forwarding wrapper-only classification to Python", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { buildPythonCommand, parseArgs } = await importMossNanoProbe();

    expect(parseArgs(["--nano5c-segment-first-soak"])).toMatchObject({
      promotionTarget: "nano5c-segment-first-soak",
    });
    expect(parseArgs(["--promotion-target", "nano5c-segment-first-soak"])).toMatchObject({
      promotionTarget: "nano5c-segment-first-soak",
    });

    const commandInfo = buildPythonCommand({
      projectRoot,
      outputDir: path.join(projectRoot, "out"),
      runtimeMode: "resident",
      processMode: "warm",
      residentDecodeMode: "stream",
      adjacentSegmentCount: 5,
      promotionTarget: "nano5c-segment-first-soak",
    });

    expect(commandInfo.args).toEqual(expect.arrayContaining([
      "--runtime-mode",
      "resident",
      "--resident-decode-mode",
      "stream",
      "--adjacent-segment-count",
      "5",
    ]));
    expect(commandInfo.args).not.toContain("--promotion-target");
    expect(commandInfo.args).not.toContain("--nano5c-segment-first-soak");
  });

  it("normalizes MOSS-NANO-5 precompute, decode, tokenizer, prompt-code, adjacent, and segment evidence", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5-normalization-evidence";
    const nestedEvidence = {
      precomputeInputsRequested: true,
      precomputeInputsActual: true,
      precomputeInputsPartial: false,
      precomputeInputsBlocker: null,
      precomputeInputsEvidence: nano5PrecomputeRowEvidence(),
      tokenizerIdentity: {
        sessionIdentity: "audio-tokenizer-session:alpha",
        vocabularyHash: "tok-hash-alpha",
      },
      promptAudioCodesEvidence: {
        status: "actual",
        codeCount: 64,
        reusedAcrossSegments: true,
      },
      decodeFullEvidence: {
        status: "failed",
        firstAudioSec: 3.4,
        memoryGrowthMb: 74,
      },
      acceptedDecodeStrategy: {
        strategy: "segmented",
        accepted: true,
        replacementForDecodeFull: true,
        evidenceRunId: "moss-nano-5-segmented-replacement",
      },
      adjacentSegmentStats: nano5FairAdjacentStats({ rtfTrendRatio: 0.08, fairRtfTrendRatio: 0.08 }),
      segments: nano5AdjacentSegments(),
      crossSegmentStateActual: false,
    };
    const { summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      options: {
        precomputeInputs: true,
        residentDecodeMode: "full",
      },
      summary: optimizedResidentNanoSummary({
        runId,
        promotionClass: false,
        optimization: nestedEvidence,
      }),
    });

    expect(summary).toMatchObject(nestedEvidence);
    expect(summary.precomputeInputsEvidence.components).toEqual({
      textNormalization: true,
      promptCodes: true,
      tokenization: true,
      requestRowsBuild: true,
      semanticInputs: true,
      acousticInputs: true,
      promptAudioCodes: true,
    });
    expect(summary.precomputeInputsEvidence).toMatchObject({
      preparedBeforeRun: true,
      consumedByMeasuredRun: true,
      requestRowCount: 5,
      textHash: "sha256:nano5-book-text-alpha",
      chunkHashes: expect.arrayContaining(["sha256:nano5-chunk-1", "sha256:nano5-chunk-5"]),
    });
    expect(summary.adjacentSegmentStats).toMatchObject({
      rtfTrendMethod: "first-two-vs-last-two-median",
      fairRtfTrendRatio: 0.08,
      balancedSegments: true,
      tokenBudgetedSegments: true,
      crossSegmentStateActual: false,
    });
    expect(summary.crossSegmentStateActual).toBe(false);
    expect(summary.segments).toHaveLength(5);
  });

  it("promotes to the MOSS-NANO-5 soak candidate only when short, punctuation, decode, precompute, and adjacent gates are all satisfied", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const goodRunId = "nano5-soak-all-gates";
    const good = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId: goodRunId,
      summary: nano5SoakCandidateSummary({ runId: goodRunId }),
      options: {
        precomputeInputs: true,
        residentDecodeMode: "full",
      },
    });

    expect(good.result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(good.summary.promotionTarget).toBe("nano5-soak");
    expect(good.summary.promotionDecision).toMatchObject({
      promote: true,
      decision: "PROMOTE_NANO_TO_SOAK_CANDIDATE",
    });

    const missingPunctuationRunId = "nano5-soak-missing-punctuation";
    const missingPunctuationSummary = nano5SoakCandidateSummary({ runId: missingPunctuationRunId });
    delete missingPunctuationSummary.promotionMetrics.punctuationRtf;
    const missingPunctuation = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId: missingPunctuationRunId,
      summary: missingPunctuationSummary,
      options: {
        precomputeInputs: true,
        residentDecodeMode: "full",
      },
    });

    expect(missingPunctuation.result).toMatchObject({
      status: "blocked",
      failureClass: "performance",
    });
    expect(missingPunctuation.summary.error).toMatch(/punctuation.*metric.*missing/i);
  });

  it("promotes with explicit valid decode-full re-threshold evidence when p95 and memory stay inside the new gate", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5-soak-valid-decode-rethreshold";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        decodeFullEvidence: {
          status: "passed",
          firstAudioSec: 2.56,
          memoryGrowthMb: 76,
          gates: {
            firstAudioSecMax: 2.5,
            memoryGrowthMbMax: 80,
          },
          rethreshold: validDecodeFullRethresholdEvidence(),
        },
        promotionMetrics: {
          ...nano5SoakCandidateSummary().promotionMetrics,
          decodeFullFirstAudioSec: 2.56,
          decodeFullMemoryGrowthMb: 76,
        },
      }),
      options: {
        precomputeInputs: true,
        residentDecodeMode: "full",
      },
    });

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.promotionDecision).toMatchObject({
      promote: true,
      decision: "PROMOTE_NANO_TO_SOAK_CANDIDATE",
    });
    expect(summary.decodeFullEvidence.rethreshold).toMatchObject({
      explicit: true,
      p95FirstAudioSec: 2.48,
      maxMemoryGrowthMb: 76,
      stale: false,
    });
  });

  it("allows adjacent fresh segments to exceed the MOSS-NANO-5 minimum", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5-adjacent-fresh-above-minimum";
    const baseSummary = nano5SoakCandidateSummary({ runId });

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        promotionMetrics: {
          ...baseSummary.promotionMetrics,
          adjacentFreshSegments: baseSummary.promotionThresholds.adjacentMinFreshSegments + 1,
        },
      }),
    });

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.promotionDecision).toMatchObject({
      promote: true,
      decision: "PROMOTE_NANO_TO_SOAK_CANDIDATE",
    });
  });

  it.each([
    [
      "missing punctuation threshold",
      (summary) => {
        delete summary.promotionThresholds.punctuationRtfMax;
      },
      /punctuation.*threshold.*missing/i,
    ],
    [
      "missing adjacent metric",
      (summary) => {
        delete summary.promotionMetrics.adjacentFreshSegments;
      },
      /adjacent.*metric.*missing/i,
    ],
    [
      "missing short memory metric",
      (summary) => {
        delete summary.promotionMetrics.shortMemoryGrowthMb;
      },
      /short.*memory.*metric.*missing/i,
    ],
    [
      "non-numeric decode threshold",
      (summary) => {
        summary.promotionThresholds.decodeFullFirstAudioSecMax = "fast";
      },
      /decode.*threshold.*numeric/i,
    ],
    [
      "non-numeric punctuation metric",
      (summary) => {
        summary.promotionMetrics.punctuationRtf = "NaN";
      },
      /punctuation.*metric.*numeric/i,
    ],
  ])("fails closed for MOSS-NANO-5 soak promotion with %s", async (_caseName, mutate, errorPattern) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano5-expanded-gate-${_caseName.replaceAll(" ", "-")}`;
    const summary = nano5SoakCandidateSummary({ runId });
    mutate(summary);

    const { result, summary: persistedSummary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary,
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "performance",
    });
    expect(persistedSummary.error).toMatch(errorPattern);
    expect(persistedSummary.checks).toContainEqual(expect.objectContaining({
      key: "promotionThresholds",
      status: "fail",
      failureClass: "performance",
    }));
  });

  it("rejects decode-full failure for soak promotion even when replacement evidence is accepted", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const rejectedRunId = "nano5-decode-full-rejected";
    const rejected = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId: rejectedRunId,
      summary: nano5SoakCandidateSummary({
        runId: rejectedRunId,
        decodeFullEvidence: {
          status: "failed",
          firstAudioSec: 3.2,
          memoryGrowthMb: 72,
        },
        acceptedDecodeStrategy: null,
        promotionMetrics: {
          ...nano5SoakCandidateSummary().promotionMetrics,
          decodeFullFirstAudioSec: 3.2,
        },
      }),
      options: {
        residentDecodeMode: "full",
      },
    });

    expect(rejected.result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(rejected.summary.error).toMatch(/decode-full.*failed.*soak/i);

    const acceptedRunId = "nano5-decode-full-segmented-replacement";
    const replacement = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId: acceptedRunId,
      summary: nano5SoakCandidateSummary({
        runId: acceptedRunId,
        decodeFullEvidence: {
          status: "failed",
          firstAudioSec: 3.2,
          memoryGrowthMb: 72,
        },
        acceptedDecodeStrategy: {
          strategy: "segmented",
          accepted: true,
          replacementForDecodeFull: true,
          evidenceRunId: "moss-nano-5-segmented-replacement",
        },
      }),
      options: {
        residentDecodeMode: "full",
      },
    });

    expect(replacement.result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(replacement.summary.error).toMatch(/replacement.*cannot bypass.*decode-full/i);
    expect(replacement.summary.checks).toContainEqual(expect.objectContaining({
      key: "decodeFullEvidence",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("rejects MOSS-NANO-5 soak promotion when decode-full memory evidence is missing everywhere", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5-decode-full-missing-memory";
    const summary = nano5SoakCandidateSummary({ runId });
    delete summary.decodeFullEvidence.memoryGrowthMb;
    delete summary.promotionMetrics.decodeFullMemoryGrowthMb;

    const { result, summary: persistedSummary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary,
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(persistedSummary.error).toMatch(/decode-full.*memory growth is missing/i);
    expect(persistedSummary.checks).toContainEqual(expect.objectContaining({
      key: "decodeFullEvidence",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("marks artifact-shaped decode-full evidence with firstAudioSec 4.779 as failed instead of passed", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5-decode-full-4779ms";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        decodeFullEvidence: {
          status: "passed",
          firstAudioSec: 4.779,
          memoryGrowthMb: 70,
          source: "resident-decode-mode-full",
        },
        acceptedDecodeStrategy: {
          strategy: "decode-full",
          accepted: true,
          replacementForDecodeFull: false,
        },
        promotionMetrics: {
          ...nano5SoakCandidateSummary().promotionMetrics,
          decodeFullFirstAudioSec: 4.779,
          decodeFullMemoryGrowthMb: 70,
        },
      }),
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.decodeFullEvidence.status).toMatch(/failed|disqualified/i);
    expect(summary.acceptedDecodeStrategy.accepted).toBe(false);
    expect(summary.error).toMatch(/decode-full.*first audio.*4\.779.*2\.5/i);
  });

  it.each([
    [
      "without re-threshold evidence",
      {},
      /decode-full.*first audio.*2\.56.*2\.5/i,
    ],
    [
      "with missing repeated p95 evidence",
      {
        rethreshold: validDecodeFullRethresholdEvidence({
          repeatedRuns: 1,
          p95FirstAudioSec: null,
          p95UnderThreshold: false,
        }),
      },
      /decode-full.*re-threshold.*p95.*repeated/i,
    ],
    [
      "with stale re-threshold evidence",
      {
        rethreshold: validDecodeFullRethresholdEvidence({
          generatedAt: "2026-04-01T00:00:00.000Z",
          stale: true,
        }),
      },
      /decode-full.*re-threshold.*stale/i,
    ],
  ])("rejects decode-full first audio 2.560s %s", async (_caseName, decodeOverrides, errorPattern) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano5-decode-full-2560-${_caseName.replaceAll(" ", "-")}`;

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        decodeFullEvidence: {
          status: "passed",
          firstAudioSec: 2.56,
          memoryGrowthMb: 76,
          gates: {
            firstAudioSecMax: 2.5,
            memoryGrowthMbMax: 80,
          },
          ...decodeOverrides,
        },
        promotionMetrics: {
          ...nano5SoakCandidateSummary().promotionMetrics,
          decodeFullFirstAudioSec: 2.56,
          decodeFullMemoryGrowthMb: 76,
        },
      }),
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(errorPattern);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_SOAK_CANDIDATE/),
    });
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "decodeFullEvidence",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it.each([
    [
      "missing actual precompute evidence",
      (summary) => {
        delete summary.precomputeInputsRequested;
        delete summary.precomputeInputsActual;
        delete summary.precomputeInputsEvidence;
      },
      /precompute.*actual.*required/i,
      "precomputeInputsEvidence",
    ],
    [
      "missing adjacent segment evidence",
      (summary) => {
        delete summary.adjacentSegmentStats;
        summary.segments = [];
      },
      /adjacent.*evidence.*required/i,
      "adjacentSegmentStats",
    ],
  ])("rejects MOSS-NANO-5 soak promotion with %s", async (_caseName, mutate, errorPattern, key) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano5-required-evidence-${_caseName.replaceAll(" ", "-")}`;
    const summary = nano5SoakCandidateSummary({ runId });
    mutate(summary);

    const { result, summary: persistedSummary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary,
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(persistedSummary.error).toMatch(errorPattern);
    expect(persistedSummary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_SOAK_CANDIDATE/),
    });
    expect(persistedSummary.checks).toContainEqual(expect.objectContaining({
      key,
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it.each([
    [
      "stale output",
      {
        adjacentSegmentStats: {
          requestedSegments: 5,
          completedSegments: 5,
          freshSegments: 4,
          emptySegments: 0,
          staleOutputReuseCount: 1,
          sessionRestartCount: 0,
          rtfTrendRatio: 0.1,
        },
        segments: nano5AdjacentSegments({
          2: {
            staleOutputReuse: true,
            firstAudioObservation: internalFirstDecodedAudioObservation({
              outputFileExistedBeforeRun: true,
              reusedExistingOutputFile: true,
            }),
          },
        }),
      },
      /adjacent.*stale output/i,
    ],
    [
      "empty segment",
      {
        adjacentSegmentStats: {
          requestedSegments: 5,
          completedSegments: 5,
          freshSegments: 5,
          emptySegments: 1,
          staleOutputReuseCount: 0,
          sessionRestartCount: 0,
          rtfTrendRatio: 0.1,
        },
        segments: nano5AdjacentSegments({
          1: {
            text: "",
            empty: true,
          },
        }),
      },
      /adjacent.*empty segment/i,
    ],
    [
      "session restart",
      {
        adjacentSegmentStats: {
          requestedSegments: 5,
          completedSegments: 5,
          freshSegments: 5,
          emptySegments: 0,
          staleOutputReuseCount: 0,
          sessionRestartCount: 1,
          rtfTrendRatio: 0.1,
        },
        segments: nano5AdjacentSegments({
          3: {
            sessionRestarted: true,
            runtimeIdentity: residentRuntimeIdentity({
              pythonProcessIdentity: "python-pid:9999",
            }),
          },
        }),
      },
      /adjacent.*session restart/i,
    ],
    [
      "fewer than five segments",
      {
        adjacentSegmentStats: {
          requestedSegments: 5,
          completedSegments: 4,
          freshSegments: 4,
          emptySegments: 0,
          staleOutputReuseCount: 0,
          sessionRestartCount: 0,
          rtfTrendRatio: 0.1,
        },
        segments: nano5AdjacentSegments().slice(0, 4),
      },
      /adjacent.*five.*segments/i,
    ],
    [
      "RTF trend above fifteen percent",
      {
        adjacentSegmentStats: {
          requestedSegments: 5,
          completedSegments: 5,
          freshSegments: 5,
          emptySegments: 0,
          staleOutputReuseCount: 0,
          sessionRestartCount: 0,
          rtfTrendRatio: 0.2,
        },
        segments: nano5AdjacentSegments({
          4: {
            rtf: 1.25,
          },
        }),
      },
      /adjacent.*rtf.*15%/i,
    ],
  ])("rejects MOSS-NANO-5 soak promotion when adjacent segments have %s", async (_caseName, overrides, errorPattern) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano5-adjacent-${_caseName.replaceAll(" ", "-")}`;

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        ...overrides,
      }),
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(errorPattern);
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "adjacentSegmentStats",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("rejects adjacent evidence that only has max-vs-first diagnostic trend without a fair stable metric", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5-adjacent-diagnostic-only-trend";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        adjacentSegmentStats: {
          requestedSegments: 5,
          completedSegments: 5,
          freshSegments: 5,
          emptySegments: 0,
          staleOutputReuseCount: 0,
          sessionRestartCount: 0,
          rtfTrendRatio: 0.1,
          rtfTrendMax: 0.15,
        },
      }),
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/adjacent.*fair.*rtf.*trend.*method/i);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_SOAK_CANDIDATE/),
    });
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "adjacentSegmentStats",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("accepts noisy max-vs-first adjacent diagnostics when the predeclared fair metric is stable and under fifteen percent", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5-adjacent-noisy-diagnostic-fair-stable";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        adjacentSegmentStats: nano5FairAdjacentStats({
          rtfTrendRatio: 0.2943,
          diagnosticRtfTrendMethod: "max-vs-first",
          fairRtfTrendRatio: 0.12,
          stableTrendGate: {
            method: "first-two-vs-last-two-median",
            ratio: 0.12,
            max: 0.15,
            stable: true,
          },
        }),
        promotionMetrics: {
          ...nano5SoakCandidateSummary().promotionMetrics,
          adjacentRtfTrendRatio: 0.2943,
          adjacentFairRtfTrendRatio: 0.12,
        },
        segments: nano5AdjacentSegments({
          0: { rtf: 0.9, audioDurationSec: 1.02 },
          1: { rtf: 0.91, audioDurationSec: 1.01 },
          2: { rtf: 1.16, audioDurationSec: 1.03 },
          3: { rtf: 1.01, audioDurationSec: 1.02 },
          4: { rtf: 1.02, audioDurationSec: 1.01 },
        }),
      }),
    });

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.promotionDecision).toMatchObject({
      promote: true,
      decision: "PROMOTE_NANO_TO_SOAK_CANDIDATE",
    });
    expect(summary.adjacentSegmentStats.crossSegmentStateActual).toBe(false);
  });

  it.each([
    [
      "without blocker",
      {
        precomputeInputsActual: false,
        precomputeInputsBlocker: null,
        precomputeInputsEvidence: {
          status: "missing",
          components: {
            semanticInputs: false,
            acousticInputs: false,
            promptAudioCodes: false,
          },
        },
      },
      /precompute actual evidence.*required/i,
    ],
    [
      "with blocker-only evidence",
      {
        precomputeInputsActual: false,
        precomputeInputsBlocker: "upstream infer_onnx exposes no reusable prepared-input hook",
        precomputeInputsEvidence: {
          status: "blocked",
          components: {
            semanticInputs: false,
            acousticInputs: false,
            promptAudioCodes: false,
          },
        },
      },
      /blocker-only precompute evidence.*must not promote/i,
    ],
  ])("rejects MOSS-NANO-5 soak promotion when precompute is actual=false %s", async (_caseName, precomputeEvidence, errorPattern) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano5-precompute-${_caseName.replaceAll(" ", "-")}`;

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        ...precomputeEvidence,
      }),
      options: {
        precomputeInputs: true,
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(errorPattern);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_SOAK_CANDIDATE/),
    });
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "precomputeInputsEvidence",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("rejects NO_PRECOMPUTE_REQUEST_ROWS_HOOK as blocker-only classification even when all runtime metrics pass", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5-precompute-request-rows-hook-blocker-only";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        precomputeInputsActual: false,
        precomputeInputsBlocker: "NO_PRECOMPUTE_REQUEST_ROWS_HOOK",
        precomputeInputsEvidence: nano5PrecomputeRowEvidence({
          status: "blocked",
          actual: false,
          preparedBeforeRun: false,
          consumedByMeasuredRun: false,
          requestRowCount: 0,
          components: {
            requestRowsBuild: false,
          },
        }),
      }),
      options: {
        precomputeInputs: true,
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/NO_PRECOMPUTE_REQUEST_ROWS_HOOK|blocker-only precompute evidence/i);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_SOAK_CANDIDATE/),
    });
  });

  it.each([
    [
      "consumedByMeasuredRun=false",
      nano5PrecomputeRowEvidence({ consumedByMeasuredRun: false }),
      /precompute.*consumed.*measured run/i,
    ],
    [
      "missing request row count",
      (() => {
        const evidence = nano5PrecomputeRowEvidence();
        delete evidence.requestRowCount;
        return evidence;
      })(),
      /precompute.*request row count.*positive/i,
    ],
    [
      "non-positive request row count",
      nano5PrecomputeRowEvidence({ requestRowCount: 0 }),
      /precompute.*request row count.*positive/i,
    ],
  ])("rejects precomputeInputsActual=true when row-consumption evidence has %s", async (_caseName, precomputeInputsEvidence, errorPattern) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano5-precompute-actual-invalid-${_caseName.replaceAll("=", "-").replaceAll(" ", "-")}`;

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        precomputeInputsActual: true,
        precomputeInputsEvidence,
      }),
      options: {
        precomputeInputs: true,
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(errorPattern);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_SOAK_CANDIDATE/),
    });
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "precomputeInputsEvidence",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("rejects app-prototype promotion attempts from the MOSS-NANO-5 gate", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5-app-prototype-forbidden";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        promotionTarget: "app-prototype",
        promotionDecision: {
          promote: true,
          target: "app-prototype",
          decision: "PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE",
        },
      }),
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/MOSS-NANO-5.*soak.*not.*app prototype/i);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE/),
    });
  });

  it("keeps app-prototype promotion forbidden even with fully valid MOSS-NANO-5 closure evidence", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5-app-prototype-forbidden-valid-closure";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        promotionTarget: "app-prototype",
        promotionDecision: {
          promote: true,
          target: "app-prototype",
          decision: "PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE",
        },
        precomputeInputsEvidence: nano5PrecomputeRowEvidence(),
        adjacentSegmentStats: nano5FairAdjacentStats(),
        decodeFullEvidence: {
          status: "passed",
          firstAudioSec: 2.1,
          memoryGrowthMb: 70,
          gates: {
            firstAudioSecMax: 2.5,
            memoryGrowthMbMax: 80,
          },
        },
      }),
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/MOSS-NANO-5.*soak.*not.*app prototype/i);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE/),
    });
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "promotionDecision",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("promotes the MOSS-NANO-5C segment-first soak candidate when decode-full is diagnostic and precompute is explicitly non-product-required", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5c-segment-first-soak-product-path";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5cSegmentFirstSoakSummary({
        runId,
        precomputeInputsEvidence: null,
      }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.promotionTarget).toBe("nano5c-segment-first-soak");
    expect(summary.promotionDecision).toMatchObject({
      promote: true,
      target: "nano5c-segment-first-soak",
      decision: "PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE",
    });
    expect(summary.decodeFullEvidence).toMatchObject({
      status: "failed",
      diagnosticOnly: true,
      productPath: false,
      requiredForProductPath: false,
      classification: "diagnostic-only-non-product-path",
      firstAudioSec: 3.2,
    });
    expect(summary.precomputeInputsEvidence).toMatchObject({
      status: "not-required",
      actual: false,
      requested: false,
      classification: "non-product-required",
      requiredForProductPath: false,
    });
    expect(summary.promotionThresholds).toMatchObject({
      segmentFirstInternalFirstDecodedAudioSecMax: 0.5,
      segmentFirstShortRtfMax: 1.5,
      adjacentFairRtfTrendMax: 0.15,
      segmentFirstMinFreshSegments: 5,
      segmentFirstStaleOutputReuseMax: 0,
      segmentFirstSessionRestartMax: 0,
    });
    expect(summary.promotionMetrics).toMatchObject({
      segmentFirstInternalFirstDecodedAudioSec: 0.2,
      segmentFirstShortRtf: 1.2,
      adjacentFairRtfTrendRatio: 0.1,
      segmentFirstInternalFirstAudioFreshSegments: 5,
      segmentFirstStaleOutputReuseCount: 0,
      segmentFirstSessionRestartCount: 0,
    });
  });

  it("classifies a real resident segment-first run as a MOSS-NANO-5C soak artifact from the CLI target", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5c-real-segment-first-cli-target";
    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: residentNanoSummary({
        runId,
        acceptedDecodeStrategy: {
          strategy: "streaming",
          accepted: true,
          replacementForDecodeFull: true,
        },
        adjacentSegmentStats: nano5FairAdjacentStats(),
        segments: nano5AdjacentSegments(),
        precomputeInputsRequested: false,
        precomputeInputsActual: false,
        precomputeInputsBlocker: null,
        precomputeInputsEvidence: null,
        promotionTarget: null,
        promotionDecision: {
          promote: false,
          target: null,
          decision: "ITERATE_NANO_RESIDENT_RUNTIME",
        },
      }),
      options: {
        promotionTarget: "nano5c-segment-first-soak",
        residentDecodeMode: "stream",
        adjacentSegmentCount: 5,
      },
    });

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.promotionTarget).toBe("nano5c-segment-first-soak");
    expect(summary.promotionDecision).toMatchObject({
      promote: true,
      target: "nano5c-segment-first-soak",
      decision: "PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE",
    });
    expect(summary.acceptedDecodeStrategy).toMatchObject({
      strategy: "segment-first",
      accepted: true,
      productPath: true,
      segmentFirst: true,
    });
    expect(summary.segmentFirstProductPathEvidence).toMatchObject({
      status: "passed",
      productPath: true,
      internalFirstAudioFreshSegments: 5,
      staleOutputReuseCount: 0,
      sessionRestartCount: 0,
      stableAdjacentTrend: true,
    });
    expect(summary.decodeFullEvidence).toMatchObject({
      diagnosticOnly: true,
      productPath: false,
      requiredForProductPath: false,
      classification: "diagnostic-only-non-product-path",
    });
    expect(summary.precomputeInputsEvidence).toMatchObject({
      status: "not-required",
      actual: false,
      requested: false,
      classification: "non-product-required",
      requiredForProductPath: false,
    });
    expect(summary.promotionThresholds).toMatchObject({
      segmentFirstInternalFirstDecodedAudioSecMax: 0.5,
      segmentFirstShortRtfMax: 1.5,
      adjacentFairRtfTrendMax: 0.15,
      segmentFirstMinFreshSegments: 5,
      segmentFirstStaleOutputReuseMax: 0,
      segmentFirstSessionRestartMax: 0,
    });
    expect(summary.promotionMetrics).toMatchObject({
      segmentFirstInternalFirstDecodedAudioSec: 0.22,
      segmentFirstShortRtf: 0.98,
      adjacentFairRtfTrendRatio: 0.1,
      segmentFirstInternalFirstAudioFreshSegments: 5,
      segmentFirstStaleOutputReuseCount: 0,
      segmentFirstSessionRestartCount: 0,
    });
  });

  it.each([
    [
      "missing thresholds",
      (summary) => {
        delete summary.promotionThresholds;
      },
      /5C segment-first.*thresholds missing/i,
    ],
    [
      "missing metrics",
      (summary) => {
        delete summary.promotionMetrics;
      },
      /5C segment-first.*metrics missing/i,
    ],
    [
      "exceeded first decoded audio",
      (summary) => {
        summary.promotionMetrics.segmentFirstInternalFirstDecodedAudioSec = 0.51;
      },
      /segment-first internal first decoded audio.*exceeds/i,
    ],
    [
      "exceeded short RTF",
      (summary) => {
        summary.promotionMetrics.segmentFirstShortRtf = 1.51;
      },
      /segment-first short RTF.*exceeds/i,
    ],
    [
      "exceeded adjacent fair trend",
      (summary) => {
        summary.promotionMetrics.adjacentFairRtfTrendRatio = 0.16;
      },
      /adjacent fair RTF trend.*exceeds/i,
    ],
    [
      "stale output reuse",
      (summary) => {
        summary.promotionMetrics.segmentFirstStaleOutputReuseCount = 1;
      },
      /stale output reuse.*zero/i,
    ],
    [
      "session restart",
      (summary) => {
        summary.promotionMetrics.segmentFirstSessionRestartCount = 1;
      },
      /session restart.*zero/i,
    ],
  ])("fails closed for MOSS-NANO-5C segment-first soak promotion with %s", async (_caseName, mutate, errorPattern) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano5c-threshold-${_caseName.replaceAll(" ", "-")}`;
    const summary = nano5cSegmentFirstSoakSummary({ runId });
    mutate(summary);

    const { result, summary: persistedSummary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary,
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "performance",
    });
    expect(persistedSummary.error).toMatch(errorPattern);
    expect(persistedSummary.checks).toContainEqual(expect.objectContaining({
      key: "promotionThresholds",
      status: "fail",
      failureClass: "performance",
    }));
  });

  it("fails the MOSS-NANO-5C segment-first soak candidate when stale promotionMetrics hide bad derived product-path metrics", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5c-stale-promotion-metrics-hide-bad-real-evidence";
    const badFirstAudioObservation = internalFirstDecodedAudioObservation({
      internalFirstDecodedAudioMs: 620,
      internalFirstDecodedAudioSec: 0.62,
    });

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5cSegmentFirstSoakSummary({
        runId,
        firstAudioSec: 0.62,
        internalFirstDecodedAudioMs: 620,
        firstAudioObservation: badFirstAudioObservation,
        totalSec: 1.7,
        rtf: 1.7,
        iterations: [
          residentIteration({
            iterationIndex: 0,
            firstAudioSec: 0.62,
            internalFirstDecodedAudioMs: 620,
            firstAudioObservation: badFirstAudioObservation,
            totalSec: 1.7,
            rtf: 1.7,
          }),
          residentIteration({ iterationIndex: 1 }),
        ],
        segments: nano5AdjacentSegments({
          0: {
            firstAudioSec: 0.62,
            internalFirstDecodedAudioMs: 620,
            firstAudioObservation: badFirstAudioObservation,
            totalSec: 1.7,
            rtf: 1.7,
          },
        }),
        promotionMetrics: {
          segmentFirstInternalFirstDecodedAudioSec: 0.2,
          segmentFirstShortRtf: 1.2,
          adjacentFairRtfTrendRatio: 0.1,
          segmentFirstInternalFirstAudioFreshSegments: 5,
          segmentFirstStaleOutputReuseCount: 0,
          segmentFirstSessionRestartCount: 0,
        },
      }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result.status).toBe("blocked");
    expect(["performance", "runtime-contract"]).toContain(result.failureClass);
    expect(summary.error).toMatch(/segment-first.*(first decoded audio|short RTF|promotion metrics|derived metrics|mismatch)/i);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE/),
    });
    expect(summary.checks).toContainEqual(expect.objectContaining({
      status: "fail",
    }));
  });

  it("fails the MOSS-NANO-5C segment-first soak candidate when passed decode-full evidence lacks diagnostic non-product classification", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5c-decode-full-passed-without-diagnostic-classification";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5cSegmentFirstSoakSummary({
        runId,
        decodeFullEvidence: {
          status: "passed",
          firstAudioSec: 2.1,
          memoryGrowthMb: 70,
          gates: {
            firstAudioSecMax: 2.5,
            memoryGrowthMbMax: 80,
          },
        },
      }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/decode-full.*diagnostic-only.*non-product-path/i);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE/),
    });
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "decodeFullEvidence",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("classifies passed decode-full evidence as diagnostic-only for CLI-targeted MOSS-NANO-5C normalization", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5c-cli-target-passed-decode-full-normalized-diagnostic";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: residentNanoSummary({
        runId,
        decodeFullEvidence: {
          status: "passed",
          firstAudioSec: 2.1,
          memoryGrowthMb: 70,
        },
        adjacentSegmentStats: nano5FairAdjacentStats(),
        segments: nano5AdjacentSegments(),
        precomputeInputsRequested: false,
        precomputeInputsActual: false,
        precomputeInputsBlocker: null,
        precomputeInputsEvidence: null,
        promotionTarget: null,
        promotionDecision: {
          promote: false,
          target: null,
          decision: "ITERATE_NANO_RESIDENT_RUNTIME",
        },
      }),
      options: {
        promotionTarget: "nano5c-segment-first-soak",
        residentDecodeMode: "stream",
        adjacentSegmentCount: 5,
      },
    });

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.decodeFullEvidence).toMatchObject({
      status: "passed",
      diagnosticOnly: true,
      productPath: false,
      requiredForProductPath: false,
      classification: "diagnostic-only-non-product-path",
    });
  });

  it("fails the MOSS-NANO-5C segment-first soak candidate when requested precompute is actual=false without non-product-required classification", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5c-precompute-requested-without-non-product-classification";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5cSegmentFirstSoakSummary({
        runId,
        precomputeInputsRequested: true,
        precomputeInputsActual: false,
        precomputeRequiredForProductPath: null,
        precomputeInputsEvidence: {
          status: "requested",
          requested: true,
          actual: false,
        },
      }),
      options: {
        precomputeInputs: true,
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/segment-first.*precompute.*requested.*actual=false.*non-product-required/i);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE/),
    });
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "precomputeInputsEvidence",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("fails the MOSS-NANO-5C segment-first soak candidate when failed decode-full lacks diagnostic-only classification", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5c-decode-full-failed-without-diagnostic-classification";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5cSegmentFirstSoakSummary({
        runId,
        decodeFullEvidence: {
          status: "failed",
          firstAudioSec: 3.2,
          memoryGrowthMb: 70,
          gates: {
            firstAudioSecMax: 2.5,
            memoryGrowthMbMax: 80,
          },
        },
      }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/decode-full.*diagnostic-only.*non-product-path/i);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE/),
    });
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "decodeFullEvidence",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("fails the MOSS-NANO-5C segment-first soak candidate when the accepted decode strategy lacks product-path segment-first evidence", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5c-segment-first-missing-product-path-evidence";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5cSegmentFirstSoakSummary({
        runId,
        acceptedDecodeStrategy: {
          strategy: "segment-first",
          accepted: true,
        },
        segmentFirstProductPathEvidence: null,
      }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/segment-first.*product-path.*evidence/i);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE/),
    });
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "segmentFirstProductPathEvidence",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("keeps the existing MOSS-NANO-5 soak gate strict when precompute remains blocker-only", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano5-old-soak-blocker-only-precompute-still-strict";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano5SoakCandidateSummary({
        runId,
        precomputeInputsActual: false,
        precomputeInputsBlocker: "NO_PRECOMPUTE_REQUEST_ROWS_HOOK",
        precomputeInputsEvidence: nano5PrecomputeRowEvidence({
          status: "blocked",
          actual: false,
          preparedBeforeRun: false,
          consumedByMeasuredRun: false,
          requestRowCount: 0,
        }),
      }),
      options: {
        precomputeInputs: true,
        residentDecodeMode: "full",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/blocker-only precompute evidence.*must not promote/i);
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: expect.not.stringMatching(/^PROMOTE_NANO_TO_SOAK_CANDIDATE$/),
    });
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "precomputeInputsEvidence",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("gates MOSS-NANO-6 resident soak memory on post-warmup phase regression, not inflated endpoint expansion", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-soak-phase-regression-not-endpoint";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano6ReadinessSummary({
        runId,
        residentSoak: {
          ...nano6ReadinessSummary({ runId }).residentSoak,
          rssSamples: [1503, 1714, 1888],
          rssSampleTimesSec: [0, 5, 1800],
          currentRssMb: 1888,
          initialExpansionMb: 211,
          inferenceSlopeMbPerMin: 0.0,
          holdSlopeMbPerMin: 0.0,
          postWarmupSlopeMbPerMin: 0.0,
          diagnosticEndpointSlopeMbPerMin: 12.84,
          memoryGrowthSlopeMbPerMin: 12.84,
          memoryGrowthSlopeMethod: "endpoint-diagnostic-only",
          readinessMemorySlopeMbPerMin: 0.0,
          readinessMemorySlopeMethod: "post-warmup-phase-regression",
        },
        promotionMetrics: {
          ...nano6ReadinessSummary({ runId }).promotionMetrics,
          memoryGrowthSlopeMbPerMin: 12.84,
          diagnosticEndpointSlopeMbPerMin: 12.84,
          postWarmupSlopeMbPerMin: 0.0,
          readinessMemorySlopeMbPerMin: 0.0,
        },
      }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.residentSoak).toMatchObject({
      initialExpansionMb: 211,
      inferenceSlopeMbPerMin: expect.any(Number),
      holdSlopeMbPerMin: expect.any(Number),
      postWarmupSlopeMbPerMin: expect.any(Number),
      diagnosticEndpointSlopeMbPerMin: 12.84,
      readinessMemorySlopeMethod: "post-warmup-phase-regression",
    });
    expect(summary.residentSoak.readinessMemorySlopeMbPerMin).not.toBe(12.84);
    expect(summary.nano6Readiness).toMatchObject({
      status: "passed",
      gate: "app-prototype",
    });
  });

  it.each([
    ["post-warmup", { postWarmupSlopeMbPerMin: 2.6 }],
    ["inference", { inferenceSlopeMbPerMin: 2.6 }],
  ])("fails closed when MOSS-NANO-6 readiness memory slope underreports unsafe %s phase growth", async (_caseName, slopeOverrides) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano6-underreported-readiness-slope-${_caseName}`;
    const base = nano6ReadinessSummary({ runId });

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano6ReadinessSummary({
        runId,
        residentSoak: {
          ...base.residentSoak,
          memoryGrowthSlopeMbPerMin: 0.2,
          readinessMemorySlopeMbPerMin: 0.2,
          ...slopeOverrides,
        },
        promotionMetrics: {
          ...base.promotionMetrics,
          memoryGrowthSlopeMbPerMin: 0.2,
          readinessMemorySlopeMbPerMin: 0.2,
          ...slopeOverrides,
        },
      }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "performance",
    });
    expect(summary.error).toMatch(/post-warmup phase memory growth exceeds 1\.5MB\/min/i);
    expect(summary.residentSoak.readinessMemorySlopeMbPerMin).toBe(2.6);
    expect(summary.nano6Readiness).toMatchObject({
      status: "failed",
      key: "residentSoak",
      failureClass: "performance",
    });
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: "ITERATE_NANO_RESIDENT_RUNTIME",
    });
  });

  it("requires MOSS-NANO-6 resident soak phase memory fields before app-prototype promotion", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-soak-phase-fields-required";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano6ReadinessSummary({
        runId,
        residentSoak: {
          ...nano6ReadinessSummary({ runId }).residentSoak,
          rssSamples: [1503, 1714, 1888],
          rssSampleTimesSec: [0, 5, 1800],
          currentRssMb: 1888,
          memoryGrowthSlopeMbPerMin: 0.0,
          initialExpansionMb: undefined,
          endpointGrowthMb: undefined,
          endpointGrowthMbPerMin: undefined,
          postWarmupSlopeMbPerMin: undefined,
          inferenceSlopeMbPerMin: undefined,
          holdSlopeMbPerMin: undefined,
          readinessMemorySlopeMbPerMin: undefined,
          readinessMemorySlopeMethod: undefined,
        },
      }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/initialExpansionMb|inferenceSlopeMbPerMin|holdSlopeMbPerMin|postWarmupSlopeMbPerMin|phase regression/i);
    expect(summary.nano6Readiness).toMatchObject({
      status: "failed",
      key: "residentSoak",
    });
  });

  it("records machine-readable tail latency evidence for MOSS-NANO-6 100-segment p95 RTF failures", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-tail-latency-p95-rtf-evidence";
    const slowSegmentIndices = [94, 95, 96, 97, 98, 99];
    const segments = nano6BookLikeSegments(Object.fromEntries(
      slowSegmentIndices.map((index) => [index, {
        totalSec: 4.2,
        audioDurationSec: 2,
        rtf: 2.1,
        punctuationRtf: 2.15,
      }]),
    ));
    const summary = nano6ReadinessSummary({ runId, segments });
    summary.promotionDecision = {
      promote: false,
      target: "app-prototype",
      decision: "ITERATE_NANO_RESIDENT_RUNTIME",
    };
    summary.bookLikeAdjacentRun = {
      ...summary.bookLikeAdjacentRun,
      p95FinalRtf: 2.1,
      p95PunctuationRtf: 2.15,
    };
    summary.promotionMetrics = {
      ...summary.promotionMetrics,
      adjacentP95FinalRtf: 2.1,
      adjacentP95PunctuationRtf: 2.15,
    };

    const { result, summary: persistedSummary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary,
      options: {
        residentDecodeMode: "stream",
        adjacentSegmentCount: 100,
      },
    });

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(persistedSummary.nano6Readiness).toMatchObject({
      status: "not-promoting",
      failedGate: "app-prototype",
      failedKey: "bookLikeAdjacentRun",
    });
    const bookFailure = persistedSummary.nano6Readiness.failedGates.find((failure) => (
      failure.key === "bookLikeAdjacentRun"
    ));
    expect(bookFailure).toMatchObject({
      gate: "app-prototype",
      key: "bookLikeAdjacentRun",
      failureClass: "performance",
      reason: expect.stringMatching(/p95.*RTF/i),
    });
    expect(bookFailure.slowSegmentIndices ?? bookFailure.tailLatencyEvidence?.slowSegmentIndices).toEqual(
      expect.arrayContaining(slowSegmentIndices),
    );
    expect(bookFailure.tailLatencyEvidence ?? bookFailure).toMatchObject({
      metric: expect.stringMatching(/p95.*rtf/i),
      threshold: 1.5,
      observed: 2.1,
    });
  });

  it.each([
    [
      "missing lifecycle class",
      (classes) => {
        delete classes.restartFailed;
      },
      /restart-failed|missing/i,
    ],
    [
      "not-implemented lifecycle class",
      (classes) => {
        classes.restartFailed = {
          classification: "restart-failed",
          observed: false,
          status: "not-implemented",
          evidenceSource: "measured-lifecycle-check",
        };
      },
      /not.?implemented|restart-failed/i,
    ],
    [
      "synthetic lifecycle class",
      (classes) => {
        classes.forcedKill = {
          classification: "forced-kill",
          observed: true,
          synthetic: true,
          evidenceSource: "synthetic-plan",
        };
      },
      /synthetic|measured-lifecycle-check/i,
    ],
    [
      "in-flight shutdown succeeds and reuses WAV",
      (classes) => {
        classes.inflightShutdown = {
          classification: "inflight-rejected",
          observed: true,
          evidenceSource: "measured-lifecycle-check",
          rejected: false,
          succeeded: true,
          wavReused: true,
        };
      },
      /in-?flight.*shutdown.*reject.*wav/i,
    ],
  ])("requires measured lifecycle class evidence for app-prototype readiness: %s", async (_caseName, mutate, errorPattern) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano6-lifecycle-classes-${_caseName.replaceAll(" ", "-")}`;
    const lifecycleClasses = nano6LifecycleClassEvidence();
    mutate(lifecycleClasses);

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano6ReadinessSummary({
        runId,
        lifecycleEvidence: {
          status: "actual",
          requestedOnly: false,
          stale: false,
          runId,
          evidenceSource: "measured-lifecycle-check",
          lifecycleClasses,
        },
      }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(errorPattern);
    expect(summary.nano6Readiness).toMatchObject({
      status: "failed",
      key: "lifecycleEvidence",
    });
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: "ITERATE_NANO_RESIDENT_RUNTIME",
    });
  });

  it("promotes a MOSS-NANO-6 runtime/package-ready artifact only with 30-minute soak and 100 fresh adjacent segments", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-runtime-package-ready-valid";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano6ReadinessSummary({ runId }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "ok",
      failureClass: null,
    });
    expect(summary.promotionDecision).toMatchObject({
      promote: true,
      target: "app-prototype",
      decision: "PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE",
    });
    expect(summary.nano6Readiness).toMatchObject({
      status: "passed",
      gate: "app-prototype",
    });
    expect(summary.residentSoak).toMatchObject({
      durationSec: expect.any(Number),
      warmupExcluded: true,
      warmupEndAt: expect.any(String),
      sampleIntervalSec: expect.any(Number),
      rssSamples: expect.any(Array),
      currentRssMb: expect.any(Number),
      memoryGrowthSlopeMbPerMin: expect.any(Number),
      crashCount: 0,
      staleOutputReuseCount: 0,
      sessionRestartCount: 0,
    });
    expect(summary.residentSoak.durationSec).toBeGreaterThanOrEqual(1800);
    expect(summary.residentSoak.rssSamples.length).toBeGreaterThan(0);
    expect(summary.residentSoak.memoryGrowthSlopeMbPerMin).toBeLessThanOrEqual(1.5);
    expect(summary.bookLikeAdjacentRun).toMatchObject({
      requestedSegments: 100,
      completedSegments: 100,
      freshSegments: 100,
      emptySegments: 0,
      staleOutputReuseCount: 0,
      sessionRestartCount: 0,
      p95InternalFirstDecodedAudioMs: expect.any(Number),
      p95FinalRtf: expect.any(Number),
      p95PunctuationRtf: expect.any(Number),
    });
    expect(summary.bookLikeAdjacentRun.p95InternalFirstDecodedAudioMs).toBeLessThanOrEqual(1500);
    expect(summary.bookLikeAdjacentRun.p95FinalRtf).toBeLessThanOrEqual(1.5);
    expect(summary.bookLikeAdjacentRun.p95PunctuationRtf).toBeLessThanOrEqual(1.45);
    expect(summary.segments).toHaveLength(100);
  });

  it.each([
    [
      "missing current RSS evidence",
      (summary) => {
        delete summary.residentSoak.currentRssMb;
      },
      /rss|memory/i,
      "residentSoak",
    ],
    [
      "stale output reuse",
      (summary) => {
        summary.residentSoak.staleOutputReuseCount = 1;
        summary.bookLikeAdjacentRun.staleOutputReuseCount = 1;
        summary.promotionMetrics.staleOutputReuseCount = 1;
      },
      /stale output reuse/i,
      "staleOutputReuse",
    ],
    [
      "empty adjacent segment",
      (summary) => {
        summary.bookLikeAdjacentRun.emptySegments = 1;
        summary.promotionMetrics.adjacentEmptySegments = 1;
        summary.segments[4] = nano6BookLikeSegment(4, { empty: true, text: "" });
      },
      /empty segment/i,
      "bookLikeAdjacentRun",
    ],
    [
      "session/runtime identity change",
      (summary) => {
        summary.bookLikeAdjacentRun.sessionRestartCount = 1;
        summary.promotionMetrics.adjacentSessionRestartCount = 1;
        summary.segments[7] = nano6BookLikeSegment(7, {
          sessionRestarted: true,
          runtimeIdentity: residentRuntimeIdentity({ pythonProcessIdentity: "python-pid:9999" }),
        });
      },
      /session|runtime identity/i,
      "runtimeIdentity",
    ],
    [
      "requested-only lifecycle evidence",
      (summary) => {
        summary.lifecycleEvidence = {
          status: "requested",
          requestedOnly: true,
          stale: false,
        };
      },
      /lifecycle|requested-only/i,
      "lifecycleEvidence",
    ],
    [
      "non-promoting app-prototype decision",
      (summary) => {
        summary.promotionDecision.promote = false;
      },
      /cannot be non-promoting/i,
      "promotionDecision",
    ],
  ])("fails closed for MOSS-NANO-6 app-prototype readiness with %s", async (_caseName, mutate, errorPattern, key) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = `nano6-fail-closed-${_caseName.replaceAll(" ", "-")}`;
    const summary = nano6ReadinessSummary({ runId });
    mutate(summary);

    const { result, summary: persistedSummary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary,
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: expect.stringMatching(/runtime-contract|performance/),
    });
    expect(persistedSummary.error).toMatch(errorPattern);
    expect(persistedSummary.promotionDecision).toMatchObject({
      promote: false,
      decision: "ITERATE_NANO_RESIDENT_RUNTIME",
    });
    expect(persistedSummary.promotionDecision.decision).not.toBe("BLOCKED_NANO_RESIDENT_RUNTIME");
    expect(persistedSummary.nano6Readiness).toMatchObject({
      status: "failed",
      failureClass: expect.stringMatching(/runtime-contract|performance/),
      key,
    });
    expect(persistedSummary.checks).toContainEqual(expect.objectContaining({
      key,
      status: "fail",
    }));
  });

  it("does not expose KEEP_KOKORO_ONLY as a MOSS-NANO-6 readiness decision", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-keep-kokoro-not-readiness-decision";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano6ReadinessSummary({
        runId,
        promotionDecision: {
          promote: false,
          target: "app-prototype",
          decision: "KEEP_KOKORO_ONLY",
        },
      }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE.*ITERATE_NANO_RESIDENT_RUNTIME.*PAUSE_NANO_RUNTIME_RELIABILITY/i);
    expect(summary.error).not.toContain("KEEP_KOKORO_ONLY");
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      target: "app-prototype",
      decision: "ITERATE_NANO_RESIDENT_RUNTIME",
    });
    expect(summary.promotionDecision.decision).not.toBe("KEEP_KOKORO_ONLY");
    expect(summary.nano6Readiness).toMatchObject({
      status: "failed",
      gate: "app-prototype",
      key: "promotionDecision",
    });
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "promotionDecision",
      status: "fail",
      failureClass: "runtime-contract",
    }));
  });

  it("records truthful MOSS-NANO-6 shutdown and restart classifications without reusing in-flight WAV output", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-shutdown-classifications";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano6ReadinessSummary({ runId }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result.status).toBe("ok");
    expect(summary.shutdownClassifications).toEqual(expect.arrayContaining([
      "clean-shutdown",
      "forced-kill",
      "zombie-process",
      "restart-clean",
      "restart-failed",
      "inflight-rejected",
    ]));
    expect(summary.shutdownEvidence.inflightShutdown).toMatchObject({
      classification: "inflight-rejected",
      observed: true,
      evidenceSource: "measured-lifecycle-check",
      rejected: true,
      succeeded: false,
      wavReused: false,
    });
  });

  it("blocks MOSS-NANO-6 promotion when shutdown classifications are synthetic observations", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-synthetic-shutdown-evidence";

    const synthetic = Object.fromEntries(
      Object.entries(nano6ReadinessSummary({ runId }).shutdownEvidence).map(([key, value]) => [
        key,
        {
          ...value,
          observed: true,
          evidenceSource: "synthetic-plan",
          classificationSource: "planned",
        },
      ]),
    );

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano6ReadinessSummary({ runId, shutdownEvidence: synthetic }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/shutdown.*measured|synthetic|planned/i);
    expect(summary.nano6Readiness).toMatchObject({
      status: "failed",
      key: "shutdownEvidence",
    });
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: "ITERATE_NANO_RESIDENT_RUNTIME",
    });
    expect(summary.promotionDecision.decision).not.toBe("BLOCKED_NANO_RESIDENT_RUNTIME");
  });

  it("blocks MOSS-NANO-6 promotion when lifecycle summaries are synthetic or not implemented", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-synthetic-lifecycle-summary";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano6ReadinessSummary({
        runId,
        lifecycleEvidence: {
          status: "actual",
          requestedOnly: false,
          stale: false,
          runId,
          shutdownRestartSummary: {
            status: "not-implemented",
            synthetic: true,
            shutdownObserved: false,
            restartObserved: false,
            evidenceSource: "synthetic-summary",
          },
        },
      }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/lifecycle.*shutdown.*restart.*observed|synthetic|not.?implemented/i);
    expect(summary.nano6Readiness).toMatchObject({
      status: "failed",
      key: "lifecycleEvidence",
    });
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: "ITERATE_NANO_RESIDENT_RUNTIME",
    });
  });

  it("records failed Nano-6 readiness gates for non-promoting real-soak artifacts", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-iterate-with-failed-readiness-gates";
    const summary = nano6ReadinessSummary({ runId });
    summary.promotionDecision = {
      promote: false,
      target: "app-prototype",
      decision: "ITERATE_NANO_RESIDENT_RUNTIME",
    };
    summary.lifecycleEvidence = {
      status: "requested",
      requestedOnly: true,
      stale: false,
      runId,
    };
    summary.residentSoak = {
      ...summary.residentSoak,
      memoryGrowthSlopeMbPerMin: 2.5,
      postWarmupSlopeMbPerMin: 2.5,
      readinessMemorySlopeMbPerMin: 2.5,
    };
    summary.bookLikeAdjacentRun = {
      ...summary.bookLikeAdjacentRun,
      completedSegments: 60,
      freshSegments: 60,
    };
    summary.promotionMetrics = {
      ...summary.promotionMetrics,
      memoryGrowthSlopeMbPerMin: 2.5,
      adjacentCompletedSegments: 60,
      adjacentFreshSegments: 60,
    };

    const { result, summary: persistedSummary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary,
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result.status).toBe("ok");
    expect(persistedSummary.nano6Readiness).toMatchObject({
      status: "not-promoting",
      gate: "app-prototype",
      failedGate: "app-prototype",
      failedKey: "lifecycleEvidence",
    });
    expect(persistedSummary.nano6Readiness.failedKeys).toEqual(expect.arrayContaining([
      "lifecycleEvidence",
      "residentSoak",
      "bookLikeAdjacentRun",
    ]));
    expect(persistedSummary.nano6Readiness.failedGates).toEqual(expect.arrayContaining([
      expect.objectContaining({
        gate: "app-prototype",
        key: "lifecycleEvidence",
        reason: expect.stringMatching(/lifecycle|requested-only/i),
      }),
      expect.objectContaining({
        gate: "app-prototype",
        key: "residentSoak",
        failureClass: "performance",
        reason: expect.stringMatching(/memory growth/i),
      }),
      expect.objectContaining({
        gate: "app-prototype",
        key: "bookLikeAdjacentRun",
        reason: expect.stringMatching(/100 completed|adjacent/i),
      }),
    ]));
    expect(persistedSummary.nano6Readiness.failedReasons).toEqual(expect.arrayContaining([
      expect.stringMatching(/lifecycle|requested-only/i),
      expect.stringMatching(/memory growth/i),
      expect.stringMatching(/100 completed|adjacent/i),
    ]));
    expect(persistedSummary.promotionDecision).toMatchObject({
      promote: false,
      decision: "ITERATE_NANO_RESIDENT_RUNTIME",
    });
  });

  it("requires 100 completed and fresh MOSS-NANO-6 adjacent segments when 100 are requested", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-adjacent-100-requested-60-completed";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano6ReadinessSummary({
        runId,
        bookLikeAdjacentRun: {
          ...nano6ReadinessSummary({ runId }).bookLikeAdjacentRun,
          requestedSegments: 100,
          completedSegments: 60,
          freshSegments: 60,
        },
        promotionMetrics: {
          ...nano6ReadinessSummary({ runId }).promotionMetrics,
          adjacentRequestedSegments: 100,
          adjacentCompletedSegments: 60,
          adjacentFreshSegments: 60,
        },
      }),
      options: {
        residentDecodeMode: "stream",
        adjacentSegmentCount: 100,
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/100.*completed|100.*fresh|adjacent/i);
    expect(summary.nano6Readiness).toMatchObject({
      status: "failed",
      key: "bookLikeAdjacentRun",
    });
    expect(summary.promotionDecision).toMatchObject({
      promote: false,
      decision: "ITERATE_NANO_RESIDENT_RUNTIME",
    });
  });

  it("uses measured MOSS-NANO-6 soak duration instead of requested CLI duration for promotion", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-requested-soak-is-not-measured";
    const summary = nano6ReadinessSummary({ runId });
    summary.residentSoak = {
      ...summary.residentSoak,
      requestedDurationSec: 1800,
      measuredDurationSec: 12,
      durationSec: 1800,
    };
    summary.promotionMetrics.soakDurationSec = 1800;

    const { result, summary: persistedSummary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary,
      options: {
        residentDecodeMode: "stream",
        soakDurationSec: 1800,
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "performance",
    });
    expect(persistedSummary.residentSoak).toMatchObject({
      requestedDurationSec: 1800,
      measuredDurationSec: 12,
      durationSec: 12,
    });
    expect(persistedSummary.error).toMatch(/soak duration.*1800/i);
    expect(persistedSummary.promotionDecision).toMatchObject({ promote: false });
  });

  it("keeps immutable MOSS-NANO-6 promotion gates when artifact thresholds are weaker", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-weakened-thresholds-do-not-promote";
    const summary = nano6ReadinessSummary({
      runId,
      residentSoak: {
        ...nano6ReadinessSummary({ runId }).residentSoak,
        durationSec: 60,
        measuredDurationSec: 60,
        requestedDurationSec: 60,
      },
      promotionThresholds: {
        soakDurationSecMin: 1,
        adjacentRequiredSegments: 1,
        adjacentP95InternalFirstDecodedAudioMsMax: 99999,
        adjacentP95FinalRtfMax: 99999,
        adjacentP95PunctuationRtfMax: 99999,
        memoryGrowthSlopeMbPerMinMax: 99999,
        staleOutputReuseMax: 99,
        emptySegmentMax: 99,
        sessionRestartMax: 99,
        crashCountMax: 99,
      },
    });

    const { result, summary: persistedSummary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary,
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "performance",
    });
    expect(persistedSummary.promotionThresholds).toMatchObject({
      soakDurationSecMin: 1800,
      adjacentRequiredSegments: 100,
    });
    expect(persistedSummary.artifactPromotionThresholds).toMatchObject({
      soakDurationSecMin: 1,
      adjacentRequiredSegments: 1,
    });
    expect(persistedSummary.promotionDecision).toMatchObject({ promote: false });
  });

  it("fails MOSS-NANO-6 readiness when in-flight shutdown succeeds or reuses a WAV", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputRoot = path.join(projectRoot, "artifacts", "nano");
    const runId = "nano6-inflight-shutdown-reuse";

    const { result, summary } = await runMockedResidentSummary({
      projectRoot,
      outputRoot,
      runId,
      summary: nano6ReadinessSummary({
        runId,
        shutdownEvidence: {
          cleanShutdown: { classification: "clean-shutdown", observed: true, evidenceSource: "measured-lifecycle-check" },
          forcedKill: { classification: "forced-kill", observed: true, evidenceSource: "measured-lifecycle-check" },
          zombieProcess: { classification: "zombie-process", observed: true, evidenceSource: "measured-lifecycle-check" },
          restartClean: { classification: "restart-clean", observed: true, evidenceSource: "measured-lifecycle-check" },
          restartFailed: { classification: "restart-failed", observed: true, evidenceSource: "measured-lifecycle-check" },
          inflightShutdown: {
            classification: "inflight-rejected",
            observed: true,
            evidenceSource: "measured-lifecycle-check",
            rejected: false,
            succeeded: true,
            wavReused: true,
          },
        },
      }),
      options: {
        residentDecodeMode: "stream",
      },
    });

    expect(result).toMatchObject({
      status: "blocked",
      failureClass: "runtime-contract",
    });
    expect(summary.error).toMatch(/in-?flight.*shutdown.*reject.*wav/i);
    expect(summary.checks).toContainEqual(expect.objectContaining({
      key: "shutdownEvidence",
      status: "fail",
    }));
  });

  it("passes custom passage text, run id, and out path into per-run artifacts", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { runMossNanoProbe } = await importMossNanoProbe();
    const outputRoot = path.join(projectRoot, "artifacts", "custom-nano");
    const runId = "nano-custom-run";
    const passageText = "Custom Nano probe text, exactly once.";
    const execFile = vi.fn(async () => ({
      stdout: `${JSON.stringify(successfulNanoSummary({
        runId,
        passageId: "custom-passage",
        wordCount: 6,
      }))}\n`,
      stderr: "",
    }));

    const result = await runMossNanoProbe({
      projectRoot,
      runId,
      passageId: "custom-passage",
      passageText,
      outputDir: outputRoot,
      execFile,
    });

    const runDir = path.join(outputRoot, runId);
    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile.mock.calls[0][1]).toEqual(expect.arrayContaining([
      "--run-id",
      runId,
      "--passage-id",
      "custom-passage",
      "--passage-text",
      passageText,
      "--output-dir",
      runDir,
    ]));
    expect(result.summaryJsonPath).toBe(path.join(runDir, "summary.json"));
    expect(result.summaryPath).toBe(path.join(runDir, "summary.txt"));
    await expect(fs.access(path.join(outputRoot, "summary.json"))).rejects.toThrow();
    expect(JSON.parse(await fs.readFile(result.summaryJsonPath, "utf8"))).toMatchObject({
      status: "ok",
      runId,
      passageId: "custom-passage",
      summary: {
        runId,
        passageId: "custom-passage",
      },
    });
  });
});
