// NARRATE-REBUILD-1 P4 test harness: the two host seams the Narrate module reaches through globals — the one
// AudioContext (Web Audio, behind WebAudioOutput) and the preload producer (electronAPI.narrateGenerate, behind
// the runtime's ProducerPort). Both are fakes: the context never advances on its own (a test moves currentTime)
// and the producer is the P3 FakeProducer, which answers with lawful synthetic tables. Nothing here estimates
// timing. Install in beforeEach and call the returned restore in afterEach.
import { FakeProducer, type FakeProducerOptions } from "./fakeProducer";

export class FakeBufferSource {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  startedAt: number | null = null;
  offsetSeconds = 0;
  stoppedAt: number | null = null;
  connected = false;
  connect(): void { this.connected = true; }
  disconnect(): void { this.connected = false; }
  start(when = 0, offset = 0): void { this.startedAt = when; this.offsetSeconds = offset; }
  stop(when = 0): void { this.stoppedAt = this.stoppedAt === null ? when : Math.min(this.stoppedAt, when); }
}

export class FakeAudioContext {
  readonly sampleRate: number;
  currentTime = 0;
  readonly destination = {};
  readonly sources: FakeBufferSource[] = [];
  closed = false;
  constructor(options?: { readonly sampleRate?: number }) { this.sampleRate = options?.sampleRate ?? 24000; }
  getOutputTimestamp(): { readonly contextTime: number; readonly performanceTime: number } {
    return { contextTime: this.currentTime, performanceTime: this.currentTime * 1000 };
  }
  createBuffer(_channels: number, length: number, _sampleRate: number): { readonly length: number; getChannelData(channel: number): Float32Array } {
    const data = new Float32Array(length);
    return { length, getChannelData: () => data };
  }
  createBufferSource(): FakeBufferSource { const s = new FakeBufferSource(); this.sources.push(s); return s; }
  close(): Promise<void> { this.closed = true; return Promise.resolve(); }
}

export interface FakeNarrateHost {
  readonly producer: FakeProducer;
  /** Every AudioContext the module constructed, in order (one per session is the contract). */
  readonly contexts: FakeAudioContext[];
  restore(): void;
}

function setGlobal(key: string, value: unknown, previous: unknown): void {
  const g = globalThis as Record<string, unknown>;
  const w = g.window as Record<string, unknown> | undefined;
  for (const target of w && w !== (g as unknown) ? [g, w] : [g]) {
    if (value === undefined && previous === undefined) delete target[key];
    else target[key] = value;
  }
}

/** Installs the fakes and returns them with their restore. */
export function installFakeNarrateHostWith(options: FakeProducerOptions = {}): FakeNarrateHost {
  const g = globalThis as Record<string, unknown>;
  const producer = new FakeProducer(options);
  const contexts: FakeAudioContext[] = [];
  const prevCtx = g.AudioContext;
  const prevApi = g.electronAPI;
  const Ctx = class extends FakeAudioContext {
    constructor(o?: { readonly sampleRate?: number }) { super(o); contexts.push(this); }
  };
  const api = {
    ...((prevApi as object | undefined) ?? {}),
    narrateGenerate: (text: string, voice: string, speed: number) => producer.generate({ text, voice, speed }),
    narratePreload: async () => ({ ok: true }),
    narrateStatus: async () => ({ state: "ready" }),
  };
  setGlobal("AudioContext", Ctx, prevCtx);
  setGlobal("electronAPI", api, prevApi);
  return {
    producer,
    contexts,
    restore: () => { setGlobal("AudioContext", prevCtx, undefined); setGlobal("electronAPI", prevApi, undefined); },
  };
}

/** Installs the fakes and returns only the restore (for suites that never inspect them). */
export function installFakeNarrateHost(options: FakeProducerOptions = {}): () => void {
  return installFakeNarrateHostWith(options).restore;
}
