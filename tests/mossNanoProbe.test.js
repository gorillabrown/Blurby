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
