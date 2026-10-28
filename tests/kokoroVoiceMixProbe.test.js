import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const probeUrl = new URL("../scripts/kokoro_voice_mix_probe.mjs", import.meta.url);

async function importProbe() {
  const module = await import(`${probeUrl.href}?case=${Date.now()}-${Math.random()}`);
  expect(module.parseArgs).toEqual(expect.any(Function));
  expect(module.parseVoiceFormula).toEqual(expect.any(Function));
  expect(module.runKokoroVoiceMixProbe).toEqual(expect.any(Function));
  return module;
}

async function makeTempProject() {
  return fs.mkdtemp(path.join(os.tmpdir(), "blurby-kokoro-voice-mix-probe-"));
}

describe("Kokoro voice mix probe", () => {
  const tempDirs = [];

  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));
    tempDirs.length = 0;
  });

  it("parses CLI options for formula probing", async () => {
    const { parseArgs } = await importProbe();
    expect(parseArgs([
      "--run-id",
      "mix-1",
      "--out",
      "artifacts/kokoro/mix",
      "--cache-dir",
      ".runtime/kokoro/models",
      "--model-id",
      "onnx-community/Kokoro-82M-v1.0-ONNX",
      "--dtype",
      "q4",
      "--base-voice",
      "af_heart",
      "--formulas",
      "af_bella:0.7+af_heart:0.3,af_bella:1+af_heart:0",
      "--speed",
      "1.2",
      "--json",
    ])).toMatchObject({
      runId: "mix-1",
      outputDir: "artifacts/kokoro/mix",
      cacheDir: ".runtime/kokoro/models",
      modelId: "onnx-community/Kokoro-82M-v1.0-ONNX",
      dtype: "q4",
      baseVoice: "af_heart",
      formulas: ["af_bella:0.7+af_heart:0.3", "af_bella:1+af_heart:0"],
      speed: 1.2,
      json: true,
    });
  });

  it("rejects zero and negative weights in formula parsing", async () => {
    const { parseVoiceFormula } = await importProbe();
    expect(parseVoiceFormula("af_bella:1+af_heart:0")).toMatchObject({
      valid: false,
      reason: expect.stringContaining("must be > 0"),
    });
    expect(parseVoiceFormula("af_bella:1+af_heart:-0.2")).toMatchObject({
      valid: false,
      reason: expect.stringContaining("must be > 0"),
    });
  });

  it("produces a non-viable verdict when runtime rejects weighted formula strings", async () => {
    const { runKokoroVoiceMixProbe } = await importProbe();
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const outputDir = path.join(projectRoot, "artifacts", "kokoro", "voice-mix-probe");
    const result = await runKokoroVoiceMixProbe({
      projectRoot,
      outputDir,
      runId: "mix-non-viable",
      baseVoice: "af_bella",
      formulas: [
        "af_bella:0.7+af_heart:0.3",
        "af_bella:1+af_heart:0",
        "af_bella:1+af_heart:-0.2",
      ],
      validatorFactory: async () => ({
        type: "loaded",
        info: { source: "test-double" },
        listVoices: async () => ["af_bella", "af_heart"],
        validateVoice: async (voice) => {
          if (voice === "af_bella" || voice === "af_heart") return true;
          throw new Error(`Voice ${voice} not found`);
        },
      }),
      now: () => new Date("2026-05-11T14:00:00.000Z"),
    });

    expect(result.verdict).toMatchObject({
      status: "non-viable",
    });
    const weightedCase = result.results.find((entry) => entry.input === "af_bella:0.7+af_heart:0.3");
    expect(weightedCase).toMatchObject({
      runtime: { accepted: false },
    });
    expect(weightedCase.componentChecks).toEqual([
      expect.objectContaining({ voiceId: "af_bella", accepted: true }),
      expect.objectContaining({ voiceId: "af_heart", accepted: true }),
    ]);
    await expect(fs.readFile(result.summaryJsonPath, "utf8")).resolves.toContain("\"status\": \"non-viable\"");
    await expect(fs.readFile(result.summaryPath, "utf8")).resolves.toContain("Kokoro Voice Mix Probe");
  });
});
