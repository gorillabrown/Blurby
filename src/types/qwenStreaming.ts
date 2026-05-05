export type QwenDisabledReason = "qwen-disabled";
export type QwenDisabledStatus = "unavailable";

export interface QwenDisabledMetadata {
  status: QwenDisabledStatus;
  reason: QwenDisabledReason;
  recoverable: false;
}

export type QwenStreamStartResult =
  | {
      ok: true;
      streamId: string;
      error?: never;
      status?: never;
      reason?: never;
      recoverable?: never;
    }
  | ({
      ok: false;
      streamId?: string;
      error?: string;
      status?: string;
      reason?: string | null;
      recoverable?: boolean;
    } | ({
      ok: false;
      streamId?: never;
      error?: string;
    } & QwenDisabledMetadata));

export interface QwenStreamAudioEvent {
  streamId: string;
  chunk: Buffer;
}

export interface QwenStreamingEngineStatus {
  ready: boolean;
  model_loaded: boolean;
  device: string;
  loading?: boolean;
  error?: string;
  warmupMs?: number;
  firstChunkMs?: number;
  status?: string;
  reason?: string | null;
  recoverable?: boolean;
}

export type QwenStreamingDisabledStatus = Omit<
  QwenStreamingEngineStatus,
  "ready" | "model_loaded" | "device" | "loading" | "status" | "reason" | "recoverable"
> & QwenDisabledMetadata & {
  ready: false;
  model_loaded: false;
  device: "disabled";
  loading: false;
};

export interface StreamAccumulatorConfig {
  text: string;
  words: string[];
  startIdx: number;
  sampleRate: number;
  getWeightConfig: () => unknown;
  getPauseConfig: () => unknown;
  getParagraphBreaks: () => number[];
  onSegmentReady: (chunk: unknown) => void;
  onStreamEnd: () => void;
}

export interface StreamAccumulator {
  feed(chunk: Float32Array): void;
  flush(): void;
  destroy(): void;
  getBufferedWordCount(): number;
}
