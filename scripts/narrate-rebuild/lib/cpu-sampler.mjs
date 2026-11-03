// NARRATE-CPU-PROFILE-1 A3-P: CPU9-14 policy-only checkpoint.
// Membership is lexical Windows observation, not native identity or kill authority.
import path from "node:path";

export const SAMPLE_INTERVAL_MS = 500;
export const MAX_LINE_BYTES = 131072;
export const MAX_PENDING_STDOUT_BYTES = 262144;
export const MAX_RETAINED_STDERR_BYTES = 8192;
export const STOP_DEADLINE_MS = 2000;

const PROCESS_TYPES = ["main", "renderer", "gpu", "audio", "other"];
const FRAME_KEYS = ["schemaVersion", "sequence", "t", "rows"];
const ROW_KEYS = ["name", "pid", "startUtcTicks", "executablePath", "commandLine", "kernel100ns", "user100ns"];
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const positiveInteger = (value) => Number.isSafeInteger(value) && value > 0;
const finiteNonnegative = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;
const exactKeys = (value, keys) => object(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
const zeroTypes = () => ({ main: 0, renderer: 0, gpu: 0, audio: 0, other: 0 });

export function parseProfileThreads(raw, enabled) {
  if (!enabled) return null;
  if (typeof raw !== "string" || !/^[1-4]$/.test(raw)) throw new TypeError("CPU_PROFILE_THREADS_REQUIRED");
  return Number(raw);
}

function windowsPath(value) {
  if (typeof value !== "string" || !/^[a-z]:[\\/]/i.test(value) || value.includes("\0")) return null;
  return path.win32.normalize(value.replace(/\//g, "\\")).toLowerCase();
}

function membershipOptions({ root, launcherPid } = {}) {
  const normalized = windowsPath(root);
  if (!normalized || !positiveInteger(launcherPid)) throw new TypeError("CPU_SAMPLER_MEMBERSHIP");
  return { root: normalized.replace(/\\+$/, "") + "\\", launcherPid };
}

// Windows argv quoting, including 2n/2n+1 backslashes and doubled quoted quotes.
function windowsArguments(commandLine) {
  const args = [];
  let word = "", quoted = false, started = false;
  for (let i = 0; i < commandLine.length;) {
    const char = commandLine[i];
    if (!quoted && /\s/.test(char)) {
      if (started) { args.push(word); word = ""; started = false; }
      i++;
    } else if (char === "\\") {
      let end = i;
      while (commandLine[end] === "\\") end++;
      const count = end - i;
      if (commandLine[end] === '"') {
        word += "\\".repeat(Math.floor(count / 2));
        started = true;
        if (count % 2) { word += '"'; i = end + 1; }
        else if (quoted && commandLine[end + 1] === '"') { word += '"'; i = end + 2; }
        else { quoted = !quoted; i = end + 1; }
      } else { word += "\\".repeat(count); started = true; i = end; }
    } else if (char === '"') {
      started = true;
      if (quoted && commandLine[i + 1] === '"') { word += '"'; i += 2; }
      else { quoted = !quoted; i++; }
    } else { word += char; started = true; i++; }
  }
  if (quoted) throw new TypeError("CPU_SAMPLER_MEMBERSHIP");
  if (started) args.push(word);
  return args;
}

function classificationSwitches(args) {
  const switches = new Map();
  const names = ["--type", "--utility-sub-type", "--service-sandbox-type"];
  for (let i = 1; i < args.length; i++) {
    const token = args[i];
    const name = names.find((candidate) => token === candidate || token.startsWith(candidate + "="));
    if (!name) continue;
    const value = token === name ? args[++i] : token.slice(name.length + 1);
    if (!value || value.startsWith("--") || switches.has(name)) throw new TypeError("CPU_SAMPLER_MEMBERSHIP");
    switches.set(name, value);
  }
  return switches;
}

function classify(row, options) {
  if (!object(row) || !positiveInteger(row.pid)) throw new TypeError("CPU_SAMPLER_MEMBERSHIP");
  if (row.pid === options.launcherPid) return null;
  const executable = windowsPath(row.executablePath);
  if (!executable) throw new TypeError("CPU_SAMPLER_MEMBERSHIP");
  // Exclude known outside processes before inspecting unavailable command lines.
  if (!executable.startsWith(options.root) || path.win32.basename(executable) !== "electron.exe") return null;
  if (typeof row.commandLine !== "string" || !row.commandLine.trim()) throw new TypeError("CPU_SAMPLER_MEMBERSHIP");
  const args = windowsArguments(row.commandLine);
  if (!args.length) throw new TypeError("CPU_SAMPLER_MEMBERSHIP");
  const switches = classificationSwitches(args);
  const type = switches.get("--type");
  if (type === undefined) return "main";
  if (type === "renderer") return "renderer";
  if (type === "gpu-process") return "gpu";
  if (type === "utility" && (switches.get("--utility-sub-type") === "audio.mojom.AudioService" || switches.get("--service-sandbox-type") === "audio")) return "audio";
  return "other";
}

export function classifyProfileProcess(row, options) {
  return classify(row, membershipOptions(options));
}

function validRow(row) {
  return exactKeys(row, ROW_KEYS) && row.name === "electron.exe" && positiveInteger(row.pid)
    && typeof row.startUtcTicks === "string" && /^[1-9][0-9]*$/.test(row.startUtcTicks)
    && (row.executablePath === null || windowsPath(row.executablePath) !== null)
    && (row.commandLine === null || typeof row.commandLine === "string")
    && [row.kernel100ns, row.user100ns].every((value) => typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value));
}

export function createCounterLedger(options) {
  const selectedOptions = membershipOptions(options);
  let closing = false, fault = null, sequence = 0, lastTime = null, retained = new Map();
  const samples = [];
  const fail = (code, reason, frame, pid = null) => {
    if (!fault) fault = Object.freeze({ code, reason, sequence: positiveInteger(frame?.sequence) ? frame.sequence : null, pid: positiveInteger(pid) ? pid : null });
    return false;
  };
  const frameFailure = (reason, frame, pid = null) => fail("CPU_SAMPLER_FRAME", reason, frame, pid);
  const discontinuity = (reason, frame, pid) => fail("CPU_COUNTER_DISCONTINUITY", reason, frame, pid);

  function accept(frame) {
    if (closing || fault) return false;
    if (!exactKeys(frame, FRAME_KEYS) || frame.schemaVersion !== "narrate.cpu-sampler.v1" || !positiveInteger(frame.sequence)
      || !Number.isSafeInteger(frame.t) || frame.t < 0 || !Array.isArray(frame.rows)) return frameFailure("INVALID_SCHEMA", frame);
    if (frame.sequence !== sequence + 1) return frameFailure("SEQUENCE", frame);
    if (lastTime !== null && frame.t <= lastTime) return frameFailure("TIME", frame);
    const seen = new Set(), next = new Map();
    for (const row of frame.rows) {
      if (!validRow(row)) return frameFailure("INVALID_SCHEMA", frame, row?.pid);
      if (seen.has(row.pid)) return discontinuity("DUPLICATE_IDENTITY", frame, row.pid);
      seen.add(row.pid);
      const previous = retained.get(row.pid);
      if (previous && previous.start !== row.startUtcTicks) return discontinuity("PID_REUSED", frame, row.pid);
      let type;
      try { type = classify(row, selectedOptions); }
      catch (error) {
        if (!(error instanceof TypeError)) throw error;
        return discontinuity("MEMBERSHIP_CHANGED", frame, row.pid);
      }
      if (type === null) {
        if (previous) return discontinuity("MEMBERSHIP_CHANGED", frame, row.pid);
        continue;
      }
      const executable = windowsPath(row.executablePath);
      if (previous && previous.executable !== executable) return discontinuity("EXECUTABLE_CHANGED", frame, row.pid);
      if (previous && previous.type !== type) return discontinuity("CLASS_CHANGED", frame, row.pid);
      const kernel = BigInt(row.kernel100ns), user = BigInt(row.user100ns), ticks = kernel + user;
      if (previous && (kernel < previous.kernel || user < previous.user)) return discontinuity("COUNTER_DECREASE", frame, row.pid);
      if (ticks > BigInt(Number.MAX_SAFE_INTEGER)) return discontinuity("UNSAFE_COUNTER", frame, row.pid);
      next.set(row.pid, { start: row.startUtcTicks, executable, type, kernel, user, ticks });
    }
    for (const pid of retained.keys()) if (!next.has(pid)) return discontinuity("PROCESS_DISAPPEARED", frame, pid);
    const totals = { main: 0n, renderer: 0n, gpu: 0n, audio: 0n, other: 0n };
    let allTicks = 0n;
    for (const [pid, entry] of next) {
      allTicks += entry.ticks;
      if (allTicks > BigInt(Number.MAX_SAFE_INTEGER)) return discontinuity("UNSAFE_COUNTER", frame, pid);
      totals[entry.type] += entry.ticks;
    }
    const byType = zeroTypes();
    for (const type of PROCESS_TYPES) byType[type] = Number(totals[type]) / 10000000;
    const sec = Number(allTicks) / 10000000;
    if (Math.abs(PROCESS_TYPES.reduce((sum, type) => sum + byType[type], 0) - sec) > 1e-6) return discontinuity("UNSAFE_COUNTER", frame, null);
    // Commit only a complete validated frame. A rejection retains the earlier prefix.
    retained = next; sequence = frame.sequence; lastTime = frame.t;
    samples.push({ t: frame.t, sec, byType });
    return true;
  }

  return {
    accept,
    close() { closing = true; },
    getFault() { return fault; },
    getSamples() { return samples.map((sample) => ({ t: sample.t, sec: sample.sec, byType: { ...sample.byType } })); },
  };
}

function validateTypeMap(sample) {
  if (sample.byType === undefined) return;
  if (!exactKeys(sample.byType, PROCESS_TYPES) || !PROCESS_TYPES.every((type) => finiteNonnegative(sample.byType[type]))
    || !finiteNonnegative(sample.sec) || Math.abs(PROCESS_TYPES.reduce((sum, type) => sum + sample.byType[type], 0) - sample.sec) > 1e-6) throw new TypeError("CPU_SAMPLER_BY_TYPE");
}

export function cpuShare(series, t0, t1, { byType = false } = {}) {
  if (!series || !series.host?.length || !series.app?.length) return null;
  if (byType) for (const sample of series.app) validateTypeMap(sample);
  if (t1 - t0 < 1000) { const mid = (t0 + t1) / 2; t0 = mid - 500; t1 = mid + 500; }
  const near = (arr, t) => arr.reduce((best, x) => (Math.abs(x.t - t) < Math.abs(best.t - t) ? x : best), arr[0]);
  const h0 = near(series.host, t0), h1 = near(series.host, t1), a0 = near(series.app, t0), a1 = near(series.app, t1);
  if (h1.t <= h0.t || a1.t <= a0.t) return null;
  const hostPct = 100 * (1 - (h1.idle - h0.idle) / Math.max(1, h1.total - h0.total));
  const denominator = ((a1.t - a0.t) / 1000) * series.cores;
  const appPct = (100 * (a1.sec - a0.sec)) / denominator;
  const result = { hostPct: +hostPct.toFixed(1), appPct: +appPct.toFixed(1), foreignPct: +Math.max(0, hostPct - appPct).toFixed(1) };
  if (byType) {
    result.byType = null;
    if (a0.byType !== undefined && a1.byType !== undefined) {
      const shares = zeroTypes();
      for (const type of PROCESS_TYPES) {
        const delta = a1.byType[type] - a0.byType[type];
        if (delta < 0) throw new TypeError("CPU_SAMPLER_BY_TYPE");
        shares[type] = +(100 * delta / denominator).toFixed(1);
      }
      result.byType = shares;
    }
  }
  return result;
}

export function readWarmThreadProof(summary, { label, rate, requestedThreads } = {}) {
  if (!object(summary) || !object(summary.config) || summary.config.kind !== "warm" || typeof label !== "string"
    || summary.config.label !== label || typeof rate !== "number" || !Number.isFinite(rate) || summary.config.rate !== rate
    || summary.error !== null || !Array.isArray(summary.steps) || !Number.isInteger(requestedThreads) || requestedThreads < 1 || requestedThreads > 4) throw new TypeError("CPU_PROFILE_THREAD_PROOF");
  const matches = summary.steps.filter((step) => step?.name === "warm-up done");
  const threads = matches[0]?.detail?.runtime?.threads;
  if (matches.length !== 1 || !Number.isInteger(threads) || threads !== requestedThreads) throw new TypeError("CPU_PROFILE_THREAD_PROOF");
  return threads;
}
