// src/hooks/narration/kokoroStrategy.ts — Kokoro TTS strategy (IPC + Web Audio)
import type { TtsStrategy } from "../../types/narration";
import * as audioPlayer from "../../utils/audioPlayer";

const api = window.electronAPI;

export interface KokoroStrategyDeps {
  /** Get current Kokoro voice ID */
  getVoiceId: () => string;
  /** Get current generation ID for stale-result detection */
  getGenerationId: () => number;
  /** Get whether a Kokoro IPC call is already in flight */
  getInFlight: () => boolean;
  /** Get current pre-buffer (if any) */
  getPreBuffer: () => { text: string; audio: any; sampleRate: number; durationMs: number } | null;
  /** Get the current narration status */
  getStatus: () => string;
  /** Get the current speed (may change during generation) */
  getSpeed: () => number;
  /** Set in-flight flag */
  setInFlight: (inFlight: boolean) => void;
  /** Clear the pre-buffer */
  clearPreBuffer: () => void;
  /** Kick off pre-buffering for the next chunk */
  preBufferNext: (afterEndIdx: number) => void;
  /** Called when Kokoro fails — caller should fall back to Web Speech */
  onFallbackToWeb: () => void;
  /** Called when generation ID is stale — caller should re-dispatch */
  onStaleGeneration: () => void;
}

/**
 * Create a TtsStrategy backed by Kokoro (local neural TTS via IPC + Web Audio).
 */
export function createKokoroStrategy(deps: KokoroStrategyDeps): TtsStrategy {
  return {
    speakChunk(text, words, _startIdx, speed, onWordAdvance, onEnd, onError) {
      console.debug("[kokoro] speak — chars:", text?.length, "words:", words?.length, "inFlight:", deps.getInFlight());
      if (!api?.kokoroGenerate) {
        onError();
        return;
      }
      if (deps.getInFlight()) return;

      const genId = deps.getGenerationId();
      deps.setInFlight(true);

      (async () => {
        try {
          // Check pre-buffer first
          let audio: any;
          let sampleRate: number;
          let durationMs: number;
          const buf = deps.getPreBuffer();
          if (buf && buf.text === text) {
            ({ audio, sampleRate, durationMs } = buf);
            deps.clearPreBuffer();
          } else {
            deps.clearPreBuffer();
            const ipcResult = await api.kokoroGenerate!(text, deps.getVoiceId(), deps.getSpeed());
            if (ipcResult.error || !ipcResult.audio || !ipcResult.sampleRate) {
              console.error("[kokoro] Generate failed:", ipcResult.error || "no audio returned");
              deps.onFallbackToWeb();
              return;
            }
            audio = ipcResult.audio;
            sampleRate = ipcResult.sampleRate;
            // Estimate duration from sample count if not provided
            durationMs = (ipcResult as any).durationMs ?? (ipcResult.audio!.length / ipcResult.sampleRate!) * 1000;
          }

          console.debug("[kokoro] IPC result — audio:", audio?.length, "samples @", sampleRate, "Hz,", durationMs, "ms, status:", deps.getStatus(), "genId ok:", genId === deps.getGenerationId());
          if (deps.getStatus() === "idle") return;

          // Discard stale IPC result if rate changed during generation
          if (genId !== deps.getGenerationId()) {
            console.debug("[kokoro] stale genId — re-dispatching");
            deps.setInFlight(false); // Clear BEFORE re-dispatch so speakNextChunk isn't blocked
            deps.onStaleGeneration();
            return;
          }

          // Start pre-buffering next chunk while this one plays
          deps.preBufferNext(_startIdx + words.length);

          audioPlayer.playBuffer(
            audio,
            sampleRate,
            durationMs,
            words.length,
            (wordOffset: number) => {
              onWordAdvance(wordOffset);
            },
            () => {
              onEnd();
            },
          );
        } catch {
          deps.onFallbackToWeb();
        } finally {
          deps.setInFlight(false);
        }
      })();
    },

    stop() {
      audioPlayer.stop();
    },

    pause() {
      audioPlayer.pause();
    },

    resume() {
      audioPlayer.resume();
    },
  };
}
