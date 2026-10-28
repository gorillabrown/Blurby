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
  const warmPreviewLatencies = summaries
    .map((s) => s.warmPreviewLatencyMs)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const warmFirstAudioLatencies = summaries
    .map((s) => s.warmFirstAudioLatencyMs ?? s.startLatencyMs)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const rateResponseLatencies = summaries
    .map((s) => s.rateResponseLatencyMs)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const driftMaxima = summaries
    .map((s) => s.maxDrift ?? 0)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  const pauseResumeFailures = summaries.filter((s) => (s.failureClasses || []).includes("pause-resume-error")).length;
  const handoffFailures = summaries.filter((s) => (s.failureClasses || []).includes("handoff-error")).length;
  const cachedStartupLatencies = summaries
    .filter((s) => s.startupCacheMode === "cached")
    .map((s) => s.startLatencyMs)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const uncachedStartupLatencies = summaries
    .filter((s) => s.startupCacheMode === "uncached")
    .map((s) => s.startLatencyMs)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const cachedOpeningChunkWordCounts = summaries.find(
    (s) => s.startupCacheMode === "cached" && Array.isArray(s.openingChunkWordCounts) && s.openingChunkWordCounts.length
  )?.openingChunkWordCounts ?? [];
  const uncachedOpeningChunkWordCounts = summaries.find(
    (s) => s.startupCacheMode === "uncached" && Array.isArray(s.openingChunkWordCounts) && s.openingChunkWordCounts.length
  )?.openingChunkWordCounts ?? [];
  const cachedStartLatencyMs = quantile(cachedStartupLatencies, 0.5);
  const uncachedStartLatencyMs = quantile(uncachedStartupLatencies, 0.5);
  const startupDeltaMs =
    cachedStartLatencyMs != null && uncachedStartLatencyMs != null
      ? uncachedStartLatencyMs - cachedStartLatencyMs
      : null;
  const openingRampMatches =
    cachedOpeningChunkWordCounts.length && uncachedOpeningChunkWordCounts.length
      ? JSON.stringify(cachedOpeningChunkWordCounts) === JSON.stringify(uncachedOpeningChunkWordCounts)
      : null;
  const startupSpikeThresholdMs = summaries.find((s) => Number.isFinite(s.startupSpikeThresholdMs))?.startupSpikeThresholdMs ?? 3000;
  const startupSpikeCount = summaries.reduce(
    (count, summary) => count + (Number.isFinite(summary.startupSpikeCount) ? summary.startupSpikeCount : 0),
    0,
  );

  return {
    runCount: summaries.length,
    startupLatency: {
      p50: quantile(latencies, 0.5),
      p95: quantile(latencies, 0.95),
      min: latencies.length ? latencies[0] : null,
      max: latencies.length ? latencies[latencies.length - 1] : null,
    },
    warmPreviewLatency: {
      p50: quantile(warmPreviewLatencies, 0.5),
      p95: quantile(warmPreviewLatencies, 0.95),
      min: warmPreviewLatencies.length ? warmPreviewLatencies[0] : null,
      max: warmPreviewLatencies.length ? warmPreviewLatencies[warmPreviewLatencies.length - 1] : null,
    },
    warmFirstAudioLatency: {
      p50: quantile(warmFirstAudioLatencies, 0.5),
      p95: quantile(warmFirstAudioLatencies, 0.95),
      min: warmFirstAudioLatencies.length ? warmFirstAudioLatencies[0] : null,
      max: warmFirstAudioLatencies.length ? warmFirstAudioLatencies[warmFirstAudioLatencies.length - 1] : null,
    },
    rateResponseLatency: {
      p50: quantile(rateResponseLatencies, 0.5),
      p95: quantile(rateResponseLatencies, 0.95),
      min: rateResponseLatencies.length ? rateResponseLatencies[0] : null,
      max: rateResponseLatencies.length ? rateResponseLatencies[rateResponseLatencies.length - 1] : null,
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
    startupSpikes: {
      thresholdMs: startupSpikeThresholdMs,
      count: startupSpikeCount,
    },
    startupParity: {
      cachedStartLatencyMs,
      uncachedStartLatencyMs,
      deltaMs: startupDeltaMs,
      cachedOpeningChunkWordCounts,
      uncachedOpeningChunkWordCounts,
      openingRampMatches,
    },
  };
}

export function formatAggregateSummary(aggregate) {
  return [
    `Aggregate runs: ${aggregate.runCount}`,
    `Warm preview latency p50/p95: ${aggregate.warmPreviewLatency.p50 ?? "n/a"} / ${aggregate.warmPreviewLatency.p95 ?? "n/a"} ms`,
    `Warm first-audio latency p50/p95: ${aggregate.warmFirstAudioLatency.p50 ?? "n/a"} / ${aggregate.warmFirstAudioLatency.p95 ?? "n/a"} ms`,
    `Startup latency p50/p95: ${aggregate.startupLatency.p50 ?? "n/a"} / ${aggregate.startupLatency.p95 ?? "n/a"} ms`,
    `Rate response latency p50/p95: ${aggregate.rateResponseLatency.p50 ?? "n/a"} / ${aggregate.rateResponseLatency.p95 ?? "n/a"} ms`,
    `Drift p50/p95/max: ${aggregate.drift.p50 ?? "n/a"} / ${aggregate.drift.p95 ?? "n/a"} / ${aggregate.drift.max ?? "n/a"}`,
    `Pause/resume failures: ${aggregate.failureCounts.pauseResumeFailures}`,
    `Handoff failures: ${aggregate.failureCounts.handoffFailures}`,
    `Startup spikes above ${aggregate.startupSpikes.thresholdMs ?? "n/a"} ms: ${aggregate.startupSpikes.count ?? "n/a"}`,
    `Startup parity cached/uncached: ${aggregate.startupParity.cachedStartLatencyMs ?? "n/a"} / ${aggregate.startupParity.uncachedStartLatencyMs ?? "n/a"} ms (delta ${aggregate.startupParity.deltaMs ?? "n/a"} ms)`,
    `Opening ramp parity: ${
      aggregate.startupParity.openingRampMatches == null
        ? "n/a"
        : aggregate.startupParity.openingRampMatches
          ? "match"
          : "mismatch"
    }`,
  ].join("\n");
}
