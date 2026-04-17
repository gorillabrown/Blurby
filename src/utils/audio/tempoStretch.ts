import type { KokoroRatePlan } from "../kokoroRatePlan";

export interface TempoStretchWordTimestamp {
  word: string;
  startTime: number;
  endTime: number;
}

export interface TempoStretchPlaybackInput {
  audio: Float32Array;
  sampleRate: number;
  durationMs: number;
  silenceMs?: number;
  wordTimestamps?: TempoStretchWordTimestamp[] | null;
  kokoroRatePlan?: KokoroRatePlan;
}

export interface TempoStretchPlaybackResult {
  audio: Float32Array;
  durationMs: number;
  wordTimestamps?: TempoStretchWordTimestamp[] | null;
  applied: boolean;
}

const TEMPO_EPSILON = 0.01;
const WINDOW_MS = 40;
const OVERLAP_MS = 14;
const SEARCH_MS = 8;
const MIN_WINDOW_SAMPLES = 256;
const MIN_OVERLAP_SAMPLES = 64;

export function applyKokoroTempoStretch(input: TempoStretchPlaybackInput): TempoStretchPlaybackResult {
  const tempoFactor = input.kokoroRatePlan?.tempoFactor ?? 1;
  if (!Number.isFinite(tempoFactor) || tempoFactor <= 0 || Math.abs(tempoFactor - 1) < TEMPO_EPSILON) {
    return {
      audio: input.audio,
      durationMs: input.durationMs,
      wordTimestamps: input.wordTimestamps,
      applied: false,
    };
  }

  const silenceSamples = clampSilenceSamples(input.audio.length, input.sampleRate, input.silenceMs ?? 0);
  const voicedSampleCount = input.audio.length - silenceSamples;
  if (voicedSampleCount <= 0) {
    return {
      audio: input.audio,
      durationMs: input.durationMs,
      wordTimestamps: input.wordTimestamps,
      applied: false,
    };
  }

  const voicedAudio = input.audio.subarray(0, voicedSampleCount);
  const stretchedVoicedAudio = stretchTempoPitchPreserving(voicedAudio, input.sampleRate, tempoFactor);
  if (stretchedVoicedAudio === voicedAudio) {
    return {
      audio: input.audio,
      durationMs: input.durationMs,
      wordTimestamps: input.wordTimestamps,
      applied: false,
    };
  }

  const stretchedAudio =
    silenceSamples > 0
      ? appendSilenceTail(stretchedVoicedAudio, input.audio.subarray(voicedSampleCount))
      : stretchedVoicedAudio;

  const voicedDurationMs = (stretchedVoicedAudio.length / input.sampleRate) * 1000;
  const durationMs = voicedDurationMs + (input.silenceMs ?? 0);

  return {
    audio: stretchedAudio,
    durationMs,
    wordTimestamps: scaleWordTimestamps(input.wordTimestamps, tempoFactor),
    applied: true,
  };
}

function clampSilenceSamples(totalSamples: number, sampleRate: number, silenceMs: number): number {
  if (!Number.isFinite(silenceMs) || silenceMs <= 0) return 0;
  return Math.max(0, Math.min(totalSamples, Math.round((silenceMs / 1000) * sampleRate)));
}

function appendSilenceTail(voicedAudio: Float32Array, silenceTail: Float32Array): Float32Array {
  const result = new Float32Array(voicedAudio.length + silenceTail.length);
  result.set(voicedAudio, 0);
  result.set(silenceTail, voicedAudio.length);
  return result;
}

function scaleWordTimestamps(
  wordTimestamps: TempoStretchWordTimestamp[] | null | undefined,
  tempoFactor: number,
): TempoStretchWordTimestamp[] | null | undefined {
  if (!wordTimestamps) return wordTimestamps;
  return wordTimestamps.map((timestamp) => ({
    ...timestamp,
    startTime: timestamp.startTime / tempoFactor,
    endTime: timestamp.endTime / tempoFactor,
  }));
}

export function stretchTempoPitchPreserving(
  source: Float32Array,
  sampleRate: number,
  tempoFactor: number,
): Float32Array {
  if (!Number.isFinite(tempoFactor) || tempoFactor <= 0 || Math.abs(tempoFactor - 1) < TEMPO_EPSILON) {
    return source;
  }

  const windowSize = normalizeWindowSize(source.length, sampleRate);
  const overlapSize = normalizeOverlapSize(windowSize, sampleRate);
  const synthesisHop = windowSize - overlapSize;
  if (windowSize <= 0 || overlapSize <= 0 || synthesisHop <= 0 || source.length < windowSize * 2) {
    return source;
  }

  const searchRadius = Math.max(16, Math.round((SEARCH_MS / 1000) * sampleRate));
  const analysisHop = Math.max(1, Math.round(synthesisHop * tempoFactor));
  const targetLength = Math.max(windowSize, Math.round(source.length / tempoFactor));
  const output = new Float32Array(targetLength + windowSize + searchRadius * 2);

  output.set(source.subarray(0, windowSize), 0);

  let inputPos = 0;
  let outputPos = 0;
  let writtenLength = windowSize;

  while (true) {
    const expectedInputPos = inputPos + analysisHop;
    if (expectedInputPos + windowSize >= source.length) break;

    outputPos += synthesisHop;

    const center = Math.round(expectedInputPos);
    const minCandidate = Math.max(inputPos + 1, center - searchRadius);
    const maxCandidate = Math.min(source.length - windowSize, center + searchRadius);
    const bestCandidate = findBestCandidate(source, output, outputPos, overlapSize, minCandidate, maxCandidate, center);

    overlapAdd(output, outputPos, source, bestCandidate, windowSize, overlapSize);
    inputPos = bestCandidate;
    writtenLength = Math.max(writtenLength, outputPos + windowSize);
  }

  if (writtenLength < targetLength) {
    const missingSamples = Math.min(targetLength - writtenLength, source.length);
    const tailStart = Math.max(0, source.length - missingSamples);
    output.set(source.subarray(tailStart), writtenLength);
    writtenLength += source.length - tailStart;
  }

  const renderLength = Math.max(windowSize, Math.min(writtenLength, targetLength));
  return output.slice(0, renderLength);
}

function normalizeWindowSize(sourceLength: number, sampleRate: number): number {
  const nominal = Math.round((WINDOW_MS / 1000) * sampleRate);
  const maxWindow = Math.max(MIN_WINDOW_SAMPLES, Math.floor(sourceLength / 2));
  return clampToEven(Math.max(MIN_WINDOW_SAMPLES, Math.min(nominal, maxWindow)));
}

function normalizeOverlapSize(windowSize: number, sampleRate: number): number {
  const nominal = Math.round((OVERLAP_MS / 1000) * sampleRate);
  const maxOverlap = Math.max(MIN_OVERLAP_SAMPLES, Math.floor(windowSize / 2));
  return clampToEven(Math.max(MIN_OVERLAP_SAMPLES, Math.min(nominal, maxOverlap)));
}

function clampToEven(value: number): number {
  return value % 2 === 0 ? value : value - 1;
}

function findBestCandidate(
  source: Float32Array,
  output: Float32Array,
  outputPos: number,
  overlapSize: number,
  minCandidate: number,
  maxCandidate: number,
  fallbackCandidate: number,
): number {
  if (minCandidate >= maxCandidate) return Math.max(0, Math.min(source.length - overlapSize, fallbackCandidate));

  let bestCandidate = fallbackCandidate;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let candidate = minCandidate; candidate <= maxCandidate; candidate++) {
    let dot = 0;
    let outputEnergy = 0;
    let sourceEnergy = 0;

    for (let i = 0; i < overlapSize; i++) {
      const existing = output[outputPos + i];
      const incoming = source[candidate + i];
      dot += existing * incoming;
      outputEnergy += existing * existing;
      sourceEnergy += incoming * incoming;
    }

    const denominator = Math.sqrt(outputEnergy * sourceEnergy);
    const score = denominator > 0 ? dot / denominator : dot;
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

function overlapAdd(
  output: Float32Array,
  outputPos: number,
  source: Float32Array,
  sourcePos: number,
  windowSize: number,
  overlapSize: number,
): void {
  const maxOverlap = Math.max(0, Math.min(overlapSize, output.length - outputPos, source.length - sourcePos));
  for (let i = 0; i < maxOverlap; i++) {
    const mix = i / overlapSize;
    output[outputPos + i] = output[outputPos + i] * (1 - mix) + source[sourcePos + i] * mix;
  }

  const copyStart = outputPos + maxOverlap;
  const requestedCopyEnd = sourcePos + windowSize;
  const maxCopySamples = Math.max(0, Math.min(requestedCopyEnd - (sourcePos + maxOverlap), output.length - copyStart));
  if (maxCopySamples > 0) {
    output.set(source.subarray(sourcePos + maxOverlap, sourcePos + maxOverlap + maxCopySamples), copyStart);
  }
}
