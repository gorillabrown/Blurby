import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const DEFAULT_OUTPUT_DIR = path.join("artifacts", "kokoro", "voice-mix-probe");
const DEFAULT_CACHE_DIR = path.join(".runtime", "kokoro", "models");
const DEFAULT_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const DEFAULT_DTYPE = "q4";
const DEFAULT_BASE_VOICE = "af_bella";
const DEFAULT_FORMULAS = Object.freeze([
  "af_bella:0.7+af_heart:0.3",
  "af_bella:1+af_heart:0",
  "af_bella:1+af_heart:-0.2",
  "af_bella:0.5+zz_missing:0.5",
]);

function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function parseCsv(value) {
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}

function parsePositiveNumber(value, flag) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${flag} requires a positive number`);
  }
  return parsed;
}

function toIsoString(now) {
  const value = typeof now === "function" ? now() : new Date();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function defaultRunId(now) {
  return `kokoro-voice-mix-probe-${toIsoString(now).replace(/[:.]/g, "-")}`;
}

function resolveRunOutputDir(outputDir, runId) {
  if (path.basename(path.resolve(outputDir)) === runId) {
    return outputDir;
  }
  return path.join(outputDir, runId);
}

export function parseVoiceFormula(formula) {
  const normalized = String(formula ?? "").trim();
  if (!normalized) {
    return {
      valid: false,
      reason: "Formula is empty",
      components: [],
      totalWeight: null,
    };
  }
  const parts = normalized.split("+").map((part) => part.trim()).filter(Boolean);
  if (!parts.length) {
    return {
      valid: false,
      reason: "Formula has no components",
      components: [],
      totalWeight: null,
    };
  }
  const components = [];
  for (const part of parts) {
    const piece = part.split(":");
    const voiceId = piece[0]?.trim();
    if (!voiceId) {
      return {
        valid: false,
        reason: `Missing voice id in component "${part}"`,
        components: [],
        totalWeight: null,
      };
    }
    const hasWeight = piece.length > 1;
    const rawWeight = hasWeight ? piece.slice(1).join(":").trim() : "1";
    const weight = Number.parseFloat(rawWeight);
    if (!Number.isFinite(weight)) {
      return {
        valid: false,
        reason: `Weight "${rawWeight}" is not numeric`,
        components: [],
        totalWeight: null,
      };
    }
    if (weight <= 0) {
      return {
        valid: false,
        reason: `Weight for "${voiceId}" must be > 0`,
        components: [],
        totalWeight: null,
      };
    }
    components.push({ voiceId, weight });
  }
  const totalWeight = components.reduce((sum, component) => sum + component.weight, 0);
  return {
    valid: true,
    reason: null,
    components,
    totalWeight,
  };
}

async function createRuntimeValidator({
  cacheDir = DEFAULT_CACHE_DIR,
  modelId = DEFAULT_MODEL_ID,
  dtype = DEFAULT_DTYPE,
} = {}) {
  let KokoroTTS = null;
  try {
    const [kokoroModule, transformersModule] = await Promise.all([
      import("kokoro-js"),
      import("@huggingface/transformers"),
    ]);
    KokoroTTS = kokoroModule?.KokoroTTS ?? null;
    if (transformersModule?.env && cacheDir) {
      transformersModule.env.cacheDir = cacheDir;
    }
  } catch (error) {
    return {
      type: "unavailable",
      info: {
        error: error instanceof Error ? error.message : String(error),
      },
      validateVoice: async () => {
        throw new Error("kokoro-js runtime unavailable");
      },
      listVoices: async () => [],
    };
  }

  if (!KokoroTTS || typeof KokoroTTS.from_pretrained !== "function") {
    return {
      type: "unavailable",
      info: { error: "KokoroTTS.from_pretrained is unavailable" },
      validateVoice: async () => {
        throw new Error("KokoroTTS.from_pretrained unavailable");
      },
      listVoices: async () => [],
    };
  }

  const tts = await KokoroTTS.from_pretrained(modelId, {
    dtype,
    device: "cpu",
  });
  const availableVoices = Object.keys(tts?.voices || {}).sort();
  return {
    type: "loaded",
    info: {
      modelId,
      dtype,
      voiceCount: availableVoices.length,
    },
    listVoices: async () => availableVoices,
    validateVoice: async (voice) => {
      if (typeof tts._validate_voice !== "function") {
        throw new Error("_validate_voice is unavailable on KokoroTTS instance");
      }
      tts._validate_voice(voice);
      return true;
    },
  };
}

async function evaluateRuntimeVoice(validateVoice, voice) {
  try {
    await validateVoice(voice);
    return { accepted: true, error: null };
  } catch (error) {
    return {
      accepted: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function buildProbeCases(baseVoice, formulaList) {
  const cases = [
    { id: "base-voice", input: baseVoice },
  ];
  for (let index = 0; index < formulaList.length; index += 1) {
    cases.push({
      id: `formula-${index + 1}`,
      input: formulaList[index],
    });
  }
  return cases;
}

function computeVerdict(caseResults) {
  const weightedCases = caseResults.filter((entry) => entry.parse.valid && entry.parse.components.length > 1);
  const acceptedWeighted = weightedCases.filter((entry) => entry.runtime.accepted);
  if (acceptedWeighted.length > 0) {
    return {
      status: "viable",
      reason: "At least one weighted formula string was accepted by runtime validation.",
    };
  }
  return {
    status: "non-viable",
    reason: "No weighted formula string was accepted by kokoro-js runtime validation.",
  };
}

export function formatSummaryText(summary) {
  return [
    "Kokoro Voice Mix Probe",
    "======================",
    `Status: ${summary.verdict.status}`,
    `Run ID: ${summary.runId}`,
    `Checked At: ${summary.checkedAt}`,
    `Reason: ${summary.verdict.reason}`,
    "",
    "Cases",
    "-----",
    ...summary.results.map((result) => {
      const parse = result.parse.valid
        ? `parse=ok components=${result.parse.components.length} totalWeight=${result.parse.totalWeight}`
        : `parse=fail reason=${result.parse.reason}`;
      const runtime = result.runtime.accepted
        ? "runtime=accepted"
        : `runtime=rejected error=${result.runtime.error}`;
      return `- ${result.id}: "${result.input}" ${parse} ${runtime}`;
    }),
    "",
  ].join("\n");
}

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    json: false,
    runId: null,
    outputDir: DEFAULT_OUTPUT_DIR,
    cacheDir: DEFAULT_CACHE_DIR,
    modelId: DEFAULT_MODEL_ID,
    dtype: DEFAULT_DTYPE,
    baseVoice: DEFAULT_BASE_VOICE,
    formulas: [...DEFAULT_FORMULAS],
    speed: 1.0,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") {
      args.json = true;
    } else if (arg === "--run-id") {
      args.runId = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--out" || arg === "--output-dir") {
      args.outputDir = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--cache-dir") {
      args.cacheDir = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--model-id") {
      args.modelId = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--dtype") {
      args.dtype = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--base-voice") {
      args.baseVoice = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--formulas") {
      args.formulas = parseCsv(requireValue(argv, index, arg));
      index += 1;
    } else if (arg === "--speed") {
      args.speed = parsePositiveNumber(requireValue(argv, index, arg), arg);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

export async function runKokoroVoiceMixProbe({
  projectRoot = process.cwd(),
  runId,
  outputDir = DEFAULT_OUTPUT_DIR,
  cacheDir = DEFAULT_CACHE_DIR,
  modelId = DEFAULT_MODEL_ID,
  dtype = DEFAULT_DTYPE,
  baseVoice = DEFAULT_BASE_VOICE,
  formulas = DEFAULT_FORMULAS,
  validatorFactory = createRuntimeValidator,
  now = () => new Date(),
  fsModule = fs,
} = {}) {
  const effectiveRunId = runId ?? defaultRunId(now);
  const effectiveOutputDir = resolveRunOutputDir(path.resolve(projectRoot, outputDir), effectiveRunId);
  await fsModule.mkdir(effectiveOutputDir, { recursive: true });

  const runtime = await validatorFactory({
    cacheDir: path.resolve(projectRoot, cacheDir),
    modelId,
    dtype,
  });
  const availableVoices = await runtime.listVoices();
  const probeCases = buildProbeCases(baseVoice, formulas);
  const results = [];

  for (const probeCase of probeCases) {
    const parse = parseVoiceFormula(probeCase.input);
    const runtimeCheck = await evaluateRuntimeVoice(runtime.validateVoice, probeCase.input);
    const componentChecks = [];
    if (parse.valid && parse.components.length > 1) {
      for (const component of parse.components) {
        const check = await evaluateRuntimeVoice(runtime.validateVoice, component.voiceId);
        componentChecks.push({
          voiceId: component.voiceId,
          weight: component.weight,
          accepted: check.accepted,
          error: check.error,
        });
      }
    }
    results.push({
      id: probeCase.id,
      input: probeCase.input,
      parse,
      runtime: runtimeCheck,
      componentChecks,
    });
  }

  const verdict = computeVerdict(results);
  const summary = {
    runId: effectiveRunId,
    checkedAt: toIsoString(now),
    outputDir: effectiveOutputDir,
    runtime: {
      type: runtime.type,
      info: runtime.info,
      availableVoiceCount: availableVoices.length,
      sampleVoices: availableVoices.slice(0, 10),
    },
    inputs: {
      baseVoice,
      formulas,
      modelId,
      dtype,
      cacheDir: path.resolve(projectRoot, cacheDir),
    },
    verdict,
    results,
  };

  const summaryJsonPath = path.join(effectiveOutputDir, "summary.json");
  const summaryPath = path.join(effectiveOutputDir, "summary.txt");
  await fsModule.writeFile(summaryJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  await fsModule.writeFile(summaryPath, formatSummaryText(summary), "utf8");
  return {
    ...summary,
    summaryJsonPath,
    summaryPath,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const result = await runKokoroVoiceMixProbe({
    projectRoot: process.cwd(),
    runId: args.runId,
    outputDir: args.outputDir,
    cacheDir: args.cacheDir,
    modelId: args.modelId,
    dtype: args.dtype,
    baseVoice: args.baseVoice,
    formulas: args.formulas,
  });
  process.stdout.write(args.json ? `${JSON.stringify(result, null, 2)}\n` : formatSummaryText(result));
  process.exitCode = result.verdict.status === "viable" ? 0 : 1;
  return result;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`Kokoro voice mix probe failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
