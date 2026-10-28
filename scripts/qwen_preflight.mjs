import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createQwenEngineManager } = require("../main/qwen-engine.js");

const projectRoot = process.cwd();
const userDataPath = path.join(projectRoot, ".runtime", "qwen-preflight-userdata");
const manager = createQwenEngineManager({
  projectRoot,
  isPackaged: false,
  userDataPath,
});

function formatCheck(check) {
  return `- [${check.status.toUpperCase()}] ${check.label}: ${check.detail}`;
}

try {
  const report = await manager.preflight();
  const asJson = process.argv.includes("--json");

  if (asJson) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write("Qwen Runtime Preflight\n");
    process.stdout.write("======================\n");
    process.stdout.write(`Status: ${report.status}\n`);
    process.stdout.write(`Reason: ${report.reason ?? "none"}\n`);
    process.stdout.write(`Supported host: ${report.supportedHost ? "yes" : "no"}\n`);
    process.stdout.write(`Detail: ${report.detail ?? "No detail"}\n`);
    if (report.configPath) process.stdout.write(`Config path: ${report.configPath}\n`);
    if (report.requestedDevice) process.stdout.write(`Requested device: ${report.requestedDevice}\n`);
    if (report.pythonExe) process.stdout.write(`Python executable: ${report.pythonExe}\n`);
    if (report.modelId) process.stdout.write(`Model id: ${report.modelId}\n`);
    process.stdout.write(`Checked at: ${report.checkedAt}\n\n`);
    process.stdout.write("Checks\n");
    process.stdout.write("------\n");
    for (const check of report.checks) {
      process.stdout.write(`${formatCheck(check)}\n`);
    }
  }

  process.exitCode = report.supportedHost && report.status === "ready" ? 0 : 1;
} catch (error) {
  process.stderr.write(`Qwen preflight failed unexpectedly: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
