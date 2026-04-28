import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { afterEach, describe, expect, it, vi } from "vitest";

const mossNanoProbeUrl = new URL("../scripts/moss_nano_probe.mjs", import.meta.url);

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
    ]));
    expect(commandInfo.args).toEqual(expect.arrayContaining([
      "--passage-text",
      "The little probe spoke once, paused, and finished cleanly.",
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
    expect(summary.summary.checks).toContainEqual(expect.objectContaining({
      key: "sourceRepo",
      status: "fail",
      failureClass: "source-download",
    }));
    expect(summary.summary.commandMetadata).toBeNull();
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
