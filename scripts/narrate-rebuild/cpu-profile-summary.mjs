// NARRATE-CPU-PROFILE-1 A2; CPU-8 and its narrow/atomic amendments.
import * as fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { CONFIGURATIONS, ProfileInputError, slug, validateRecord, summarizeConfiguration, buildSummary } from "./lib/cpuprofile.mjs";

function parseArgs(args) {
  const positions = [], flags = new Set();
  for (const arg of args) {
    if (arg.startsWith("-")) {
      if (!["--synthetic", "--break"].includes(arg) || flags.has(arg)) return null;
      flags.add(arg);
    } else positions.push(arg);
  }
  return positions.length === 2 ? { recordsDir: positions[0], artifactsRoot: positions[1], synthetic: flags.has("--synthetic"), breakControl: flags.has("--break") } : null;
}

async function requireAbsent(file) {
  try { await fs.lstat(file); }
  catch (error) { if (error.code === "ENOENT") return; throw error; }
  throw new Error(`entry already exists: ${path.basename(file)}`);
}

async function publish(document, temporary, final) {
  const bytes = Buffer.from(`${JSON.stringify(document, null, 2)}\n`, "utf8");
  let handle = null, phase = "inspect";
  try {
    await requireAbsent(temporary); await requireAbsent(final);
    phase = "open"; handle = await fs.open(temporary, "wx");
    phase = "write"; await handle.writeFile(bytes);
    phase = "sync"; await handle.sync();
    phase = "close"; await handle.close(); handle = null;
    phase = "temporary-readback";
    if (!(await fs.readFile(temporary)).equals(bytes)) throw new Error("temporary bytes differ");
    phase = "link"; await fs.link(temporary, final);
    phase = "final-readback";
    if (!(await fs.readFile(final)).equals(bytes)) throw new Error("final bytes differ");
    return bytes;
  } catch (error) {
    if (handle) {
      try { await handle.close(); }
      catch (closeError) { error = new Error(`${error.message}; close failed: ${closeError.message}`); }
    }
    throw new Error(`OUTPUT_WRITE_FAILED ${phase}: ${error.message}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options) { console.error("usage: cpu-profile-summary.mjs <recordsDir> <artifactsRoot> [--synthetic] [--break]"); return 2; }
  if (!options.synthetic) await import("./lib/app-icu-guard.mjs");
  const temporary = path.join(options.recordsDir, "cpu-profile.summary.json.tmp"), final = path.join(options.recordsDir, "cpu-profile.summary.json");
  try { await requireAbsent(temporary); await requireAbsent(final); }
  catch (error) { console.error(`OUTPUT_WRITE_FAILED inspect: ${error.message}`); return 1; }
  const sourceFiles = [];
  const readJson = async (file, logical) => {
    let bytes;
    try { bytes = await fs.readFile(file); }
    catch (error) { throw new ProfileInputError("INPUT_IO", logical); }
    sourceFiles.push({ path: logical, sha256: createHash("sha256").update(bytes).digest("hex") });
    try { return JSON.parse(bytes.toString("utf8")); }
    catch (error) { throw new ProfileInputError("INPUT_JSON", logical); }
  };
  let document;
  try {
    const configurations = [];
    for (const { id, threads } of CONFIGURATIONS) {
      const filename = `latency-e2e.${id}.json`;
      const record = await readJson(path.join(options.recordsDir, filename), `records/${filename}`);
      validateRecord(record, id, threads, options.synthetic);
      const artifacts = new Map();
      for (const run of record.runs) {
        const relative = `${id}/`;
        const files = { trace: `traces/${slug(run.label)}.trace.json`, cpu: `logs/${slug(run.label)}.cpu.json`, summary: `summaries/trial-${run.label}.json` };
        const data = {};
        for (const [kind, suffix] of Object.entries(files)) data[kind] = await readJson(path.join(options.artifactsRoot, id, suffix), `artifacts/${relative}${suffix}`);
        artifacts.set(run.label, data);
      }
      configurations.push(summarizeConfiguration(record, artifacts, id, threads, options.synthetic));
    }
    document = buildSummary(configurations, sourceFiles, options.synthetic, options.breakControl);
  } catch (error) {
    if (!(error instanceof ProfileInputError)) throw error;
    document = { schemaVersion: "narrate.cpu-profile.summary.v1", inputKind: options.synthetic ? "synthetic" : "recorded", status: "invalid", decision: null, errors: [{ code: error.code, path: error.path }] };
  }
  try {
    const bytes = await publish(document, temporary, final);
    process.stdout.write(bytes);
  } catch (error) { console.error(error.message); return 1; }
  return document.status === "valid" && document.decision.verdict !== "noisy" ? 0 : 1;
}

main().then((code) => { process.exitCode = code; }).catch((error) => { console.error(`RECORD_INVALID: ${error.message}`); process.exitCode = 1; });
