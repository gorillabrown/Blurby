import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

function getMetric(aggregate, metricPath) {
  return String(metricPath || "")
    .split(".")
    .filter(Boolean)
    .reduce((value, segment) => (value == null ? undefined : value[segment]), aggregate);
}

function compare(actual, op, expected) {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return false;
  if (op === "<=") return actual <= expected;
  if (op === "<") return actual < expected;
  if (op === ">=") return actual >= expected;
  if (op === ">") return actual > expected;
  if (op === "==") return actual === expected;
  throw new Error(`Unsupported gate operator "${op}"`);
}

function evaluateRule(aggregate, rule, severity) {
  const actual = getMetric(aggregate, rule.metric);
  const passed = compare(actual, rule.op, rule.value);
  return {
    id: rule.id,
    metric: rule.metric,
    severity,
    op: rule.op,
    expected: rule.value,
    actual: Number.isFinite(actual) ? actual : null,
    unit: rule.unit || null,
    reason: rule.reason || "",
    passed,
  };
}

export function evaluateQualityGates({ aggregate, gateConfig, evaluatedAt = null }) {
  if (!aggregate || typeof aggregate !== "object") throw new Error("Missing aggregate summary data.");
  if (!gateConfig || typeof gateConfig !== "object") throw new Error("Missing gate configuration.");

  const hardRules = Array.isArray(gateConfig.hardFail) ? gateConfig.hardFail : [];
  const warnRules = Array.isArray(gateConfig.warnOnly) ? gateConfig.warnOnly : [];

  const hardResults = hardRules.map((rule) => evaluateRule(aggregate, rule, "hard"));
  const warnResults = warnRules.map((rule) => evaluateRule(aggregate, rule, "warn"));
  const failedHard = hardResults.filter((result) => !result.passed);
  const failedWarn = warnResults.filter((result) => !result.passed);

  return {
    schemaVersion: "1.0",
    gateVersion: gateConfig.gateVersion || "unknown",
    evaluatedAt: evaluatedAt || new Date().toISOString(),
    pass: failedHard.length === 0,
    counts: {
      hardRules: hardResults.length,
      warnRules: warnResults.length,
      hardFailures: failedHard.length,
      warnings: failedWarn.length,
    },
    failures: failedHard,
    warnings: failedWarn,
    results: [...hardResults, ...warnResults],
    aggregate,
  };
}

export function formatGateReport(report) {
  const status = report.pass ? "PASS" : "FAIL";
  const lines = [
    `Gate status: ${status}`,
    `Gate version: ${report.gateVersion}`,
    `Hard failures: ${report.counts.hardFailures}/${report.counts.hardRules}`,
    `Warnings: ${report.counts.warnings}/${report.counts.warnRules}`,
  ];

  if (report.failures.length) {
    lines.push("", "Hard-fail breaches:");
    for (const failure of report.failures) {
      lines.push(
        `- [${failure.id}] ${failure.metric} ${failure.op} ${failure.expected}${failure.unit ? ` ${failure.unit}` : ""}; actual=${failure.actual}`
      );
      if (failure.reason) lines.push(`  reason: ${failure.reason}`);
    }
  }

  if (report.warnings.length) {
    lines.push("", "Warning breaches:");
    for (const warning of report.warnings) {
      lines.push(
        `- [${warning.id}] ${warning.metric} ${warning.op} ${warning.expected}${warning.unit ? ` ${warning.unit}` : ""}; actual=${warning.actual}`
      );
      if (warning.reason) lines.push(`  reason: ${warning.reason}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(path.resolve(filePath), "utf8"));
}

async function writeJsonAtomic(filePath, value) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}

export async function runGateEvaluation({
  aggregatePath,
  gatePath,
  outDir = null,
  reportBaseName = "gate-report",
  evaluatedAt = null,
}) {
  const aggregate = await readJson(aggregatePath);
  const gateConfig = await readJson(gatePath);
  const report = evaluateQualityGates({ aggregate, gateConfig, evaluatedAt });

  const reportDir = outDir ? path.resolve(outDir) : path.dirname(path.resolve(aggregatePath));
  await fs.mkdir(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, `${reportBaseName}.json`);
  const textPath = path.join(reportDir, `${reportBaseName}.txt`);
  await writeJsonAtomic(jsonPath, report);
  await fs.writeFile(textPath, formatGateReport(report), "utf8");

  return { report, jsonPath, textPath };
}

function parseCliArgs(argv) {
  const args = {
    aggregatePath: "",
    gatePath: "docs/testing/tts_quality_gates.v1.json",
    outDir: null,
    reportBaseName: "gate-report",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--aggregate") {
      args.aggregatePath = argv[i + 1] || "";
      i += 1;
      continue;
    }
    if (token === "--gates") {
      args.gatePath = argv[i + 1] || args.gatePath;
      i += 1;
      continue;
    }
    if (token === "--out") {
      args.outDir = argv[i + 1] || args.outDir;
      i += 1;
      continue;
    }
    if (token === "--report-base") {
      args.reportBaseName = argv[i + 1] || args.reportBaseName;
      i += 1;
      continue;
    }
  }
  return args;
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (!args.aggregatePath) throw new Error("Missing required --aggregate <path> argument.");
  const { report, jsonPath, textPath } = await runGateEvaluation(args);
  // eslint-disable-next-line no-console
  console.log(`Gate ${report.pass ? "PASS" : "FAIL"} (${report.counts.hardFailures} hard failures, ${report.counts.warnings} warnings)`);
  // eslint-disable-next-line no-console
  console.log(`Artifacts: ${jsonPath} | ${textPath}`);
  if (!report.pass) process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("[tts_eval_gate] failed:", error.message);
    process.exitCode = 1;
  });
}
