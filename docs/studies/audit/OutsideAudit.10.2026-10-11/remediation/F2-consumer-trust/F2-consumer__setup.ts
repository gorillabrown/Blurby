// Test doubles for browser/Electron globals. Must be imported before any repo module.
declare const require: (id: string) => any;
const nodeRequire = eval("require");
const path = nodeRequire("path");

const SCRATCH = process.env.F2_SCRATCH as string;
const mainCache = nodeRequire("C:/Projects/Blurby/main/tts-cache.js");

export const clock = { ctx: null as any };
const rafQueue = new Map<number, () => void>();
let rafId = 1;

class MockAudioContext {
  currentTime = 0;
  state = "running";
  destination = {};
  constructor() { clock.ctx = this; }
  createBuffer(_ch: number, length: number, sampleRate: number) {
    return { length, sampleRate, copyToChannel() {} };
  }
  createBufferSource() {
    return { buffer: null, onended: null, connect() {}, disconnect() {}, start() {}, stop() {} };
  }
  resume() { return Promise.resolve(); }
  suspend() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
}

(globalThis as any).AudioContext = MockAudioContext;
(globalThis as any).requestAnimationFrame = (cb: () => void) => { const id = rafId++; rafQueue.set(id, cb); return id; };
(globalThis as any).cancelAnimationFrame = (id: number) => { rafQueue.delete(id); };

/** Advance the mock audio clock in 16 ms steps, running queued animation frames. */
export function pump(seconds: number) {
  const steps = Math.ceil(seconds / 0.016);
  for (let i = 0; i < steps; i++) {
    if (clock.ctx) clock.ctx.currentTime += 0.016;
    const due = [...rafQueue.entries()];
    rafQueue.clear();
    for (const [, cb] of due) cb();
  }
}

// Mutable generate behaviour, set per scenario by the harness.
export const gen = { wordTimestamps: null as any, calls: 0 };
export const SR = 24000;

function makePcm(seconds: number) {
  const pcm = new Float32Array(Math.round(seconds * SR));
  for (let i = 0; i < pcm.length; i++) pcm[i] = 0.3 * Math.sin((2 * Math.PI * 220 * i) / SR);
  return pcm;
}

(globalThis as any).window = {
  electronAPI: {
    // Mirrors main/ipc/tts.js:140-151 result shape.
    kokoroGenerate: async (_text: string, _voice: string, _speed: number, words: string[]) => {
      gen.calls += 1;
      const audio = makePcm(0.25 * words.length);
      return { audio, sampleRate: SR, durationMs: (audio.length / SR) * 1000, wordTimestamps: gen.wordTimestamps };
    },
    // Real main-process cache (main/tts-cache.js) rooted in scratch; mirrors main/ipc/tts.js:328-372.
    ttsCacheHas: async (bookId: string, id: any, startIdx: number) => mainCache.hasChunk(bookId, id, startIdx),
    ttsCacheWrite: async (bookId: string, id: any, startIdx: number, audio: Float32Array, sr: number, durMs: number, wc: number, tm: any) => {
      await mainCache.writeChunk(bookId, id, startIdx, audio, sr, durMs, wc, tm);
      return { success: true };
    },
    ttsCacheRead: async (bookId: string, id: any, startIdx: number) => {
      const r = await mainCache.readChunk(bookId, id, startIdx);
      if (!r) return { miss: true };
      return { audio: r.audio, sampleRate: r.sampleRate, durationMs: r.durationMs, wordCount: r.wordCount ?? null, timing: r.timing ?? null, wordTimestamps: r.wordTimestamps ?? null };
    },
  },
};

export async function initCache() {
  await mainCache.init(path.join(SCRATCH, "userData"));
}
