import { spawn } from "node:child_process";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const BUILT_IN_PASSAGES = Object.freeze({
  "short-smoke": "The little probe spoke once, paused, and finished cleanly.",
  "punctuation-heavy-mid": "Wait... really? Yes: commas, semicolons; dashes, quotes, and parentheses all need a calm voice.",
  "dialogue-switches": "\"Are you ready?\" she asked. \"Ready,\" he said. The narrator waited, then the room answered.",
  "long-form-3min": [
    "This is a longer Nano passage for local MOSS smoke testing.",
    "It is intentionally plain, steady, and paragraph shaped so the runtime can exercise batching, punctuation, and continuity.",
    "The probe should not fetch model assets or repair the runtime automatically.",
    "It should only use the configured local paths, generate audio when local assets are ready, and report a concise summary.",
  ].join(" "),
});

export const PASSAGE_ALIASES = Object.freeze({
  short: "short-smoke",
  punctuation: "punctuation-heavy-mid",
});

const DEFAULT_RUN_ID = "moss-nano-1-probe";
const DEFAULT_PASSAGE_ID = "short-smoke";
const PYTHON_PROBE_RELATIVE_PATH = path.join("scripts", "moss_nano_probe.py");
const PYTHON_RESIDENT_PROBE_RELATIVE_PATH = path.join("scripts", "moss_nano_resident_probe.py");
const DECODE_FULL_FIRST_AUDIO_SEC_MAX = 2.5;
const DECODE_FULL_MEMORY_GROWTH_MB_MAX = 80;

export function resolvePassageId(passageId = DEFAULT_PASSAGE_ID) {
  return PASSAGE_ALIASES[passageId] ?? passageId;
}

function resolvePassageText({ passageId, passageText }) {
  if (passageText != null) return passageText;
  return BUILT_IN_PASSAGES[resolvePassageId(passageId ?? DEFAULT_PASSAGE_ID)] ?? "";
}

function repoLocalNanoPython(projectRoot) {
  const candidate = process.platform === "win32"
    ? path.join(projectRoot, ".runtime", "moss", ".venv-nano", "Scripts", "python.exe")
    : path.join(projectRoot, ".runtime", "moss", ".venv-nano", "bin", "python");
  return fsSync.existsSync(candidate) ? candidate : null;
}

function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function positiveInteger(value, flag) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${flag} requires a positive integer`);
  }
  return parsed;
}

function nonNegativeInteger(value, flag) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${flag} requires a non-negative integer`);
  }
  return parsed;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const args = { json: false, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--config") {
      args.configPath = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--runtime-mode") {
      args.runtimeMode = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--run-id") {
      args.runId = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--passage" || arg === "--passage-id") {
      args.passageId = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--passage-text") {
      args.passageText = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--allow-empty-passage") {
      args.allowEmptyPassage = true;
    } else if (arg === "--out" || arg === "--output-dir") {
      args.outputDir = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--python") {
      args.python = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--repo-dir") {
      args.repoDir = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--model-dir") {
      args.modelDir = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--threads") {
      args.threads = positiveInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--max-new-frames") {
      args.maxNewFrames = positiveInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--sample-mode") {
      args.sampleMode = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--voice") {
      args.voice = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--prompt-audio") {
      args.promptAudio = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--process-mode") {
      args.processMode = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--iterations") {
      args.iterations = positiveInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--warmup-runs") {
      args.warmupRuns = nonNegativeInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--prewarm") {
      args.prewarm = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--profile-stages") {
      args.profileStages = true;
    } else if (arg === "--profile-events-jsonl") {
      args.profileEventsJsonl = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--segment-policy") {
      args.segmentPolicy = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--segment-max-tokens") {
      args.segmentMaxTokens = positiveInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--segment-max-chars") {
      args.segmentMaxChars = positiveInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--segment-min-chars") {
      args.segmentMinChars = nonNegativeInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--segment-source") {
      args.segmentSource = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--write-segment-wavs") {
      args.writeSegmentWavs = true;
    } else if (arg === "--ort-providers") {
      args.ortProviders = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--ort-intra-op-threads") {
      args.ortIntraOpThreads = positiveInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--ort-inter-op-threads") {
      args.ortInterOpThreads = positiveInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--ort-execution-mode") {
      args.ortExecutionMode = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--ort-graph-optimization") {
      args.ortGraphOptimization = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--ort-enable-cpu-mem-arena") {
      args.ortEnableCpuMemArena = true;
    } else if (arg === "--no-ort-enable-cpu-mem-arena") {
      args.ortEnableCpuMemArena = false;
    } else if (arg === "--ort-enable-mem-pattern") {
      args.ortEnableMemPattern = true;
    } else if (arg === "--no-ort-enable-mem-pattern") {
      args.ortEnableMemPattern = false;
    } else if (arg === "--ort-enable-mem-reuse") {
      args.ortEnableMemReuse = true;
    } else if (arg === "--no-ort-enable-mem-reuse") {
      args.ortEnableMemReuse = false;
    } else if (arg === "--ort-use-per-session-threads") {
      args.ortUsePerSessionThreads = true;
    } else if (arg === "--no-ort-use-per-session-threads") {
      args.ortUsePerSessionThreads = false;
    } else if (arg === "--precompute-inputs") {
      args.precomputeInputs = true;
    } else if (arg === "--variant-id") {
      args.variantId = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--optimization-profile") {
      args.optimizationProfile = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--provider-variant") {
      args.providerVariant = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--reuse-tokenizer") {
      args.tokenizerReuse = true;
    } else if (arg === "--reuse-prompt") {
      args.promptReuse = true;
    } else if (arg === "--short-passage-overhead-reduction") {
      args.shortPassageOverheadReduction = true;
    } else if (arg === "--book-like-warm-runs") {
      args.bookLikeWarmRuns = nonNegativeInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--resident-decode-mode") {
      args.residentDecodeMode = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--stream-decode-frame-budget") {
      args.streamDecodeFrameBudget = positiveInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--adjacent-segment-count") {
      args.adjacentSegmentCount = positiveInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--adjacent-segment-source") {
      args.adjacentSegmentSource = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--adjacent-segment-rtf-trend-max") {
      const value = Number.parseFloat(requireValue(argv, index, arg));
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`${arg} requires a non-negative number`);
      }
      args.adjacentSegmentRtfTrendMax = value;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function defaultOptions(projectRoot = process.cwd()) {
  return {
    runId: DEFAULT_RUN_ID,
    passageId: DEFAULT_PASSAGE_ID,
    outputRoot: path.join(projectRoot, "artifacts", "moss"),
    repoDir: path.join(projectRoot, ".runtime", "moss", "MOSS-TTS-Nano"),
    modelDir: path.join(projectRoot, ".runtime", "moss", "weights", "MOSS-TTS-Nano-ONNX"),
    backend: "moss-nano-onnx",
    device: "cpu",
    modelVariant: "moss-tts-nano-onnx",
    threads: 4,
    sampleRate: 48000,
    maxNewFrames: 375,
    sampleMode: "fixed",
    streaming: true,
    voice: "Junhao",
    processMode: "cold",
    iterations: 1,
    warmupRuns: 0,
    prewarm: "none",
    segmentPolicy: "none",
    segmentSource: "raw",
  };
}

function resolveRunOutputDir(outputDir, runId) {
  const outputRoot = outputDir ?? path.join(process.cwd(), "artifacts", "moss");
  if (path.basename(path.resolve(outputRoot)) === runId) {
    return outputRoot;
  }
  return path.join(outputRoot, runId);
}

function tail(value, limit = 12000) {
  const text = String(value ?? "").trim();
  return text.length > limit ? text.slice(-limit) : text;
}

function parsePythonSummary(stdout) {
  try {
    return { summary: JSON.parse(stdout.trim()), error: null };
  } catch {
    return { summary: null, error: "Python Nano probe did not return valid JSON on stdout." };
  }
}

function makeContractCheck(key, detail) {
  return makeFailureCheck(key, detail, "runtime-contract");
}

function makeFailureCheck(key, detail, failureClass) {
  return {
    key,
    status: "fail",
    detail,
    failureClass,
  };
}

function sortedJson(value) {
  if (Array.isArray(value)) return `[${value.map(sortedJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${sortedJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function residentRunRecords(summary) {
  return [
    ...(Array.isArray(summary?.warmups) ? summary.warmups : []),
    ...(Array.isArray(summary?.iterations) ? summary.iterations : []),
  ];
}

function hasStableResidentIdentity(identity) {
  const sessions = identity?.loadedSessionIdentities;
  return Boolean(
    identity?.pythonProcessIdentity
      && sessions
      && typeof sessions === "object"
      && Object.keys(sessions).length > 0
      && Object.values(sessions).every(Boolean),
  );
}

function requestedOrtOptionsFromConfig(options = {}) {
  return {
    providers: String(options.ortProviders ?? "").split(",").map((item) => item.trim()).filter(Boolean),
    intraOpThreads: options.ortIntraOpThreads,
    interOpThreads: options.ortInterOpThreads,
    executionMode: options.ortExecutionMode,
    graphOptimization: options.ortGraphOptimization,
    enableCpuMemArena: options.ortEnableCpuMemArena,
    enableMemPattern: options.ortEnableMemPattern,
    enableMemReuse: options.ortEnableMemReuse,
    usePerSessionThreads: options.ortUsePerSessionThreads,
  };
}

function objectOrEmpty(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function blockResidentSummary(summary, message, key, failureClass = "runtime-contract") {
  summary.ok = false;
  summary.status = "blocked";
  summary.failureClass = failureClass;
  summary.error = message;
  summary.checks = Array.isArray(summary.checks) ? summary.checks : [];
  summary.checks.push(makeFailureCheck(key, message, failureClass));
  if (summary.promotionDecision && typeof summary.promotionDecision === "object") {
    summary.promotionDecision.promote = false;
    summary.promotionDecision.blockedReason = message;
    if (String(summary.promotionDecision.decision ?? "").startsWith("PROMOTE_NANO_TO_")) {
      summary.promotionDecision.decision = failureClass === "performance"
        ? "ITERATE_NANO_RESIDENT_RUNTIME"
        : "BLOCKED_NANO_RESIDENT_RUNTIME";
    }
  }
  return summary;
}

function sanitizeFileFirstAudioObservation(observation = {}) {
  return {
    ...observation,
    kind: "internal-first-decoded-audio",
    sourceEvent: observation.sourceEvent ?? "firstDecodedAudio",
    internalFirstDecodedAudioSupported: Boolean(observation.internalFirstDecodedAudioSupported),
    fileObservedAudioSec: null,
  };
}

function normalizeOptimizationEvidence(summary, requested = {}) {
  const optimization = objectOrEmpty(summary.optimization);
  for (const key of [
    "precomputeInputsRequested",
    "precomputeInputsActual",
    "precomputeInputsPartial",
    "precomputeInputsBlocker",
    "precomputeInputsEvidence",
    "tokenizerIdentity",
    "promptAudioCodesEvidence",
    "decodeFullEvidence",
    "acceptedDecodeStrategy",
    "adjacentSegmentStats",
    "segments",
    "promotionTarget",
    "promotionThresholds",
    "promotionMetrics",
  ]) {
    if (summary[key] == null && Object.prototype.hasOwnProperty.call(optimization, key)) {
      summary[key] = optimization[key];
    }
  }
  if (summary.promotionDecision == null && Object.prototype.hasOwnProperty.call(optimization, "promotionDecision")) {
    summary.promotionDecision = optimization.promotionDecision;
  }
  if (summary.optimizationVariant == null) {
    summary.optimizationVariant = optimization.variantId ?? optimization.optimizationVariant ?? requested.variantId ?? null;
  }
  if (summary.optimizationProfile == null) {
    summary.optimizationProfile = optimization.profile ?? optimization.optimizationProfile ?? requested.optimizationProfile ?? null;
  }
  if (summary.providerVariant == null) {
    summary.providerVariant = optimization.providerVariant ?? requested.providerVariant ?? null;
  }
  if (summary.precomputeInputsRequested == null && requested.precomputeInputs != null) {
    summary.precomputeInputsRequested = Boolean(requested.precomputeInputs);
  }
  if (summary.tokenizerReuseRequested == null && requested.tokenizerReuse != null) {
    summary.tokenizerReuseRequested = Boolean(requested.tokenizerReuse);
  }
  if (summary.promptReuseRequested == null && requested.promptReuse != null) {
    summary.promptReuseRequested = Boolean(requested.promptReuse);
  }
  if (summary.tokenizerReuseActual == null) {
    summary.tokenizerReuseActual = optimization.tokenizerReuseActual ?? null;
  }
  if (summary.promptReuseActual == null) {
    summary.promptReuseActual = optimization.promptReuseActual ?? null;
  }
  if (summary.shortPassageOverheadReduction == null) {
    summary.shortPassageOverheadReduction = optimization.shortPassageOverheadReduction ?? (
      requested.shortPassageOverheadReduction
        ? { requested: true, actual: false, reason: "Resident probe did not report applied short-passage overhead reduction evidence." }
        : null
    );
  }
  if (summary.bookLikeRunStats == null) {
    summary.bookLikeRunStats = optimization.bookLikeRunStats ?? null;
  }
  if (summary.optimizationEvidence == null) {
    summary.optimizationEvidence = optimization.evidence ?? optimization.optimizationEvidence ?? null;
  }
  if (summary.promotionMetrics == null && !summary.promotionClass) {
    const firstDecodedSec = summary.firstAudioObservation?.internalFirstDecodedAudioSec
      ?? (summary.internalFirstDecodedAudioMs == null ? null : Number(summary.internalFirstDecodedAudioMs) / 1000)
      ?? summary.firstAudioSec
      ?? null;
    summary.promotionMetrics = {
      shortRtf: summary.rtf ?? null,
      firstDecodedAudioSec: firstDecodedSec,
      internalFirstDecodedAudioMs: summary.internalFirstDecodedAudioMs ?? null,
    };
  }
  return summary;
}

function hasNano5SoakShape(summary, requested = {}) {
  const decision = String(summary.promotionDecision?.decision ?? "");
  return summary.promotionTarget === "nano5-soak"
    || summary.promotionDecision?.target === "nano5-soak"
    || decision === "PROMOTE_NANO_TO_SOAK_CANDIDATE"
    || decision === "PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE"
    || summary.adjacentSegmentStats != null
    || summary.decodeFullEvidence != null
    || summary.acceptedDecodeStrategy != null
    || requested.adjacentSegmentCount != null;
}

function requiredNumericGate(thresholds, metrics, thresholdKey, metricKey, label) {
  if (!(thresholdKey in thresholds)) {
    return `${label} threshold missing: ${thresholdKey}`;
  }
  if (!isFiniteNumber(thresholds[thresholdKey])) {
    return `${label} threshold ${thresholdKey} must be numeric`;
  }
  if (!(metricKey in metrics)) {
    return `${label} metric missing: ${metricKey}`;
  }
  if (!isFiniteNumber(metrics[metricKey])) {
    return `${label} metric ${metricKey} must be numeric`;
  }
  if (metrics[metricKey] > thresholds[thresholdKey]) {
    return `${label} metric ${metricKey}=${metrics[metricKey]} exceeds threshold ${thresholdKey}=${thresholds[thresholdKey]}`;
  }
  return null;
}

function firstFiniteNumber(...values) {
  return values.find((value) => isFiniteNumber(value)) ?? null;
}

function normalizePromotionMemoryMetrics(summary) {
  if (!summary.promotionMetrics || typeof summary.promotionMetrics !== "object" || Array.isArray(summary.promotionMetrics)) {
    return;
  }
  const metrics = summary.promotionMetrics;
  const aggregate = objectOrEmpty(summary.aggregate);
  const decodeFullEvidence = objectOrEmpty(summary.decodeFullEvidence);
  if (!isFiniteNumber(metrics.shortMemoryGrowthMb)) {
    const representativeGrowth = firstFiniteNumber(summary.memoryDeltaMb, aggregate.representativeMemoryGrowthMb);
    if (representativeGrowth != null) metrics.shortMemoryGrowthMb = representativeGrowth;
  }
  if (!isFiniteNumber(metrics.representativeMemoryGrowthMb)) {
    const representativeGrowth = firstFiniteNumber(summary.memoryDeltaMb, metrics.shortMemoryGrowthMb);
    if (representativeGrowth != null) metrics.representativeMemoryGrowthMb = representativeGrowth;
  }
  if (!isFiniteNumber(metrics.memoryGrowthAcrossRunsMb) && isFiniteNumber(aggregate.memoryGrowthAcrossRunsMb)) {
    metrics.memoryGrowthAcrossRunsMb = aggregate.memoryGrowthAcrossRunsMb;
  }
  if (!isFiniteNumber(metrics.decodeFullMemoryGrowthMb) && isFiniteNumber(decodeFullEvidence.memoryGrowthMb)) {
    metrics.decodeFullMemoryGrowthMb = decodeFullEvidence.memoryGrowthMb;
  }
  if (!isFiniteNumber(metrics.decodeFullFirstAudioSec) && isFiniteNumber(decodeFullEvidence.firstAudioSec)) {
    metrics.decodeFullFirstAudioSec = decodeFullEvidence.firstAudioSec;
  }
}

function normalizeDecodeFullEvidence(summary) {
  if (!summary.decodeFullEvidence || typeof summary.decodeFullEvidence !== "object" || Array.isArray(summary.decodeFullEvidence)) {
    return null;
  }
  const evidence = summary.decodeFullEvidence;
  const metrics = objectOrEmpty(summary.promotionMetrics);
  const thresholds = objectOrEmpty(summary.promotionThresholds);
  const firstAudioSecMax = firstFiniteNumber(
    evidence.gates?.firstAudioSecMax,
    thresholds.decodeFullFirstAudioSecMax,
    DECODE_FULL_FIRST_AUDIO_SEC_MAX,
  );
  const memoryGrowthMbMax = firstFiniteNumber(
    evidence.gates?.memoryGrowthMbMax,
    thresholds.decodeFullMemoryGrowthMbMax,
    DECODE_FULL_MEMORY_GROWTH_MB_MAX,
  );
  const firstAudioSec = firstFiniteNumber(evidence.firstAudioSec, metrics.decodeFullFirstAudioSec);
  const memoryGrowthMb = firstFiniteNumber(evidence.memoryGrowthMb, metrics.decodeFullMemoryGrowthMb);
  const failures = [];
  if (!isFiniteNumber(firstAudioSec)) {
    failures.push("decode-full first audio is missing");
  } else if (firstAudioSec > firstAudioSecMax) {
    failures.push(`decode-full first audio ${firstAudioSec}s exceeds ${firstAudioSecMax}s`);
  }
  if (!isFiniteNumber(memoryGrowthMb)) {
    failures.push("decode-full memory growth is missing");
  } else if (memoryGrowthMb > memoryGrowthMbMax) {
    failures.push(`decode-full memory growth ${memoryGrowthMb}MB exceeds ${memoryGrowthMbMax}MB`);
  }
  summary.decodeFullEvidence = {
    ...evidence,
    status: failures.length > 0 ? "failed" : "passed",
    firstAudioSec,
    memoryGrowthMb,
    gates: {
      ...objectOrEmpty(evidence.gates),
      firstAudioSecMax,
      memoryGrowthMbMax,
      firstAudioPassed: isFiniteNumber(firstAudioSec) && firstAudioSec <= firstAudioSecMax,
      memoryGrowthPassed: isFiniteNumber(memoryGrowthMb) && memoryGrowthMb <= memoryGrowthMbMax,
    },
    reason: failures.length > 0 ? failures.join("; ") : (evidence.reason ?? null),
  };
  if (failures.length > 0 && summary.acceptedDecodeStrategy?.strategy === "decode-full") {
    summary.acceptedDecodeStrategy = {
      ...summary.acceptedDecodeStrategy,
      accepted: false,
      reason: summary.decodeFullEvidence.reason,
    };
  }
  return summary.decodeFullEvidence.reason;
}

function nano5PromotionThresholdFailure(summary) {
  if (!summary.promotionThresholds || typeof summary.promotionThresholds !== "object" || Array.isArray(summary.promotionThresholds)) {
    return "MOSS-NANO-5 promotion thresholds missing";
  }
  if (!summary.promotionMetrics || typeof summary.promotionMetrics !== "object" || Array.isArray(summary.promotionMetrics)) {
    return "MOSS-NANO-5 promotion metrics missing";
  }
  const thresholds = summary.promotionThresholds;
  const metrics = summary.promotionMetrics;
  const gates = [
    ["shortRtfMax", "shortRtf", "short"],
    ["shortP95RtfMax", "shortP95Rtf", "short"],
    ["shortFirstDecodedAudioSecMax", "shortFirstDecodedAudioSec", "short"],
    ["shortMemoryGrowthMbMax", "shortMemoryGrowthMb", "short memory"],
    ["punctuationRtfMax", "punctuationRtf", "punctuation"],
    ["punctuationP95RtfMax", "punctuationP95Rtf", "punctuation"],
    ["punctuationFirstDecodedAudioSecMax", "punctuationFirstDecodedAudioSec", "punctuation"],
    ["decodeFullFirstAudioSecMax", "decodeFullFirstAudioSec", "decode first audio"],
    ["decodeFullMemoryGrowthMbMax", "decodeFullMemoryGrowthMb", "decode memory"],
    ["adjacentRtfTrendMax", "adjacentRtfTrendRatio", "adjacent"],
  ];
  for (const [thresholdKey, metricKey, label] of gates) {
    const failure = requiredNumericGate(thresholds, metrics, thresholdKey, metricKey, label);
    if (failure) return failure;
  }
  if (!("adjacentMinFreshSegments" in thresholds)) {
    return "adjacent threshold missing: adjacentMinFreshSegments";
  }
  if (!isFiniteNumber(thresholds.adjacentMinFreshSegments)) {
    return "adjacent threshold adjacentMinFreshSegments must be numeric";
  }
  if (!("adjacentFreshSegments" in metrics)) {
    return "adjacent metric missing: adjacentFreshSegments";
  }
  if (!isFiniteNumber(metrics.adjacentFreshSegments)) {
    return "adjacent metric adjacentFreshSegments must be numeric";
  }
  if (metrics.adjacentFreshSegments < thresholds.adjacentMinFreshSegments) {
    return `adjacent metric adjacentFreshSegments=${metrics.adjacentFreshSegments} is below required ${thresholds.adjacentMinFreshSegments}`;
  }
  if (isFiniteNumber(metrics.punctuationStaleOutputReuseCount) && metrics.punctuationStaleOutputReuseCount > 0) {
    return "punctuation stale output reuse count must be zero";
  }
  if (isFiniteNumber(metrics.adjacentEmptySegments) && metrics.adjacentEmptySegments > 0) {
    return "adjacent empty segment count must be zero";
  }
  if (isFiniteNumber(metrics.adjacentStaleOutputReuseCount) && metrics.adjacentStaleOutputReuseCount > 0) {
    return "adjacent stale output reuse count must be zero";
  }
  if (isFiniteNumber(metrics.adjacentSessionRestartCount) && metrics.adjacentSessionRestartCount > 0) {
    return "adjacent session restart count must be zero";
  }
  return null;
}

function validateDecodeFullGate(summary) {
  const evidence = objectOrEmpty(summary.decodeFullEvidence);
  if (!summary.decodeFullEvidence || Object.keys(evidence).length === 0) {
    return "decode-full evidence is required for MOSS-NANO-5 soak promotion";
  }
  const thresholdFailure = normalizeDecodeFullEvidence(summary);
  const normalizedEvidence = objectOrEmpty(summary.decodeFullEvidence);
  if (String(normalizedEvidence.status ?? "").toLowerCase() === "passed") return null;
  const accepted = objectOrEmpty(summary.acceptedDecodeStrategy);
  const strategy = String(accepted.strategy ?? "").toLowerCase();
  const replacementAccepted = accepted.accepted === true
    && (accepted.replacementForDecodeFull === true || ["stream", "streaming", "segmented"].includes(strategy));
  if (replacementAccepted) {
    return "accepted replacement evidence cannot bypass failed decode-full gate for MOSS-NANO-5 soak promotion";
  }
  return `decode-full failed MOSS-NANO-5 soak gate${thresholdFailure ? `: ${thresholdFailure}` : ""}`;
}

function validateAdjacentSegments(summary, { required = false } = {}) {
  const stats = objectOrEmpty(summary.adjacentSegmentStats);
  const segments = Array.isArray(summary.segments) ? summary.segments : [];
  if (required && !summary.adjacentSegmentStats) {
    return "adjacent segment evidence is required for MOSS-NANO-5 soak promotion";
  }
  if (!summary.adjacentSegmentStats || segments.length < 5 || Number(stats.completedSegments ?? 0) < 5) {
    return "adjacent run requires at least five fresh segments";
  }
  if (Number(stats.emptySegments ?? 0) > 0 || segments.some((segment) => segment?.empty || !String(segment?.text ?? "").trim())) {
    return "adjacent run contains an empty segment";
  }
  if (Number(stats.staleOutputReuseCount ?? 0) > 0 || segments.some((segment) => (
    segment?.staleOutputReuse
      || segment?.firstAudioObservation?.outputFileExistedBeforeRun
      || segment?.firstAudioObservation?.reusedExistingOutputFile
  ))) {
    return "adjacent run has stale output reuse";
  }
  if (Number(stats.freshSegments ?? 0) < 5) {
    return "adjacent run requires at least five fresh segments";
  }
  if (Number(stats.sessionRestartCount ?? 0) > 0 || segments.some((segment) => segment?.sessionRestarted)) {
    return "adjacent run has a session restart";
  }
  const trend = Number(stats.rtfTrendRatio);
  const trendMax = Number(stats.rtfTrendMax ?? summary.promotionThresholds?.adjacentRtfTrendMax ?? 0.15);
  if (Number.isFinite(trend) && Number.isFinite(trendMax) && trend > trendMax) {
    return "adjacent RTF trend exceeds 15%";
  }
  const firstIdentity = segments[0]?.runtimeIdentity;
  if (!segments.every((segment) => sortedJson(segment?.runtimeIdentity) === sortedJson(firstIdentity))) {
    return "adjacent run has a session restart";
  }
  const wavs = segments.map((segment) => segment?.outputWavPath).filter(Boolean);
  if (new Set(wavs).size !== wavs.length) {
    return "adjacent run requires distinct WAV outputs";
  }
  if (segments.some((segment) => segment?.firstAudioObservation?.internalFirstDecodedAudioMs == null)) {
    return "adjacent run requires internal first decoded audio for every segment";
  }
  return null;
}

function validateNano5SoakPromotion(summary, requested = {}) {
  if (!hasNano5SoakShape(summary, requested)) return null;
  const decision = String(summary.promotionDecision?.decision ?? "");
  const target = summary.promotionTarget ?? summary.promotionDecision?.target ?? null;
  const isSoakPromotion = decision === "PROMOTE_NANO_TO_SOAK_CANDIDATE" || target === "nano5-soak";
  if (target === "app-prototype" || decision === "PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE") {
    return {
      message: "MOSS-NANO-5 may promote to soak, not app prototype.",
      key: "promotionDecision",
      failureClass: "runtime-contract",
    };
  }
  normalizePromotionMemoryMetrics(summary);
  const precomputeRequested = summary.precomputeInputsRequested === true || requested.precomputeInputs === true;
  const precomputeEvidence = objectOrEmpty(summary.precomputeInputsEvidence);
  const precomputeEvidenceActual = summary.precomputeInputsActual === true
    && (String(precomputeEvidence.status ?? "").toLowerCase() === "actual" || precomputeEvidence.actual === true);
  if (isSoakPromotion && !precomputeEvidenceActual) {
    if (summary.precomputeInputsBlocker || String(precomputeEvidence.status ?? "").toLowerCase() === "blocked") {
      return {
        message: "blocker-only precompute evidence must not promote.",
        key: "precomputeInputsEvidence",
        failureClass: "runtime-contract",
      };
    }
    return {
      message: "precompute actual evidence is required for MOSS-NANO-5 soak promotion.",
      key: "precomputeInputsEvidence",
      failureClass: "runtime-contract",
    };
  }
  if (!isSoakPromotion && precomputeRequested && summary.precomputeInputsActual !== true) {
    if (!summary.precomputeInputsBlocker) {
      return {
        message: "precomputeInputsActual=false requires a named blocker.",
        key: "precomputeInputsEvidence",
        failureClass: "runtime-contract",
      };
    }
    return {
      message: "blocker-only precompute evidence must not promote.",
      key: "precomputeInputsEvidence",
      failureClass: "runtime-contract",
    };
  }
  if (isSoakPromotion) {
    const decodeFailure = validateDecodeFullGate(summary);
    if (decodeFailure) {
      return {
        message: decodeFailure,
        key: "decodeFullEvidence",
        failureClass: "runtime-contract",
      };
    }
    const adjacentFailure = validateAdjacentSegments(summary, { required: true });
    if (adjacentFailure) {
      return {
        message: adjacentFailure,
        key: "adjacentSegmentStats",
        failureClass: "runtime-contract",
      };
    }
  } else {
    normalizeDecodeFullEvidence(summary);
    if (summary.adjacentSegmentStats != null) {
      const adjacentFailure = validateAdjacentSegments(summary);
      if (adjacentFailure) {
        return {
          message: adjacentFailure,
          key: "adjacentSegmentStats",
          failureClass: "runtime-contract",
        };
      }
    }
  }
  if (isSoakPromotion) {
    const thresholdFailure = nano5PromotionThresholdFailure(summary);
    if (thresholdFailure) {
      return {
        message: `MOSS-NANO-5 soak promotion blocked: ${thresholdFailure}.`,
        key: "promotionThresholds",
        failureClass: "performance",
      };
    }
  }
  return null;
}

function promotionThresholdFailure(summary) {
  const thresholds = objectOrEmpty(summary.promotionThresholds);
  const metrics = objectOrEmpty(summary.promotionMetrics);
  const requiredGates = [
    {
      thresholdKey: "shortRtfMax",
      metricKey: "shortRtf",
      label: "short RTF",
    },
    {
      thresholdKey: "firstDecodedAudioSecMax",
      metricKey: "firstDecodedAudioSec",
      label: "first decoded audio",
      unit: "s",
    },
  ];
  if (!summary.promotionThresholds || typeof summary.promotionThresholds !== "object" || Array.isArray(summary.promotionThresholds)) {
    return "promotion thresholds missing";
  }
  if (!summary.promotionMetrics || typeof summary.promotionMetrics !== "object" || Array.isArray(summary.promotionMetrics)) {
    return "promotion metrics missing";
  }
  for (const gate of requiredGates) {
    const threshold = thresholds[gate.thresholdKey];
    if (!isFiniteNumber(threshold)) {
      return `promotion threshold ${gate.thresholdKey} must be numeric`;
    }
    const metric = metrics[gate.metricKey];
    if (!isFiniteNumber(metric)) {
      return `promotion metric ${gate.metricKey} must be numeric`;
    }
    if (metric > threshold) {
      return `${gate.label} ${metric}${gate.unit ?? ""} > ${threshold}${gate.unit ?? ""}`;
    }
  }
  return null;
}

function requestedOptimizationContradiction(summary) {
  const optimization = objectOrEmpty(summary.optimization);
  const precomputeEvidence = objectOrEmpty(summary.precomputeInputsEvidence ?? optimization.precomputeInputsEvidence);
  const requestedClaims = [
    {
      label: "precompute inputs",
      requested: summary.precomputeInputsRequested ?? precomputeEvidence.requested ?? optimization.precomputeInputsRequested,
      actual: summary.precomputeInputsActual ?? precomputeEvidence.actual ?? optimization.precomputeInputsActual,
    },
    {
      label: "tokenizer reuse",
      requested: summary.tokenizerReuseRequested ?? optimization.tokenizerReuseRequested,
      actual: summary.tokenizerReuseActual ?? optimization.tokenizerReuseActual,
    },
    {
      label: "prompt reuse",
      requested: summary.promptReuseRequested ?? optimization.promptReuseRequested,
      actual: summary.promptReuseActual ?? optimization.promptReuseActual,
    },
    {
      label: "short-passage overhead reduction",
      requested: summary.shortPassageOverheadReduction?.requested ?? optimization.shortPassageOverheadReduction?.requested,
      actual: summary.shortPassageOverheadReduction?.actual ?? optimization.shortPassageOverheadReduction?.actual,
    },
  ];
  return requestedClaims.find((claim) => claim.requested === true && claim.actual !== true) ?? null;
}

function validateOptimizationPromotion(summary) {
  if (!summary.promotionClass) return null;
  const evidence = summary.optimizationEvidence;
  if (!evidence || typeof evidence !== "object") {
    return {
      message: "Resident promotion-class summary blocked: optimization evidence is missing.",
      key: "optimizationEvidence",
      failureClass: "runtime-contract",
    };
  }
  if (evidence.requestedOnly || String(evidence.status ?? "").toLowerCase() === "requested") {
    return {
      message: "Resident promotion-class summary blocked: optimization evidence is requested-only.",
      key: "optimizationEvidence",
      failureClass: "runtime-contract",
    };
  }
  if (evidence.stale) {
    return {
      message: "Resident promotion-class summary blocked: optimization evidence is stale.",
      key: "optimizationEvidence",
      failureClass: "runtime-contract",
    };
  }
  const contradiction = requestedOptimizationContradiction(summary);
  if (contradiction) {
    return {
      message: `Resident promotion-class summary blocked: ${contradiction.label} was requested but not proven actual.`,
      key: "optimizationEvidence",
      failureClass: "runtime-contract",
    };
  }

  const stats = summary.bookLikeRunStats;
  if (stats && typeof stats === "object") {
    const requestedWarmRuns = Number(stats.requestedWarmRuns ?? 0);
    const completedWarmRuns = Number(stats.completedWarmRuns ?? 0);
    const freshRuns = Number(stats.internalFirstDecodedAudioFreshRuns ?? 0);
    const staleOutputReuseCount = Number(stats.staleOutputReuseCount ?? 0);
    if (requestedWarmRuns > 0 && (completedWarmRuns < requestedWarmRuns || freshRuns < requestedWarmRuns || staleOutputReuseCount > 0)) {
      return {
        message: "Resident promotion-class book-like warm-run evidence requires repeated fresh internal first decoded audio.",
        key: "bookLikeWarmRuns",
        failureClass: "runtime-contract",
      };
    }
  }

  const thresholdFailure = promotionThresholdFailure(summary);
  if (thresholdFailure) {
    return {
      message: `Resident promotion-class summary blocked: promotion threshold gate failed (${thresholdFailure}).`,
      key: "promotionThresholds",
      failureClass: "performance",
    };
  }
  return null;
}

function normalizeResidentSummary(summary, requested = {}) {
  if (!summary || typeof summary !== "object") return summary;
  summary.runtimeMode = "resident";
  normalizeOptimizationEvidence(summary, requested);
  if (summary.firstAudioObservation?.kind === "internal-first-decoded-audio") {
    summary.firstAudioSource = "internal-decoded-audio";
    summary.firstAudioObservedSec = null;
  }

  let contractMessage = null;
  let contractKey = "residentContract";

  const hasResidentOrtOptions = summary.ortOptionsRequested && summary.ortOptionsApplied && summary.ortOptionsUnsupported;
  if (!hasResidentOrtOptions) {
    summary.ortOptionsRequested = objectOrEmpty(summary.ortOptionsRequested ?? summary.ort?.requested ?? requestedOrtOptionsFromConfig(requested));
    summary.ortOptionsApplied = objectOrEmpty(summary.ortOptionsApplied ?? summary.ort?.applied);
    summary.ortOptionsUnsupported = objectOrEmpty(summary.ortOptionsUnsupported ?? summary.ort?.unsupported);
    if (summary.ortOptionsRequested?.usePerSessionThreads != null && !summary.ortOptionsUnsupported.usePerSessionThreads) {
      summary.ortOptionsUnsupported.usePerSessionThreads = {
        requested: Boolean(summary.ortOptionsRequested.usePerSessionThreads),
        reason: "Resident probe must report unsupported per-session thread policy separately from applied ORT session options.",
      };
    }
    contractMessage = "Resident summaries must include ortOptionsRequested and ortOptionsApplied metadata.";
    contractKey = "ortOptions";
  }

  const reuseClaimed = Boolean(summary.benchmark?.runtimeReuseActual)
    || residentRunRecords(summary).some((record) => record?.runtimeReuseActual);
  if (!contractMessage && reuseClaimed) {
    const records = residentRunRecords(summary);
    const identities = records.map((record) => record?.runtimeIdentity ?? summary.runtimeIdentity);
    const firstIdentity = identities[0];
    const reuseProven = identities.length > 0
      && identities.every(hasStableResidentIdentity)
      && identities.every((identity) => sortedJson(identity) === sortedJson(firstIdentity));
    if (!reuseProven) {
      if (summary.benchmark) summary.benchmark.runtimeReuseActual = false;
      for (const record of records) record.runtimeReuseActual = false;
      contractMessage = "Resident runtime reuse could not be proven from stable process/session identity.";
      contractKey = "runtimeReuse";
    }
  }

  const fileFirstAudio = summary.firstAudioObservation?.kind === "file-observed-wav-bytes"
    || residentRunRecords(summary).some((record) => record?.firstAudioObservation?.kind === "file-observed-wav-bytes");
  if (!contractMessage && summary.promotionClass && fileFirstAudio) {
    summary.firstAudioObservation = sanitizeFileFirstAudioObservation(summary.firstAudioObservation);
    contractMessage = "Resident promotion-class summaries require internal first decoded audio evidence.";
    contractKey = "firstDecodedAudio";
  }

  const staleOutputEvidence = residentRunRecords(summary).some((record) => (
    record?.firstAudioObservation?.outputFileExistedBeforeRun
      || record?.firstAudioObservation?.reusedExistingOutputFile
  )) || summary.firstAudioObservation?.outputFileExistedBeforeRun || summary.firstAudioObservation?.reusedExistingOutputFile;
  if (!contractMessage && staleOutputEvidence) {
    contractMessage = "Resident warm runs must not use an existing output file as first-audio evidence.";
    contractKey = "firstAudioOutputFreshness";
  }

  if (contractMessage) return blockResidentSummary(summary, contractMessage, contractKey);
  const nano5Failure = validateNano5SoakPromotion(summary, requested);
  if (nano5Failure) {
    return blockResidentSummary(summary, nano5Failure.message, nano5Failure.key, nano5Failure.failureClass);
  }
  const promotionFailure = validateOptimizationPromotion(summary);
  if (promotionFailure) {
    return blockResidentSummary(summary, promotionFailure.message, promotionFailure.key, promotionFailure.failureClass);
  }
  return summary;
}

export function buildPythonCommand({
  projectRoot = process.cwd(),
  python,
  configPath,
  runtimeMode,
  runId,
  passageId,
  passageText,
  outputDir,
  repoDir,
  modelDir,
  threads,
  maxNewFrames,
  sampleMode,
  voice,
  promptAudio,
  processMode,
  iterations,
  warmupRuns,
  prewarm,
  profileStages,
  profileEventsJsonl,
  segmentPolicy,
  segmentMaxTokens,
  segmentMaxChars,
  segmentMinChars,
  segmentSource,
  writeSegmentWavs,
  ortProviders,
  ortIntraOpThreads,
  ortInterOpThreads,
  ortExecutionMode,
  ortGraphOptimization,
  ortEnableCpuMemArena,
  ortEnableMemPattern,
  ortEnableMemReuse,
  ortUsePerSessionThreads,
  precomputeInputs,
  variantId,
  optimizationProfile,
  providerVariant,
  tokenizerReuse,
  promptReuse,
  shortPassageOverheadReduction,
  bookLikeWarmRuns,
  residentDecodeMode,
  streamDecodeFrameBudget,
  adjacentSegmentCount,
  adjacentSegmentSource,
  adjacentSegmentRtfTrendMax,
  allowEmptyPassage,
} = {}) {
  const defaults = defaultOptions(projectRoot);
  const command = python ?? process.env.PYTHON ?? repoLocalNanoPython(projectRoot) ?? "python";
  const residentMode = runtimeMode === "resident";
  const pythonProbePath = path.join(projectRoot, residentMode ? PYTHON_RESIDENT_PROBE_RELATIVE_PATH : PYTHON_PROBE_RELATIVE_PATH);
  const effectivePassageId = resolvePassageId(passageId ?? defaults.passageId);
  const args = [
    pythonProbePath,
    "--run-id",
    runId ?? defaults.runId,
    "--passage-id",
    effectivePassageId,
    "--output-dir",
    outputDir,
    "--repo-dir",
    repoDir ?? defaults.repoDir,
    "--model-dir",
    modelDir ?? defaults.modelDir,
    "--threads",
    String(threads ?? defaults.threads),
    "--max-new-frames",
    String(maxNewFrames ?? defaults.maxNewFrames),
    "--sample-mode",
    sampleMode ?? defaults.sampleMode,
    "--voice",
    voice ?? defaults.voice,
    "--process-mode",
    processMode ?? defaults.processMode,
    "--iterations",
    String(iterations ?? defaults.iterations),
    "--warmup-runs",
    String(warmupRuns ?? defaults.warmupRuns),
    "--prewarm",
    prewarm ?? defaults.prewarm,
    "--segment-policy",
    segmentPolicy ?? defaults.segmentPolicy,
    "--segment-source",
    segmentSource ?? defaults.segmentSource,
  ];

  if (configPath) args.push("--config", configPath);
  if (residentMode) args.push("--runtime-mode", "resident");
  const effectivePassageText = resolvePassageText({ passageId: effectivePassageId, passageText });
  if (effectivePassageText) args.push("--passage-text", effectivePassageText);
  if (allowEmptyPassage) args.push("--allow-empty-passage");
  if (promptAudio) args.push("--prompt-audio", promptAudio);
  if (profileStages) args.push("--profile-stages");
  if (profileEventsJsonl) args.push("--profile-events-jsonl", profileEventsJsonl);
  if (segmentMaxTokens != null) args.push("--segment-max-tokens", String(segmentMaxTokens));
  if (segmentMaxChars != null) args.push("--segment-max-chars", String(segmentMaxChars));
  if (segmentMinChars != null) args.push("--segment-min-chars", String(segmentMinChars));
  if (writeSegmentWavs) args.push("--write-segment-wavs");
  if (ortProviders) args.push("--ort-providers", ortProviders);
  if (ortIntraOpThreads != null) args.push("--ort-intra-op-threads", String(ortIntraOpThreads));
  if (ortInterOpThreads != null) args.push("--ort-inter-op-threads", String(ortInterOpThreads));
  if (ortExecutionMode) args.push("--ort-execution-mode", ortExecutionMode);
  if (ortGraphOptimization) args.push("--ort-graph-optimization", ortGraphOptimization);
  if (ortEnableCpuMemArena != null) args.push(ortEnableCpuMemArena ? "--ort-enable-cpu-mem-arena" : "--no-ort-enable-cpu-mem-arena");
  if (ortEnableMemPattern != null) args.push(ortEnableMemPattern ? "--ort-enable-mem-pattern" : "--no-ort-enable-mem-pattern");
  if (ortEnableMemReuse != null) args.push(ortEnableMemReuse ? "--ort-enable-mem-reuse" : "--no-ort-enable-mem-reuse");
  if (ortUsePerSessionThreads != null) args.push(ortUsePerSessionThreads ? "--ort-use-per-session-threads" : "--no-ort-use-per-session-threads");
  if (precomputeInputs) args.push("--precompute-inputs");
  if (variantId) args.push("--variant-id", variantId);
  if (optimizationProfile) args.push("--optimization-profile", optimizationProfile);
  if (providerVariant) args.push("--provider-variant", providerVariant);
  if (tokenizerReuse) args.push("--reuse-tokenizer");
  if (promptReuse) args.push("--reuse-prompt");
  if (shortPassageOverheadReduction) args.push("--short-passage-overhead-reduction");
  if (bookLikeWarmRuns != null) args.push("--book-like-warm-runs", String(bookLikeWarmRuns));
  if (residentDecodeMode) args.push("--resident-decode-mode", residentDecodeMode);
  if (streamDecodeFrameBudget != null) args.push("--stream-decode-frame-budget", String(streamDecodeFrameBudget));
  if (adjacentSegmentCount != null) args.push("--adjacent-segment-count", String(adjacentSegmentCount));
  if (adjacentSegmentSource) args.push("--adjacent-segment-source", adjacentSegmentSource);
  if (adjacentSegmentRtfTrendMax != null) args.push("--adjacent-segment-rtf-trend-max", String(adjacentSegmentRtfTrendMax));

  return { command, args, pythonExecutable: command, pythonProbePath };
}

export function runSpawn(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";

    child.stdout?.setEncoding("utf8");
    child.stderr?.setEncoding("utf8");
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      const error = new Error(`Python exited ${code}`);
      error.code = code;
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
  });
}

export function formatSummaryText(result) {
  const summary = result.summary ?? result;
  const lines = [
    "MOSS Nano Probe",
    "===============",
    `Status: ${summary.status ?? result.status ?? "unknown"}`,
    `Failure class: ${summary.failureClass ?? result.failureClass ?? "none"}`,
    `Run ID: ${summary.runId ?? result.runId ?? "unknown"}`,
    `Passage: ${summary.passageId ?? result.passageId ?? "unknown"}`,
    `Backend: ${summary.backend ?? "unknown"}`,
    `Device: ${summary.device ?? "unknown"}`,
    `Output WAV: ${summary.outputWavPath ?? "none"}`,
    `Total seconds: ${summary.totalSec ?? "unknown"}`,
    `First WAV bytes seconds: ${summary.firstAudioObservedSec ?? summary.firstAudioSec ?? "unknown"}`,
    `Internal first decoded seconds: ${summary.firstAudioObservation?.internalFirstDecodedAudioSec ?? "unsupported"}`,
    `Audio duration seconds: ${summary.audioDurationSec ?? "unknown"}`,
    `RTF: ${summary.rtf ?? "unknown"}`,
    `Peak memory: ${summary.peakMemoryMb ?? "unknown"} MB`,
    `Process mode: ${summary.benchmark?.processMode ?? "unknown"}`,
    `Runtime reuse actual: ${summary.benchmark?.runtimeReuseActual ?? "unknown"}`,
    `Prewarm: ${summary.benchmark?.prewarm ?? "unknown"}`,
    `Iterations: ${summary.aggregate?.iterations ?? summary.iterations?.length ?? "unknown"}`,
  ];
  if (summary.error ?? result.error) lines.push(`Error: ${summary.error ?? result.error}`);
  return `${lines.join("\n")}\n`;
}

export async function writeProbeSummary({ result, outputDir, fsModule = fs } = {}) {
  await fsModule.mkdir(outputDir, { recursive: true });
  const jsonPath = path.join(outputDir, "summary.json");
  const textPath = path.join(outputDir, "summary.txt");
  await fsModule.writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  await fsModule.writeFile(textPath, formatSummaryText(result), "utf8");
  return { summaryJsonPath: jsonPath, summaryPath: textPath };
}

export async function runMossNanoProbe({
  projectRoot = process.cwd(),
  configPath,
  runtimeMode,
  runId,
  passageId,
  passageText,
  outputDir,
  python,
  repoDir,
  modelDir,
  threads,
  maxNewFrames,
  sampleMode,
  voice,
  promptAudio,
  processMode,
  iterations,
  warmupRuns,
  prewarm,
  profileStages,
  profileEventsJsonl,
  segmentPolicy,
  segmentMaxTokens,
  segmentMaxChars,
  segmentMinChars,
  segmentSource,
  writeSegmentWavs,
  ortProviders,
  ortIntraOpThreads,
  ortInterOpThreads,
  ortExecutionMode,
  ortGraphOptimization,
  ortEnableCpuMemArena,
  ortEnableMemPattern,
  ortEnableMemReuse,
  ortUsePerSessionThreads,
  precomputeInputs,
  variantId,
  optimizationProfile,
  providerVariant,
  tokenizerReuse,
  promptReuse,
  shortPassageOverheadReduction,
  bookLikeWarmRuns,
  residentDecodeMode,
  streamDecodeFrameBudget,
  adjacentSegmentCount,
  adjacentSegmentSource,
  adjacentSegmentRtfTrendMax,
  allowEmptyPassage,
  execFile = runSpawn,
  fsModule = fs,
} = {}) {
  const defaults = defaultOptions(projectRoot);
  const effectiveRunId = runId ?? defaults.runId;
  const effectivePassageId = resolvePassageId(passageId ?? defaults.passageId);
  const effectivePassageText = resolvePassageText({ passageId: effectivePassageId, passageText });
  const effectiveOutputDir = resolveRunOutputDir(outputDir ?? defaults.outputRoot, effectiveRunId);
  if (!allowEmptyPassage && !String(effectivePassageText).trim()) {
    const result = {
      ok: false,
      status: "blocked",
      runId: effectiveRunId,
      passageId: effectivePassageId,
      failureClass: "runtime-contract",
      error: "Passage text is empty. Provide --passage-text, use a built-in passage ID, or pass --allow-empty-passage for diagnostics.",
    };
    const paths = await writeProbeSummary({ result, outputDir: effectiveOutputDir, fsModule });
    return { ...result, ...paths };
  }
  const commandInfo = buildPythonCommand({
    projectRoot,
    python,
    configPath,
    runtimeMode,
    runId: effectiveRunId,
    passageId: effectivePassageId,
    passageText: effectivePassageText,
    outputDir: effectiveOutputDir,
    repoDir,
    modelDir,
    threads,
    maxNewFrames,
    sampleMode,
    voice,
    promptAudio,
    processMode,
    iterations,
    warmupRuns,
    prewarm,
    profileStages,
    profileEventsJsonl,
    segmentPolicy,
    segmentMaxTokens,
    segmentMaxChars,
    segmentMinChars,
    segmentSource,
    writeSegmentWavs,
    ortProviders,
    ortIntraOpThreads,
    ortInterOpThreads,
    ortExecutionMode,
    ortGraphOptimization,
    ortEnableCpuMemArena,
    ortEnableMemPattern,
    ortEnableMemReuse,
    ortUsePerSessionThreads,
    precomputeInputs,
    variantId,
    optimizationProfile,
    providerVariant,
    tokenizerReuse,
    promptReuse,
    shortPassageOverheadReduction,
    bookLikeWarmRuns,
    residentDecodeMode,
    streamDecodeFrameBudget,
    adjacentSegmentCount,
    adjacentSegmentSource,
    adjacentSegmentRtfTrendMax,
    allowEmptyPassage,
  });

  let result;
  try {
    const { stdout, stderr } = await execFile(commandInfo.command, commandInfo.args, { cwd: projectRoot });
    const parsed = parsePythonSummary(stdout);
    if (parsed.error) {
      result = {
        ok: false,
        status: "failed",
        runId: effectiveRunId,
        passageId: effectivePassageId,
        failureClass: "runtime-contract",
        error: parsed.error,
        stdoutTail: tail(stdout),
        stderrTail: tail(stderr),
        pythonExecutable: commandInfo.pythonExecutable,
        pythonProbePath: commandInfo.pythonProbePath,
      };
    } else {
      const summary = runtimeMode === "resident"
        ? normalizeResidentSummary(parsed.summary, {
          ortProviders,
          ortIntraOpThreads,
          ortInterOpThreads,
          ortExecutionMode,
          ortGraphOptimization,
          ortEnableCpuMemArena,
          ortEnableMemPattern,
          ortEnableMemReuse,
          ortUsePerSessionThreads,
          precomputeInputs,
          variantId,
          optimizationProfile,
          providerVariant,
          tokenizerReuse,
          promptReuse,
          shortPassageOverheadReduction,
          bookLikeWarmRuns,
          residentDecodeMode,
          streamDecodeFrameBudget,
          adjacentSegmentCount,
          adjacentSegmentSource,
          adjacentSegmentRtfTrendMax,
        })
        : parsed.summary;
      result = {
        status: summary.status ?? "ok",
        runId: summary.runId ?? effectiveRunId,
        passageId: summary.passageId ?? effectivePassageId,
        failureClass: summary.failureClass ?? null,
        summary,
        pythonExecutable: commandInfo.pythonExecutable,
        pythonProbePath: commandInfo.pythonProbePath,
      };
    }
  } catch (error) {
    const parsed = parsePythonSummary(error?.stdout ?? "");
    if (!parsed.error && parsed.summary) {
      const summary = runtimeMode === "resident"
        ? normalizeResidentSummary(parsed.summary, {
          ortProviders,
          ortIntraOpThreads,
          ortInterOpThreads,
          ortExecutionMode,
          ortGraphOptimization,
          ortEnableCpuMemArena,
          ortEnableMemPattern,
          ortEnableMemReuse,
          ortUsePerSessionThreads,
          precomputeInputs,
          variantId,
          optimizationProfile,
          providerVariant,
          tokenizerReuse,
          promptReuse,
          shortPassageOverheadReduction,
          bookLikeWarmRuns,
          residentDecodeMode,
          streamDecodeFrameBudget,
          adjacentSegmentCount,
          adjacentSegmentSource,
          adjacentSegmentRtfTrendMax,
        })
        : parsed.summary;
      result = {
        status: summary.status ?? "failed",
        runId: summary.runId ?? effectiveRunId,
        passageId: summary.passageId ?? effectivePassageId,
        failureClass: summary.failureClass ?? "runtime",
        summary,
        pythonExecutable: commandInfo.pythonExecutable,
        pythonProbePath: commandInfo.pythonProbePath,
      };
    } else {
      result = {
        ok: false,
        status: "failed",
        runId: effectiveRunId,
        passageId: effectivePassageId,
        failureClass: "python-env",
        error: tail(error?.stderr) || (error instanceof Error ? error.message : String(error)),
        stdoutTail: tail(error?.stdout),
        stderrTail: tail(error?.stderr),
        pythonExecutable: commandInfo.pythonExecutable,
        pythonProbePath: commandInfo.pythonProbePath,
      };
    }
  }

  const paths = await writeProbeSummary({ result, outputDir: effectiveOutputDir, fsModule });
  return { ...result, ...paths };
}

function helpText() {
  return [
    "Usage: node scripts/moss_nano_probe.mjs [options]",
    "",
    "Options:",
    "  --json",
    "  --run-id <id>",
    "  --passage | --passage-id <id>",
    "  --passage-text <text>",
    "  --allow-empty-passage",
    "  --out | --output-dir <dir>",
    "  --python <python-exe>",
    "  --repo-dir <dir>",
    "  --model-dir <dir>",
    "  --threads <n>",
    "  --max-new-frames <n>",
    "  --sample-mode <mode>",
    "  --voice <name>",
    "  --prompt-audio <wav>",
    "  --config <json>",
    "  --runtime-mode <subprocess|resident>",
    "  --process-mode <cold|warm>",
    "  --iterations <n>",
    "  --warmup-runs <n>",
    "  --prewarm <none|ort-sessions|synthetic-synth>",
    "  --profile-stages",
    "  --profile-events-jsonl <path>",
    "  --segment-policy <none|first-sentence|natural-break|token-window|char-window>",
    "  --segment-max-tokens <n>",
    "  --segment-max-chars <n>",
    "  --segment-min-chars <n>",
    "  --segment-source <raw|prepared>",
    "  --write-segment-wavs",
    "  --ort-providers <csv>",
    "  --ort-intra-op-threads <n>",
    "  --ort-inter-op-threads <n>",
    "  --ort-execution-mode <sequential|parallel>",
    "  --ort-graph-optimization <disable|basic|extended|all>",
    "  --ort-enable-cpu-mem-arena | --no-ort-enable-cpu-mem-arena",
    "  --ort-enable-mem-pattern | --no-ort-enable-mem-pattern",
    "  --ort-enable-mem-reuse | --no-ort-enable-mem-reuse",
    "  --ort-use-per-session-threads | --no-ort-use-per-session-threads",
    "  --precompute-inputs",
    "  --variant-id <id>",
    "  --optimization-profile <profile>",
    "  --provider-variant <id>",
    "  --reuse-tokenizer",
    "  --reuse-prompt",
    "  --short-passage-overhead-reduction",
    "  --book-like-warm-runs <n>",
    "  --resident-decode-mode <full|stream>",
    "  --stream-decode-frame-budget <n>",
    "  --adjacent-segment-count <n>",
    "  --adjacent-segment-source <raw|book-like>",
    "  --adjacent-segment-rtf-trend-max <n>",
  ].join("\n");
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    process.stdout.write(`${helpText()}\n`);
    return { status: "help" };
  }

  const result = await runMossNanoProbe({
    projectRoot: process.cwd(),
    configPath: args.configPath,
    runtimeMode: args.runtimeMode,
    runId: args.runId,
    passageId: args.passageId,
    passageText: args.passageText,
    allowEmptyPassage: args.allowEmptyPassage,
    outputDir: args.outputDir,
    python: args.python,
    repoDir: args.repoDir,
    modelDir: args.modelDir,
    threads: args.threads,
    maxNewFrames: args.maxNewFrames,
    sampleMode: args.sampleMode,
    voice: args.voice,
    promptAudio: args.promptAudio,
    processMode: args.processMode,
    iterations: args.iterations,
    warmupRuns: args.warmupRuns,
    prewarm: args.prewarm,
    profileStages: args.profileStages,
    profileEventsJsonl: args.profileEventsJsonl,
    segmentPolicy: args.segmentPolicy,
    segmentMaxTokens: args.segmentMaxTokens,
    segmentMaxChars: args.segmentMaxChars,
    segmentMinChars: args.segmentMinChars,
    segmentSource: args.segmentSource,
    writeSegmentWavs: args.writeSegmentWavs,
    ortProviders: args.ortProviders,
    ortIntraOpThreads: args.ortIntraOpThreads,
    ortInterOpThreads: args.ortInterOpThreads,
    ortExecutionMode: args.ortExecutionMode,
    ortGraphOptimization: args.ortGraphOptimization,
    ortEnableCpuMemArena: args.ortEnableCpuMemArena,
    ortEnableMemPattern: args.ortEnableMemPattern,
    ortEnableMemReuse: args.ortEnableMemReuse,
    ortUsePerSessionThreads: args.ortUsePerSessionThreads,
    precomputeInputs: args.precomputeInputs,
    variantId: args.variantId,
    optimizationProfile: args.optimizationProfile,
    providerVariant: args.providerVariant,
    tokenizerReuse: args.tokenizerReuse,
    promptReuse: args.promptReuse,
    shortPassageOverheadReduction: args.shortPassageOverheadReduction,
    bookLikeWarmRuns: args.bookLikeWarmRuns,
    residentDecodeMode: args.residentDecodeMode,
    streamDecodeFrameBudget: args.streamDecodeFrameBudget,
    adjacentSegmentCount: args.adjacentSegmentCount,
    adjacentSegmentSource: args.adjacentSegmentSource,
    adjacentSegmentRtfTrendMax: args.adjacentSegmentRtfTrendMax,
  });

  process.stdout.write(args.json ? `${JSON.stringify(result, null, 2)}\n` : formatSummaryText(result));
  process.exitCode = result.status === "ok" ? 0 : 1;
  return result;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`MOSS Nano probe failed unexpectedly: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
