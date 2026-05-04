import type {
  PocketTtsErrorResponse,
  PocketTtsStatusSnapshot,
  PocketTtsSynthesizeRequest,
  PocketTtsSynthesizeResult,
} from "../../types";
import type { TtsStrategy } from "../../types/narration";
import { createAudioScheduler } from "../../utils/audioScheduler";
import type { AudioProgressReport, AudioScheduler, ScheduledChunk } from "../../utils/audioScheduler";

type PocketFailure = PocketTtsErrorResponse | (Partial<PocketTtsStatusSnapshot> & { ok?: false; error?: string });

type PocketSynthesisSuccess = PocketTtsSynthesizeResult & {
  audio?: Float32Array | number[];
  sampleRate?: number;
  durationMs?: number;
};

export type PocketTtsSchedulerSegment = ScheduledChunk & {
  timingTruth: "segment-following";
  wordTimestamps: null;
};

export interface PocketTtsStrategyDeps {
  getVoiceId: () => string;
  getWords: () => string[];
  onStatus?: (status: PocketTtsStatusSnapshot | PocketTtsErrorResponse) => void;
  onError?: (error: unknown) => void;
  onSegmentTrace?: (event: PocketTtsSegmentTraceEvent) => void;
  onRuntimeTrace?: (event: PocketTtsRuntimeTraceEvent) => void;
  cacheLimit?: number;
}

export interface PocketTtsContinuityScope {
  bookId?: string | null;
  sectionId?: string | number | null;
  generation?: string | number | null;
}

export interface PocketTtsPrefetchOptions {
  reason?: "next-segment" | "next-section";
}

export interface PocketTtsSegmentTraceEvent {
  kind: "pocket-segment";
  phase: "request" | "prefetch-start" | "prefetch-ready" | "prefetch-stale" | "prefetch-cancelled" | "playback";
  startIdx: number;
  endIdx: number;
  latencyMs?: number;
  cacheHit: boolean;
  prefetchReady: boolean;
  timingTruth: "segment-following";
  wordTimestamps: null;
  reason?: string;
}

export interface PocketTtsRuntimeTraceEvent {
  kind: "pocket-runtime" | "pocket-synthesis";
  backend?: string | null;
  modelVariant?: string | null;
  syntheticAudio: boolean | null;
  status?: string | null;
}

interface CacheEntry {
  key: string;
  segment: PocketTtsSchedulerSegment;
  requestId: string | null;
  ownerRequestId: string;
  createdAt: number;
  scopeKey: string;
  voice: string;
  rate: number;
  textHash: string;
  textLength: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  evictions: number;
  stalePrefetches: number;
  prefetchReady: number;
  prefetchCancelled: number;
}

function isFailure(result: unknown): result is PocketFailure {
  return Boolean(result && typeof result === "object" && (result as { ok?: unknown }).ok === false);
}

function normalizeAudio(audio: Float32Array | number[] | undefined): Float32Array | null {
  if (!audio) return null;
  return audio instanceof Float32Array ? audio : new Float32Array(audio);
}

function stringField(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function hashText(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return String(hash >>> 0);
}

function scopeToKey(scope: PocketTtsContinuityScope): string {
  return [
    scope.bookId ?? "book:none",
    scope.sectionId ?? "section:none",
    scope.generation ?? "generation:none",
  ].map(String).join("|");
}

export function createPocketTtsStrategy(deps: PocketTtsStrategyDeps): TtsStrategy & {
  prefetchChunk: (
    text: string,
    words: string[],
    startIdx: number,
    speed: number,
    options?: PocketTtsPrefetchOptions,
  ) => Promise<{ ok: boolean; cacheHit: boolean; stale?: boolean }>;
  setContinuityScope: (scope: PocketTtsContinuityScope) => void;
  clearCache: (options?: { reason?: string }) => void;
  getCacheStats: () => CacheStats;
  getScheduler: () => AudioScheduler;
  getAudioProgress: () => AudioProgressReport | null;
  getLastSegment: () => PocketTtsSchedulerSegment | null;
  getLastError: () => unknown;
  getStatusSnapshot: () => unknown;
  getLastPlaybackTrace: () => PocketTtsSegmentTraceEvent | null;
} {
  const scheduler = createAudioScheduler();
  const cache = new Map<string, CacheEntry>();
  const cacheLimit = Math.max(1, deps.cacheLimit ?? 8);
  const stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    evictions: 0,
    stalePrefetches: 0,
    prefetchReady: 0,
    prefetchCancelled: 0,
  };
  let activeRequestId: string | null = null;
  let generationId = 0;
  let prefetchGenerationId = 0;
  let requestSequence = 0;
  let continuityScope: PocketTtsContinuityScope = {};
  let lastSegment: PocketTtsSchedulerSegment | null = null;
  let lastError: unknown = null;
  let statusSnapshot: unknown = null;
  let lastPlaybackTrace: PocketTtsSegmentTraceEvent | null = null;

  const reportError = (error: unknown, onError: (error?: unknown) => void) => {
    lastError = error;
    deps.onError?.(error);
    onError(error);
  };

  const makeCacheKey = (text: string, startIdx: number, rate: number, voice: string, scopeKey = scopeToKey(continuityScope)) => [
    scopeKey,
    voice,
    String(rate),
    String(startIdx),
    String(text.length),
    hashText(text),
  ].join("::");

  const createOwnerRequestId = () => {
    requestSequence += 1;
    return `pocket-local-request-${requestSequence}`;
  };

  const emitSegmentTrace = (event: PocketTtsSegmentTraceEvent) => deps.onSegmentTrace?.(event);
  const emitRuntimeTrace = (event: PocketTtsRuntimeTraceEvent) => deps.onRuntimeTrace?.(event);
  const updateCacheSize = () => {
    stats.size = cache.size;
  };

  const rememberSegment = (entry: CacheEntry) => {
    if (cache.has(entry.key)) cache.delete(entry.key);
    cache.set(entry.key, entry);
    while (cache.size > cacheLimit) {
      const oldestKey = cache.keys().next().value;
      if (!oldestKey) break;
      cache.delete(oldestKey);
      stats.evictions += 1;
    }
    updateCacheSize();
  };

  const scheduleSegment = (segment: PocketTtsSchedulerSegment, trace: PocketTtsSegmentTraceEvent) => {
    lastSegment = segment;
    lastPlaybackTrace = trace;
    scheduler.play();
    scheduler.scheduleChunk(segment);
    scheduler.markPipelineDone();
    emitSegmentTrace(trace);
  };

  const fetchSegment = async (
    payload: PocketTtsSynthesizeRequest,
    words: string[],
    startIdx: number,
    scopeKey: string,
    textHash: string,
    textLength: string,
    ownerRequestId: string,
    onError: (error?: unknown) => void,
  ): Promise<{ entry: CacheEntry; latencyMs: number } | null> => {
    const api = window.electronAPI;
    if (!api?.pocketSynthesize) {
      reportError({ ok: false, error: "pocketSynthesize not available", recoverable: true }, onError);
      return null;
    }

    if (api.pocketStatus) {
      const status = await api.pocketStatus();
      statusSnapshot = status;
      deps.onStatus?.(status);
      if (!isFailure(status)) {
        emitRuntimeTrace({
          kind: "pocket-runtime",
          backend: stringField(status.runtime?.backend),
          modelVariant: stringField(status.runtime?.modelVariant ?? status.metadata?.modelVariant),
          syntheticAudio: typeof status.syntheticAudio === "boolean"
            ? status.syntheticAudio
            : typeof status.runtime?.syntheticAudio === "boolean"
              ? status.runtime.syntheticAudio
              : null,
          status: status.status ?? null,
        });
      }
      if (isFailure(status) || status.ready === false) {
        reportError(status, onError);
        return null;
      }
    }

    const startedAt = Date.now();
    const result = await api.pocketSynthesize(payload) as PocketSynthesisSuccess | PocketFailure;
    if (isFailure(result)) {
      statusSnapshot = {
        status: result.status,
        reason: result.reason,
        recoverable: result.recoverable,
      };
      reportError(result, onError);
      return null;
    }

    emitRuntimeTrace({
      kind: "pocket-synthesis",
      backend: stringField(result.runtime?.backend),
      modelVariant: stringField(result.runtime?.modelVariant),
      syntheticAudio: result.syntheticAudio ?? null,
      status: result.status ?? "ready",
    });

    const audio = normalizeAudio(result.audio);
    if (!audio || !result.sampleRate) {
      reportError({
        ok: false,
        error: "Pocket synthesis returned no scheduler-compatible audio",
        requestId: result.requestId ?? null,
        reason: "missing-audio",
        recoverable: true,
      }, onError);
      return null;
    }

    const latencyMs = Math.max(0, Date.now() - startedAt);
    const durationMs = result.durationMs ?? (audio.length / result.sampleRate) * 1000;
    const segment: PocketTtsSchedulerSegment = {
      audio,
      sampleRate: result.sampleRate,
      durationMs,
      words,
      startIdx,
      timingTruth: "segment-following",
      wordTimestamps: null,
    };

    const requestId = result.requestId ?? null;
    const entry: CacheEntry = {
      key: makeCacheKey(payload.text, startIdx, payload.rate ?? 1, payload.voice ?? "", scopeKey),
      segment,
      requestId,
      ownerRequestId,
      createdAt: Date.now(),
      scopeKey,
      voice: payload.voice ?? "",
      rate: payload.rate ?? 1,
      textHash,
      textLength,
    };
    return { entry, latencyMs };
  };

  return {
    speakChunk(text, words, startIdx, speed, onWordAdvance, onEnd, onError) {
      scheduler.setCallbacks({ onWordAdvance, onChunkBoundary: () => {}, onEnd, onError });

      const generation = ++generationId;
      const voice = deps.getVoiceId();
      const scopeKey = scopeToKey(continuityScope);
      const textHash = hashText(text);
      const textLength = String(text.length);
      const ownerRequestId = createOwnerRequestId();
      const key = makeCacheKey(text, startIdx, speed, voice, scopeKey);
      const cached = cache.get(key);
      if (cached) {
        stats.hits += 1;
        cache.delete(key);
        cache.set(key, cached);
        scheduleSegment(cached.segment, {
          kind: "pocket-segment",
          phase: "playback",
          startIdx,
          endIdx: startIdx + cached.segment.words.length,
          latencyMs: 0,
          cacheHit: true,
          prefetchReady: true,
          timingTruth: "segment-following",
          wordTimestamps: null,
        });
        return;
      }
      stats.misses += 1;
      const chunkWords = words.length > 0 ? words : deps.getWords().slice(startIdx);
      emitSegmentTrace({
        kind: "pocket-segment",
        phase: "request",
        startIdx,
        endIdx: startIdx + chunkWords.length,
        cacheHit: false,
        prefetchReady: false,
        timingTruth: "segment-following",
        wordTimestamps: null,
      });
      void fetchSegment({ text, voice, rate: speed }, chunkWords, startIdx, scopeKey, textHash, textLength, ownerRequestId, onError).then((result) => {
        if (generation !== generationId || !result) return;
        const { entry, latencyMs } = result;
        if (entry.ownerRequestId !== ownerRequestId) return;
        activeRequestId = entry.requestId;
        rememberSegment(entry);
        scheduleSegment(entry.segment, {
          kind: "pocket-segment",
          phase: "playback",
          startIdx,
          endIdx: startIdx + entry.segment.words.length,
          latencyMs,
          cacheHit: false,
          prefetchReady: false,
          timingTruth: "segment-following",
          wordTimestamps: null,
        });
      }).catch((error) => {
        if (generation !== generationId) return;
        reportError(error, onError);
      });
    },

    async prefetchChunk(text, words, startIdx, speed, options = {}) {
      const voice = deps.getVoiceId();
      const scopeKey = scopeToKey(continuityScope);
      const textHash = hashText(text);
      const textLength = String(text.length);
      const ownerRequestId = createOwnerRequestId();
      const key = makeCacheKey(text, startIdx, speed, voice, scopeKey);
      if (cache.has(key)) {
        stats.hits += 1;
        updateCacheSize();
        return { ok: true, cacheHit: true };
      }

      const chunkWords = words.length > 0 ? words : deps.getWords().slice(startIdx);
      const generation = ++prefetchGenerationId;
      emitSegmentTrace({
        kind: "pocket-segment",
        phase: "prefetch-start",
        startIdx,
        endIdx: startIdx + chunkWords.length,
        cacheHit: false,
        prefetchReady: false,
        timingTruth: "segment-following",
        wordTimestamps: null,
        reason: options.reason,
      });
      const entry = await fetchSegment({ text, voice, rate: speed }, chunkWords, startIdx, scopeKey, textHash, textLength, ownerRequestId, () => {});
      const resultEntry = entry?.entry ?? null;
      const stillMatches =
        generation === prefetchGenerationId
        && resultEntry
        && resultEntry.ownerRequestId === ownerRequestId
        && resultEntry.key === key
        && resultEntry.scopeKey === scopeToKey(continuityScope)
        && resultEntry.voice === voice
        && resultEntry.rate === speed
        && resultEntry.textHash === textHash
        && resultEntry.textLength === textLength;
      if (!stillMatches || !resultEntry || !entry) {
        stats.stalePrefetches += 1;
        emitSegmentTrace({
          kind: "pocket-segment",
          phase: "prefetch-stale",
          startIdx,
          endIdx: startIdx + chunkWords.length,
          cacheHit: false,
          prefetchReady: false,
          timingTruth: "segment-following",
          wordTimestamps: null,
          reason: options.reason,
        });
        updateCacheSize();
        return { ok: false, cacheHit: false, stale: true };
      }
      rememberSegment(resultEntry);
      stats.prefetchReady += 1;
      emitSegmentTrace({
        kind: "pocket-segment",
        phase: "prefetch-ready",
        startIdx,
        endIdx: startIdx + chunkWords.length,
        latencyMs: entry.latencyMs,
        cacheHit: false,
        prefetchReady: true,
        timingTruth: "segment-following",
        wordTimestamps: null,
        reason: options.reason,
      });
      return { ok: true, cacheHit: false };
    },

    setContinuityScope(scope) {
      continuityScope = { ...scope };
      generationId++;
      prefetchGenerationId++;
    },

    clearCache() {
      cache.clear();
      updateCacheSize();
      prefetchGenerationId++;
      lastPlaybackTrace = null;
    },

    getCacheStats() {
      updateCacheSize();
      return { ...stats };
    },

    stop() {
      generationId++;
      prefetchGenerationId++;
      const requestId = activeRequestId;
      activeRequestId = null;
      if (requestId && window.electronAPI?.pocketCancel) {
        void window.electronAPI.pocketCancel(requestId).catch((error: unknown) => {
          lastError = error;
        });
      }
      scheduler.stop();
    },

    pause() {
      scheduler.pause();
    },

    resume() {
      scheduler.resume();
    },

    getScheduler() {
      return scheduler;
    },

    getAudioProgress() {
      return scheduler.getAudioProgress();
    },

    getLastSegment() {
      return lastSegment;
    },

    getLastError() {
      return lastError;
    },

    getStatusSnapshot() {
      return statusSnapshot;
    },

    getLastPlaybackTrace() {
      return lastPlaybackTrace;
    },
  };
}
