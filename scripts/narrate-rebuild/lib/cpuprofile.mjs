// NARRATE-CPU-PROFILE-1: ROADMAP decision rule, CPU-7 and CPU-8 contracts.
// These harness constants do not change production defaults.
export const MAINSTREAM_WARM_BUDGET_MS = 2500;
export const NOISE_FLOOR_MS = 100;
export const NOISY_SPREAD_MS = 500;
export const CPU_GAIN_POINTS = 10;
export const SWEEP_THREADS = Object.freeze([4, 3, 2, 1]);
export const RATES = Object.freeze([1, 2]);
export const TYPES = Object.freeze(["play", "resume", "click", "speed"]);
export const CONFIGURATIONS = Object.freeze([
  Object.freeze({ id: "t4-1", threads: 4 }),
  Object.freeze({ id: "t3", threads: 3 }),
  Object.freeze({ id: "t2", threads: 2 }),
  Object.freeze({ id: "t1", threads: 1 }),
  Object.freeze({ id: "t4-2", threads: 4 }),
]);
const PROCESS_TYPES = Object.freeze(["main", "renderer", "gpu", "audio", "other"]);
const finite = (x) => typeof x === "number" && Number.isFinite(x);
const nonnegative = (x) => finite(x) && x >= 0;
const percentage = (x) => nonnegative(x) && x <= 100;
const object = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export class ProfileInputError extends TypeError {
  constructor(code, path) { super(`${code}: ${path}`); this.code = code; this.path = path; }
}
function check(condition, code, path) {
  if (!condition) throw new ProfileInputError(code, path);
}
function contract(condition, message) {
  if (!condition) throw new TypeError(message);
}

export function requestBreakdown(events) {
  contract(Array.isArray(events), "events must be a request trace slice");
  const voiced = events.map((e, i) => ({ e, i })).filter(({ e }) => e?.kind === "narrate-first-voiced");
  contract(voiced.length === 1, "one first-voiced event is required");
  const { e, i } = voiced[0];
  const requests = events.slice(0, i).filter((r) => r?.kind === "narrate-request" && r.t === e.requestT && r.cause === e.cause);
  const schedule = events[i - 1];
  contract(finite(e.requestT) && TYPES.includes(e.cause) && requests.length === 1, "unique matching request required");
  contract(schedule?.kind === "narrate-schedule", "immediately preceding schedule required");
  const stages = schedule.hops?.stages;
  contract(finite(stages?.queued) && finite(stages?.posted) && stages.posted >= stages.queued, "invalid queue timestamps");
  contract(nonnegative(schedule.genMs) && Number.isInteger(schedule.chunkStart) && schedule.chunkStart >= 0 && Number.isInteger(schedule.chunkEnd) && schedule.chunkEnd > schedule.chunkStart, "invalid generation metadata");
  contract(nonnegative(schedule.busyAtAssign?.pool), "invalid busy count");
  const words = schedule.chunkEnd - schedule.chunkStart;
  return { cause: e.cause, waitMs: stages.posted - stages.queued, genMs: schedule.genMs, words, genMsPerWord: schedule.genMs / words, otherBusy: schedule.busyAtAssign.pool > 0 };
}

export function validateDecisionInputs(configs) {
  contract(object(configs) && configs.schemaVersion === "narrate.cpu-profile.configs.v1", "invalid decision schema");
  contract(equal(configs.rates, RATES) && equal(configs.types, TYPES), "invalid matrix axes");
  contract(Array.isArray(configs.configurations) && configs.configurations.length === CONFIGURATIONS.length, "five configurations required");
  configs.configurations.forEach((c, i) => {
    const expected = CONFIGURATIONS[i];
    contract(object(c) && c.id === expected.id && c.threads === expected.threads && c.runtimeThreads === expected.threads && c.d6class === "mainstream" && percentage(c.medianAppCpuPct), "invalid configuration");
    for (const [name, valid] of [["worstMs", nonnegative], ["counting", (n) => Number.isInteger(n) && n >= 20]]) {
      contract(Array.isArray(c[name]) && c[name].length === 2 && c[name].every((row) => Array.isArray(row) && row.length === 4 && row.every(valid)), `invalid ${name} matrix`);
    }
  });
}

export function decisionDetails(configs) {
  validateDecisionInputs(configs);
  const [a, , , , b] = configs.configurations;
  const baselineMedianAppCpuPct = (a.medianAppCpuPct + b.medianAppCpuPct) / 2;
  const gainThresholdAppCpuPct = baselineMedianAppCpuPct - CPU_GAIN_POINTS;
  const candidates = configs.configurations.slice(1, 4).map((c) => {
    const cellLimitsMs = RATES.map((_, r) => TYPES.map((_, t) => Math.max(a.worstMs[r][t], b.worstMs[r][t]) + Math.max(Math.abs(a.worstMs[r][t] - b.worstMs[r][t]), NOISE_FLOOR_MS)));
    return { id: c.id, threads: c.threads, admissible: c.worstMs.every((row, r) => row.every((value, t) => value < MAINSTREAM_WARM_BUDGET_MS && value <= cellLimitsMs[r][t])), hasCpuGain: c.medianAppCpuPct <= gainThresholdAppCpuPct, cpuGainPoints: baselineMedianAppCpuPct - c.medianAppCpuPct, cellLimitsMs };
  });
  return { baselineMedianAppCpuPct, gainThresholdAppCpuPct, candidates };
}

export function profileDecision(configs) {
  validateDecisionInputs(configs);
  const [a, , , , b] = configs.configurations;
  if (a.worstMs.some((row, r) => row.some((value, t) => value >= MAINSTREAM_WARM_BUDGET_MS || b.worstMs[r][t] >= MAINSTREAM_WARM_BUDGET_MS || Math.abs(value - b.worstMs[r][t]) > NOISY_SPREAD_MS))) return { verdict: "noisy" };
  const candidates = decisionDetails(configs).candidates.filter((c) => c.admissible && c.hasCpuGain);
  candidates.sort((x, y) => configs.configurations.find((c) => c.id === x.id).medianAppCpuPct - configs.configurations.find((c) => c.id === y.id).medianAppCpuPct || y.threads - x.threads);
  return candidates.length ? { verdict: "adapt", threads: candidates[0].threads } : { verdict: "keep", threads: 4 };
}

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function cpuWindow(series, t0, t1, cores, path) {
  check(object(series) && series.cores === cores && Array.isArray(series.host) && Array.isArray(series.app), "CPU_SERIES", path);
  for (const sample of series.host) check(object(sample) && finite(sample.t) && nonnegative(sample.idle) && nonnegative(sample.total), "CPU_SERIES", path);
  for (const sample of series.app) {
    check(object(sample) && finite(sample.t) && nonnegative(sample.sec), "CPU_SERIES", path);
    if (sample.byType !== undefined) {
      check(object(sample.byType) && PROCESS_TYPES.every((type) => nonnegative(sample.byType[type])) && Math.abs(PROCESS_TYPES.reduce((sum, type) => sum + sample.byType[type], 0) - sample.sec) <= 1e-6, "CPU_SERIES", path);
    }
  }
  if (!series.host.length || !series.app.length) return { cpu: null, byType: null };
  if (t1 - t0 < 1000) { const mid = (t0 + t1) / 2; t0 = mid - 500; t1 = mid + 500; }
  const near = (samples, t) => samples.reduce((best, item) => Math.abs(item.t - t) < Math.abs(best.t - t) ? item : best, samples[0]);
  const h0 = near(series.host, t0), h1 = near(series.host, t1), a0 = near(series.app, t0), a1 = near(series.app, t1);
  if (h1.t <= h0.t || a1.t <= a0.t) return { cpu: null, byType: null };
  const total = h1.total - h0.total, idle = h1.idle - h0.idle, sec = a1.sec - a0.sec;
  check(total > 0 && idle >= 0 && idle <= total && sec >= 0, "CPU_SERIES", path);
  const denominator = ((a1.t - a0.t) / 1000) * cores;
  const hostPct = 100 * (1 - idle / total), appPct = 100 * sec / denominator;
  check(percentage(hostPct) && percentage(appPct), "CPU_SERIES", path);
  let byType = null;
  if (a0.byType && a1.byType) {
    byType = Object.fromEntries(PROCESS_TYPES.map((type) => {
      const delta = a1.byType[type] - a0.byType[type];
      check(delta >= 0, "CPU_SERIES", path);
      return [type, Number((100 * delta / denominator).toFixed(1))];
    }));
  }
  return { cpu: { hostPct: Number(hostPct.toFixed(1)), appPct: Number(appPct.toFixed(1)), foreignPct: Number(Math.max(0, hostPct - appPct).toFixed(1)) }, byType };
}

function profileMapping(value) {
  return object(value) && Object.values(value).every((x) => x === null || typeof x === "string");
}
export function validateRecord(record, id, threads, synthetic) {
  const fail = (condition, suffix = "record") => check(condition, "RECORD_INVALID", `${id}/${suffix}`);
  fail(object(record));
  fail(synthetic ? record.synthetic === true : record.synthetic !== true, "synthetic");
  fail(record.host?.d6class === "mainstream" && Number.isInteger(record.host.physicalCores) && record.host.physicalCores >= 4 && record.host.physicalCores <= 7 && Number.isInteger(record.host.cpus) && record.host.cpus > 0, "host");
  fail(record.budgets?.warmMs === 2500 && record.budgets.coldMs === 8000 && record.budgets.foreignCeilingPct === 25 && record.budgets.cycleCap === 40, "budgets");
  fail(equal(record.rates, RATES) && equal(record.types, TYPES), "axes");
  const before = record.liveProfile?.before, after = record.liveProfile?.after;
  fail(profileMapping(before) && profileMapping(after) && equal(Object.keys(before).sort(), Object.keys(after).sort()) && Object.keys(before).every((key) => before[key] === after[key]), "liveProfile");
  fail(Array.isArray(record.runs) && record.runs.length > 0 && object(record.warm) && Array.isArray(record.failures), "runs");
  const labels = new Set();
  for (const run of record.runs) {
    fail(object(run) && typeof run.label === "string" && /^warm-(1\.00|2\.00)(?:-[2-9][0-9]*|-[1-9][0-9]+)?$/.test(run.label) && !labels.has(run.label), "runs/label");
    labels.add(run.label);
    fail(run.code === 0 && finite(run.wallMs) && run.wallMs > 0 && run.traceExists === true && Number.isInteger(run.cycles) && run.cycles > 0 && percentage(run.appCpuPct), `${run.label}/metadata`);
    fail(typeof run.tracePath === "string" && run.tracePath.replace(/\\/g, "/").split("/").pop() === `${slug(run.label)}.trace.json`, `${run.label}/tracePath`);
  }
  for (const rate of RATES) {
    const label = `warm-${rate.toFixed(2)}`, own = record.runs.filter((run) => run.label === label || run.label.startsWith(`${label}-`));
    fail(own.length > 0 && own.every((run, i) => run.label === (i ? `${label}-${i + 1}` : label)) && own.reduce((sum, run) => sum + run.cycles, 0) <= 40, `${label}/cycles`);
  }
  // Loaded-thread proofs are checked after structural metadata, before trial reconstruction.
  if (record.intraOpThreads !== undefined) check(record.intraOpThreads === threads, "THREAD_MISMATCH", `${id}/intraOpThreads`);
  for (const run of record.runs) if (run.runtimeThreads !== undefined) check(run.runtimeThreads === threads, "THREAD_MISMATCH", `${id}/${run.label}/runtimeThreads`);
}

export function summarizeConfiguration(record, artifacts, id, threads, synthetic) {
  validateRecord(record, id, threads, synthetic);
  for (const run of record.runs) {
    const summary = artifacts.get(run.label)?.summary, rate = Number(run.label.slice(5, 9));
    check(object(summary) && summary.config?.kind === "warm" && summary.config.label === run.label && summary.config.rate === rate && summary.error === null && Array.isArray(summary.steps), "RECORD_INVALID", `${id}/${run.label}/summary`);
    const steps = summary.steps.filter((step) => step?.name === "warm-up done");
    check(steps.length === 1 && steps[0].detail?.runtime?.threads === threads, "THREAD_MISMATCH", `${id}/${run.label}/warm-up`);
  }
  const reconstructed = new Map();
  for (const run of record.runs) {
    const data = artifacts.get(run.label), rate = Number(run.label.slice(5, 9));
    const events = Array.isArray(data.trace) ? data.trace : data.trace?.events;
    check(Array.isArray(events), "RECORD_INVALID", `${id}/${run.label}/trace`);
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (e?.kind !== "narrate-first-voiced" || e.cause === "navigate") continue;
      check(TYPES.includes(e.cause), "RECORD_INVALID", `${id}/${run.label}/cause`);
      const path = `${id}/warm/${rate.toFixed(2)}/${e.cause}`;
      const pair = events.slice(i + 1).find((x) => x?.kind === "narrate-commit" && finite(x.otsPerf) && x.otsPerf > 0 && finite(x.otsCtx));
      check(pair && [e.startAt, e.requestT, e.ts, e.t, e.word, e.speed].every(finite), "CLOCK_MAPPING", path);
      const latencyMs = Number((pair.otsPerf + (e.startAt - pair.otsCtx) * 1000 - e.requestT).toFixed(0));
      check(nonnegative(latencyMs), "CLOCK_MAPPING", path);
      const epoch = e.ts - (e.t - e.requestT);
      const window = cpuWindow(data.cpu, epoch, epoch + latencyMs, record.host.cpus, path);
      const key = `${rate}/${e.cause}`;
      if (!reconstructed.has(key)) reconstructed.set(key, []);
      reconstructed.get(key).push({ cause: e.cause, run: run.label, word: e.word, speed: e.speed, latencyMs, cpu: window.cpu, byType: window.byType, events, eventIndex: i });
    }
  }
  const cells = [], countingTrials = [], failures = [];
  for (const rate of RATES) for (const type of TYPES) {
    const path = `${id}/warm/${rate.toFixed(2)}/${type}`, source = record.warm[rate.toFixed(2)]?.[type], rows = reconstructed.get(`${rate}/${type}`) ?? [];
    check(object(source) && Array.isArray(source.trials) && source.trials.length === rows.length, "TRIAL_JOIN", path);
    rows.forEach((row, i) => {
      const original = source.trials[i];
      check(object(original) && ["cause", "run", "word", "speed", "latencyMs"].every((field) => original[field] === row[field]) && (row.cpu === null ? original.cpu === null : object(original.cpu) && ["hostPct", "appPct", "foreignPct"].every((field) => original.cpu[field] === row.cpu[field])), "TRIAL_JOIN", path);
    });
    const counting = rows.filter((row) => row.latencyMs !== null && row.cpu !== null && row.cpu.foreignPct <= 25);
    const worst = counting.length ? Math.max(...counting.map((row) => row.latencyMs)) : null;
    const over = counting.filter((row) => row.latencyMs >= MAINSTREAM_WARM_BUDGET_MS).length;
    check(source.n === rows.length && source.counting === counting.length && source.worstMs === worst && source.over === over && source.unmeasured === 0, "REPORT_MISMATCH", path);
    cells.push({ rate, type, counting: counting.length, excluded: rows.length - counting.length, worstLatencyMs: worst, medianAppCpuPct: median(counting.map((row) => row.cpu.appPct)), maxAppCpuPct: counting.length ? Math.max(...counting.map((row) => row.cpu.appPct)) : null, medianHostCpuPct: median(counting.map((row) => row.cpu.hostPct)), maxHostCpuPct: counting.length ? Math.max(...counting.map((row) => row.cpu.hostPct)) : null });
    countingTrials.push(...counting);
    if (over) failures.push(`warm ${rate.toFixed(2)} ${type}: ${over} counting trials at or over 2500 ms (worst ${worst})`);
  }
  // CPU-8 amendment: all source totals, then minimum counts, then report failure array.
  for (const cell of cells) check(cell.counting >= 20, "COUNT_LT_20", `${id}/warm/${cell.rate.toFixed(2)}/${cell.type}`);
  check(record.verdict === (failures.length ? "FAIL" : "PASS") && equal(record.failures, failures), "REPORT_MISMATCH", `${id}/failures`);
  const requests = countingTrials.map((row) => {
    const e = row.events[row.eventIndex], schedule = row.events[row.eventIndex - 1];
    const matching = row.events.slice(0, row.eventIndex).filter((x) => x?.kind === "narrate-request" && x.t === e.requestT && x.cause === e.cause);
    try { contract(matching.length === 1, "ambiguous request"); return requestBreakdown([matching[0], schedule, e]); }
    catch (error) { if (!(error instanceof TypeError)) throw error; throw new ProfileInputError("REQUEST_BREAKDOWN", `${id}/${row.run}/${e.cause}`); }
  });
  const meanX = requests.reduce((sum, x) => sum + x.words, 0) / requests.length, meanY = requests.reduce((sum, x) => sum + x.genMs, 0) / requests.length;
  const denominator = requests.reduce((sum, x) => sum + (x.words - meanX) ** 2, 0);
  const slope = requests.length >= 2 && denominator > 0 ? requests.reduce((sum, x) => sum + (x.words - meanX) * (x.genMs - meanY), 0) / denominator : null;
  const allByType = countingTrials.every((row) => row.byType !== null);
  const anyByType = [...artifacts.values()].some(({ cpu }) => cpu.app.some((sample) => sample.byType !== undefined));
  return { id, threads, runtimeThreads: threads, d6class: "mainstream", cells, medianAppCpuPct: median(countingTrials.map((row) => row.cpu.appPct)), medianHostCpuPct: median(countingTrials.map((row) => row.cpu.hostPct)), runAppCpuPct: record.runs.reduce((sum, run) => sum + run.appCpuPct * run.wallMs, 0) / record.runs.reduce((sum, run) => sum + run.wallMs, 0), perProcess: { status: allByType ? "measured" : "not-measured", reason: allByType ? null : anyByType ? "INCOMPLETE_BY_TYPE_COVERAGE" : "NO_BY_TYPE_SAMPLES", medianAppCpuPctByType: allByType ? Object.fromEntries(PROCESS_TYPES.map((type) => [type, median(countingTrials.map((row) => row.byType[type]))])) : null }, requests: { n: requests.length, medianWaitMs: median(requests.map((x) => x.waitMs)), medianGenMs: median(requests.map((x) => x.genMs)), medianGenMsPerWord: median(requests.map((x) => x.genMsPerWord)), otherBusyFraction: requests.filter((x) => x.otherBusy).length / requests.length, regression: { n: requests.length, slopeMsPerWord: slope, interceptMs: slope === null ? null : meanY - slope * meanX } } };
}

export function buildSummary(configurations, sourceFiles, synthetic, breakControl) {
  const decisionInputs = { schemaVersion: "narrate.cpu-profile.configs.v1", rates: [...RATES], types: [...TYPES], configurations: configurations.map((c) => ({ id: c.id, threads: c.threads, runtimeThreads: c.runtimeThreads, d6class: c.d6class, medianAppCpuPct: c.medianAppCpuPct, counting: RATES.map((rate) => c.cells.filter((cell) => cell.rate === rate).map((cell) => cell.counting)), worstMs: RATES.map((rate) => c.cells.filter((cell) => cell.rate === rate).map((cell) => cell.worstLatencyMs)) })) };
  let control = null;
  if (breakControl) {
    const beforeMs = decisionInputs.configurations[4].worstMs[1][2];
    decisionInputs.configurations[4].worstMs[1][2] += 600;
    control = { kind: "baseline-click-plus-600ms", path: ["configurations", 4, "worstMs", 1, 2], beforeMs, afterMs: beforeMs + 600 };
  }
  const decision = profileDecision(decisionInputs);
  check(!breakControl || decision.verdict === "noisy", "RECORD_INVALID", "control/break");
  return { schemaVersion: "narrate.cpu-profile.summary.v1", inputKind: synthetic ? "synthetic" : "recorded", status: "valid", control, configurations, decisionInputs, decision, decisionDetails: decisionDetails(decisionInputs), sourceFiles: [...sourceFiles].sort((a, b) => a.path.localeCompare(b.path, "en")) };
}
