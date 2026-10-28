import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { evaluateQualityGates, formatGateReport, runGateEvaluation } from "../scripts/tts_eval_gate.mjs";
import { parseArgs, runHarness } from "../scripts/tts_eval_runner.mjs";

const tempDirs: string[] = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "blurby-tts-gates-"));
  tempDirs.push(dir);
  return dir;
}

async function writeJson(filePath: string, value: unknown) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

afterEach(async () => {
  while (tempDirs.length) {
    const dir = tempDirs.pop();
    if (dir) await fs.rm(dir, { recursive: true, force: true });
  }
});

async function createRuntimeWithFiles(baseDir: string) {
  const fixtureDir = path.join(baseDir, "fixtures");
  await fs.mkdir(fixtureDir, { recursive: true });
  const prosePath = path.join(fixtureDir, "prose-basic.txt");
  await fs.writeFile(prosePath, "one two three four five", "utf8");

  const fixtureManifest = {
    fixtures: [
      { id: "prose-basic", title: "Prose", sourceType: "prose", expectedCoverage: [], notes: "", file: "prose-basic.txt" },
    ],
  };
  const matrixManifest = {
    scenarios: [
      { id: "smoke-1", fixtureId: "prose-basic", voiceId: "af_bella", requestedRate: 1.0, durationClass: "short", tags: ["smoke"] },
    ],
  };
  const fixtureLookup = new Map([
    [
      "prose-basic",
      {
        id: "prose-basic",
        title: "Prose",
        sourceType: "prose",
        expectedCoverage: [],
        notes: "",
        textPath: prosePath,
      },
    ],
  ]);
  return { fixtureManifest, matrixManifest, fixtureLookup };
}

describe("tts eval quality gates", () => {
  it("passes when all hard rules pass and tracks warn-only counts", () => {
    const report = evaluateQualityGates({
      aggregate: {
        startupLatency: { p50: 300, p95: 420, max: 500 },
        drift: { p95: 1, max: 3 },
        failureCounts: { pauseResumeFailures: 0, handoffFailures: 0 },
      },
      gateConfig: {
        gateVersion: "vtest",
        hardFail: [{ id: "a", metric: "startupLatency.p50", op: "<=", value: 400 }],
        warnOnly: [{ id: "b", metric: "drift.max", op: "<=", value: 2 }],
      },
    });
    expect(report.pass).toBe(true);
    expect(report.counts.hardFailures).toBe(0);
    expect(report.counts.warnings).toBe(1);
    expect(report.warnings[0].id).toBe("b");
  });

  it("fails when a hard rule is breached and includes explicit failure details", () => {
    const report = evaluateQualityGates({
      aggregate: {
        startupLatency: { p50: 480, p95: 600, max: 640 },
        drift: { p95: 2, max: 2 },
        failureCounts: { pauseResumeFailures: 1, handoffFailures: 0 },
      },
      gateConfig: {
        gateVersion: "vtest",
        hardFail: [{ id: "startup", metric: "startupLatency.p95", op: "<=", value: 500, reason: "tail too high" }],
        warnOnly: [],
      },
    });
    expect(report.pass).toBe(false);
    expect(report.failures).toHaveLength(1);
    expect(report.failures[0].id).toBe("startup");
    expect(formatGateReport(report)).toContain("Hard-fail breaches");
  });

  it("writes deterministic gate report artifacts", async () => {
    const outDir = await makeTempDir();
    const aggregatePath = path.join(outDir, "aggregate-summary.json");
    const gatePath = path.join(outDir, "gates.json");
    await writeJson(aggregatePath, {
      startupLatency: { p50: 200, p95: 300, max: 350 },
      drift: { p95: 0, max: 1 },
      failureCounts: { pauseResumeFailures: 0, handoffFailures: 0 },
    });
    await writeJson(gatePath, {
      gateVersion: "vtest",
      hardFail: [{ id: "pass", metric: "startupLatency.p50", op: "<=", value: 300 }],
      warnOnly: [],
    });

    const one = await runGateEvaluation({
      aggregatePath,
      gatePath,
      outDir,
      reportBaseName: "gate",
    } as any);
    const two = await runGateEvaluation({
      aggregatePath,
      gatePath,
      outDir,
      reportBaseName: "gate",
    } as any);

    const jsonOne = await fs.readFile(one.jsonPath, "utf8");
    const jsonTwo = await fs.readFile(two.jsonPath, "utf8");
    const textOne = await fs.readFile(one.textPath, "utf8");
    const textTwo = await fs.readFile(two.textPath, "utf8");
    expect(jsonOne).toBe(jsonTwo);
    expect(textOne).toBe(textTwo);
  });

  it("parses --gates as flag or explicit path", () => {
    const byFlag = parseArgs(["--gates"]);
    const byPath = parseArgs(["--gates", "docs/testing/custom-gates.json"]);
    expect(byFlag.gates).toBe(true);
    expect(byPath.gates).toBe("docs/testing/custom-gates.json");
  });

  it("runner emits gate-report artifacts when --gates is enabled", async () => {
    const outDir = await makeTempDir();
    const runtime = await createRuntimeWithFiles(outDir);
    const gatePath = path.join(outDir, "gates.json");
    await writeJson(gatePath, {
      gateVersion: "vtest",
      hardFail: [
        { id: "latency", metric: "startupLatency.p95", op: "<=", value: 1000 },
        { id: "drift", metric: "drift.p95", op: "<=", value: 10 },
      ],
      warnOnly: [{ id: "warn", metric: "startupLatency.max", op: "<=", value: 2000 }],
    });
    const args = parseArgs(["--matrix", "--run-id", "gated", "--out", outDir, "--gates", gatePath]);
    const result = await runHarness(args, runtime as any);
    expect(result.gate?.pass).toBe(true);
    await expect(fs.stat(path.join(outDir, "gate-report.json"))).resolves.toBeDefined();
    await expect(fs.stat(path.join(outDir, "gate-report.txt"))).resolves.toBeDefined();
  });
});
