function quantile(sorted, q) {
  if (!sorted.length) return null;
  if (sorted.length === 1) return sorted[0];
  const clamped = Math.min(1, Math.max(0, q));
  const idx = (sorted.length - 1) * clamped;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const weight = idx - lo;
  return sorted[lo] * (1 - weight) + sorted[hi] * weight;
}

export function calculateAggregateMetrics(runSummaries) {
  const summaries = Array.isArray(runSummaries) ? runSummaries : [];
  const latencies = summaries
    .map((s) => s.startLatencyMs)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const driftMaxima = summaries
    .map((s) => s.maxDrift ?? 0)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  const pauseResumeFailures = summaries.filter((s) => (s.failureClasses || []).includes("pause-resume-error")).length;
  const handoffFailures = summaries.filter((s) => (s.failureClasses || []).includes("handoff-error")).length;

  return {
    runCount: summaries.length,
    startupLatency: {
      p50: quantile(latencies, 0.5),
      p95: quantile(latencies, 0.95),
      min: latencies.length ? latencies[0] : null,
      max: latencies.length ? latencies[latencies.length - 1] : null,
    },
    drift: {
      p50: quantile(driftMaxima, 0.5),
      p95: quantile(driftMaxima, 0.95),
      max: driftMaxima.length ? driftMaxima[driftMaxima.length - 1] : null,
    },
    failureCounts: {
      pauseResumeFailures,
      handoffFailures,
    },
  };
}

export function formatAggregateSummary(aggregate) {
  return [
    `Aggregate runs: ${aggregate.runCount}`,
    `Startup latency p50/p95: ${aggregate.startupLatency.p50 ?? "n/a"} / ${aggregate.startupLatency.p95 ?? "n/a"} ms`,
    `Drift p50/p95/max: ${aggregate.drift.p50 ?? "n/a"} / ${aggregate.drift.p95 ?? "n/a"} / ${aggregate.drift.max ?? "n/a"}`,
    `Pause/resume failures: ${aggregate.failureCounts.pauseResumeFailures}`,
    `Handoff failures: ${aggregate.failureCounts.handoffFailures}`,
  ].join("\n");
}

