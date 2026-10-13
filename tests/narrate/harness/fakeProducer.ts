// NARRATE-REBUILD-1 P3 test harness: a producer that returns lawful synthetic tables (one unit per word, integer
// frames, Σ frames × 600 = PCM samples, native provenance) and, on request, the three D4 negative controls. Results
// can be held back and released by the test, to exercise prefetch, gaps and stale-job dropping. No timing in it
// is estimated from text: the frames are fixed per word so the test knows every boundary in advance.
import type { ChunkTable } from "../../../src/reader/modes/narrate/engine/wordTable";
import type { ProducerPort, ProducerResult } from "../../../src/reader/modes/narrate/engine/narrateEngine";

export const SPF = 600;
export const SAMPLE_RATE = 24000;

export type ControlKind = "ok" | "missing-table" | "mismatch-words" | "mismatch-audio" | "fabricated-weights" | "forged-native-weights" | "error";

export interface FakeRequest {
  readonly text: string;
  readonly speed: number;
  readonly voice: string;
  readonly index: number;
  release(): void;
  fail(message: string): void;
  readonly settled: boolean;
}

export interface FakeProducerOptions {
  /** Frames per word at speed 1.0 (default 8 = 200 ms); scaled by 1/speed and rounded. */
  readonly framesPerWord?: number;
  readonly leadFrames?: number;
  readonly tailFrames?: number;
  /** Results wait for release() when true. */
  readonly hold?: boolean;
}

export function lawfulTable(words: readonly string[], speed: number, o: Required<Pick<FakeProducerOptions, "framesPerWord" | "leadFrames" | "tailFrames">>): { table: ChunkTable; pcm: Float32Array } {
  const per = Math.max(1, Math.round(o.framesPerWord / speed));
  const durations = [o.leadFrames, ...words.map(() => per), o.tailFrames];
  const units = words.map((w, i) => {
    const frameStart = o.leadFrames + i * per;
    return { words: [w], kind: "word" as const, frameStart, frameEnd: frameStart + per, sampleStart: frameStart * SPF, sampleEnd: (frameStart + per) * SPF };
  });
  const total = durations.reduce((a, b) => a + b, 0) * SPF;
  const pcm = new Float32Array(total);
  for (let s = o.leadFrames * SPF; s < total - o.tailFrames * SPF; s++) pcm[s] = 0.5; // voiced from the first word's first sample
  return { table: { provenance: { source: "model-output", outputNames: ["waveform", "durations"], durationsType: "float32" }, durations, samplesPerFrame: SPF, sampleRate: SAMPLE_RATE, units, reconciled: true }, pcm };
}

export class FakeProducer implements ProducerPort {
  readonly requests: FakeRequest[] = [];
  private readonly controls: ControlKind[] = [];
  private readonly o: Required<Pick<FakeProducerOptions, "framesPerWord" | "leadFrames" | "tailFrames">>;
  private hold: boolean;

  constructor(options: FakeProducerOptions = {}) {
    this.o = { framesPerWord: options.framesPerWord ?? 8, leadFrames: options.leadFrames ?? 2, tailFrames: options.tailFrames ?? 1 };
    this.hold = options.hold ?? false;
  }

  /** Queue the control the next request answers with (default "ok"). */
  nextControl(kind: ControlKind): void { this.controls.push(kind); }
  setHold(hold: boolean): void { this.hold = hold; }

  generate(request: { readonly text: string; readonly voice: string; readonly speed: number }): Promise<ProducerResult> {
    const kind = this.controls.shift() ?? "ok";
    const words = request.text.split(" ");
    const index = this.requests.length;
    return new Promise<ProducerResult>((resolve, reject) => {
      let settled = false;
      const build = (): ProducerResult => {
        const { table, pcm } = lawfulTable(words, request.speed, this.o);
        switch (kind) {
          case "missing-table": return { table: null, pcm, sampleRate: SAMPLE_RATE };
          case "mismatch-words": return { table: { ...table, units: table.units.map((u, i) => (i === 0 ? { ...u, words: ["wrong"] } : u)) }, pcm, sampleRate: SAMPLE_RATE };
          case "mismatch-audio": return { table, pcm: new Float32Array(pcm.length + 1), sampleRate: SAMPLE_RATE };
          case "fabricated-weights": return { table: weightShaped(words, pcm.length, "estimate"), pcm, sampleRate: SAMPLE_RATE };
          case "forged-native-weights": return { table: weightShaped(words, pcm.length, "model-output"), pcm, sampleRate: SAMPLE_RATE };
          default: return { table, pcm, sampleRate: SAMPLE_RATE };
        }
      };
      const req: FakeRequest = {
        text: request.text, speed: request.speed, voice: request.voice, index,
        get settled() { return settled; },
        release: () => { if (settled) return; settled = true; if (kind === "error") reject(new Error("producer failed")); else resolve(build()); },
        fail: (message) => { if (settled) return; settled = true; reject(new Error(message)); },
      };
      this.requests.push(req);
      if (!this.hold) req.release();
    });
  }
}

/**
 * The old anti-pattern (OutsideAudit.10 F2): a table built from word-length weights over the PCM length. Integer
 * frames, the law holds, so it is structurally valid; its units' words are the chunk's words. Only its provenance
 * (or, when forged native, the producer's own reconciliation being bypassed) can tell it apart — which is why the
 * engine's gate requires native provenance from the one producer and never trusts structure alone.
 */
function weightShaped(words: readonly string[], pcmSamples: number, source: string): ChunkTable {
  const totalFrames = pcmSamples / SPF;
  const weights = words.map((w) => w.length + 1);
  const sum = weights.reduce((a, b) => a + b, 0);
  const frames = weights.map((w) => Math.floor((totalFrames * w) / sum));
  frames[frames.length - 1] += totalFrames - frames.reduce((a, b) => a + b, 0);
  const units: ChunkTable["units"][number][] = [];
  let at = 0;
  for (let i = 0; i < words.length; i++) { units.push({ words: [words[i]], kind: "word", frameStart: at, frameEnd: at + frames[i], sampleStart: at * SPF, sampleEnd: (at + frames[i]) * SPF }); at += frames[i]; }
  return { provenance: { source }, durations: [0, ...frames, 0], samplesPerFrame: SPF, sampleRate: SAMPLE_RATE, units, reconciled: true };
}
