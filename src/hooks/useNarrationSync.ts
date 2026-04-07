import { useState, useEffect, useRef } from "react";
import {
  TTS_PAUSE_COMMA_MS,
  TTS_PAUSE_CLAUSE_MS,
  TTS_PAUSE_SENTENCE_MS,
  TTS_PAUSE_PARAGRAPH_MS,
  TTS_DIALOGUE_SENTENCE_THRESHOLD,
} from "../constants";
import type { BlurbySettings, BlurbyDoc } from "../types";
import type { BookWordArray } from "../types/narration";

type DocWithContent = BlurbyDoc & { content: string };

/** Return type of the useNarration hook (duck-typed to avoid circular import). */
interface NarrationHook {
  setBookId: (id: string) => void;
  setPronunciationOverrides: (overrides: Array<{ id: string; from: string; to: string; enabled: boolean }>) => void;
  setBookPronunciationOverrides: (overrides: Array<{ id: string; from: string; to: string; enabled: boolean }>) => void;
  setEngine: (engine: "web" | "kokoro") => void;
  selectVoice: (voice: SpeechSynthesisVoice) => void;
  setKokoroVoice: (name: string) => void;
  adjustRate: (rate: number) => void;
  setPauseConfig: (config: {
    commaMs: number;
    clauseMs: number;
    sentenceMs: number;
    paragraphMs: number;
    dialogueThreshold: number;
  }) => void;
  setFootnoteMode: (mode: "skip" | "read") => void;
  setFootnoteCues: (cues: Array<{ afterWordIdx: number; text: string }>) => void;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  rate: number;
}

interface UseNarrationSyncParams {
  activeDoc: DocWithContent;
  settings: BlurbySettings;
  narration: NarrationHook;
  /** Ref to footnote cues (shared mutable). */
  footnoteCuesRef: React.MutableRefObject<Array<{ afterWordIdx: number; text: string }>>;
}

interface UseNarrationSyncReturn {
  bookWordMeta: { sections: BookWordArray["sections"]; totalWords: number } | null;
  setBookWordMeta: React.Dispatch<React.SetStateAction<{ sections: BookWordArray["sections"]; totalWords: number } | null>>;
  currentNarrationSectionRef: React.MutableRefObject<number>;
}

/**
 * Syncs narration-related settings and document state into the useNarration hook.
 *
 * Extracts 10 useEffect hooks from ReaderContainer that bridge settings/document
 * changes to the narration system: book ID, pronunciation overrides, TTS engine/voice/rate,
 * pause config, footnote mode/cues, and bookWordMeta reset.
 *
 * Note: TOC chapter re-resolution and section-end wiring are handled by useFoliateSync.
 */
export function useNarrationSync({
  activeDoc,
  settings,
  narration,
  footnoteCuesRef,
}: UseNarrationSyncParams): UseNarrationSyncReturn {
  // ── State owned by this hook ────────────────────────────────────────────
  const [bookWordMeta, setBookWordMeta] = useState<{ sections: BookWordArray["sections"]; totalWords: number } | null>(null);
  const currentNarrationSectionRef = useRef<number>(-1);

  // ── Refs for voice sync (avoid triggering re-runs on voice list changes) ──
  const narrationVoicesRef = useRef(narration.voices);
  narrationVoicesRef.current = narration.voices;
  const narrationCurrentVoiceRef = useRef(narration.currentVoice);
  narrationCurrentVoiceRef.current = narration.currentVoice;
  const narrationSelectVoiceRef = useRef(narration.selectVoice);
  narrationSelectVoiceRef.current = narration.selectVoice;
  const narrationSetKokoroVoiceRef = useRef(narration.setKokoroVoice);
  narrationSetKokoroVoiceRef.current = narration.setKokoroVoice;

  // ── 1. Sync book ID to narration hook for cache keying ──────────────────
  // Footnote mode affects generated audio text, so it must partition cache identity.
  useEffect(() => {
    narration.setBookId(`${activeDoc.id}::fn:${settings.ttsFootnoteMode || "skip"}`);
  }, [activeDoc.id, settings.ttsFootnoteMode, narration.setBookId]);

  // ── 2. Sync pronunciation overrides (global) → narration hook ───────────
  useEffect(() => {
    narration.setPronunciationOverrides(settings.pronunciationOverrides || []);
  }, [settings.pronunciationOverrides]);

  // ── 3. Sync pronunciation overrides (per-book) → narration hook ─────────
  useEffect(() => {
    narration.setBookPronunciationOverrides(activeDoc.pronunciationOverrides || []);
  }, [activeDoc.pronunciationOverrides, activeDoc.id]);

  // ── 4. Sync TTS engine from settings → narration hook ───────────────────
  useEffect(() => {
    narration.setEngine(settings.ttsEngine || "web");
  }, [settings.ttsEngine, narration.setEngine]);

  // ── 5. Sync TTS voice from settings → narration hook ────────────────────
  useEffect(() => {
    if (settings.ttsEngine === "kokoro" && settings.ttsVoiceName) {
      narrationSetKokoroVoiceRef.current(settings.ttsVoiceName);
    } else if (settings.ttsVoiceName && narrationVoicesRef.current.length > 0) {
      const voice = narrationVoicesRef.current.find((v) => v.name === settings.ttsVoiceName);
      if (voice && voice.name !== narrationCurrentVoiceRef.current?.name) {
        narrationSelectVoiceRef.current(voice);
      }
    }
  }, [settings.ttsEngine, settings.ttsVoiceName]);

  // ── 6. Sync TTS rate from settings → narration hook ─────────────────────
  useEffect(() => {
    if (settings.ttsRate && settings.ttsRate !== narration.rate) {
      narration.adjustRate(settings.ttsRate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.ttsRate]);

  // ── 7. Sync TTS pause config from settings → narration hook ─────────────
  useEffect(() => {
    narration.setPauseConfig({
      commaMs: settings.ttsPauseCommaMs ?? TTS_PAUSE_COMMA_MS,
      clauseMs: settings.ttsPauseClauseMs ?? TTS_PAUSE_CLAUSE_MS,
      sentenceMs: settings.ttsPauseSentenceMs ?? TTS_PAUSE_SENTENCE_MS,
      paragraphMs: settings.ttsPauseParagraphMs ?? TTS_PAUSE_PARAGRAPH_MS,
      dialogueThreshold: settings.ttsDialogueSentenceThreshold ?? TTS_DIALOGUE_SENTENCE_THRESHOLD,
    });
  }, [settings.ttsPauseCommaMs, settings.ttsPauseClauseMs, settings.ttsPauseSentenceMs, settings.ttsPauseParagraphMs, settings.ttsDialogueSentenceThreshold, narration.setPauseConfig]);

  // ── 8. Reset bookWordMeta + footnoteCues on doc change ──────────────────
  useEffect(() => {
    setBookWordMeta(null);
    footnoteCuesRef.current = [];
  }, [activeDoc.id]);

  // ── 9. Sync footnote mode from settings → narration hook ────────────────
  useEffect(() => {
    narration.setFootnoteMode(settings.ttsFootnoteMode || "skip");
  }, [settings.ttsFootnoteMode, narration]);

  // ── 10. Sync footnote cues → narration hook ─────────────────────────────
  useEffect(() => {
    narration.setFootnoteCues(footnoteCuesRef.current);
  }, [narration, activeDoc.id, bookWordMeta?.totalWords]);

  return {
    bookWordMeta,
    setBookWordMeta,
    currentNarrationSectionRef,
  };
}
