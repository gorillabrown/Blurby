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
