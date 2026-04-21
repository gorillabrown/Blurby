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
