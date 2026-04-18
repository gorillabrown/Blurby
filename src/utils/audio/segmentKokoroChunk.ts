import { KOKORO_LIVE_RATE_MAX_SEGMENT_DURATION_MS } from "../../constants";
import type {
  KokoroLiveRateSegmentOptions,
  KokoroSchedulerSegmentMetadata,
} from "../../types/narration";
import { computeWordWeights, type ScheduledChunk } from "../audioScheduler";
import { resolveKokoroRatePlan } from "../kokoroRatePlan";

type WordTimestamp = NonNullable<ScheduledChunk["wordTimestamps"]>[number];

export type SegmentedKokoroChunk = ScheduledChunk & KokoroSchedulerSegmentMetadata;

const TIMING_EPSILON_MS = 0.001;

export function segmentKokoroChunk(
  chunk: ScheduledChunk,
  options: Partial<KokoroLiveRateSegmentOptions> = {},
): SegmentedKokoroChunk[] {
  if (chunk.words.length === 0) return [];

  const maxSegmentDurationMs = normalizeMaxSegmentDuration(options.maxSegmentDurationMs);
  const minSegmentWords = normalizeMinSegmentWords(options.minSegmentWords);
  const maxSegmentWords = normalizeMaxSegmentWords(options.maxSegmentWords, chunk.words.length);
  const tempoFactor = resolveTempoFactor(chunk);
  const parentChunkWordCount = chunk.words.length;
  const timeline = buildSegmentTimeline(chunk);
  const segments: SegmentedKokoroChunk[] = [];

  let segmentStartWord = 0;
  let segmentIndex = 0;

  while (segmentStartWord < chunk.words.length) {
    let segmentEndWord = segmentStartWord;

    while (segmentEndWord + 1 < chunk.words.length) {
      const nextEndWord = segmentEndWord + 1;
      const nextWordCount = nextEndWord - segmentStartWord + 1;
      const remainingWordCount = chunk.words.length - (nextEndWord + 1);

      if (nextWordCount > maxSegmentWords) break;

      const playbackDurationMs = toPlaybackDurationMs(
        timeline[segmentStartWord].startTime,
        timeline[nextEndWord].endTime,
        tempoFactor,
      );
      const wouldLeaveTooFewWords = remainingWordCount > 0 && remainingWordCount < minSegmentWords;

      if (
        playbackDurationMs > maxSegmentDurationMs + TIMING_EPSILON_MS &&
        nextWordCount >= minSegmentWords &&
        !wouldLeaveTooFewWords
      ) {
        break;
      }

      segmentEndWord = nextEndWord;

      if (playbackDurationMs >= maxSegmentDurationMs - TIMING_EPSILON_MS) {
        break;
      }
    }

    if (chunk.words.length - (segmentEndWord + 1) < minSegmentWords) {
      segmentEndWord = chunk.words.length - 1;
    }

    const isFinalSegment = segmentEndWord === chunk.words.length - 1;
    segments.push(
      createSegment(chunk, timeline, {
        segmentStartWord,
        segmentEndWord,
        segmentIndex,
        parentChunkWordCount,
        isFinalSegment,
      }),
    );

    segmentStartWord = segmentEndWord + 1;
    segmentIndex += 1;
  }

  return segments;
}

function createSegment(
  chunk: ScheduledChunk,
  timeline: WordTimestamp[],
  segment: {
    segmentStartWord: number;
    segmentEndWord: number;
    segmentIndex: number;
    parentChunkWordCount: number;
    isFinalSegment: boolean;
  },
): SegmentedKokoroChunk {
  const { segmentStartWord, segmentEndWord, segmentIndex, parentChunkWordCount, isFinalSegment } = segment;
  const segmentStartTime = timeline[segmentStartWord].startTime;
  const segmentEndTime = timeline[segmentEndWord].endTime;
  const startSample = clampSampleIndex(Math.floor(segmentStartTime * chunk.sampleRate), chunk.audio.length);
  const endSample = isFinalSegment
    ? chunk.audio.length
    : clampEndSample(Math.ceil(segmentEndTime * chunk.sampleRate), startSample, chunk.audio.length);
  const segmentAudio = chunk.audio.slice(startSample, endSample);
  const segmentWords = chunk.words.slice(segmentStartWord, segmentEndWord + 1);
  const rebasedTimestamps = timeline
    .slice(segmentStartWord, segmentEndWord + 1)
    .map((timestamp) => ({
      word: timestamp.word,
      startTime: timestamp.startTime - segmentStartTime,
      endTime: timestamp.endTime - segmentStartTime,
    }));

  return {
    audio: segmentAudio,
    sampleRate: chunk.sampleRate,
    durationMs: samplesToDurationMs(segmentAudio.length, chunk.sampleRate),
    words: segmentWords,
    startIdx: chunk.startIdx + segmentStartWord,
    kokoroRatePlan: chunk.kokoroRatePlan,
    weightConfig: chunk.weightConfig,
    boundaryType: isFinalSegment ? chunk.boundaryType : undefined,
    silenceMs: isFinalSegment ? chunk.silenceMs : undefined,
    wordTimestamps: rebasedTimestamps,
    parentChunkStartIdx: chunk.startIdx,
    parentChunkWordCount,
    segmentIndex,
    isFinalSegment,
  };
}

function buildSegmentTimeline(chunk: ScheduledChunk): WordTimestamp[] {
  if (hasUsableWordTimestamps(chunk)) {
    return chunk.wordTimestamps.map((timestamp) => ({
      word: timestamp.word,
      startTime: timestamp.startTime,
      endTime: timestamp.endTime,
    }));
  }

  return buildFallbackTimeline(chunk);
}

function hasUsableWordTimestamps(chunk: ScheduledChunk): chunk is ScheduledChunk & { wordTimestamps: WordTimestamp[] } {
  if (!chunk.wordTimestamps || chunk.wordTimestamps.length !== chunk.words.length) return false;

  for (let i = 0; i < chunk.wordTimestamps.length; i += 1) {
    const timestamp = chunk.wordTimestamps[i];
    const previous = i > 0 ? chunk.wordTimestamps[i - 1] : null;
    if (!timestamp) return false;
    if (timestamp.word !== chunk.words[i]) return false;
    if (!Number.isFinite(timestamp.startTime) || !Number.isFinite(timestamp.endTime)) return false;
    if (timestamp.startTime < 0 || timestamp.endTime < timestamp.startTime) return false;
    if (previous && timestamp.startTime < previous.startTime) return false;
  }

  return true;
}

function buildFallbackTimeline(chunk: ScheduledChunk): WordTimestamp[] {
  const voicedDurationMs = Math.max(0, chunk.durationMs - (chunk.silenceMs ?? 0));
  const voicedDurationSec = voicedDurationMs / 1000;
  const weights = computeWordWeights(chunk.words, chunk.weightConfig);
  const timeline: WordTimestamp[] = [];
  let cursorSec = 0;

  for (let i = 0; i < chunk.words.length; i += 1) {
    const startTime = cursorSec;
    cursorSec += voicedDurationSec * (weights[i] ?? 0);
    const endTime = i === chunk.words.length - 1 ? voicedDurationSec : cursorSec;

    timeline.push({
      word: chunk.words[i],
      startTime,
      endTime,
    });
  }

  return timeline;
}

function normalizeMaxSegmentDuration(maxSegmentDurationMs?: number): number {
  if (!Number.isFinite(maxSegmentDurationMs) || !maxSegmentDurationMs || maxSegmentDurationMs <= 0) {
    return KOKORO_LIVE_RATE_MAX_SEGMENT_DURATION_MS;
  }

  return maxSegmentDurationMs;
}

function normalizeMinSegmentWords(minSegmentWords?: number): number {
  if (!Number.isFinite(minSegmentWords) || !minSegmentWords || minSegmentWords <= 1) return 1;
  return Math.floor(minSegmentWords);
}

function normalizeMaxSegmentWords(maxSegmentWords: number | undefined, totalWords: number): number {
  if (!Number.isFinite(maxSegmentWords) || !maxSegmentWords || maxSegmentWords < 1) return totalWords;
  return Math.max(1, Math.floor(maxSegmentWords));
}

function resolveTempoFactor(chunk: ScheduledChunk): number {
  const tempoFactor = chunk.kokoroRatePlan?.tempoFactor;
  if (Number.isFinite(tempoFactor) && tempoFactor > 0) {
    return tempoFactor;
  }

  const selectedSpeed = chunk.kokoroRatePlan?.selectedSpeed;
  if (Number.isFinite(selectedSpeed) && selectedSpeed > 0) {
    return resolveKokoroRatePlan(selectedSpeed).tempoFactor;
  }

  return 1;
}

function toPlaybackDurationMs(startTimeSec: number, endTimeSec: number, tempoFactor: number): number {
  return Math.max(0, ((endTimeSec - startTimeSec) * 1000) / tempoFactor);
}

function clampSampleIndex(sampleIndex: number, totalSamples: number): number {
  return Math.max(0, Math.min(totalSamples, sampleIndex));
}

function clampEndSample(sampleIndex: number, startSample: number, totalSamples: number): number {
  return Math.max(startSample + 1, Math.min(totalSamples, sampleIndex));
}

function samplesToDurationMs(sampleCount: number, sampleRate: number): number {
  if (sampleRate <= 0) return 0;
  return (sampleCount / sampleRate) * 1000;
}
