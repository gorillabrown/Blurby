"use strict";

const path = require("path");
const fs = require("fs/promises");
const { extractWords } = require("./epub-word-extractor");
const ttsCache = require("./tts-cache");

const SUBTITLE_MAX_WORDS = 12;
const SUBTITLE_MAX_DURATION_MS = 2600;
const SUBTITLE_BREAK_GAP_MS = 650;

function sanitizeStem(value, fallback = "narration") {
  return String(value || fallback)
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || fallback;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function pad3(value) {
  return String(value).padStart(3, "0");
}

function formatSrtTime(ms) {
  const safeMs = Math.max(0, Math.floor(ms));
  const hours = Math.floor(safeMs / 3_600_000);
  const minutes = Math.floor((safeMs % 3_600_000) / 60_000);
  const seconds = Math.floor((safeMs % 60_000) / 1000);
  const millis = safeMs % 1000;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)},${pad3(millis)}`;
}

function formatVttTime(ms) {
  const safeMs = Math.max(0, Math.floor(ms));
  const hours = Math.floor(safeMs / 3_600_000);
  const minutes = Math.floor((safeMs % 3_600_000) / 60_000);
  const seconds = Math.floor((safeMs % 60_000) / 1000);
  const millis = safeMs % 1000;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}.${pad3(millis)}`;
}

function clampToInt16(sample) {
  const clamped = Math.max(-1, Math.min(1, Number(sample) || 0));
  return clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7FFF);
}

async function writePcm16Wav(filePath, pcm, sampleRate) {
  const safeSampleRate = Number.isFinite(sampleRate) && sampleRate > 0 ? Math.floor(sampleRate) : 24_000;
  const channelCount = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const byteRate = safeSampleRate * channelCount * bytesPerSample;
  const blockAlign = channelCount * bytesPerSample;
  const dataBytes = pcm.length * bytesPerSample;
  const buffer = Buffer.allocUnsafe(44 + dataBytes);

  buffer.write("RIFF", 0, 4, "ascii");
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8, 4, "ascii");
  buffer.write("fmt ", 12, 4, "ascii");
  buffer.writeUInt32LE(16, 16); // PCM fmt chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(channelCount, 22);
  buffer.writeUInt32LE(safeSampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36, 4, "ascii");
  buffer.writeUInt32LE(dataBytes, 40);

  let offset = 44;
  for (let i = 0; i < pcm.length; i += 1) {
    buffer.writeInt16LE(clampToInt16(pcm[i]), offset);
    offset += 2;
  }
  await fs.writeFile(filePath, buffer);
}

function pickSubtitleFormat(value) {
  const normalized = String(value || "none").toLowerCase().trim();
  if (normalized === "srt" || normalized === "vtt" || normalized === "both") return normalized;
  return "none";
}

function resolveDocEpubPath(doc) {
  const converted = typeof doc?.convertedEpubPath === "string" ? doc.convertedEpubPath : "";
  if (converted.toLowerCase().endsWith(".epub")) return converted;
  const raw = typeof doc?.filepath === "string" ? doc.filepath : "";
  if (raw.toLowerCase().endsWith(".epub")) return raw;
  return null;
}

function createAnchor(bookId, startIdx, endIdx) {
  return { bookId, startIdx, endIdx };
}

function resolveWordText(globalWordIdx, fallbackWord, extractedWords) {
  const fromBook = Array.isArray(extractedWords) ? extractedWords[globalWordIdx] : null;
  if (typeof fromBook === "string" && fromBook.length) return fromBook;
  if (typeof fallbackWord === "string" && fallbackWord.length) return fallbackWord;
  return `w${globalWordIdx}`;
}

function buildSubtitleCues(wordTimeline) {
  if (!Array.isArray(wordTimeline) || wordTimeline.length === 0) return [];
  const cues = [];
  let current = [];
  let cueStartMs = wordTimeline[0].startMs;

  const pushCue = () => {
    if (current.length === 0) return;
    const first = current[0];
    const last = current[current.length - 1];
    cues.push({
      startMs: first.startMs,
      endMs: Math.max(first.startMs, last.endMs),
      text: current.map((item) => item.word).join(" ").trim(),
      startWordIdx: first.wordIndex,
      endWordIdx: last.wordIndex + 1,
    });
    current = [];
  };

  for (let i = 0; i < wordTimeline.length; i += 1) {
    const item = wordTimeline[i];
    const previous = current[current.length - 1] || null;
    if (current.length === 0) cueStartMs = item.startMs;

    if (previous) {
      const gapMs = Math.max(0, item.startMs - previous.endMs);
      const durationMs = Math.max(0, previous.endMs - cueStartMs);
      const sentenceBreak = /[.!?]["')\]]*$/.test(previous.word);
      const cueTooLong = current.length >= SUBTITLE_MAX_WORDS || durationMs >= SUBTITLE_MAX_DURATION_MS;
      const gapBreak = gapMs >= SUBTITLE_BREAK_GAP_MS;
      if (sentenceBreak || cueTooLong || gapBreak) {
        pushCue();
        cueStartMs = item.startMs;
      }
    }

    current.push(item);
  }

  pushCue();
  return cues;
}

function renderSrt(cues) {
  const lines = [];
  for (let i = 0; i < cues.length; i += 1) {
    const cue = cues[i];
    lines.push(String(i + 1));
    lines.push(`${formatSrtTime(cue.startMs)} --> ${formatSrtTime(cue.endMs)}`);
    lines.push(cue.text);
    lines.push("");
  }
  return lines.join("\n");
}

function renderVtt(cues) {
  const lines = ["WEBVTT", ""];
  for (let i = 0; i < cues.length; i += 1) {
    const cue = cues[i];
    lines.push(`${i + 1}`);
    lines.push(`${formatVttTime(cue.startMs)} --> ${formatVttTime(cue.endMs)}`);
    lines.push(cue.text);
    lines.push("");
  }
  return lines.join("\n");
}

function findWordTime(wordStartMap, chunkTimeline, wordIdx) {
  if (wordStartMap.has(wordIdx)) return wordStartMap.get(wordIdx);
  for (const chunk of chunkTimeline) {
    if (wordIdx >= chunk.startIdx && wordIdx < chunk.endIdx) {
      const span = Math.max(1, chunk.endIdx - chunk.startIdx);
      const progress = (wordIdx - chunk.startIdx) / span;
      return chunk.startMs + progress * (chunk.endMs - chunk.startMs);
    }
  }
  return null;
}

function buildChapterMarkers(bookId, sections, wordStartMap, chunkTimeline, durationMs) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return [
      {
        index: 0,
        title: "Chapter 1",
        startWordIdx: 0,
        endWordIdx: null,
        startTimeMs: 0,
        anchor: createAnchor(bookId, 0, Number.MAX_SAFE_INTEGER),
      },
    ];
  }

  const markers = [];
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const startWordIdx = Number.isFinite(section.startWordIdx) ? section.startWordIdx : 0;
    const endWordIdx = Number.isFinite(section.endWordIdx) ? section.endWordIdx : startWordIdx;
    const title = typeof section.title === "string" && section.title.trim()
      ? section.title.trim()
      : `Chapter ${i + 1}`;
    let startTimeMs = findWordTime(wordStartMap, chunkTimeline, startWordIdx);
    if (!Number.isFinite(startTimeMs)) {
      startTimeMs = i === 0
        ? 0
        : Math.min(durationMs, Math.max(0, (durationMs * i) / sections.length));
    }
    markers.push({
      index: i,
      title,
      startWordIdx,
      endWordIdx,
      startTimeMs: Math.max(0, Math.round(startTimeMs)),
      anchor: createAnchor(bookId, startWordIdx, endWordIdx),
    });
  }
  return markers.sort((a, b) => a.startTimeMs - b.startTimeMs);
}

async function resolveSectionMetadata(doc) {
  const epubPath = resolveDocEpubPath(doc);
  if (!epubPath) return { words: null, sections: null, source: null };
  const extracted = await extractWords(epubPath);
  const sections = Array.isArray(extracted.sections)
    ? extracted.sections.map((section, index) => ({
      sectionIndex: Number.isFinite(section.sectionIndex) ? section.sectionIndex : index,
      startWordIdx: Number.isFinite(section.startWordIdx) ? section.startWordIdx : 0,
      endWordIdx: Number.isFinite(section.endWordIdx) ? section.endWordIdx : 0,
      wordCount: Number.isFinite(section.wordCount) ? section.wordCount : 0,
      title: `Section ${index + 1}`,
    }))
    : null;
  return {
    words: Array.isArray(extracted.words) ? extracted.words : null,
    sections,
    source: epubPath,
  };
}

async function exportLongFormAudio(params) {
  const {
    doc,
    bookId,
    voiceId,
    outputDir,
    subtitleFormat,
    fileStem,
  } = params || {};

  if (!bookId || !voiceId) {
    throw new Error("bookId and voiceId are required for Kokoro export.");
  }

  const subtitleMode = pickSubtitleFormat(subtitleFormat);
  const exportRoot = outputDir || path.join(process.cwd(), "exports", "kokoro");
  await fs.mkdir(exportRoot, { recursive: true });
  const stem = sanitizeStem(fileStem || doc?.title || `book-${bookId}`);

  const cachedChunks = await ttsCache.readStructuredBookVoiceChunks(bookId, voiceId, { provider: "kokoro" });
  if (!Array.isArray(cachedChunks) || cachedChunks.length === 0) {
    throw new Error("No cached Kokoro chunks found for this book/voice. Run narration first, then retry export.");
  }

  const sectionMeta = await resolveSectionMetadata(doc);
  const extractedWords = sectionMeta.words;

  let totalSamples = 0;
  let sampleRate = null;
  for (const chunk of cachedChunks) {
    totalSamples += chunk.audio.length;
    if (!sampleRate) sampleRate = chunk.sampleRate;
    if (sampleRate && chunk.sampleRate !== sampleRate) {
      throw new Error("Mixed sample rates detected in cache; cannot produce a single WAV export.");
    }
  }
  const pcm = new Float32Array(totalSamples);
  const chunkTimeline = [];
  const wordTimeline = [];
  const wordStartMap = new Map();

  let sampleOffset = 0;
  let audioCursorMs = 0;
  for (const chunk of cachedChunks) {
    pcm.set(chunk.audio, sampleOffset);
    sampleOffset += chunk.audio.length;

    const chunkStartMs = audioCursorMs;
    const chunkDurationMs = Number.isFinite(chunk.durationMs)
      ? chunk.durationMs
      : (chunk.audio.length / sampleRate) * 1000;
    const chunkEndMs = chunkStartMs + chunkDurationMs;
    audioCursorMs = chunkEndMs;

    const chunkStartIdx = Number.isFinite(chunk.chunkStartIdx) ? chunk.chunkStartIdx : chunk.startIdx;
    const chunkEndIdx = Number.isFinite(chunk.chunkEndIdx)
      ? chunk.chunkEndIdx
      : (Number.isFinite(chunk.wordCount) ? chunkStartIdx + chunk.wordCount : chunkStartIdx);
    const wordCount = Math.max(0, chunkEndIdx - chunkStartIdx);

    chunkTimeline.push({
      startIdx: chunkStartIdx,
      endIdx: chunkEndIdx,
      startMs: chunkStartMs,
      endMs: chunkEndMs,
      durationMs: chunkDurationMs,
      timingTruth: chunk.timing?.timingTruth ?? chunk.timingTruth ?? "none",
      timingClassification: chunk.timing?.timingClassification ?? "missing",
      anchor: createAnchor(bookId, chunkStartIdx, chunkEndIdx),
    });

    const trustedWordTiming = Array.isArray(chunk.timing?.wordTimestamps)
      && chunk.timing?.timingClassification === "trusted"
      && chunk.timing.wordTimestamps.length === wordCount;

    for (let localIdx = 0; localIdx < wordCount; localIdx += 1) {
      const globalWordIdx = chunkStartIdx + localIdx;
      let startMs = chunkStartMs;
      let endMs = chunkEndMs;
      let fallbackWord = null;
      if (trustedWordTiming) {
        const ts = chunk.timing.wordTimestamps[localIdx];
        startMs = chunkStartMs + ts.startTime * 1000;
        endMs = chunkStartMs + ts.endTime * 1000;
        fallbackWord = ts.word;
      } else {
        const stepMs = wordCount > 0 ? chunkDurationMs / wordCount : 0;
        startMs = chunkStartMs + (localIdx * stepMs);
        endMs = chunkStartMs + ((localIdx + 1) * stepMs);
      }
      startMs = Math.max(chunkStartMs, startMs);
      endMs = Math.max(startMs, Math.min(chunkEndMs, endMs));
      const word = resolveWordText(globalWordIdx, fallbackWord, extractedWords);
      wordTimeline.push({
        wordIndex: globalWordIdx,
        word,
        startMs,
        endMs,
        anchor: createAnchor(bookId, globalWordIdx, globalWordIdx + 1),
      });
      if (!wordStartMap.has(globalWordIdx)) wordStartMap.set(globalWordIdx, startMs);
    }
  }

  const audioPath = path.join(exportRoot, `${stem}.wav`);
  await writePcm16Wav(audioPath, pcm, sampleRate);

  const markers = buildChapterMarkers(
    bookId,
    sectionMeta.sections,
    wordStartMap,
    chunkTimeline,
    audioCursorMs,
  );
  const chaptersPath = path.join(exportRoot, `${stem}.chapters.json`);
  await fs.writeFile(chaptersPath, JSON.stringify({ schemaVersion: 1, markers }, null, 2), "utf-8");

  const subtitlePaths = {};
  if (subtitleMode === "srt" || subtitleMode === "both" || subtitleMode === "vtt") {
    const cues = buildSubtitleCues(wordTimeline);
    if (subtitleMode === "srt" || subtitleMode === "both") {
      subtitlePaths.srt = path.join(exportRoot, `${stem}.srt`);
      await fs.writeFile(subtitlePaths.srt, renderSrt(cues), "utf-8");
    }
    if (subtitleMode === "vtt" || subtitleMode === "both") {
      subtitlePaths.vtt = path.join(exportRoot, `${stem}.vtt`);
      await fs.writeFile(subtitlePaths.vtt, renderVtt(cues), "utf-8");
    }
  }

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    book: {
      id: bookId,
      title: doc?.title || null,
      sourcePath: sectionMeta.source || doc?.filepath || null,
    },
    provider: "kokoro",
    voiceId,
    sampleRate,
    durationMs: Math.round(audioCursorMs),
    chunkCount: chunkTimeline.length,
    wordCount: wordTimeline.length,
    outputs: {
      audioPath,
      chaptersPath,
      ...subtitlePaths,
    },
    chunkTimeline,
    chapterMarkers: markers,
  };
  const manifestPath = path.join(exportRoot, `${stem}.manifest.json`);
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  return {
    ok: true,
    audioPath,
    chaptersPath,
    manifestPath,
    subtitlePaths,
    chunkCount: chunkTimeline.length,
    wordCount: wordTimeline.length,
    durationMs: Math.round(audioCursorMs),
  };
}

module.exports = {
  exportLongFormAudio,
  writePcm16Wav,
  buildSubtitleCues,
  renderSrt,
  renderVtt,
  buildChapterMarkers,
};
