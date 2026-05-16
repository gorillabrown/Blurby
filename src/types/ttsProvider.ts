import type { TtsEngine } from "../types";
import type { TtsStrategy } from "./narration";

export type TtsProviderTimingTruth =
  | "word-native"
  | "segment-following"
  | "unreliable-boundary"
  | "none";

export type TtsProviderStatusKind =
  | "browser"
  | "local-model"
  | "sidecar"
  | "disabled";

export interface ProviderCapabilities {
  id: TtsEngine;
  label: string;
  selectable: boolean;
  defaultEngine: boolean;
  experimental: boolean;
  disabledReason: string | null;
  offline: boolean;
  requiresSidecar: boolean;
  canStream: boolean;
  providesWordTimings: boolean;
  emitsWordBoundaryEvents: boolean;
  timingTruth: TtsProviderTimingTruth;
  canBlendVoices: boolean;
  supportsVoiceCloning: boolean;
  supportedLanguages: readonly string[];
  sampleRate: number | null;
  license: string;
  cacheable: boolean;
  statusKind: TtsProviderStatusKind;
}

/**
 * Provider-level word-boundary timing event.
 * `sourceWordIndex` is the provider/native timing index (normalized token space);
 * `resolvedWordIndex` is the original global word index used by reader surfaces.
 */
export interface TtsProviderWordBoundaryEvent {
  sourceWordIndex: number | null;
  resolvedWordIndex: number;
  isTrustedWordTiming: boolean;
  alignmentCorrected: boolean;
  timingTruth: TtsProviderTimingTruth;
}

export type TtsProviderWordBoundaryCallback = (event: TtsProviderWordBoundaryEvent) => void;

export interface TTSProviderCopy {
  buttonLabel: string;
  posture: string;
  readyHint: string;
  blockedHint: string;
}

export interface TTSProvider {
  id: TtsEngine;
  capabilities: ProviderCapabilities;
  copy: TTSProviderCopy;
  /**
   * Placeholder for future provider-owned strategy creation. TTS-REGISTRY-1
   * records the seam only; existing playback strategy wiring remains unchanged.
   */
  createStrategy?: () => TtsStrategy;
}
