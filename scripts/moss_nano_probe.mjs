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
const NANO5C_SEGMENT_FIRST_SOAK_TARGET = "nano5c-segment-first-soak";
const NANO5C_SEGMENT_FIRST_SOAK_DECISION = "PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE";
const NANO6_APP_PROTOTYPE_TARGET = "app-prototype";
const NANO6_APP_PROTOTYPE_DECISION = "PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE";
const NANO6_BOUNDED_LIFECYCLE_DECISION = "PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE";
const NANO6_ITERATE_DECISION = "ITERATE_NANO_RESIDENT_RUNTIME";
const NANO6_PAUSE_DECISION = "PAUSE_NANO_RUNTIME_RELIABILITY";
const NANO6_LEGACY_DECISIONS = new Set([
  NANO6_APP_PROTOTYPE_DECISION,
  NANO6_ITERATE_DECISION,
  NANO6_PAUSE_DECISION,
]);
const NANO6_BOUNDED_LIFECYCLE_DECISIONS = new Set([
  NANO6_BOUNDED_LIFECYCLE_DECISION,
  NANO6_ITERATE_DECISION,
  NANO6_PAUSE_DECISION,
]);
const NANO6_DECISIONS = new Set([
  ...NANO6_LEGACY_DECISIONS,
  NANO6_BOUNDED_LIFECYCLE_DECISION,
]);
const NANO6_REQUIRED_SHUTDOWN_CLASSIFICATIONS = Object.freeze([
  "clean-shutdown",
  "forced-kill",
  "zombie-process",
  "restart-clean",
  "restart-failed",
  "inflight-rejected",
]);
const NANO6_DEFAULT_THRESHOLDS = Object.freeze({
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
});
const NANO5C_SEGMENT_FIRST_DEFAULT_THRESHOLDS = Object.freeze({
  segmentFirstInternalFirstDecodedAudioSecMax: 0.5,
  segmentFirstShortRtfMax: 1.5,
  adjacentFairRtfTrendMax: 0.15,
  segmentFirstMinFreshSegments: 5,
  segmentFirstStaleOutputReuseMax: 0,
  segmentFirstSessionRestartMax: 0,
});

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

function promotionTarget(value, flag) {
  const supportedTargets = new Set([NANO5C_SEGMENT_FIRST_SOAK_TARGET, NANO6_APP_PROTOTYPE_TARGET]);
  if (!supportedTargets.has(value)) {
    throw new Error(`${flag} only supports ${Array.from(supportedTargets).join(", ")}`);
  }
  return value;
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
    } else if (arg === "--nano6-soak") {
      args.nano6Soak = true;
      args.promotionTarget = NANO6_APP_PROTOTYPE_TARGET;
    } else if (arg === "--soak-duration-sec") {
      args.soakDurationSec = positiveInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--soak-sample-interval-sec") {
      args.soakSampleIntervalSec = positiveInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--shutdown-restart-evidence" || arg === "--shutdown-evidence" || arg === "--restart-evidence") {
      args.shutdownRestartEvidence = true;
    } else if (arg === "--bounded-lifecycle") {
      args.boundedLifecycle = true;
    } else if (arg === "--recycle-after-segments") {
      args.recycleAfterSegments = positiveInteger(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--recycle-rss-threshold-mb") {
      const value = Number.parseFloat(requireValue(argv, index, arg));
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`${arg} requires a positive number`);
      }
      args.recycleRssThresholdMb = value;
      index += 1;
    } else if (arg === "--measure-restart-cost") {
      args.measureRestartCost = true;
    } else if (arg === "--warm-spare") {
      args.warmSpare = true;
    } else if (arg === "--promotion-target") {
      args.promotionTarget = promotionTarget(requireValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--nano5c-segment-first-soak") {
      args.promotionTarget = NANO5C_SEGMENT_FIRST_SOAK_TARGET;
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

function hasNano6PromotionDecisionShape(summary) {
  const decision = String(summary.promotionDecision?.decision ?? "");
  const target = summary.promotionTarget ?? summary.promotionDecision?.target ?? null;
  return target === NANO6_APP_PROTOTYPE_TARGET
    || summary.nano6Readiness?.gate === NANO6_APP_PROTOTYPE_TARGET
    || NANO6_DECISIONS.has(decision);
}

function hasBoundedLifecycleMode(summary, requested = {}) {
  return requested.boundedLifecycle === true
    || summary?.boundedLifecycle != null
    || summary?.promotionDecision?.decision === NANO6_BOUNDED_LIFECYCLE_DECISION;
}

function isNano6PromotionAttempt(summary, requested = {}) {
  return hasNano6PromotionDecisionShape(summary)
    && (
      summary?.promotionDecision?.promote === true
      || summary?.promotionDecision?.decision === nano6PromotionDecisionName(summary, requested)
    );
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
    const decision = String(summary.promotionDecision.decision ?? "");
    const nano6PromotionDecisionShape = hasNano6PromotionDecisionShape(summary);
    if (nano6PromotionDecisionShape && !NANO6_DECISIONS.has(decision)) {
      summary.promotionDecision.decision = NANO6_ITERATE_DECISION;
    } else if (decision.startsWith("PROMOTE_NANO_TO_")) {
      summary.promotionDecision.decision = nano6PromotionDecisionShape || failureClass === "performance"
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
    "precomputeRequiredForProductPath",
    "precomputeInputsEvidence",
    "tokenizerIdentity",
    "promptAudioCodesEvidence",
    "decodeFullEvidence",
    "acceptedDecodeStrategy",
    "segmentFirstProductPathEvidence",
    "adjacentSegmentStats",
    "segments",
    "crossSegmentStateActual",
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
    || summary.promotionTarget === "nano5c-segment-first-soak"
    || summary.promotionDecision?.target === "nano5c-segment-first-soak"
    || decision === "PROMOTE_NANO_TO_SOAK_CANDIDATE"
    || decision === "PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE"
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
  const adjacentStats = objectOrEmpty(summary.adjacentSegmentStats);
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
  if (!isFiniteNumber(metrics.adjacentRtfTrendRatio) && isFiniteNumber(adjacentStats.rtfTrendRatio)) {
    metrics.adjacentRtfTrendRatio = adjacentStats.rtfTrendRatio;
  }
  if (!isFiniteNumber(metrics.adjacentFairRtfTrendRatio) && isFiniteNumber(adjacentStats.fairRtfTrendRatio)) {
    metrics.adjacentFairRtfTrendRatio = adjacentStats.fairRtfTrendRatio;
  }
  if (summary.crossSegmentStateActual == null && Object.prototype.hasOwnProperty.call(adjacentStats, "crossSegmentStateActual")) {
    summary.crossSegmentStateActual = adjacentStats.crossSegmentStateActual;
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
  const rethreshold = objectOrEmpty(evidence.rethreshold);
  const hasRethresholdEvidence = Object.keys(rethreshold).length > 0;
  let effectiveFirstAudioSecMax = firstAudioSecMax;
  let effectiveMemoryGrowthMbMax = memoryGrowthMbMax;
  let rethresholdFailure = null;
  if (isFiniteNumber(firstAudioSec) && firstAudioSec > firstAudioSecMax && hasRethresholdEvidence) {
    const rethresholdFirstAudioSecMax = firstFiniteNumber(rethreshold.firstAudioSecMax, firstAudioSecMax);
    const rethresholdMemoryGrowthMbMax = firstFiniteNumber(
      rethreshold.memoryGrowthMbMax,
      memoryGrowthMbMax,
    );
    const repeatedRuns = Number(rethreshold.repeatedRuns);
    const evidenceRunIds = Array.isArray(rethreshold.evidenceRunIds) ? rethreshold.evidenceRunIds.filter(Boolean) : [];
    const p95FirstAudioSec = rethreshold.p95FirstAudioSec;
    const p95UnderThreshold = rethreshold.p95UnderThreshold === true
      || (isFiniteNumber(p95FirstAudioSec) && isFiniteNumber(rethresholdFirstAudioSecMax) && p95FirstAudioSec <= rethresholdFirstAudioSecMax);
    const maxMemoryGrowthMb = firstFiniteNumber(rethreshold.maxMemoryGrowthMb, rethreshold.memoryGrowthMb);
    if (rethreshold.explicit !== true) {
      rethresholdFailure = "decode-full re-threshold evidence must be explicit";
    } else if (rethreshold.stale === true) {
      rethresholdFailure = "decode-full re-threshold evidence is stale";
    } else if (!Number.isFinite(repeatedRuns) || repeatedRuns < 3 || evidenceRunIds.length < 2 || !isFiniteNumber(p95FirstAudioSec) || p95UnderThreshold !== true) {
      rethresholdFailure = "decode-full re-threshold evidence requires p95 from repeated fresh runs";
    } else if (!isFiniteNumber(rethresholdFirstAudioSecMax) || firstAudioSec > rethresholdFirstAudioSecMax || p95FirstAudioSec > rethresholdFirstAudioSecMax) {
      rethresholdFailure = `decode-full re-threshold p95 ${p95FirstAudioSec}s exceeds ${rethresholdFirstAudioSecMax}s`;
    } else if (!isFiniteNumber(maxMemoryGrowthMb) || maxMemoryGrowthMb > rethresholdMemoryGrowthMbMax || (isFiniteNumber(memoryGrowthMb) && memoryGrowthMb > rethresholdMemoryGrowthMbMax)) {
      rethresholdFailure = `decode-full re-threshold memory growth exceeds ${rethresholdMemoryGrowthMbMax}MB`;
    } else {
      effectiveFirstAudioSecMax = rethresholdFirstAudioSecMax;
      effectiveMemoryGrowthMbMax = rethresholdMemoryGrowthMbMax;
    }
  }
  if (rethresholdFailure) {
    failures.push(rethresholdFailure);
  }
  if (!isFiniteNumber(firstAudioSec)) {
    failures.push("decode-full first audio is missing");
  } else if (firstAudioSec > effectiveFirstAudioSecMax && !rethresholdFailure) {
    failures.push(`decode-full first audio ${firstAudioSec}s exceeds ${effectiveFirstAudioSecMax}s`);
  }
  if (!isFiniteNumber(memoryGrowthMb)) {
    failures.push("decode-full memory growth is missing");
  } else if (memoryGrowthMb > effectiveMemoryGrowthMbMax && !rethresholdFailure) {
    failures.push(`decode-full memory growth ${memoryGrowthMb}MB exceeds ${effectiveMemoryGrowthMbMax}MB`);
  }
  summary.decodeFullEvidence = {
    ...evidence,
    status: failures.length > 0 ? "failed" : "passed",
    firstAudioSec,
    memoryGrowthMb,
    gates: {
      ...objectOrEmpty(evidence.gates),
      firstAudioSecMax: effectiveFirstAudioSecMax,
      memoryGrowthMbMax: effectiveMemoryGrowthMbMax,
      originalFirstAudioSecMax: firstAudioSecMax,
      originalMemoryGrowthMbMax: memoryGrowthMbMax,
      firstAudioPassed: isFiniteNumber(firstAudioSec) && firstAudioSec <= effectiveFirstAudioSecMax,
      memoryGrowthPassed: isFiniteNumber(memoryGrowthMb) && memoryGrowthMb <= effectiveMemoryGrowthMbMax,
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
  if (!("decodeFullFirstAudioSecMax" in thresholds)) {
    return "decode first audio threshold missing: decodeFullFirstAudioSecMax";
  }
  if (!isFiniteNumber(thresholds.decodeFullFirstAudioSecMax)) {
    return "decode first audio threshold decodeFullFirstAudioSecMax must be numeric";
  }
  const gates = [
    ["shortRtfMax", "shortRtf", "short"],
    ["shortP95RtfMax", "shortP95Rtf", "short"],
    ["shortFirstDecodedAudioSecMax", "shortFirstDecodedAudioSec", "short"],
    ["shortMemoryGrowthMbMax", "shortMemoryGrowthMb", "short memory"],
    ["punctuationRtfMax", "punctuationRtf", "punctuation"],
    ["punctuationP95RtfMax", "punctuationP95Rtf", "punctuation"],
    ["punctuationFirstDecodedAudioSecMax", "punctuationFirstDecodedAudioSec", "punctuation"],
    ["decodeFullMemoryGrowthMbMax", "decodeFullMemoryGrowthMb", "decode memory"],
    ["adjacentRtfTrendMax", "adjacentFairRtfTrendRatio", "adjacent fair"],
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

function precomputePromotionFailure(summary) {
  const evidence = objectOrEmpty(summary.precomputeInputsEvidence);
  const status = String(evidence.status ?? "").toLowerCase();
  const evidenceActual = summary.precomputeInputsActual === true
    && (status === "actual" || evidence.actual === true);
  if (!evidenceActual) {
    if (summary.precomputeInputsBlocker || status === "blocked") {
      return "blocker-only precompute evidence must not promote.";
    }
    return "precompute actual evidence is required for MOSS-NANO-5 soak promotion.";
  }
  if (evidence.consumedByMeasuredRun !== true) {
    return "precompute row evidence must be consumed by the measured run.";
  }
  if (!isFiniteNumber(evidence.requestRowCount) || evidence.requestRowCount <= 0) {
    return "precompute request row count must be positive.";
  }
  return null;
}

function normalizeNano5cPrecomputeEvidence(summary, requested = {}) {
  const requestedPrecompute = summary.precomputeInputsRequested === true || requested.precomputeInputs === true;
  const actualPrecompute = summary.precomputeInputsActual === true;
  const evidence = objectOrEmpty(summary.precomputeInputsEvidence);
  const requiredForProductPath = summary.precomputeRequiredForProductPath ?? evidence.requiredForProductPath;
  if (!actualPrecompute && requestedPrecompute !== true && requiredForProductPath === false) {
    summary.precomputeInputsEvidence = {
      status: "not-required",
      requested: false,
      actual: false,
      classification: "non-product-required",
      requiredForProductPath: false,
      ...evidence,
    };
    if (summary.precomputeInputsRequested == null) summary.precomputeInputsRequested = false;
    if (summary.precomputeInputsActual == null) summary.precomputeInputsActual = false;
    return;
  }
  if (Object.keys(evidence).length > 0) {
    summary.precomputeInputsEvidence = {
      ...evidence,
      requested: requestedPrecompute,
      actual: actualPrecompute || evidence.actual === true,
      requiredForProductPath,
    };
  }
}

function nano5cPrecomputeFailure(summary, requested = {}) {
  normalizeNano5cPrecomputeEvidence(summary, requested);
  const evidence = objectOrEmpty(summary.precomputeInputsEvidence);
  if (summary.precomputeInputsActual === true || evidence.actual === true || String(evidence.status ?? "").toLowerCase() === "actual") {
    return precomputePromotionFailure(summary);
  }
  const requestedPrecompute = summary.precomputeInputsRequested === true || requested.precomputeInputs === true || evidence.requested === true;
  const notRequired = evidence.classification === "non-product-required"
    && evidence.requiredForProductPath === false
    && ["not-required", "non-product-required"].includes(String(evidence.status ?? "").toLowerCase());
  if (notRequired && requestedPrecompute !== true) return null;
  return "segment-first precompute requested actual=false requires explicit non-product-required product-path classification.";
}

function isDiagnosticOnlyDecodeFull(evidence) {
  const classification = String(evidence.classification ?? "").toLowerCase();
  return evidence.diagnosticOnly === true
    && evidence.productPath === false
    && evidence.requiredForProductPath === false
    && classification.includes("diagnostic-only")
    && classification.includes("non-product-path");
}

function validateNano5cDecodeFullGate(summary) {
  if (!summary.decodeFullEvidence || Object.keys(objectOrEmpty(summary.decodeFullEvidence)).length === 0) {
    return "decode-full diagnostic-only non-product-path evidence is required for MOSS-NANO-5C segment-first soak promotion";
  }
  normalizeDecodeFullEvidence(summary);
  const evidence = objectOrEmpty(summary.decodeFullEvidence);
  if (isDiagnosticOnlyDecodeFull(evidence)) return null;
  return "decode-full evidence for segment-first soak must be diagnostic-only non-product-path.";
}

function validateSegmentFirstProductPath(summary) {
  const accepted = objectOrEmpty(summary.acceptedDecodeStrategy);
  const evidence = objectOrEmpty(summary.segmentFirstProductPathEvidence);
  const strategy = String(accepted.strategy ?? "").toLowerCase();
  if (
    strategy !== "segment-first"
    || accepted.accepted !== true
    || accepted.productPath !== true
    || accepted.segmentFirst !== true
    || !summary.segmentFirstProductPathEvidence
    || evidence.productPath !== true
    || !["passed", "ok"].includes(String(evidence.status ?? "").toLowerCase())
  ) {
    return "segment-first product-path evidence is required for MOSS-NANO-5C soak promotion.";
  }
  if (summary.runtimeMode !== "resident" || summary.processMode !== "warm") {
    return "segment-first product-path evidence requires resident warm runtime.";
  }
  const reuseActual = summary.benchmark?.runtimeReuseActual === true
    || residentRunRecords(summary).some((record) => record?.runtimeReuseActual === true);
  if (!reuseActual) {
    return "segment-first product-path evidence requires resident runtime reuse.";
  }
  const firstAudioObservation = objectOrEmpty(summary.firstAudioObservation);
  const hasInternalFirstAudio = firstAudioObservation.kind === "internal-first-decoded-audio"
    || residentRunRecords(summary).some((record) => record?.firstAudioObservation?.kind === "internal-first-decoded-audio");
  if (!hasInternalFirstAudio) {
    return "segment-first product-path evidence requires internal first decoded audio.";
  }
  if (Number(evidence.staleOutputReuseCount ?? 0) > 0 || Number(evidence.sessionRestartCount ?? 0) > 0) {
    return "segment-first product-path evidence must have no stale reuse or session restart.";
  }
  if (Number(evidence.internalFirstAudioFreshSegments ?? 0) < 5) {
    return "segment-first product-path evidence requires fresh internal first decoded audio for adjacent segments.";
  }
  if (evidence.stableAdjacentTrend !== true) {
    return "segment-first product-path evidence requires stable adjacent segment trend.";
  }
  const adjacentFailure = validateAdjacentSegments(summary, { required: true });
  if (adjacentFailure) return `segment-first product-path evidence blocked: ${adjacentFailure}`;
  return null;
}

function hasNano5cSegmentFirstSoakShape(summary) {
  const decision = String(summary.promotionDecision?.decision ?? "");
  const target = summary.promotionTarget ?? summary.promotionDecision?.target ?? null;
  return target === NANO5C_SEGMENT_FIRST_SOAK_TARGET
    || decision === NANO5C_SEGMENT_FIRST_SOAK_DECISION;
}

function countInternalFreshSegments(summary) {
  const segments = Array.isArray(summary.segments) ? summary.segments : [];
  return segments.filter((segment) => (
    segment?.firstAudioObservation?.kind === "internal-first-decoded-audio"
      && segment?.firstAudioObservation?.internalFirstDecodedAudioMs != null
      && !segment?.staleOutputReuse
      && !segment?.firstAudioObservation?.outputFileExistedBeforeRun
      && !segment?.firstAudioObservation?.reusedExistingOutputFile
  )).length;
}

function countStaleOutputReuseSegments(summary) {
  if (!Array.isArray(summary.segments)) return null;
  return summary.segments.filter((segment) => (
    segment?.staleOutputReuse
      || segment?.firstAudioObservation?.outputFileExistedBeforeRun
      || segment?.firstAudioObservation?.reusedExistingOutputFile
  )).length;
}

function countSessionRestartSegments(summary) {
  if (!Array.isArray(summary.segments)) return null;
  return summary.segments.filter((segment) => segment?.sessionRestarted).length;
}

function maxFiniteNumber(values) {
  const numbers = values.filter(isFiniteNumber);
  return numbers.length > 0 ? Math.max(...numbers) : null;
}

function minFiniteNumber(values) {
  const numbers = values.filter(isFiniteNumber);
  return numbers.length > 0 ? Math.min(...numbers) : null;
}

function internalFirstDecodedAudioSecFromObservation(observation = {}) {
  if (isFiniteNumber(observation.internalFirstDecodedAudioSec)) return observation.internalFirstDecodedAudioSec;
  if (isFiniteNumber(observation.internalFirstDecodedAudioMs)) return observation.internalFirstDecodedAudioMs / 1000;
  return null;
}

function deriveNano5cSegmentFirstMetrics(summary) {
  const metrics = objectOrEmpty(summary.promotionMetrics);
  const stats = objectOrEmpty(summary.adjacentSegmentStats);
  const evidence = objectOrEmpty(summary.segmentFirstProductPathEvidence);
  const segments = Array.isArray(summary.segments) ? summary.segments : [];
  const records = residentRunRecords(summary);
  const firstDecodedSec = maxFiniteNumber([
    internalFirstDecodedAudioSecFromObservation(summary.firstAudioObservation),
    ...records.map((record) => internalFirstDecodedAudioSecFromObservation(record?.firstAudioObservation)),
    ...segments.map((segment) => internalFirstDecodedAudioSecFromObservation(segment?.firstAudioObservation)),
  ]);
  const segmentRtf = maxFiniteNumber([
    summary.rtf,
    ...records.map((record) => record?.rtf),
    ...segments.map((segment) => segment?.rtf),
  ]);
  return {
    segmentFirstInternalFirstDecodedAudioSec: firstFiniteNumber(
      firstDecodedSec,
      metrics.shortFirstDecodedAudioSec,
      metrics.firstDecodedAudioSec,
      metrics.segmentFirstInternalFirstDecodedAudioSec,
    ),
    segmentFirstShortRtf: firstFiniteNumber(
      segmentRtf,
      metrics.shortRtf,
      metrics.segmentFirstShortRtf,
    ),
    adjacentFairRtfTrendRatio: firstFiniteNumber(
      stats.fairRtfTrendRatio,
      stats.stableTrendGate?.ratio,
      metrics.adjacentRtfTrendRatio,
      metrics.adjacentFairRtfTrendRatio,
    ),
    segmentFirstInternalFirstAudioFreshSegments: firstFiniteNumber(
      evidence.internalFirstAudioFreshSegments,
      countInternalFreshSegments(summary),
      stats.freshSegments,
      metrics.adjacentFreshSegments,
      metrics.segmentFirstInternalFirstAudioFreshSegments,
    ),
    segmentFirstStaleOutputReuseCount: firstFiniteNumber(
      evidence.staleOutputReuseCount,
      countStaleOutputReuseSegments(summary),
      stats.staleOutputReuseCount,
      metrics.adjacentStaleOutputReuseCount,
      metrics.segmentFirstStaleOutputReuseCount,
    ),
    segmentFirstSessionRestartCount: firstFiniteNumber(
      evidence.sessionRestartCount,
      countSessionRestartSegments(summary),
      stats.sessionRestartCount,
      metrics.adjacentSessionRestartCount,
      metrics.segmentFirstSessionRestartCount,
    ),
  };
}

function normalizeNano5cSegmentFirstPromotionGates(summary) {
  summary.promotionThresholds = {
    ...NANO5C_SEGMENT_FIRST_DEFAULT_THRESHOLDS,
    ...objectOrEmpty(summary.promotionThresholds),
  };
  summary.promotionMetrics = {
    ...objectOrEmpty(summary.promotionMetrics),
    ...deriveNano5cSegmentFirstMetrics(summary),
  };
}

function maxGateMetric(existing, derived) {
  return maxFiniteNumber([existing, derived]) ?? firstFiniteNumber(existing, derived);
}

function minGateMetric(existing, derived) {
  return minFiniteNumber([existing, derived]) ?? firstFiniteNumber(existing, derived);
}

function nano5cFailClosedSegmentFirstMetrics(summary) {
  const metrics = objectOrEmpty(summary.promotionMetrics);
  const derived = deriveNano5cSegmentFirstMetrics(summary);
  return {
    ...metrics,
    segmentFirstInternalFirstDecodedAudioSec: maxGateMetric(
      metrics.segmentFirstInternalFirstDecodedAudioSec,
      derived.segmentFirstInternalFirstDecodedAudioSec,
    ),
    segmentFirstShortRtf: maxGateMetric(
      metrics.segmentFirstShortRtf,
      derived.segmentFirstShortRtf,
    ),
    adjacentFairRtfTrendRatio: maxGateMetric(
      metrics.adjacentFairRtfTrendRatio,
      derived.adjacentFairRtfTrendRatio,
    ),
    segmentFirstInternalFirstAudioFreshSegments: minGateMetric(
      metrics.segmentFirstInternalFirstAudioFreshSegments,
      derived.segmentFirstInternalFirstAudioFreshSegments,
    ),
    segmentFirstStaleOutputReuseCount: maxGateMetric(
      metrics.segmentFirstStaleOutputReuseCount,
      derived.segmentFirstStaleOutputReuseCount,
    ),
    segmentFirstSessionRestartCount: maxGateMetric(
      metrics.segmentFirstSessionRestartCount,
      derived.segmentFirstSessionRestartCount,
    ),
  };
}

function stableAdjacentTrend(summary, stats) {
  if (stats.stableTrendGate?.stable === true) return true;
  const fairTrend = firstFiniteNumber(stats.fairRtfTrendRatio, stats.stableTrendGate?.ratio);
  const fairTrendMax = firstFiniteNumber(
    stats.fairRtfTrendMax,
    stats.stableTrendGate?.max,
    stats.rtfTrendMax,
    summary.promotionThresholds?.adjacentRtfTrendMax,
    0.15,
  );
  return isFiniteNumber(fairTrend) && isFiniteNumber(fairTrendMax) && fairTrend <= fairTrendMax;
}

function applyNano5cSegmentFirstClassification(summary, requested = {}) {
  if (requested.promotionTarget !== NANO5C_SEGMENT_FIRST_SOAK_TARGET) return;

  summary.promotionTarget = NANO5C_SEGMENT_FIRST_SOAK_TARGET;
  summary.promotionDecision = {
    ...objectOrEmpty(summary.promotionDecision),
    promote: true,
    target: NANO5C_SEGMENT_FIRST_SOAK_TARGET,
    decision: NANO5C_SEGMENT_FIRST_SOAK_DECISION,
  };

  summary.precomputeRequiredForProductPath = false;
  if (summary.precomputeInputsActual !== true) {
    const precomputeEvidence = objectOrEmpty(summary.precomputeInputsEvidence);
    summary.precomputeInputsRequested = false;
    summary.precomputeInputsActual = false;
    summary.precomputeInputsEvidence = {
      ...precomputeEvidence,
      status: "not-required",
      requested: false,
      actual: false,
      classification: "non-product-required",
      requiredForProductPath: false,
      productPath: false,
      blocker: summary.precomputeInputsBlocker ?? precomputeEvidence.blocker ?? null,
    };
  }

  const decodeEvidence = objectOrEmpty(summary.decodeFullEvidence);
  summary.decodeFullEvidence = {
    ...decodeEvidence,
    status: decodeEvidence.status ?? "not-run",
    diagnosticOnly: true,
    productPath: false,
    requiredForProductPath: false,
    classification: "diagnostic-only-non-product-path",
    source: decodeEvidence.source ?? "nano5c-segment-first-classification",
    reason: decodeEvidence.reason ?? (
      Object.keys(decodeEvidence).length > 0
        ? null
        : "decode-full is diagnostic only and not required for the segment-first product path."
    ),
  };

  const stats = objectOrEmpty(summary.adjacentSegmentStats);
  const metrics = objectOrEmpty(summary.promotionMetrics);
  const evidence = objectOrEmpty(summary.segmentFirstProductPathEvidence);
  const internalFreshSegments = firstFiniteNumber(
    evidence.internalFirstAudioFreshSegments,
    countInternalFreshSegments(summary),
    stats.freshSegments,
    metrics.adjacentFreshSegments,
  ) ?? 0;
  const staleOutputReuseCount = firstFiniteNumber(
    evidence.staleOutputReuseCount,
    stats.staleOutputReuseCount,
    metrics.adjacentStaleOutputReuseCount,
  ) ?? 0;
  const sessionRestartCount = firstFiniteNumber(
    evidence.sessionRestartCount,
    stats.sessionRestartCount,
    metrics.adjacentSessionRestartCount,
  ) ?? 0;
  const trendStable = evidence.stableAdjacentTrend ?? stableAdjacentTrend(summary, stats);
  const productEvidencePassed = internalFreshSegments >= 5
    && staleOutputReuseCount === 0
    && sessionRestartCount === 0
    && trendStable === true;
  summary.acceptedDecodeStrategy = {
    ...objectOrEmpty(summary.acceptedDecodeStrategy),
    strategy: "segment-first",
    accepted: true,
    productPath: true,
    segmentFirst: true,
    diagnosticReplacementForDecodeFull: false,
  };
  summary.segmentFirstProductPathEvidence = {
    ...evidence,
    status: evidence.status ?? (productEvidencePassed ? "passed" : "blocked"),
    productPath: true,
    internalFirstAudioFreshSegments: internalFreshSegments,
    staleOutputReuseCount,
    sessionRestartCount,
    stableAdjacentTrend: trendStable,
  };
  normalizeNano5cSegmentFirstPromotionGates(summary);
}

function requiredZeroCountGate(thresholds, metrics, thresholdKey, metricKey, label) {
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
    return thresholds[thresholdKey] === 0
      ? `${label} count must be zero`
      : `${label} metric ${metricKey}=${metrics[metricKey]} exceeds threshold ${thresholdKey}=${thresholds[thresholdKey]}`;
  }
  return null;
}

function nano5cSegmentFirstThresholdFailure(summary) {
  if (!summary.promotionThresholds || typeof summary.promotionThresholds !== "object" || Array.isArray(summary.promotionThresholds)) {
    return "MOSS-NANO-5C segment-first promotion thresholds missing";
  }
  if (!summary.promotionMetrics || typeof summary.promotionMetrics !== "object" || Array.isArray(summary.promotionMetrics)) {
    return "MOSS-NANO-5C segment-first promotion metrics missing";
  }
  const thresholds = summary.promotionThresholds;
  const metrics = nano5cFailClosedSegmentFirstMetrics(summary);
  const gates = [
    ["segmentFirstInternalFirstDecodedAudioSecMax", "segmentFirstInternalFirstDecodedAudioSec", "segment-first internal first decoded audio"],
    ["segmentFirstShortRtfMax", "segmentFirstShortRtf", "segment-first short RTF"],
    ["adjacentFairRtfTrendMax", "adjacentFairRtfTrendRatio", "adjacent fair RTF trend"],
  ];
  for (const [thresholdKey, metricKey, label] of gates) {
    const failure = requiredNumericGate(thresholds, metrics, thresholdKey, metricKey, label);
    if (failure) return failure;
  }
  if (!("segmentFirstMinFreshSegments" in thresholds)) {
    return "segment-first fresh threshold missing: segmentFirstMinFreshSegments";
  }
  if (!isFiniteNumber(thresholds.segmentFirstMinFreshSegments)) {
    return "segment-first fresh threshold segmentFirstMinFreshSegments must be numeric";
  }
  if (!("segmentFirstInternalFirstAudioFreshSegments" in metrics)) {
    return "segment-first fresh metric missing: segmentFirstInternalFirstAudioFreshSegments";
  }
  if (!isFiniteNumber(metrics.segmentFirstInternalFirstAudioFreshSegments)) {
    return "segment-first fresh metric segmentFirstInternalFirstAudioFreshSegments must be numeric";
  }
  if (metrics.segmentFirstInternalFirstAudioFreshSegments < thresholds.segmentFirstMinFreshSegments) {
    return `segment-first fresh metric segmentFirstInternalFirstAudioFreshSegments=${metrics.segmentFirstInternalFirstAudioFreshSegments} is below required ${thresholds.segmentFirstMinFreshSegments}`;
  }
  for (const [thresholdKey, metricKey, label] of [
    ["segmentFirstStaleOutputReuseMax", "segmentFirstStaleOutputReuseCount", "segment-first stale output reuse"],
    ["segmentFirstSessionRestartMax", "segmentFirstSessionRestartCount", "segment-first session restart"],
  ]) {
    const failure = requiredZeroCountGate(thresholds, metrics, thresholdKey, metricKey, label);
    if (failure) return failure;
  }
  if ("segmentFirstMemoryGrowthMbMax" in thresholds || "segmentFirstMemoryGrowthMb" in metrics) {
    const failure = requiredNumericGate(
      thresholds,
      metrics,
      "segmentFirstMemoryGrowthMbMax",
      "segmentFirstMemoryGrowthMb",
      "segment-first memory",
    );
    if (failure) return failure;
  }
  return null;
}

function adjacentFairTrendFailure(summary, stats) {
  const fairMethod = stats.rtfTrendMethod ?? stats.stableTrendGate?.method;
  const fairTrend = firstFiniteNumber(stats.fairRtfTrendRatio, stats.stableTrendGate?.ratio);
  const fairTrendMax = firstFiniteNumber(
    stats.fairRtfTrendMax,
    stats.stableTrendGate?.max,
    stats.rtfTrendMax,
    summary.promotionThresholds?.adjacentRtfTrendMax,
    0.15,
  );
  const diagnosticTrend = Number(stats.rtfTrendRatio);
  const diagnosticTrendMax = Number(stats.rtfTrendMax ?? summary.promotionThresholds?.adjacentRtfTrendMax ?? 0.15);
  if (!fairMethod || !isFiniteNumber(fairTrend)) {
    const diagnosticSuffix = Number.isFinite(diagnosticTrend) && Number.isFinite(diagnosticTrendMax) && diagnosticTrend > diagnosticTrendMax
      ? "; diagnostic adjacent RTF trend exceeds 15%"
      : "";
    return `adjacent fair RTF trend method and metric are required${diagnosticSuffix}`;
  }
  if (!isFiniteNumber(fairTrendMax) || fairTrend > fairTrendMax || stats.stableTrendGate?.stable === false) {
    return "adjacent fair RTF trend exceeds 15%";
  }
  return null;
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
  const fairTrendFailure = adjacentFairTrendFailure(summary, stats);
  if (fairTrendFailure) {
    return fairTrendFailure;
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

function percentile(values, percentileValue) {
  const numeric = values.filter(isFiniteNumber).sort((a, b) => a - b);
  if (numeric.length === 0) return null;
  const index = Math.ceil((percentileValue / 100) * numeric.length) - 1;
  return numeric[Math.min(numeric.length - 1, Math.max(0, index))];
}

function hasNano6ReadinessShape(summary, requested = {}) {
  if (requested.nano6Soak === true) return true;
  if (requested.boundedLifecycle === true) return true;
  if (requested.promotionTarget === NANO6_APP_PROTOTYPE_TARGET) return true;
  const target = summary?.promotionTarget ?? summary?.promotionDecision?.target ?? null;
  const decision = summary?.promotionDecision?.decision ?? null;
  const readinessEvidence = Boolean(
    summary?.residentSoak
      || summary?.bookLikeAdjacentRun
      || summary?.shutdownEvidence
      || summary?.lifecycleEvidence,
  );
  if (readinessEvidence && (target === NANO6_APP_PROTOTYPE_TARGET || NANO6_DECISIONS.has(decision))) return true;
  return Boolean(
    summary?.nano6Readiness?.gate === NANO6_APP_PROTOTYPE_TARGET
      || summary?.nano6Readiness?.target === NANO6_APP_PROTOTYPE_TARGET,
  );
}

function normalizeNano6ReadinessEvidence(summary, requested = {}) {
  const artifactThresholds = objectOrEmpty(summary.promotionThresholds);
  if (Object.keys(artifactThresholds).length > 0) {
    summary.artifactPromotionThresholds = artifactThresholds;
  }
  const thresholds = { ...NANO6_DEFAULT_THRESHOLDS };
  summary.promotionThresholds = thresholds;
  summary.promotionMetrics = objectOrEmpty(summary.promotionMetrics);
  summary.nano6Readiness = {
    status: "evaluating",
    gate: NANO6_APP_PROTOTYPE_TARGET,
    hardThresholds: thresholds,
    artifactThresholds: Object.keys(artifactThresholds).length > 0 ? artifactThresholds : null,
  };

  if (summary.promotionTarget == null && requested.promotionTarget === NANO6_APP_PROTOTYPE_TARGET) {
    summary.promotionTarget = NANO6_APP_PROTOTYPE_TARGET;
  }
  if (summary.promotionTarget == null && hasBoundedLifecycleMode(summary, requested)) {
    summary.promotionTarget = NANO6_APP_PROTOTYPE_TARGET;
  }
  if (summary.boundedLifecycle && typeof summary.boundedLifecycle === "object" && !Array.isArray(summary.boundedLifecycle)) {
    if (requested.recycleAfterSegments != null && summary.boundedLifecycle.recycleAfterSegments == null) {
      summary.boundedLifecycle.recycleAfterSegments = requested.recycleAfterSegments;
    }
    if (requested.recycleRssThresholdMb != null && summary.boundedLifecycle.recycleRssThresholdMb == null) {
      summary.boundedLifecycle.recycleRssThresholdMb = requested.recycleRssThresholdMb;
    }
    if (requested.measureRestartCost != null && summary.boundedLifecycle.measureRestartCost == null) {
      summary.boundedLifecycle.measureRestartCost = Boolean(requested.measureRestartCost);
    }
    if (requested.warmSpare != null && summary.boundedLifecycle.warmSpare == null) {
      summary.boundedLifecycle.warmSpare = {
        actual: false,
        requested: Boolean(requested.warmSpare),
        unsupported: true,
      };
    }
  }

  if (summary.bookLikeAdjacentRun == null && Array.isArray(summary.segments) && summary.segments.length > 0) {
    const segments = summary.segments;
    const internalFirstDecoded = segments.map((segment) => segment?.firstAudioObservation?.internalFirstDecodedAudioMs ?? segment?.internalFirstDecodedAudioMs);
    const rtfs = segments.map((segment) => segment?.rtf);
    const punctuationRtfs = segments.map((segment) => segment?.punctuationRtf ?? segment?.rtf);
    summary.bookLikeAdjacentRun = {
      requestedSegments: requested.adjacentSegmentCount ?? segments.length,
      completedSegments: segments.length,
      freshSegments: segments.filter((segment) => segment?.fresh !== false && !segment?.empty && !segment?.staleOutputReuse).length,
      emptySegments: segments.filter((segment) => segment?.empty || !String(segment?.text ?? "").trim()).length,
      staleOutputReuseCount: segments.filter((segment) => (
        segment?.staleOutputReuse
          || segment?.firstAudioObservation?.outputFileExistedBeforeRun
          || segment?.firstAudioObservation?.reusedExistingOutputFile
      )).length,
      sessionRestartCount: segments.filter((segment) => segment?.sessionRestarted).length,
      p95InternalFirstDecodedAudioMs: percentile(internalFirstDecoded, 95),
      p95FinalRtf: percentile(rtfs, 95),
      p95PunctuationRtf: percentile(punctuationRtfs, 95),
    };
  }

  const soak = objectOrEmpty(summary.residentSoak);
  const adjacent = objectOrEmpty(summary.bookLikeAdjacentRun);
  if (summary.residentSoak && typeof summary.residentSoak === "object" && !Array.isArray(summary.residentSoak)) {
    if (requested.soakDurationSec != null && soak.requestedDurationSec == null) {
      summary.residentSoak.requestedDurationSec = requested.soakDurationSec;
    }
    const measuredDurationSec = firstFiniteNumber(
      soak.measuredDurationSec,
      soak.wallClockDurationSec,
      soak.actualDurationSec,
    );
    if (isFiniteNumber(measuredDurationSec)) {
      summary.residentSoak.measuredDurationSec = measuredDurationSec;
      summary.residentSoak.durationSec = measuredDurationSec;
    } else if (soak.requestedDurationSec != null && Number(soak.durationSec) === Number(soak.requestedDurationSec)) {
      summary.residentSoak.durationSec = null;
    }
  }
  Object.assign(summary.promotionMetrics, {
    soakDurationSec: firstFiniteNumber(soak.durationSec, summary.promotionMetrics.soakDurationSec),
    memoryGrowthSlopeMbPerMin: firstFiniteNumber(summary.promotionMetrics.memoryGrowthSlopeMbPerMin, soak.memoryGrowthSlopeMbPerMin),
    diagnosticEndpointSlopeMbPerMin: firstFiniteNumber(summary.promotionMetrics.diagnosticEndpointSlopeMbPerMin, soak.diagnosticEndpointSlopeMbPerMin, soak.endpointGrowthMbPerMin),
    postWarmupSlopeMbPerMin: firstFiniteNumber(summary.promotionMetrics.postWarmupSlopeMbPerMin, soak.postWarmupSlopeMbPerMin),
    inferenceSlopeMbPerMin: firstFiniteNumber(summary.promotionMetrics.inferenceSlopeMbPerMin, soak.inferenceSlopeMbPerMin),
    holdSlopeMbPerMin: firstFiniteNumber(summary.promotionMetrics.holdSlopeMbPerMin, soak.holdSlopeMbPerMin),
    readinessMemorySlopeMbPerMin: firstFiniteNumber(summary.promotionMetrics.readinessMemorySlopeMbPerMin, soak.readinessMemorySlopeMbPerMin, soak.postWarmupSlopeMbPerMin),
    crashCount: firstFiniteNumber(summary.promotionMetrics.crashCount, soak.crashCount),
    staleOutputReuseCount: firstFiniteNumber(summary.promotionMetrics.staleOutputReuseCount, soak.staleOutputReuseCount, adjacent.staleOutputReuseCount),
    sessionRestartCount: firstFiniteNumber(summary.promotionMetrics.sessionRestartCount, soak.sessionRestartCount, adjacent.sessionRestartCount),
    adjacentRequestedSegments: firstFiniteNumber(summary.promotionMetrics.adjacentRequestedSegments, adjacent.requestedSegments),
    adjacentCompletedSegments: firstFiniteNumber(summary.promotionMetrics.adjacentCompletedSegments, adjacent.completedSegments),
    adjacentFreshSegments: firstFiniteNumber(summary.promotionMetrics.adjacentFreshSegments, adjacent.freshSegments),
    adjacentEmptySegments: firstFiniteNumber(summary.promotionMetrics.adjacentEmptySegments, adjacent.emptySegments),
    adjacentStaleOutputReuseCount: firstFiniteNumber(summary.promotionMetrics.adjacentStaleOutputReuseCount, adjacent.staleOutputReuseCount),
    adjacentSessionRestartCount: firstFiniteNumber(summary.promotionMetrics.adjacentSessionRestartCount, adjacent.sessionRestartCount),
    adjacentP95InternalFirstDecodedAudioMs: firstFiniteNumber(summary.promotionMetrics.adjacentP95InternalFirstDecodedAudioMs, adjacent.p95InternalFirstDecodedAudioMs),
    adjacentP95FinalRtf: firstFiniteNumber(summary.promotionMetrics.adjacentP95FinalRtf, adjacent.p95FinalRtf),
    adjacentP95PunctuationRtf: firstFiniteNumber(summary.promotionMetrics.adjacentP95PunctuationRtf, adjacent.p95PunctuationRtf),
  });
}

function nano6Failure(message, key, failureClass = "runtime-contract") {
  return { message, key, failureClass };
}

function nano6FailureWithEvidence(message, key, failureClass, evidence = {}) {
  return { message, key, failureClass, ...evidence };
}

function markNano6ReadinessFailure(summary, failure) {
  summary.nano6Readiness = {
    ...objectOrEmpty(summary.nano6Readiness),
    status: "failed",
    gate: NANO6_APP_PROTOTYPE_TARGET,
    key: failure.key,
    failureClass: failure.failureClass,
    reason: failure.message,
  };
  return failure;
}

function nano6ReadinessFailureDetails(failures) {
  return failures.map((failure) => ({
    gate: NANO6_APP_PROTOTYPE_TARGET,
    key: failure.key,
    reason: failure.message,
    failureClass: failure.failureClass,
    ...(failure.tailLatencyEvidence ? { tailLatencyEvidence: failure.tailLatencyEvidence } : {}),
    ...(failure.slowSegmentIndices ? { slowSegmentIndices: failure.slowSegmentIndices } : {}),
  }));
}

function withNano6ReadinessFailureDetails(readiness, failures) {
  const failedGates = nano6ReadinessFailureDetails(failures);
  const firstFailure = failedGates[0] ?? null;
  return {
    ...readiness,
    failedGate: firstFailure?.gate ?? null,
    failedKey: firstFailure?.key ?? null,
    failedReason: firstFailure?.reason ?? null,
    failedGates,
    failedKeys: [...new Set(failedGates.map((failure) => failure.key))],
    failedReasons: failedGates.map((failure) => failure.reason),
  };
}

function collectNano6ReadinessFailures(summary) {
  return [
    validateNano6LifecycleEvidence(summary),
    validateNano6BoundedLifecycleEvidence(summary),
    validateNano6Soak(summary),
    validateNano6BookLikeAdjacentRun(summary),
    validateNano6ShutdownEvidence(summary),
  ].filter(Boolean);
}

function nano6AllowedDecisionSet(summary, requested = {}) {
  return hasBoundedLifecycleMode(summary, requested)
    ? NANO6_BOUNDED_LIFECYCLE_DECISIONS
    : NANO6_LEGACY_DECISIONS;
}

function nano6PromotionDecisionName(summary, requested = {}) {
  return hasBoundedLifecycleMode(summary, requested)
    ? NANO6_BOUNDED_LIFECYCLE_DECISION
    : NANO6_APP_PROTOTYPE_DECISION;
}

function nano6DecisionSetMessage(summary, requested = {}) {
  const decisions = Array.from(nano6AllowedDecisionSet(summary, requested)).join(", ");
  return `MOSS-NANO-6 promotion decision must be ${decisions}.`;
}

function isMeasuredBoundedLifecycle(summary) {
  return validateNano6BoundedLifecycleEvidence(summary) == null
    && objectOrEmpty(summary.boundedLifecycle).actual === true;
}

function validateNano6PromotionDecision(summary, requested = {}) {
  const decision = String(summary.promotionDecision?.decision ?? "");
  const target = summary.promotionTarget ?? summary.promotionDecision?.target ?? null;
  const promote = summary.promotionDecision?.promote === true;
  const allowedDecisions = nano6AllowedDecisionSet(summary, requested);
  const promotionDecision = nano6PromotionDecisionName(summary, requested);
  if (!allowedDecisions.has(decision)) {
    return nano6Failure(nano6DecisionSetMessage(summary, requested), "promotionDecision");
  }
  if (promote && (decision !== promotionDecision || target !== NANO6_APP_PROTOTYPE_TARGET)) {
    return nano6Failure(`MOSS-NANO-6 app prototype promotion requires target app-prototype and ${promotionDecision}.`, "promotionDecision");
  }
  if (!promote && decision === promotionDecision) {
    return nano6Failure("MOSS-NANO-6 app prototype decision cannot be non-promoting.", "promotionDecision");
  }
  return null;
}

function validateNano6BoundedLifecycleEvidence(summary, requested = {}) {
  if (!hasBoundedLifecycleMode(summary, requested)) return null;
  const evidence = objectOrEmpty(summary.boundedLifecycle);
  if (!summary.boundedLifecycle) {
    return nano6Failure("MOSS-NANO-6 bounded lifecycle evidence is required when bounded lifecycle is requested.", "boundedLifecycle");
  }
  const status = String(evidence.status ?? "").toLowerCase();
  const source = String(evidence.evidenceSource ?? evidence.source ?? "").toLowerCase();
  const synthetic = evidence.synthetic === true
    || ["synthetic", "planned", "requested", "not-implemented", "not-observed"].some((marker) => status.includes(marker) || source.includes(marker));
  if (evidence.actual !== true || status !== "actual" || source !== "measured-bounded-lifecycle" || synthetic) {
    return nano6Failure("MOSS-NANO-6 bounded lifecycle evidence must be actual measured-bounded-lifecycle evidence, not synthetic or not implemented.", "boundedLifecycle");
  }
  const missingCostStats = [
    "p50RestartCostMs",
    "p95RestartCostMs",
    "p50PrewarmCostMs",
    "p95PrewarmCostMs",
  ].filter((key) => !isFiniteNumber(evidence[key]));
  if (evidence.measureRestartCost !== true || missingCostStats.length > 0) {
    return nano6Failure(
      `MOSS-NANO-6 bounded lifecycle requires p50/p95 restart and prewarm cost stats: ${missingCostStats.join(", ") || "measureRestartCost"}.`,
      "boundedLifecycle",
    );
  }
  if (!isFiniteNumber(evidence.recycleCount) || evidence.recycleCount <= 0 || !Array.isArray(evidence.recycleReasons) || evidence.recycleReasons.length === 0 || !Array.isArray(evidence.segmentsPerRuntime) || evidence.segmentsPerRuntime.length < 2) {
    return nano6Failure("MOSS-NANO-6 bounded lifecycle requires recycleCount, recycle reasons, and segmentsPerRuntime distribution.", "boundedLifecycle");
  }
  const tailEvidence = objectOrEmpty(evidence.tailEvidence);
  if (
    !Array.isArray(tailEvidence.postRecycleSegmentIndices)
    || tailEvidence.postRecycleSegmentIndices.length === 0
    || !isFiniteNumber(tailEvidence.p95PostRecycleFirstAudioMs)
    || !isFiniteNumber(tailEvidence.p95PostRecycleRtf)
  ) {
    return nano6Failure("MOSS-NANO-6 bounded lifecycle requires post-recycle segment indices and p95 first audio/RTF tail evidence.", "boundedLifecycle");
  }
  if (!isFiniteNumber(evidence.staleOutputReuseCount) || evidence.staleOutputReuseCount !== 0 || evidence.staleOutputClean !== true) {
    return nano6Failure("MOSS-NANO-6 bounded lifecycle stale-output clean evidence must show zero stale output reuse.", "boundedLifecycle");
  }
  if (isNano6PromotionAttempt(summary, requested)) {
    const restartEvidence = objectOrEmpty(evidence.restartEvidence);
    const restartKind = String(restartEvidence.kind ?? restartEvidence.measurementKind ?? "").toLowerCase();
    if (
      evidence.processRestartActual !== true
      || restartKind.includes("in-process")
      || restartEvidence.processRestartActual === false
      || restartEvidence.beforeChildPid === restartEvidence.afterChildPid
    ) {
      return nano6Failure(
        "MOSS-NANO-6E bounded lifecycle promotion requires processRestartActual=true from a real child process restart, not an in-process reset.",
        "boundedLifecycle",
      );
    }
    const staleOutputCleanEvidence = objectOrEmpty(evidence.staleOutputCleanEvidence);
    const staleSource = String(staleOutputCleanEvidence.evidenceSource ?? staleOutputCleanEvidence.source ?? "").toLowerCase();
    const staleStatus = String(staleOutputCleanEvidence.status ?? "").toLowerCase();
    if (
      staleOutputCleanEvidence.shutdownClean !== true
      || staleOutputCleanEvidence.restartClean !== true
      || staleOutputCleanEvidence.inflightClean !== true
      || staleOutputCleanEvidence.staleOutputReuseCount !== 0
      || staleSource !== "measured-lifecycle-check"
      || staleStatus !== "actual"
    ) {
      return nano6Failure(
        "MOSS-NANO-6E bounded lifecycle requires stale-output clean evidence across shutdown, restart, and in-flight rejection via staleOutputCleanEvidence.",
        "boundedLifecycle",
      );
    }
    const segments = Array.isArray(summary.segments) ? summary.segments : [];
    const identityChanged = segments.some((segment) => segment?.sessionRestarted === true);
    const lifecycleTransitions = Array.isArray(evidence.lifecycleTransitions) ? evidence.lifecycleTransitions : [];
    const hiddenReuse = String(evidence.identityChangeClassification ?? "").toLowerCase().includes("hidden-runtime-reuse")
      || evidence.childProcessLifecycle === false
      || lifecycleTransitions.some((transition) => (
        String(transition?.classification ?? "").toLowerCase().includes("hidden-runtime-reuse")
          || transition?.childProcessLifecycle === false
          || transition?.processRestartActual === false
      ));
    const validTransitions = lifecycleTransitions.filter((transition) => (
      transition?.childProcessLifecycle === true
        && transition?.processRestartActual === true
        && transition?.beforeChildPid != null
        && transition?.afterChildPid != null
        && transition.beforeChildPid !== transition.afterChildPid
        && String(transition?.classification ?? "").toLowerCase().includes("child-process")
    ));
    if (identityChanged && (hiddenReuse || validTransitions.length === 0)) {
      return nano6Failure(
        "MOSS-NANO-6E identity changes must be classified with child-process lifecycleTransitions, not hidden runtime reuse.",
        "boundedLifecycle",
      );
    }
  }
  return null;
}

function validateNano6StaleOutputEvidence(summary) {
  const soak = objectOrEmpty(summary.residentSoak);
  const run = objectOrEmpty(summary.bookLikeAdjacentRun);
  const segments = Array.isArray(summary.segments) ? summary.segments : [];
  const staleSegment = segments.some((segment) => (
    segment?.staleOutputReuse
      || segment?.fresh === false
      || segment?.firstAudioObservation?.outputFileExistedBeforeRun
      || segment?.firstAudioObservation?.reusedExistingOutputFile
  ));
  if (Number(soak.staleOutputReuseCount ?? 0) > 0 || Number(run.staleOutputReuseCount ?? 0) > 0 || staleSegment) {
    return nano6Failure("MOSS-NANO-6 stale output reuse is forbidden across resident and bounded lifecycle recycle runs.", "staleOutputReuse");
  }
  return null;
}

function validateNano6Soak(summary) {
  const soak = objectOrEmpty(summary.residentSoak);
  const thresholds = objectOrEmpty(summary.promotionThresholds);
  if (!summary.residentSoak) {
    return nano6Failure("MOSS-NANO-6 resident soak evidence is required.", "residentSoak");
  }
  if (!isFiniteNumber(soak.durationSec) || soak.durationSec < thresholds.soakDurationSecMin) {
    return nano6Failure("MOSS-NANO-6 resident soak duration must be at least 1800 seconds.", "residentSoak", "performance");
  }
  if (soak.warmupExcluded !== true || !String(soak.warmupEndAt ?? "").trim()) {
    return nano6Failure("MOSS-NANO-6 resident soak must exclude warmup and record warmupEndAt.", "residentSoak");
  }
  if (!isFiniteNumber(soak.sampleIntervalSec) || soak.sampleIntervalSec <= 0) {
    return nano6Failure("MOSS-NANO-6 resident soak sampleIntervalSec must be numeric.", "residentSoak");
  }
  if (!Array.isArray(soak.rssSamples) || soak.rssSamples.length === 0 || !soak.rssSamples.every(isFiniteNumber) || !isFiniteNumber(soak.currentRssMb)) {
    return nano6Failure("MOSS-NANO-6 resident soak RSS memory evidence is required.", "residentSoak");
  }
  if (!isFiniteNumber(soak.endpointGrowthMb) && soak.rssSamples.length >= 2) {
    soak.endpointGrowthMb = Math.round((soak.rssSamples.at(-1) - soak.rssSamples[0]) * 100) / 100;
  }
  if (!isFiniteNumber(soak.endpointGrowthMbPerMin)) {
    soak.endpointGrowthMbPerMin = firstFiniteNumber(soak.diagnosticEndpointSlopeMbPerMin, soak.memoryGrowthSlopeMbPerMin);
  }
  const requiredPhaseFields = [
    "initialExpansionMb",
    "endpointGrowthMb",
    "endpointGrowthMbPerMin",
    "postWarmupSlopeMbPerMin",
    "inferenceSlopeMbPerMin",
    "holdSlopeMbPerMin",
  ];
  const missingPhaseFields = requiredPhaseFields.filter((key) => !isFiniteNumber(soak[key]));
  const phaseMethod = String(soak.readinessMemorySlopeMethod ?? soak.memoryGrowthSlopeMethod ?? soak.memoryGrowthMethod ?? "").toLowerCase();
  const phaseMethodValid = (phaseMethod.includes("regression") || phaseMethod.includes("window"))
    && (phaseMethod.includes("post-warmup") || phaseMethod.includes("phase"));
  if (missingPhaseFields.length > 0 || !phaseMethodValid) {
    return nano6Failure(
      `MOSS-NANO-6 resident soak requires phase regression memory fields before promotion: ${missingPhaseFields.join(", ") || "method"}.`,
      "residentSoak",
    );
  }
  const reportedReadinessSlope = firstFiniteNumber(
    soak.readinessMemorySlopeMbPerMin,
    summary.promotionMetrics?.readinessMemorySlopeMbPerMin,
  );
  const readinessSlope = maxFiniteNumber([
    reportedReadinessSlope,
    soak.postWarmupSlopeMbPerMin,
    soak.inferenceSlopeMbPerMin,
    summary.promotionMetrics?.postWarmupSlopeMbPerMin,
    summary.promotionMetrics?.inferenceSlopeMbPerMin,
  ]);
  soak.readinessMemorySlopeMbPerMin = readinessSlope;
  soak.readinessMemorySlopeSource = "max-of-readiness-postWarmup-inference";
  if (isFiniteNumber(reportedReadinessSlope) && isFiniteNumber(readinessSlope) && readinessSlope !== reportedReadinessSlope) {
    soak.readinessMemorySlopeBackfilledFrom = "authoritative-phase-max";
  }
  summary.promotionMetrics.readinessMemorySlopeMbPerMin = readinessSlope;
  if (soak.diagnosticEndpointSlopeMbPerMin == null && isFiniteNumber(soak.endpointGrowthMbPerMin)) {
    soak.diagnosticEndpointSlopeMbPerMin = soak.endpointGrowthMbPerMin;
  }
  if (!isFiniteNumber(readinessSlope) || readinessSlope > thresholds.memoryGrowthSlopeMbPerMinMax) {
    return nano6Failure("MOSS-NANO-6 resident soak post-warmup phase memory growth exceeds 1.5MB/min.", "residentSoak", "performance");
  }
  if (Number(soak.crashCount ?? 0) > thresholds.crashCountMax) {
    return nano6Failure("MOSS-NANO-6 resident soak crash count must be zero.", "residentSoak");
  }
  if (Number(soak.staleOutputReuseCount ?? 0) > thresholds.staleOutputReuseMax) {
    return nano6Failure("MOSS-NANO-6 resident soak has stale output reuse.", "staleOutputReuse");
  }
  if (!isMeasuredBoundedLifecycle(summary) && Number(soak.sessionRestartCount ?? 0) > thresholds.sessionRestartMax) {
    return nano6Failure("MOSS-NANO-6 resident soak has a session/runtime identity restart.", "runtimeIdentity");
  }
  return null;
}

function validateNano6BookLikeAdjacentRun(summary) {
  const run = objectOrEmpty(summary.bookLikeAdjacentRun);
  const thresholds = objectOrEmpty(summary.promotionThresholds);
  const segments = Array.isArray(summary.segments) ? summary.segments : [];
  if (!summary.bookLikeAdjacentRun) {
    return nano6Failure("MOSS-NANO-6 book-like adjacent run evidence is required.", "bookLikeAdjacentRun");
  }
  if (Number(run.requestedSegments ?? 0) !== thresholds.adjacentRequiredSegments || segments.length !== thresholds.adjacentRequiredSegments) {
    return nano6Failure("MOSS-NANO-6 requires exactly 100 adjacent book-like segments.", "bookLikeAdjacentRun");
  }
  if (Number(run.completedSegments ?? 0) < thresholds.adjacentRequiredSegments) {
    return nano6Failure("MOSS-NANO-6 requires 100 completed adjacent book-like segments.", "bookLikeAdjacentRun");
  }
  if (Number(run.emptySegments ?? 0) > thresholds.emptySegmentMax || segments.some((segment) => segment?.empty || !String(segment?.text ?? "").trim())) {
    return nano6Failure("MOSS-NANO-6 adjacent run contains an empty segment.", "bookLikeAdjacentRun");
  }
  const staleSegment = segments.some((segment) => (
    segment?.staleOutputReuse
      || segment?.fresh === false
      || segment?.firstAudioObservation?.outputFileExistedBeforeRun
      || segment?.firstAudioObservation?.reusedExistingOutputFile
  ));
  if (Number(run.staleOutputReuseCount ?? 0) > thresholds.staleOutputReuseMax || staleSegment) {
    return nano6Failure("MOSS-NANO-6 adjacent run has stale output reuse.", "staleOutputReuse");
  }
  if (Number(run.freshSegments ?? 0) < thresholds.adjacentRequiredSegments) {
    return nano6Failure("MOSS-NANO-6 requires 100 fresh adjacent book-like segments.", "bookLikeAdjacentRun");
  }
  const firstIdentity = segments[0]?.runtimeIdentity;
  const identityChanged = segments.some((segment) => (
    segment?.sessionRestarted || sortedJson(segment?.runtimeIdentity) !== sortedJson(firstIdentity)
  ));
  if (!isMeasuredBoundedLifecycle(summary) && (Number(run.sessionRestartCount ?? 0) > thresholds.sessionRestartMax || identityChanged)) {
    return nano6Failure("MOSS-NANO-6 adjacent run has a session/runtime identity change.", "runtimeIdentity");
  }
  const wavs = segments.map((segment) => segment?.outputWavPath).filter(Boolean);
  if (new Set(wavs).size !== wavs.length) {
    return nano6Failure("MOSS-NANO-6 adjacent run requires distinct WAV outputs.", "bookLikeAdjacentRun");
  }
  if (segments.some((segment) => !isFiniteNumber(segment?.firstAudioObservation?.internalFirstDecodedAudioMs ?? segment?.internalFirstDecodedAudioMs))) {
    return nano6Failure("MOSS-NANO-6 adjacent run requires internal first decoded audio for every segment.", "bookLikeAdjacentRun");
  }
  if (!isFiniteNumber(run.p95InternalFirstDecodedAudioMs) || run.p95InternalFirstDecodedAudioMs > thresholds.adjacentP95InternalFirstDecodedAudioMsMax) {
    return nano6Failure("MOSS-NANO-6 adjacent p95 internal first decoded audio exceeds 1500ms.", "bookLikeAdjacentRun", "performance");
  }
  if (!isFiniteNumber(run.p95FinalRtf) || run.p95FinalRtf > thresholds.adjacentP95FinalRtfMax) {
    return nano6TailLatencyFailure(
      "MOSS-NANO-6 adjacent p95 final RTF exceeds 1.5.",
      "p95 final rtf",
      "rtf",
      run.p95FinalRtf,
      thresholds.adjacentP95FinalRtfMax,
      segments,
    );
  }
  if (!isFiniteNumber(run.p95PunctuationRtf) || run.p95PunctuationRtf > thresholds.adjacentP95PunctuationRtfMax) {
    return nano6TailLatencyFailure(
      "MOSS-NANO-6 adjacent p95 punctuation RTF exceeds 1.45.",
      "p95 punctuation rtf",
      "punctuationRtf",
      run.p95PunctuationRtf,
      thresholds.adjacentP95PunctuationRtfMax,
      segments,
    );
  }
  return null;
}

function nano6TailLatencyFailure(message, metric, segmentMetricKey, observed, threshold, segments) {
  const slowSegments = segments
    .map((segment, fallbackIndex) => ({
      index: Number.isInteger(segment?.index) ? segment.index : fallbackIndex,
      rtf: segment?.rtf ?? null,
      punctuationRtf: segment?.punctuationRtf ?? segment?.rtf ?? null,
      firstDecodedAudioMs: segment?.firstAudioObservation?.internalFirstDecodedAudioMs ?? segment?.internalFirstDecodedAudioMs ?? null,
      totalSec: segment?.totalSec ?? null,
      audioDurationSec: segment?.audioDurationSec ?? null,
      metricValue: segment?.[segmentMetricKey] ?? (segmentMetricKey === "punctuationRtf" ? segment?.rtf : null),
    }))
    .filter((segment) => isFiniteNumber(segment.metricValue) && segment.metricValue > threshold);
  const slowSegmentIndices = slowSegments.map((segment) => segment.index);
  return nano6FailureWithEvidence(message, "bookLikeAdjacentRun", "performance", {
    slowSegmentIndices,
    tailLatencyEvidence: {
      metric,
      method: "nearest-rank-p95",
      threshold,
      observed,
      slowSegmentIndices,
      slowSegments,
    },
  });
}

function validateNano6LifecycleEvidence(summary) {
  const evidence = objectOrEmpty(summary.lifecycleEvidence);
  if (!summary.lifecycleEvidence || evidence.requestedOnly === true || String(evidence.status ?? "").toLowerCase() === "requested") {
    return nano6Failure("MOSS-NANO-6 lifecycle evidence must be actual, not requested-only.", "lifecycleEvidence");
  }
  if (evidence.stale === true) {
    return nano6Failure("MOSS-NANO-6 lifecycle evidence is stale.", "lifecycleEvidence");
  }
  const lifecycleSummary = objectOrEmpty(evidence.shutdownRestartSummary);
  if (Object.keys(lifecycleSummary).length > 0) {
    const source = String(lifecycleSummary.evidenceSource ?? lifecycleSummary.source ?? lifecycleSummary.classificationSource ?? "").toLowerCase();
    const status = String(lifecycleSummary.status ?? "").toLowerCase();
    const synthetic = lifecycleSummary.synthetic === true
      || ["synthetic", "planned", "requested", "not-implemented"].some((marker) => source.includes(marker) || status.includes(marker));
    if (
      synthetic
      || lifecycleSummary.shutdownObserved !== true
      || lifecycleSummary.restartObserved !== true
      || source !== "measured-lifecycle-check"
    ) {
      return nano6Failure(
        "MOSS-NANO-6 lifecycle shutdown/restart evidence must be observed by measured-lifecycle-check, not synthetic or not implemented.",
        "lifecycleEvidence",
      );
    }
  }
  const shutdownEvidenceDuplicatesLifecycleClasses = summary.shutdownEvidence
    && sortedJson(summary.shutdownEvidence) === sortedJson(evidence.lifecycleClasses);
  if (evidence.lifecycleClasses != null && !shutdownEvidenceDuplicatesLifecycleClasses) {
    const lifecycleClassFailure = validateNano6LifecycleClassEvidence(evidence.lifecycleClasses, "lifecycleEvidence");
    if (lifecycleClassFailure) return lifecycleClassFailure;
  }
  return null;
}

function validateNano6ShutdownEvidence(summary) {
  const lifecycleClasses = objectOrEmpty(summary.lifecycleEvidence?.lifecycleClasses);
  const evidence = objectOrEmpty(summary.shutdownEvidence ?? lifecycleClasses);
  if (!summary.shutdownEvidence && Object.keys(lifecycleClasses).length === 0) {
    return nano6Failure("MOSS-NANO-6 shutdown/restart evidence is required.", "shutdownEvidence");
  }
  if (!summary.shutdownEvidence && Object.keys(lifecycleClasses).length > 0) {
    summary.shutdownEvidence = lifecycleClasses;
  }
  const classFailure = validateNano6LifecycleClassEvidence(evidence, "shutdownEvidence");
  if (classFailure) return classFailure;
  return null;
}

function validateNano6LifecycleClassEvidence(evidence, key) {
  const classifications = new Set();
  const evidenceByClassification = new Map();
  for (const item of Object.values(evidence)) {
    if (item && typeof item === "object" && item.classification) {
      classifications.add(item.classification);
      evidenceByClassification.set(item.classification, item);
    }
  }
  const missing = NANO6_REQUIRED_SHUTDOWN_CLASSIFICATIONS.filter((classification) => !classifications.has(classification));
  if (missing.length > 0) {
    return nano6Failure(`MOSS-NANO-6 shutdown/restart classifications are missing: ${missing.join(", ")}.`, key);
  }
  const notMeasured = NANO6_REQUIRED_SHUTDOWN_CLASSIFICATIONS.filter((classification) => {
    const item = objectOrEmpty(evidenceByClassification.get(classification));
    const source = String(item.evidenceSource ?? item.source ?? item.classificationSource ?? "").toLowerCase();
    const status = String(item.status ?? "").toLowerCase();
    const synthetic = item.synthetic === true
      || ["synthetic", "planned", "requested", "not-implemented", "not-observed"].some((marker) => source.includes(marker) || status.includes(marker));
    return item.observed !== true || synthetic || source !== "measured-lifecycle-check";
  });
  if (notMeasured.length > 0) {
    return nano6Failure(`MOSS-NANO-6 shutdown/restart classifications require measured observed lifecycle checks, not synthetic, planned, or not implemented evidence: ${notMeasured.join(", ")}.`, key);
  }
  const inProcessEvidence = NANO6_REQUIRED_SHUTDOWN_CLASSIFICATIONS.filter((classification) => {
    const item = objectOrEmpty(evidenceByClassification.get(classification));
    const measurementKind = String(item.measurementKind ?? item.kind ?? "").toLowerCase();
    return measurementKind.includes("in-process")
      || item.processLifecycleActual === false
      || item.childProcessLifecycle === false;
  });
  if (inProcessEvidence.length > 0) {
    return nano6Failure(
      `MOSS-NANO-6E shutdown evidence must be measured from actual child process lifecycle checks, not in-process reset/processLifecycleActual=false evidence: ${inProcessEvidence.join(", ")}.`,
      key,
    );
  }
  const inflight = objectOrEmpty(evidence.inflightShutdown);
  if (inflight.classification !== "inflight-rejected" || inflight.rejected !== true || inflight.succeeded === true || inflight.wavReused === true) {
    return nano6Failure("MOSS-NANO-6 in-flight shutdown must reject work and must not reuse a stale WAV.", key);
  }
  return null;
}

function validateNano6Readiness(summary, requested = {}) {
  if (!hasNano6ReadinessShape(summary, requested)) return null;
  normalizeNano6ReadinessEvidence(summary, requested);
  const staleOutputFailure = validateNano6StaleOutputEvidence(summary);
  if (staleOutputFailure) return markNano6ReadinessFailure(summary, staleOutputFailure);
  const boundedLifecycleFailure = validateNano6BoundedLifecycleEvidence(summary, requested);
  if (boundedLifecycleFailure) return markNano6ReadinessFailure(summary, boundedLifecycleFailure);
  const decisionFailure = validateNano6PromotionDecision(summary, requested);
  if (decisionFailure) return markNano6ReadinessFailure(summary, decisionFailure);
  if (summary.promotionDecision?.decision !== nano6PromotionDecisionName(summary, requested)) {
    const failures = collectNano6ReadinessFailures(summary);
    summary.nano6Readiness = {
      ...withNano6ReadinessFailureDetails({
        ...objectOrEmpty(summary.nano6Readiness),
        status: "not-promoting",
        gate: NANO6_APP_PROTOTYPE_TARGET,
      }, failures),
    };
    return null;
  }
  const failures = collectNano6ReadinessFailures(summary);
  const failure = failures[0] ?? null;
  if (failure) {
    summary.nano6Readiness = withNano6ReadinessFailureDetails(objectOrEmpty(summary.nano6Readiness), failures);
  }
  if (failure) return markNano6ReadinessFailure(summary, failure);
  summary.nano6Readiness = {
    ...objectOrEmpty(summary.nano6Readiness),
    status: "passed",
    gate: NANO6_APP_PROTOTYPE_TARGET,
  };
  return null;
}

function validateNano5SoakPromotion(summary, requested = {}) {
  if (!hasNano5SoakShape(summary, requested)) return null;
  const decision = String(summary.promotionDecision?.decision ?? "");
  const target = summary.promotionTarget ?? summary.promotionDecision?.target ?? null;
  const isSoakPromotion = decision === "PROMOTE_NANO_TO_SOAK_CANDIDATE" || target === "nano5-soak";
  const isSegmentFirstSoakPromotion = hasNano5cSegmentFirstSoakShape(summary);
  if (target === "app-prototype" || decision === "PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE") {
    return {
      message: "MOSS-NANO-5 may promote to soak, not app prototype.",
      key: "promotionDecision",
      failureClass: "runtime-contract",
    };
  }
  normalizePromotionMemoryMetrics(summary);
  const precomputeRequested = summary.precomputeInputsRequested === true || requested.precomputeInputs === true;
  if (isSegmentFirstSoakPromotion) {
    const precomputeFailure = nano5cPrecomputeFailure(summary, requested);
    if (precomputeFailure) {
      return {
        message: precomputeFailure,
        key: "precomputeInputsEvidence",
        failureClass: "runtime-contract",
      };
    }
    const decodeFailure = validateNano5cDecodeFullGate(summary);
    if (decodeFailure) {
      return {
        message: decodeFailure,
        key: "decodeFullEvidence",
        failureClass: "runtime-contract",
      };
    }
    const segmentFirstFailure = validateSegmentFirstProductPath(summary);
    if (segmentFirstFailure) {
      return {
        message: segmentFirstFailure,
        key: "segmentFirstProductPathEvidence",
        failureClass: "runtime-contract",
      };
    }
    const thresholdFailure = nano5cSegmentFirstThresholdFailure(summary);
    if (thresholdFailure) {
      return {
        message: `MOSS-NANO-5C segment-first soak promotion blocked: ${thresholdFailure}.`,
        key: "promotionThresholds",
        failureClass: "performance",
      };
    }
    return null;
  }
  if (isSoakPromotion) {
    const precomputeFailure = precomputePromotionFailure(summary);
    if (precomputeFailure) {
      return {
        message: precomputeFailure,
        key: "precomputeInputsEvidence",
        failureClass: "runtime-contract",
      };
    }
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
  if (hasNano5cSegmentFirstSoakShape(summary)) return null;
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
    const boundedRestartEvidence = hasBoundedLifecycleMode(summary, requested) && (
      Number(summary.residentSoak?.sessionRestartCount ?? 0) > 0
        || Number(summary.bookLikeAdjacentRun?.sessionRestartCount ?? 0) > 0
        || Number(summary.promotionMetrics?.sessionRestartCount ?? 0) > 0
        || Number(summary.promotionMetrics?.adjacentSessionRestartCount ?? 0) > 0
        || (Array.isArray(summary.segments) && summary.segments.some((segment) => segment?.sessionRestarted === true))
    );
    const reuseProven = identities.length > 0
      && identities.every(hasStableResidentIdentity)
      && identities.every((identity) => sortedJson(identity) === sortedJson(firstIdentity));
    if ((!reuseProven || boundedRestartEvidence) && hasBoundedLifecycleMode(summary, requested)) {
      if (summary.benchmark) summary.benchmark.runtimeReuseActual = false;
      for (const record of records) record.runtimeReuseActual = false;
      for (const segment of Array.isArray(summary.segments) ? summary.segments : []) {
        if (segment) segment.runtimeReuseActual = false;
      }
      summary.boundedLifecycle = {
        ...objectOrEmpty(summary.boundedLifecycle),
        residentIdentityReuseActual: false,
        boundedRuntimeReuseActual: objectOrEmpty(summary.boundedLifecycle).actual === true,
      };
    } else if (!reuseProven) {
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

  applyNano5cSegmentFirstClassification(summary, requested);
  if (contractMessage) return blockResidentSummary(summary, contractMessage, contractKey);
  const nano6Failure = validateNano6Readiness(summary, requested);
  if (nano6Failure) {
    return blockResidentSummary(summary, nano6Failure.message, nano6Failure.key, nano6Failure.failureClass);
  }
  if (hasNano6ReadinessShape(summary, requested)) {
    return summary;
  }
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
  nano6Soak,
  soakDurationSec,
  soakSampleIntervalSec,
  shutdownRestartEvidence,
  boundedLifecycle,
  recycleAfterSegments,
  recycleRssThresholdMb,
  measureRestartCost,
  warmSpare,
  allowEmptyPassage,
} = {}) {
  const defaults = defaultOptions(projectRoot);
  const command = python ?? process.env.PYTHON ?? repoLocalNanoPython(projectRoot) ?? "python";
  const residentMode = runtimeMode === "resident";
  const pythonProbePath = path.join(projectRoot, residentMode ? PYTHON_RESIDENT_PROBE_RELATIVE_PATH : PYTHON_PROBE_RELATIVE_PATH);
  const effectivePassageId = resolvePassageId(passageId ?? defaults.passageId);
  const effectiveAdjacentSegmentSource = adjacentSegmentSource
    ?? (boundedLifecycle && adjacentSegmentCount != null ? "book-like" : null);
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
  if (effectiveAdjacentSegmentSource) args.push("--adjacent-segment-source", effectiveAdjacentSegmentSource);
  if (adjacentSegmentRtfTrendMax != null) args.push("--adjacent-segment-rtf-trend-max", String(adjacentSegmentRtfTrendMax));
  if (nano6Soak) args.push("--nano6-soak");
  if (soakDurationSec != null) args.push("--soak-duration-sec", String(soakDurationSec));
  if (soakSampleIntervalSec != null) args.push("--soak-sample-interval-sec", String(soakSampleIntervalSec));
  if (shutdownRestartEvidence) args.push("--shutdown-restart-evidence");
  if (boundedLifecycle) args.push("--bounded-lifecycle");
  if (recycleAfterSegments != null) args.push("--recycle-after-segments", String(recycleAfterSegments));
  if (recycleRssThresholdMb != null) args.push("--recycle-rss-threshold-mb", String(recycleRssThresholdMb));
  if (measureRestartCost) args.push("--measure-restart-cost");
  if (warmSpare) args.push("--warm-spare");

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

function setArg(args, flag, value) {
  const next = [...args];
  const index = next.indexOf(flag);
  if (index >= 0) {
    next[index + 1] = String(value);
    return next;
  }
  next.push(flag, String(value));
  return next;
}

function removeArgs(args, flagsWithValues = [], flagsWithoutValues = []) {
  const valueFlags = new Set(flagsWithValues);
  const booleanFlags = new Set(flagsWithoutValues);
  const next = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (valueFlags.has(arg)) {
      index += 1;
      continue;
    }
    if (booleanFlags.has(arg)) continue;
    next.push(arg);
  }
  return next;
}

function lifecycleProbeArgs(baseArgs, { runId, outputDir, soak = false, failingModelDir = null, failingProbePath = null } = {}) {
  let args = removeArgs(
    baseArgs,
    [
      "--run-id",
      "--output-dir",
      "--adjacent-segment-count",
      "--adjacent-segment-source",
      "--soak-duration-sec",
      "--soak-sample-interval-sec",
      "--recycle-after-segments",
      "--recycle-rss-threshold-mb",
    ],
    [
      "--nano6-soak",
      "--shutdown-restart-evidence",
      "--bounded-lifecycle",
      "--measure-restart-cost",
      "--warm-spare",
      "--write-segment-wavs",
    ],
  );
  args = setArg(args, "--run-id", runId);
  args = setArg(args, "--output-dir", outputDir);
  args = setArg(args, "--iterations", 1);
  args = setArg(args, "--warmup-runs", 0);
  if (failingModelDir) args = setArg(args, "--model-dir", failingModelDir);
  if (soak) {
    args.push("--nano6-soak", "--soak-duration-sec", "60", "--soak-sample-interval-sec", "1");
  }
  if (failingProbePath) {
    args[0] = failingProbePath;
  }
  return args;
}

function processAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function runLifecycleChild(command, args, options = {}) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let killedByHarness = false;
    let killTimer = null;

    child.stdout?.setEncoding("utf8");
    child.stderr?.setEncoding("utf8");
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    if (options.killAfterMs != null) {
      killTimer = setTimeout(() => {
        killedByHarness = true;
        child.kill("SIGKILL");
      }, options.killAfterMs);
    }
    child.on("error", (error) => {
      if (killTimer) clearTimeout(killTimer);
      resolve({
        pid: child.pid ?? null,
        code: null,
        signal: null,
        error: error instanceof Error ? error.message : String(error),
        stdout,
        stderr,
        parsed: parsePythonSummary(stdout),
        killedByHarness,
        durationMs: Date.now() - startedAt,
        aliveAfterClose: processAlive(child.pid),
      });
    });
    child.on("close", (code, signal) => {
      if (killTimer) clearTimeout(killTimer);
      resolve({
        pid: child.pid ?? null,
        code,
        signal,
        stdout,
        stderr,
        parsed: parsePythonSummary(stdout),
        killedByHarness,
        durationMs: Date.now() - startedAt,
        aliveAfterClose: processAlive(child.pid),
      });
    });
  });
}

function freshOutputFromLifecycleChild(run) {
  const summary = run?.parsed?.summary;
  const observation = objectOrEmpty(summary?.firstAudioObservation);
  return run?.code === 0
    && summary
    && observation.outputFileExistedBeforeRun !== true
    && observation.reusedExistingOutputFile !== true
    && summary.staleOutputReuse !== true;
}

function lifecycleClassEvidence(classification, details = {}) {
  return {
    classification,
    observed: true,
    evidenceSource: "measured-lifecycle-check",
    measurementKind: "child-process-lifecycle",
    processLifecycleActual: true,
    childProcessLifecycle: true,
    ...details,
  };
}

async function measureNano6ProcessLifecycleEvidence({ commandInfo, projectRoot, runId, outputDir }) {
  const lifecycleRoot = path.join(outputDir, "lifecycle-proof");
  await fs.mkdir(lifecycleRoot, { recursive: true });
  const childOutputDir = (name) => path.join(lifecycleRoot, name);
  const clean = await runLifecycleChild(commandInfo.command, lifecycleProbeArgs(commandInfo.args, {
    runId: `${runId}-lifecycle-clean`,
    outputDir: childOutputDir("clean"),
  }), { cwd: projectRoot });
  const forced = await runLifecycleChild(commandInfo.command, lifecycleProbeArgs(commandInfo.args, {
    runId: `${runId}-lifecycle-forced-kill`,
    outputDir: childOutputDir("forced-kill"),
    soak: true,
  }), { cwd: projectRoot, killAfterMs: 1500 });
  const restart = await runLifecycleChild(commandInfo.command, lifecycleProbeArgs(commandInfo.args, {
    runId: `${runId}-lifecycle-restart-clean`,
    outputDir: childOutputDir("restart-clean"),
  }), { cwd: projectRoot });
  const failingModelDir = path.join(lifecycleRoot, "missing-model-dir");
  const restartFailed = await runLifecycleChild(commandInfo.command, lifecycleProbeArgs(commandInfo.args, {
    runId: `${runId}-lifecycle-restart-failed`,
    outputDir: childOutputDir("restart-failed"),
    failingModelDir,
    failingProbePath: path.join(lifecycleRoot, "missing_probe.py"),
  }), { cwd: projectRoot });
  const inflight = await runLifecycleChild(commandInfo.command, lifecycleProbeArgs(commandInfo.args, {
    runId: `${runId}-lifecycle-inflight`,
    outputDir: childOutputDir("inflight"),
    soak: true,
  }), { cwd: projectRoot, killAfterMs: 750 });

  const cleanOutputFresh = freshOutputFromLifecycleChild(clean);
  const restartOutputFresh = freshOutputFromLifecycleChild(restart);
  const forcedExited = forced.killedByHarness === true && forced.aliveAfterClose === false;
  const inflightRejected = inflight.killedByHarness === true && inflight.aliveAfterClose === false;
  const restartFailedObserved = restartFailed.code !== 0 || restartFailed.parsed?.error != null;
  const processRestartActual = clean.pid != null && restart.pid != null && clean.pid !== restart.pid;

  const shutdownEvidence = {
    cleanShutdown: lifecycleClassEvidence("clean-shutdown", {
      childPid: clean.pid ?? null,
      exitCode: clean.code,
      signal: clean.signal,
      freshOutput: cleanOutputFresh,
      durationMs: clean.durationMs,
      stdoutTail: tail(clean.stdout, 2000),
      stderrTail: tail(clean.stderr, 2000),
    }),
    forcedKill: lifecycleClassEvidence("forced-kill", {
      childPid: forced.pid ?? null,
      exitCode: forced.code,
      signal: forced.signal,
      killedByHarness: forced.killedByHarness,
      processExited: forcedExited,
      durationMs: forced.durationMs,
      stderrTail: tail(forced.stderr, 2000),
    }),
    zombieProcess: lifecycleClassEvidence("zombie-process", {
      childPid: forced.pid ?? null,
      zombieProcessDetected: forced.aliveAfterClose === true,
      processAliveAfterClose: forced.aliveAfterClose,
      processExited: forcedExited,
    }),
    restartClean: lifecycleClassEvidence("restart-clean", {
      beforeChildPid: clean.pid ?? null,
      afterChildPid: restart.pid ?? null,
      processRestartActual,
      oldProcessExited: clean.aliveAfterClose === false,
      exitCode: restart.code,
      freshOutput: restartOutputFresh,
      staleOutputReuseCount: 0,
      durationMs: restart.durationMs,
    }),
    restartFailed: lifecycleClassEvidence("restart-failed", {
      childPid: restartFailed.pid ?? null,
      failed: restartFailedObserved,
      exitCode: restartFailed.code,
      signal: restartFailed.signal,
      error: restartFailed.parsed?.error ?? tail(restartFailed.stderr, 2000),
      staleOutputReuseCount: 0,
      durationMs: restartFailed.durationMs,
    }),
    inflightShutdown: lifecycleClassEvidence("inflight-rejected", {
      childPid: inflight.pid ?? null,
      rejected: inflightRejected,
      succeeded: false,
      wavReused: false,
      exitCode: inflight.code,
      signal: inflight.signal,
      killedByHarness: inflight.killedByHarness,
      processExited: inflight.aliveAfterClose === false,
      durationMs: inflight.durationMs,
    }),
  };
  if (clean.code !== 0) shutdownEvidence.cleanShutdown.observed = false;
  if (!forcedExited) shutdownEvidence.forcedKill.observed = false;
  if (forced.aliveAfterClose === true) shutdownEvidence.zombieProcess.observed = false;
  if (!processRestartActual || restart.code !== 0) shutdownEvidence.restartClean.observed = false;
  if (!restartFailedObserved) shutdownEvidence.restartFailed.observed = false;
  if (!inflightRejected) shutdownEvidence.inflightShutdown.observed = false;

  return {
    status: "actual",
    evidenceSource: "measured-lifecycle-check",
    processLifecycleActual: true,
    childProcessLifecycle: true,
    processRestartActual,
    shutdownEvidence,
    shutdownRestartSummary: {
      status: "actual",
      shutdownObserved: clean.code === 0 && forcedExited,
      restartObserved: processRestartActual && restart.code === 0 && restartFailedObserved,
      evidenceSource: "measured-lifecycle-check",
      processLifecycleActual: true,
      childProcessLifecycle: true,
      cleanChildPid: clean.pid ?? null,
      restartChildPid: restart.pid ?? null,
      forcedKillChildPid: forced.pid ?? null,
      inflightChildPid: inflight.pid ?? null,
    },
    restartEvidence: {
      kind: "child-process-restart",
      processRestartActual,
      beforeChildPid: clean.pid ?? null,
      afterChildPid: restart.pid ?? null,
      oldProcessExited: clean.aliveAfterClose === false,
      zombieProcessDetected: forced.aliveAfterClose === true,
      freshOutput: restartOutputFresh,
      staleOutputReuseCount: 0,
    },
    staleOutputCleanEvidence: {
      status: "actual",
      evidenceSource: "measured-lifecycle-check",
      shutdownClean: cleanOutputFresh,
      restartClean: restartOutputFresh,
      inflightClean: inflightRejected,
      staleOutputReuseCount: 0,
      outputFileExistedBeforeRun: false,
      reusedExistingOutputFile: false,
    },
  };
}

function mergeNano6ProcessLifecycleEvidence(summary, lifecycleProof) {
  if (!summary || typeof summary !== "object" || !lifecycleProof) return summary;
  summary.shutdownEvidence = lifecycleProof.shutdownEvidence;
  summary.shutdownClassifications = [...NANO6_REQUIRED_SHUTDOWN_CLASSIFICATIONS];
  summary.lifecycleEvidence = {
    ...objectOrEmpty(summary.lifecycleEvidence),
    status: "actual",
    requestedOnly: false,
    stale: false,
    evidenceSource: "measured-lifecycle-check",
    measurementKind: "child-process-lifecycle",
    processLifecycleActual: true,
    childProcessLifecycle: true,
    shutdownRestartSummary: lifecycleProof.shutdownRestartSummary,
    lifecycleClasses: lifecycleProof.shutdownEvidence,
  };
  const boundedLifecycle = objectOrEmpty(summary.boundedLifecycle);
  if (Object.keys(boundedLifecycle).length > 0) {
    summary.boundedLifecycle = {
      ...boundedLifecycle,
      processRestartActual: lifecycleProof.processRestartActual,
      childProcessLifecycle: true,
      restartEvidence: lifecycleProof.restartEvidence,
      staleOutputCleanEvidence: lifecycleProof.staleOutputCleanEvidence,
      lifecycleTransitions: Array.isArray(boundedLifecycle.lifecycleTransitions) && boundedLifecycle.lifecycleTransitions.length > 0
        ? boundedLifecycle.lifecycleTransitions
        : [{
          segmentIndex: null,
          beforeChildPid: lifecycleProof.restartEvidence.beforeChildPid,
          afterChildPid: lifecycleProof.restartEvidence.afterChildPid,
          classification: "child-process-lifecycle",
          processRestartActual: lifecycleProof.processRestartActual,
          childProcessLifecycle: true,
        }],
    };
  }
  return summary;
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
  promotionTarget,
  nano6Soak,
  soakDurationSec,
  soakSampleIntervalSec,
  shutdownRestartEvidence,
  boundedLifecycle,
  recycleAfterSegments,
  recycleRssThresholdMb,
  measureRestartCost,
  warmSpare,
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
    nano6Soak,
    soakDurationSec,
    soakSampleIntervalSec,
    shutdownRestartEvidence,
    boundedLifecycle,
    recycleAfterSegments,
    recycleRssThresholdMb,
    measureRestartCost,
    warmSpare,
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
      let residentSummary = parsed.summary;
      if (runtimeMode === "resident" && shutdownRestartEvidence) {
        const lifecycleProof = await measureNano6ProcessLifecycleEvidence({
          commandInfo,
          projectRoot,
          runId: effectiveRunId,
          outputDir: effectiveOutputDir,
        });
        residentSummary = mergeNano6ProcessLifecycleEvidence(residentSummary, lifecycleProof);
      }
      const summary = runtimeMode === "resident"
        ? normalizeResidentSummary(residentSummary, {
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
          promotionTarget,
          nano6Soak,
          soakDurationSec,
          soakSampleIntervalSec,
          shutdownRestartEvidence,
          boundedLifecycle,
          recycleAfterSegments,
          recycleRssThresholdMb,
          measureRestartCost,
          warmSpare,
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
      let residentSummary = parsed.summary;
      if (runtimeMode === "resident" && shutdownRestartEvidence) {
        const lifecycleProof = await measureNano6ProcessLifecycleEvidence({
          commandInfo,
          projectRoot,
          runId: effectiveRunId,
          outputDir: effectiveOutputDir,
        });
        residentSummary = mergeNano6ProcessLifecycleEvidence(residentSummary, lifecycleProof);
      }
      const summary = runtimeMode === "resident"
        ? normalizeResidentSummary(residentSummary, {
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
          promotionTarget,
          nano6Soak,
          soakDurationSec,
          soakSampleIntervalSec,
          shutdownRestartEvidence,
          boundedLifecycle,
          recycleAfterSegments,
          recycleRssThresholdMb,
          measureRestartCost,
          warmSpare,
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
    "  --nano6-soak",
    "  --soak-duration-sec <n>",
    "  --soak-sample-interval-sec <n>",
    "  --shutdown-restart-evidence",
    "  --bounded-lifecycle",
    "  --recycle-after-segments <n>",
    "  --recycle-rss-threshold-mb <mb>",
    "  --measure-restart-cost",
    "  --warm-spare",
    "  --promotion-target <target>",
    "  --nano5c-segment-first-soak",
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
    promotionTarget: args.promotionTarget,
    nano6Soak: args.nano6Soak,
    soakDurationSec: args.soakDurationSec,
    soakSampleIntervalSec: args.soakSampleIntervalSec,
    shutdownRestartEvidence: args.shutdownRestartEvidence,
    boundedLifecycle: args.boundedLifecycle,
    recycleAfterSegments: args.recycleAfterSegments,
    recycleRssThresholdMb: args.recycleRssThresholdMb,
    measureRestartCost: args.measureRestartCost,
    warmSpare: args.warmSpare,
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
