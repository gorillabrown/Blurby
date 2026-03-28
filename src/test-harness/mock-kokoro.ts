// src/test-harness/mock-kokoro.ts — Mock Kokoro TTS: generates synthetic PCM audio
// Dev-only. Never bundled in production.

const KOKORO_SAMPLE_RATE = 24000;

/** Available mock Kokoro voices (mirrors real Kokoro voice IDs) */
export const MOCK_KOKORO_VOICES = [
  "af_heart", "af_alloy", "af_aoede", "af_bella", "af_jessica",
  "af_kore", "af_nicole", "af_nova", "af_river", "af_sarah", "af_sky",
  "am_adam", "am_echo", "am_eric", "am_fenrir", "am_liam",
  "am_michael", "am_onyx", "am_puck", "am_santa",
  "bf_alice", "bf_emma", "bf_isabella", "bf_lily",
  "bm_daniel", "bm_fable", "bm_george", "bm_lewis",
];

/**
 * Generate a 440Hz sine wave PCM buffer that matches Kokoro's response shape.
 * Duration is proportional to word count at the requested speed.
 */
export function generateMockAudio(
  text: string,
  _voice: string,
  speed: number,
): { audio: Float32Array; sampleRate: number; durationMs: number; error: undefined } {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length || 1;
  // Duration formula: (wordCount / (speed * 150)) * 60 * 1000 ms
  const durationMs = (wordCount / (speed * 150)) * 60 * 1000;
  const sampleCount = Math.round(KOKORO_SAMPLE_RATE * (durationMs / 1000));
  const audio = new Float32Array(sampleCount);

  // Generate 440Hz sine wave at 0.3 amplitude (audible but not harsh)
  const freq = 440;
  const amplitude = 0.3;
  for (let i = 0; i < sampleCount; i++) {
    audio[i] = amplitude * Math.sin(2 * Math.PI * freq * i / KOKORO_SAMPLE_RATE);
  }

  return { audio, sampleRate: KOKORO_SAMPLE_RATE, durationMs, error: undefined };
}

/** Mock model status — always "ready" in stub mode */
export function getMockModelStatus(): { ready: boolean } {
  return { ready: true };
}

/** Mock voice list */
export function getMockVoices(): { voices: string[]; error: undefined } {
  return { voices: [...MOCK_KOKORO_VOICES], error: undefined };
}
