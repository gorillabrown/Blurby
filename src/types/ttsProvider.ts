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
  timingTruth: TtsProviderTimingTruth;
  canBlendVoices: boolean;
  supportsVoiceCloning: boolean;
  supportedLanguages: readonly string[];
  sampleRate: number | null;
  license: string;
  cacheable: boolean;
  statusKind: TtsProviderStatusKind;
}

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
