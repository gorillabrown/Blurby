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
