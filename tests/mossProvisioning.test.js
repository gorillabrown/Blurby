import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mossPreflightUrl = new URL("../scripts/moss_preflight.mjs", import.meta.url);
const mossPreflightScript = path.join(repoRoot, "scripts", "moss_preflight.mjs");

async function makeTempProject() {
  return fs.mkdtemp(path.join(os.tmpdir(), "blurby-moss-preflight-"));
}

async function importMossPreflight() {
  const module = await import(`${mossPreflightUrl.href}?case=${Date.now()}-${Math.random()}`);
  expect(module.runMossPreflight).toEqual(expect.any(Function));
  return module;
}

function configPathFor(projectRoot) {
  return path.join(projectRoot, ".runtime", "moss", "config.json");
}

async function writeConfig(projectRoot, config) {
  const configPath = configPathFor(projectRoot);
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(
    configPath,
    typeof config === "string" ? config : JSON.stringify(config, null, 2),
    "utf8",
  );
  return configPath;
}

async function writePackageJson(projectRoot, packageJson) {
  await fs.writeFile(
    path.join(projectRoot, "package.json"),
    JSON.stringify(packageJson, null, 2),
    "utf8",
  );
}

async function makeDir(projectRoot, ...segments) {
  const dir = path.join(projectRoot, ...segments);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function makeValidConfig(projectRoot, overrides = {}) {
  const repoDir = await makeDir(projectRoot, "moss-repo");
  const llamaCppDir = await makeDir(projectRoot, "llama.cpp");
  const modelDir = await makeDir(projectRoot, "models", "moss");
  const audioTokenizerDir = await makeDir(projectRoot, "models", "audio-tokenizer");
  const pythonExe = process.execPath;

  return {
    pythonExe,
    repoDir,
    llamaCppDir,
    modelDir,
    audioTokenizerDir,
    backend: "llama-cpp-onnx",
    device: "cpu",
    hostProfile: "local-dev",
    modelVariant: "moss-tts",
    quant: "q4_k_m",
    threads: 4,
    ...overrides,
  };
}

async function makeNanoConfig(projectRoot, overrides = {}) {
  const sourceDir = await makeDir(projectRoot, ".runtime", "moss", "MOSS-TTS-Nano");
  const modelDir = await makeDir(projectRoot, ".runtime", "moss", "weights", "MOSS-TTS-Nano-ONNX");
  const tokenizerDir = await makeDir(projectRoot, ".runtime", "moss", "weights", "MOSS-Audio-Tokenizer-Nano-ONNX");
  const venvDir = await makeDir(projectRoot, ".runtime", "moss", "venv");
  await fs.writeFile(path.join(modelDir, "model.onnx"), "fake model", "utf8");
  await fs.writeFile(path.join(tokenizerDir, "model.onnx"), "fake tokenizer", "utf8");
  return makeValidConfig(projectRoot, {
    repoDir: sourceDir,
    modelDir,
    audioTokenizerDir: tokenizerDir,
    sourceDir,
    tokenizerDir,
    venvDir,
    backend: "moss-nano-onnx",
    modelVariant: "moss-tts-nano-onnx",
    source: {
      repository: "https://github.com/OpenMOSS/MOSS-TTS",
      revision: "nano6-package-ready",
    },
    license: {
      model: "Apache-2.0",
      tokenizer: "Apache-2.0",
    },
    updatePolicy: "manual-download",
    privacyPolicy: "local-only",
    shipVsDownloadDecision: "download-at-setup",
    ...overrides,
  });
}

async function runPreflight(projectRoot) {
  const { runMossPreflight } = await importMossPreflight();
  return runMossPreflight({ projectRoot, now: () => new Date("2026-04-26T12:00:00.000Z") });
}

async function expectPreflightReason(projectRoot, expectedReason) {
  const report = await runPreflight(projectRoot);
  expect(report).toMatchObject({
    status: expect.not.stringMatching(/^ready$/),
    reason: expectedReason,
  });
  return report;
}

describe("MOSS provisioning preflight", () => {
  const tempDirs = [];

  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));
    tempDirs.length = 0;
  });

  it("returns config-missing when config is absent", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);

    await expectPreflightReason(projectRoot, "config-missing");
  });

  it("returns config-invalid when config JSON cannot be parsed", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, "{ not-valid-json");

    await expectPreflightReason(projectRoot, "config-invalid");
  });

  it("returns config-invalid for a null JSON config and --json remains parseable", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, "null");

    await expectPreflightReason(projectRoot, "config-invalid");

    await expect(execFileAsync(process.execPath, [mossPreflightScript, "--json"], {
      cwd: projectRoot,
      encoding: "utf8",
    })).rejects.toMatchObject({
      stdout: expect.stringMatching(/"reason": "config-invalid"/),
    });

    try {
      await execFileAsync(process.execPath, [mossPreflightScript, "--json"], {
        cwd: projectRoot,
        encoding: "utf8",
      });
    } catch (error) {
      expect(() => JSON.parse(error.stdout)).not.toThrow();
    }
  });

  it("returns python-missing when pythonExe is missing", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { pythonExe, ...config } = await makeValidConfig(projectRoot);
    await writeConfig(projectRoot, config);

    await expectPreflightReason(projectRoot, "python-missing");
  });

  it("returns python-missing when pythonExe points to a directory", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const pythonExe = await makeDir(projectRoot, "python-dir");
    await writeConfig(projectRoot, await makeValidConfig(projectRoot, { pythonExe }));

    await expectPreflightReason(projectRoot, "python-missing");
  });

  it("returns repo-missing when repoDir is missing", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { repoDir, ...config } = await makeValidConfig(projectRoot);
    await writeConfig(projectRoot, config);

    await expectPreflightReason(projectRoot, "repo-missing");
  });

  it("returns repo-missing when repoDir points to a file", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const repoDir = path.join(projectRoot, "repo-file");
    await fs.writeFile(repoDir, "", "utf8");
    await writeConfig(projectRoot, await makeValidConfig(projectRoot, { repoDir }));

    await expectPreflightReason(projectRoot, "repo-missing");
  });

  it("returns llama-cpp-missing when llamaCppDir is missing", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { llamaCppDir, ...config } = await makeValidConfig(projectRoot);
    await writeConfig(projectRoot, config);

    await expectPreflightReason(projectRoot, "llama-cpp-missing");
  });

  it("returns llama-cpp-missing when llamaCppDir points to a file", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const llamaCppDir = path.join(projectRoot, "llama.cpp-file");
    await fs.writeFile(llamaCppDir, "", "utf8");
    await writeConfig(projectRoot, await makeValidConfig(projectRoot, { llamaCppDir }));

    await expectPreflightReason(projectRoot, "llama-cpp-missing");
  });

  it("returns model-assets-missing when modelDir is missing", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { modelDir, ...config } = await makeValidConfig(projectRoot);
    await writeConfig(projectRoot, config);

    await expectPreflightReason(projectRoot, "model-assets-missing");
  });

  it("returns model-assets-missing when modelDir points to a file", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const modelDir = path.join(projectRoot, "model-assets-file");
    await fs.writeFile(modelDir, "", "utf8");
    await writeConfig(projectRoot, await makeValidConfig(projectRoot, { modelDir }));

    await expectPreflightReason(projectRoot, "model-assets-missing");
  });

  it("returns tokenizer-assets-missing when audioTokenizerDir is missing", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const { audioTokenizerDir, ...config } = await makeValidConfig(projectRoot);
    await writeConfig(projectRoot, config);

    await expectPreflightReason(projectRoot, "tokenizer-assets-missing");
  });

  it("returns tokenizer-assets-missing when audioTokenizerDir points to a file", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const audioTokenizerDir = path.join(projectRoot, "audio-tokenizer-file");
    await fs.writeFile(audioTokenizerDir, "", "utf8");
    await writeConfig(projectRoot, await makeValidConfig(projectRoot, { audioTokenizerDir }));

    await expectPreflightReason(projectRoot, "tokenizer-assets-missing");
  });

  it("returns backend-unsupported for unsupported backend values", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, await makeValidConfig(projectRoot, { backend: "webgpu" }));

    await expectPreflightReason(projectRoot, "backend-unsupported");
  });

  it.each(["cuda", "cuda:0"])("returns device-unsupported for unsupported device value %s", async (device) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, await makeValidConfig(projectRoot, { device }));

    await expectPreflightReason(projectRoot, "device-unsupported");
  });

  it("returns ready for a valid mocked config", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, await makeValidConfig(projectRoot));

    await expect(runPreflight(projectRoot)).resolves.toMatchObject({
      status: "ready",
      reason: null,
    });
  });

  it("includes host profile, model metadata, timing, and check details in the report", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, await makeValidConfig(projectRoot, {
      hostProfile: "strix-halo",
      modelVariant: "moss-tts-base",
      quant: "q5_k_m",
      threads: 8,
    }));

    const report = await runPreflight(projectRoot);

    expect(report).toMatchObject({
      hostProfile: "strix-halo",
      modelVariant: "moss-tts-base",
      quant: "q5_k_m",
      threads: 8,
      checkedAt: "2026-04-26T12:00:00.000Z",
      checks: expect.any(Array),
    });
    expect(report.checks.length).toBeGreaterThan(0);
    expect(report.checks[0]).toEqual(expect.objectContaining({
      key: expect.any(String),
      status: expect.any(String),
      detail: expect.any(String),
    }));
  });

  it("includes MOSS-NANO-6 package readiness metadata and .runtime exclusion safeguards", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writePackageJson(projectRoot, {
      build: {
        files: ["dist/**", "package.json"],
        extraResources: [
          { from: "assets", to: "assets", filter: ["**/*"] },
        ],
      },
    });
    const config = await makeNanoConfig(projectRoot, { pythonVersion: "3.11.9" });
    await writeConfig(projectRoot, config);

    const report = await runPreflight(projectRoot);

    expect(report).toMatchObject({
      status: "ready",
      sourceDir: config.sourceDir,
      modelDir: config.modelDir,
      tokenizerDir: config.tokenizerDir,
      venvDir: config.venvDir,
      pythonVersion: expect.stringMatching(/^\d+\.\d+\.\d+/),
      packageVersions: expect.objectContaining({
        onnxruntime: expect.any(String),
        numpy: expect.any(String),
        sentencepiece: expect.any(String),
      }),
      assetSizes: expect.objectContaining({
        modelBytes: expect.any(Number),
        tokenizerBytes: expect.any(Number),
      }),
      venvFootprintBytes: expect.any(Number),
      setupTimeSec: expect.any(Number),
      license: expect.objectContaining({
        model: expect.any(String),
        tokenizer: expect.any(String),
      }),
      source: expect.objectContaining({
        repository: expect.any(String),
        revision: expect.any(String),
      }),
      updatePolicy: expect.any(String),
      privacyPolicy: expect.any(String),
      shipVsDownloadDecision: expect.stringMatching(/download|ship/i),
      packageSafeguards: expect.objectContaining({
        runtimeGlobExcluded: true,
        runtimeDirPackaged: false,
        packageResourceAllowlist: expect.any(Array),
      }),
      nanoPackageEvidence: expect.objectContaining({
        status: "ready",
      }),
    });
    expect(report.packageSafeguards.packageResourceAllowlist).not.toContain(".runtime/**");
    expect(report.checks).toContainEqual(expect.objectContaining({
      key: "packageSafeguards",
      status: "pass",
    }));
  });

  it("does not report Nano package evidence for a legacy flagship runtime config", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, await makeValidConfig(projectRoot, {
      backend: "llama-cpp-onnx",
      modelVariant: "moss-tts-base",
    }));

    const report = await runPreflight(projectRoot);

    expect(report).toMatchObject({
      status: "ready",
      nanoPackageEvidence: expect.objectContaining({
        status: "not-ready",
        reason: "not-nano-package-evidence",
      }),
    });
    expect(report.sourceDir).toBeUndefined();
    expect(report.packageSafeguards).toBeUndefined();
    expect(report.checks).toContainEqual(expect.objectContaining({
      key: "nanoPackageEvidence",
      status: "blocker",
    }));
  });

  it("does not reuse the Node runtime version as Nano pythonVersion", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, await makeNanoConfig(projectRoot));

    const report = await runPreflight(projectRoot);

    expect(report.pythonVersion).not.toBe(process.version);
    if (report.pythonVersion === "unknown") {
      expect(report.pythonVersionReason).toMatch(/python.*version/i);
    } else {
      expect(report.pythonVersion).toMatch(/^\d+\.\d+\.\d+/);
    }
  });

  it.each([
    ["build.files broad glob", { build: { files: ["**/*"] } }],
    ["extraResources broad from scope", { build: { files: ["dist/**"], extraResources: [{ from: ".", to: ".", filter: ["**/*"] }] } }],
  ])("marks Nano package evidence not-ready when package config can include .runtime via %s", async (_caseName, packageJson) => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writePackageJson(projectRoot, packageJson);
    await writeConfig(projectRoot, await makeNanoConfig(projectRoot, { pythonVersion: "3.11.9" }));

    const report = await runPreflight(projectRoot);

    expect(report).toMatchObject({
      status: "unsupported",
      reason: "package-safeguards-failed",
      nanoPackageEvidence: expect.objectContaining({
        status: "not-ready",
        reason: "package-safeguards-failed",
      }),
      packageSafeguards: expect.objectContaining({
        runtimeGlobExcluded: false,
      }),
    });
    expect(report.checks).toContainEqual(expect.objectContaining({
      key: "packageSafeguards",
      status: "fail",
    }));
  });

  it("--json outputs parseable JSON", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, await makeValidConfig(projectRoot));

    const { stdout } = await execFileAsync(process.execPath, [mossPreflightScript, "--json"], {
      cwd: projectRoot,
      encoding: "utf8",
    });

    expect(() => JSON.parse(stdout)).not.toThrow();
    expect(JSON.parse(stdout)).toMatchObject({
      status: "ready",
      reason: null,
      checks: expect.any(Array),
    });
  });
});
