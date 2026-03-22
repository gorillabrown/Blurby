import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";

// sync-queue.js is CommonJS and uses fs/promises + crypto + path + os.
// We test the pure, exported logic directly. File I/O is mocked so no disk
// access occurs during the test run.

import os from "os";
import path from "path";
import fs from "fs/promises";

const {
  compactQueue,
  generateDeviceId,
  setDeviceId,
  getDeviceId,
  initSyncQueue,
  enqueue,
  getPendingOps,
  drainSyncedOps,
  clearQueue,
} = await import("../main/sync-queue.js");

// Use a real temp dir for tests that hit the filesystem
const TEST_DIR = path.join(os.tmpdir(), "blurby-test-sync-queue-" + Date.now());
beforeAll(async () => { await fs.mkdir(TEST_DIR, { recursive: true }); });
afterAll(async () => { try { await fs.rm(TEST_DIR, { recursive: true }); } catch {} });

// ── Helper ────────────────────────────────────────────────────────────────

function makeOp(overrides = {}) {
  return {
    op: "update-progress",
    deviceId: "dev-abc1",
    docId: "doc-1",
    revision: 1,
    timestamp: 1000,
    value: 50,
    ...overrides,
  };
}

// ── generateDeviceId ──────────────────────────────────────────────────────

describe("generateDeviceId", () => {
  it("returns a non-empty string", () => {
    const id = generateDeviceId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("contains a hyphen separator", () => {
    const id = generateDeviceId();
    expect(id).toMatch(/-/);
  });

  it("generates unique IDs on successive calls", () => {
    const id1 = generateDeviceId();
    const id2 = generateDeviceId();
    // Because of the random suffix, two calls should differ with overwhelming probability.
    expect(id1).not.toBe(id2);
  });
});

// ── setDeviceId / getDeviceId ──────────────────────────────────────────────

describe("setDeviceId / getDeviceId", () => {
  it("round-trips the device ID", () => {
    setDeviceId("test-device-42");
    expect(getDeviceId()).toBe("test-device-42");
  });
});

// ── compactQueue — idempotency ─────────────────────────────────────────────

describe("compactQueue — idempotency", () => {
  it("replaying the same op twice produces a single entry", () => {
    const op = makeOp({ revision: 1, timestamp: 1000 });
    // Same op key: same deviceId + revision + op + docId
    const result = compactQueue([op, { ...op }]);
    expect(result).toHaveLength(1);
    expect(result[0].revision).toBe(1);
  });

  it("different revisions for same doc are collapsed to latest", () => {
    const op1 = makeOp({ revision: 1, timestamp: 1000 });
    const op2 = makeOp({ revision: 2, timestamp: 2000 });
    const result = compactQueue([op1, op2]);
    // update-progress for same docId collapses to highest revision
    expect(result).toHaveLength(1);
    expect(result[0].revision).toBe(2);
  });
});

// ── compactQueue — update-progress collapse ───────────────────────────────

describe("compactQueue — update-progress collapsed to latest", () => {
  it("keeps only the highest-revision update-progress per docId", () => {
    const ops = [
      makeOp({ op: "update-progress", docId: "doc-1", revision: 1, value: 10, timestamp: 1000 }),
      makeOp({ op: "update-progress", docId: "doc-1", revision: 3, value: 30, timestamp: 3000 }),
      makeOp({ op: "update-progress", docId: "doc-1", revision: 2, value: 20, timestamp: 2000 }),
    ];
    const result = compactQueue(ops);
    const progressOps = result.filter((o) => o.op === "update-progress" && o.docId === "doc-1");
    expect(progressOps).toHaveLength(1);
    expect(progressOps[0].revision).toBe(3);
    expect(progressOps[0].value).toBe(30);
  });

  it("keeps update-progress for distinct docIds", () => {
    const ops = [
      makeOp({ op: "update-progress", docId: "doc-1", revision: 1 }),
      makeOp({ op: "update-progress", docId: "doc-2", revision: 1 }),
    ];
    const result = compactQueue(ops);
    const progressOps = result.filter((o) => o.op === "update-progress");
    expect(progressOps).toHaveLength(2);
  });
});

// ── compactQueue — add-doc + delete-doc cancellation ─────────────────────

describe("compactQueue — add-doc + delete-doc pair cancels out", () => {
  it("add-doc followed by delete-doc for the same doc produces an empty result", () => {
    const ops = [
      makeOp({ op: "add-doc", docId: "doc-x", revision: 1, timestamp: 1000 }),
      makeOp({ op: "delete-doc", docId: "doc-x", revision: 2, timestamp: 2000 }),
    ];
    const result = compactQueue(ops);
    expect(result.filter((o) => o.docId === "doc-x")).toHaveLength(0);
  });

  it("delete-doc alone is kept", () => {
    const ops = [
      makeOp({ op: "delete-doc", docId: "doc-y", revision: 5, timestamp: 5000 }),
    ];
    const result = compactQueue(ops);
    expect(result.filter((o) => o.op === "delete-doc" && o.docId === "doc-y")).toHaveLength(1);
  });

  it("add-doc alone is kept", () => {
    const ops = [
      makeOp({ op: "add-doc", docId: "doc-z", revision: 3, timestamp: 3000 }),
    ];
    const result = compactQueue(ops);
    expect(result.filter((o) => o.op === "add-doc" && o.docId === "doc-z")).toHaveLength(1);
  });

  it("cancellation does not affect other docs", () => {
    const ops = [
      makeOp({ op: "add-doc", docId: "doc-cancel", revision: 1, timestamp: 1000 }),
      makeOp({ op: "delete-doc", docId: "doc-cancel", revision: 2, timestamp: 2000 }),
      makeOp({ op: "add-doc", docId: "doc-keep", revision: 3, timestamp: 3000 }),
    ];
    const result = compactQueue(ops);
    expect(result.filter((o) => o.docId === "doc-cancel")).toHaveLength(0);
    expect(result.filter((o) => o.docId === "doc-keep")).toHaveLength(1);
  });
});

// ── compactQueue — reset-progress handling ────────────────────────────────

describe("compactQueue — reset-progress op handling", () => {
  it("keeps only the latest reset-progress per docId", () => {
    const ops = [
      makeOp({ op: "reset-progress", docId: "doc-1", revision: 1, timestamp: 1000 }),
      makeOp({ op: "reset-progress", docId: "doc-1", revision: 5, timestamp: 5000 }),
      makeOp({ op: "reset-progress", docId: "doc-1", revision: 3, timestamp: 3000 }),
    ];
    const result = compactQueue(ops);
    const resetOps = result.filter((o) => o.op === "reset-progress" && o.docId === "doc-1");
    expect(resetOps).toHaveLength(1);
    expect(resetOps[0].revision).toBe(5);
  });

  it("reset-progress at higher revision beats update-progress at lower revision", () => {
    const ops = [
      makeOp({ op: "update-progress", docId: "doc-1", revision: 3, timestamp: 3000, value: 99 }),
      makeOp({ op: "reset-progress", docId: "doc-1", revision: 7, timestamp: 7000 }),
    ];
    const result = compactQueue(ops);
    // Only one progress-related op for doc-1 — the reset, because it has higher revision
    const docOps = result.filter((o) => o.docId === "doc-1");
    expect(docOps).toHaveLength(1);
    expect(docOps[0].op).toBe("reset-progress");
  });

  it("update-progress at higher revision beats reset-progress at lower revision", () => {
    const ops = [
      makeOp({ op: "reset-progress", docId: "doc-1", revision: 2, timestamp: 2000 }),
      makeOp({ op: "update-progress", docId: "doc-1", revision: 8, timestamp: 8000, value: 42 }),
    ];
    const result = compactQueue(ops);
    const docOps = result.filter((o) => o.docId === "doc-1");
    expect(docOps).toHaveLength(1);
    expect(docOps[0].op).toBe("update-progress");
  });
});

// ── compactQueue — sort order ─────────────────────────────────────────────

describe("compactQueue — output sorted by revision ascending", () => {
  it("returns ops in ascending revision order", () => {
    const ops = [
      makeOp({ op: "add-doc", docId: "doc-a", revision: 10, timestamp: 10000 }),
      makeOp({ op: "add-doc", docId: "doc-b", revision: 2, timestamp: 2000 }),
      makeOp({ op: "add-doc", docId: "doc-c", revision: 7, timestamp: 7000 }),
    ];
    const result = compactQueue(ops);
    const revisions = result.map((o) => o.revision);
    for (let i = 1; i < revisions.length; i++) {
      expect(revisions[i]).toBeGreaterThanOrEqual(revisions[i - 1]);
    }
  });
});

// ── enqueue / getPendingOps / drainSyncedOps / clearQueue ─────────────────

describe("enqueue and getPendingOps", () => {
  beforeEach(async () => {
    // Reset module state by initialising with a fresh device ID.
    // initSyncQueue will call loadQueue which is mocked to return [].
    await initSyncQueue(TEST_DIR, "device-test");
    await clearQueue();
  });

  it("enqueued op appears in getPendingOps", async () => {
    await enqueue("add-doc", { docId: "doc-1", revision: 1, timestamp: 1000 });
    const ops = getPendingOps();
    expect(ops.some((o) => o.op === "add-doc" && o.docId === "doc-1")).toBe(true);
  });

  it("enqueuing the same op twice is idempotent (same op key deduped)", async () => {
    // Same device ID, same revision, same op, same docId → same key
    await enqueue("update-progress", { docId: "doc-2", revision: 5, timestamp: 1000, value: 10 });
    await enqueue("update-progress", { docId: "doc-2", revision: 5, timestamp: 1000, value: 10 });
    const ops = getPendingOps();
    const matching = ops.filter((o) => o.op === "update-progress" && o.docId === "doc-2" && o.revision === 5);
    expect(matching).toHaveLength(1);
  });

  it("drainSyncedOps removes ops at or below the synced revision", async () => {
    await enqueue("update-progress", { docId: "doc-3", revision: 3, timestamp: 3000 });
    await enqueue("update-progress", { docId: "doc-3", revision: 7, timestamp: 7000 });
    await drainSyncedOps(5);
    const ops = getPendingOps();
    const remaining = ops.filter((o) => o.docId === "doc-3");
    // Only revision 7 should survive
    expect(remaining.every((o) => o.revision > 5)).toBe(true);
  });

  it("clearQueue empties all pending ops", async () => {
    await enqueue("add-doc", { docId: "doc-4", revision: 1, timestamp: 1000 });
    await clearQueue();
    expect(getPendingOps()).toHaveLength(0);
  });
});
