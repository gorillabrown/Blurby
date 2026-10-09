/**
 * createReaderPorts — the owner-checking port broker (READER-MODE-SEPARATION-2 contract items 5–6).
 *
 * The broker owns only session identity and the gate in front of external side effects. Every
 * issued method closes over its key (documentId, documentGeneration, mode, session) and is
 * accepted only while that key is active. Rules:
 *   - invalidate(key) before stop/destroy: from then on, the old session's calls are rejected
 *     (neutral return value, stats.rejected, a "port-rejected" diagnostic to infrastructure);
 *   - teardown(key, run) lets run() make release-class calls only (READER_PORT_RELEASE_CALLS);
 *   - callbacks registered into infrastructure are wrapped and dropped once the key is not active;
 *   - promises returned to a session never settle once the key is not active (LL-109);
 *   - audio is issued only to Narrate; other modes get a port whose every method throws;
 *   - invalidate, teardown and closeAll are idempotent.
 * No module-level mutable state: all state lives in the closure of one createReaderPorts() call.
 */
import type { ReaderModeId } from "../modes/ReaderModeAdapter";
import type { ReaderSessionKey } from "../document/ReaderDocumentSnapshot";
import type { ReaderAudioPort, ReaderPorts } from "./ReaderPorts";

/** The shell-side implementations the broker forwards accepted calls to. */
export type ReaderPortInfrastructure = ReaderPorts;

export type ReaderSessionState = "active" | "closing" | "closed";

export interface ReaderPortStats {
  readonly accepted: Readonly<Record<string, number>>;
  readonly rejected: Readonly<Record<string, number>>;
}

export interface ReaderPortBroker {
  /** generation += 1; closeAll(). Returns the new generation. */
  openDocument(documentId: string): number;
  /** session += 1. Throws if a key is still active or no document is open. */
  issue(mode: ReaderModeId): { readonly key: ReaderSessionKey; readonly ports: ReaderPorts };
  /** active → closing (idempotent). */
  invalidate(key: ReaderSessionKey): void;
  /** run() may make release-class calls only; then the key is closed. A closed key does not run. */
  teardown(key: ReaderSessionKey, run: () => void): void;
  /** Every key → closed, with no release window (unmount, document replace). */
  closeAll(): void;
  isCurrent(key: ReaderSessionKey): boolean;
  /** Broker effect counts, keyed "group.method" (dropped callbacks: "group.method:callback"). */
  readonly stats: ReaderPortStats;
}

/** Calls a session may still make inside its teardown window. */
export const READER_PORT_RELEASE_CALLS: readonly string[] = Object.freeze([
  "audio.stop",
  "audio.setOnTruthSync(null)",
  "audio.setPageEndWord(null)",
  "audio.setOnChunkBoundary(null)",
  "audio.setOnSegmentStart(null)",
  "audio.setOnSectionEnd(null)",
  "settings.update{isNarrating}",
  "diagnostics.*",
]);

export class ReaderPortAccessError extends Error {
  constructor(readonly method: string, readonly mode: ReaderModeId) {
    super(`${method} is not issued to ${mode}`);
    this.name = "ReaderPortAccessError";
  }
}

const PORT_METHODS = {
  settings: ["read", "update", "setWpm"],
  persistence: ["updateDocProgress", "updateProgress", "recordCfi", "markEngaged", "markPageActivity", "scheduleRelocateSave"],
  document: ["snapshot", "readBookBytes", "ensureBookWords", "subscribe"],
  audio: [
    "readState", "start", "pause", "resume", "stop", "setOnTruthSync", "setPageEndWord", "resync",
    "setOnChunkBoundary", "setOnSegmentStart", "setOnSectionEnd", "updateWords", "adjustRate",
    "resolveHighlightSync", "getAudioProgress", "updateCacheCursor", "configure",
  ],
  diagnostics: ["record", "transition", "trace"],
  shell: ["reportRelocate", "reportToc", "reportFlowProgress", "reportEinkContentChange", "requestCompletionToPage", "requestCrossBook"],
} as const satisfies { readonly [G in keyof ReaderPorts]: readonly (keyof ReaderPorts[G])[] };

/** Index of the callback argument a method registers into infrastructure. */
const CALLBACK_ARG: Readonly<Record<string, number>> = Object.freeze({
  "audio.start": 3,
  "audio.setOnTruthSync": 0,
  "audio.setOnChunkBoundary": 0,
  "audio.setOnSegmentStart": 0,
  "audio.setOnSectionEnd": 0,
  "document.subscribe": 0,
});
/** Reads whose rejected value is the session's last accepted (frozen) result. */
const CACHED_READS: readonly string[] = Object.freeze(["settings.read", "document.snapshot", "audio.readState"]);
const ASYNC_METHODS: readonly string[] = Object.freeze(["document.readBookBytes", "document.ensureBookWords"]);

type AnyFn = (...args: unknown[]) => unknown;

function releaseSignature(method: string, args: readonly unknown[]): string {
  if (method.startsWith("diagnostics.")) return "diagnostics.*";
  if (method === "settings.update") return `settings.update{${Object.keys(args[0] ?? {}).sort().join(",")}}`;
  if (args.length === 1 && args[0] === null) return `${method}(null)`;
  return method;
}

function neverSettles(): Promise<never> {
  return new Promise<never>(() => {});
}

function keyId(key: ReaderSessionKey): string {
  return JSON.stringify([key.documentId, key.documentGeneration, key.mode, key.session]);
}

function throwingAudioPort(mode: ReaderModeId): ReaderAudioPort {
  return new Proxy({} as ReaderAudioPort, {
    get: (_target, prop) => () => {
      throw new ReaderPortAccessError(`audio.${String(prop)}`, mode);
    },
  });
}

export function createReaderPorts(infra: ReaderPortInfrastructure): ReaderPortBroker {
  let documentId: string | null = null;
  let generation = 0;
  let session = 0;
  let releasing: string | null = null;
  // Only non-closed keys are stored; a missing id is "closed".
  const states = new Map<string, Exclude<ReaderSessionState, "closed">>();
  const accepted: Record<string, number> = {};
  const rejected: Record<string, number> = {};
  const bump = (rec: Record<string, number>, name: string) => { rec[name] = (rec[name] ?? 0) + 1; };

  function issuePorts(key: ReaderSessionKey): ReaderPorts {
    const id = keyId(key);
    const live = () => states.get(id) === "active";
    const lastRead = new Map<string, unknown>();

    function call(method: string, args: unknown[], invoke: (args: unknown[]) => unknown): unknown {
      const state = states.get(id);
      const allowed = state === "active"
        || (state === "closing" && releasing === id && READER_PORT_RELEASE_CALLS.includes(releaseSignature(method, args)));
      if (!allowed) {
        bump(rejected, method);
        infra.diagnostics.record("port-rejected", `${method} ${id}`);
        if (CACHED_READS.includes(method)) return lastRead.get(method);
        if (ASYNC_METHODS.includes(method)) return neverSettles();
        if (method === "audio.start") return "error";
        if (method === "audio.getAudioProgress") return null;
        if (method === "document.subscribe") return () => {};
        return undefined;
      }
      bump(accepted, method);
      const cbIndex = CALLBACK_ARG[method];
      if (cbIndex !== undefined && typeof args[cbIndex] === "function") {
        const cb = args[cbIndex] as AnyFn;
        args = [...args];
        args[cbIndex] = (...cbArgs: unknown[]) => {
          if (!live()) { bump(rejected, `${method}:callback`); return undefined; }
          return cb(...cbArgs);
        };
      }
      const result = invoke(args);
      if (CACHED_READS.includes(method)) lastRead.set(method, result);
      if (ASYNC_METHODS.includes(method)) {
        // LL-109: the continuation re-checks liveness after the await.
        return Promise.resolve(result).then(
          (value) => (live() ? value : neverSettles()),
          (error: unknown) => (live() ? Promise.reject(error) : neverSettles()),
        );
      }
      return result;
    }

    function group<G extends keyof ReaderPorts>(name: G): ReaderPorts[G] {
      const target = infra[name] as unknown as Record<string, AnyFn>;
      const out: Record<string, AnyFn> = {};
      for (const method of PORT_METHODS[name] as readonly string[]) {
        out[method] = (...args: unknown[]) => call(`${name}.${method}`, args, (a) => target[method](...a));
      }
      return Object.freeze(out) as unknown as ReaderPorts[G];
    }

    // Seed the cached reads so a rejected read always has a frozen value to return.
    lastRead.set("settings.read", infra.settings.read());
    lastRead.set("document.snapshot", infra.document.snapshot());
    if (key.mode === "narrate") lastRead.set("audio.readState", infra.audio.readState());

    return Object.freeze({
      settings: group("settings"),
      persistence: group("persistence"),
      document: group("document"),
      audio: key.mode === "narrate" ? group("audio") : throwingAudioPort(key.mode),
      diagnostics: group("diagnostics"),
      shell: group("shell"),
    });
  }

  function closeAll(): void {
    states.clear();
    releasing = null;
  }

  return {
    openDocument(nextDocumentId) {
      closeAll();
      documentId = nextDocumentId;
      generation += 1;
      return generation;
    },
    issue(mode) {
      if (documentId === null) throw new Error("ReaderPortBroker.issue: no document is open");
      for (const state of states.values()) {
        if (state === "active") throw new Error(`ReaderPortBroker.issue(${mode}): another session is still active`);
      }
      session += 1;
      const key: ReaderSessionKey = Object.freeze({ documentId, documentGeneration: generation, mode, session });
      states.set(keyId(key), "active");
      return Object.freeze({ key, ports: issuePorts(key) });
    },
    invalidate(key) {
      const id = keyId(key);
      if (states.get(id) === "active") states.set(id, "closing");
    },
    teardown(key, run) {
      const id = keyId(key);
      if (!states.has(id)) return;
      states.set(id, "closing");
      releasing = id;
      try {
        run();
      } finally {
        releasing = null;
        states.delete(id);
      }
    },
    closeAll,
    isCurrent(key) {
      return states.get(keyId(key)) === "active";
    },
    stats: Object.freeze({ accepted, rejected }),
  };
}
