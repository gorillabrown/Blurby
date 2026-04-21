export interface QwenStreamStartResult {
  ok: boolean;
  streamId?: string;
  error?: string;
}

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
}

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
