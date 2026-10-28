import { describe, it, expect, vi } from "vitest";

// sync-hardening.test.js — Sprint 19A-H
//
// Tests pure functions exported from sync-engine.js that do not require
// live cloud storage or the Electron runtime. File I/O and cloud storage
// modules are mocked so we exercise only the merge/tombstone/checksum logic.

// ── Module mocks (must precede dynamic import) ─────────────────────────────

vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn().mockRejectedValue(new Error("not found")),
    writeFile: vi.fn().mockResolvedValue(undefined),
    rename: vi.fn().mockResolvedValue(undefined),
    appendFile: vi.fn().mockResolvedValue(undefined),
  },
  readFile: vi.fn().mockRejectedValue(new Error("not found")),
  writeFile: vi.fn().mockResolvedValue(undefined),
  rename: vi.fn().mockResolvedValue(undefined),
  appendFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../main/cloud-storage.js", () => ({
  getCloudStorage: vi.fn().mockReturnValue(null),
}));

vi.mock("../main/auth.js", () => ({
  getAuthState: vi.fn().mockReturnValue({ provider: null }),
  getAccessToken: vi.fn().mockResolvedValue(null),
}));

vi.mock("../main/sync-queue.js", () => ({
  initSyncQueue: vi.fn().mockResolvedValue("dev-mock"),
  enqueue: vi.fn().mockResolvedValue(undefined),
  getPendingOps: vi.fn().mockReturnValue([]),
  drainSyncedOps: vi.fn().mockResolvedValue(undefined),
  clearQueue: vi.fn().mockResolvedValue(undefined),
  compact: vi.fn().mockResolvedValue(0),
  getDeviceId: vi.fn().mockReturnValue("dev-mock"),
  setDeviceId: vi.fn(),
}));

const {
  mergeLibrary,
  mergeHistory,
  mergeSettings,
  applyTombstone,
  gcTombstones,
  cleanStagingIfStale,
} = await import("../main/sync-engine.js");

// ── Helpers ────────────────────────────────────────────────────────────────

function makeDoc(overrides = {}) {
  return {
    id: "doc-1",
    title: "Test Doc",
    revision: 1,
    modified: 1000,
    position: 0,
    deleted: false,
    ...overrides,
  };
}

// ── 19A: Revision counter ordering ────────────────────────────────────────

describe("19A — revision counter ordering", () => {
  it("higher cloud revision wins over lower local revision", () => {
    const localDoc = makeDoc({ id: "doc-1", revision: 3, title: "Local title", modified: 9000 });
    const cloudDoc = makeDoc({ id: "doc-1", revision: 10, title: "Cloud title", modified: 1000 });
    const result = mergeLibrary([localDoc], [cloudDoc], 10);
    expect(result[0].title).toBe("Cloud title");
    expect(result[0].revision).toBe(10);
  });

  it("higher local revision wins over lower cloud revision", () => {
    const localDoc = makeDoc({ id: "doc-1", revision: 8, title: "Local title", modified: 1000 });
    const cloudDoc = makeDoc({ id: "doc-1", revision: 2, title: "Cloud title", modified: 9000 });
    // Even though cloud has a later timestamp, local revision is higher
    const result = mergeLibrary([localDoc], [cloudDoc], 8);
    expect(result[0].title).toBe("Local title");
  });

  it("equal revisions keep local copy", () => {
    const localDoc = makeDoc({ id: "doc-1", revision: 5, title: "Local" });
    const cloudDoc = makeDoc({ id: "doc-1", revision: 5, title: "Cloud" });
    const result = mergeLibrary([localDoc], [cloudDoc], 5);
    // localRev === cloudRev → local wins (cloudRev > localRev is false)
    expect(result[0].title).toBe("Local");
  });

  it("falls back to timestamp when both revisions are 0", () => {
    const localDoc = makeDoc({ id: "doc-1", revision: 0, modified: 1000, title: "Old local" });
    const cloudDoc = makeDoc({ id: "doc-1", revision: 0, modified: 5000, title: "Newer cloud" });
    const result = mergeLibrary([localDoc], [cloudDoc], 0);
    expect(result[0].title).toBe("Newer cloud");
  });
});

// ── 19D: Tombstone merge rules ─────────────────────────────────────────────

describe("19D — tombstone merge: tombstone newer than live → delete wins", () => {
  it("cloud tombstone with higher deletedAt than local revision → delete wins", () => {
    const localDoc = makeDoc({ id: "doc-1", revision: 3, deleted: false });
    const cloudDoc = makeDoc({ id: "doc-1", deleted: true, deletedAt: 10, deletedBy: "dev-b" });
    const result = mergeLibrary([localDoc], [cloudDoc], 10);
    const merged = result.find((d) => d.id === "doc-1");
    expect(merged.deleted).toBe(true);
  });

  it("local tombstone with higher deletedAt than cloud revision → delete wins", () => {
    const localDoc = makeDoc({ id: "doc-1", deleted: true, deletedAt: 15, deletedBy: "dev-a" });
    const cloudDoc = makeDoc({ id: "doc-1", revision: 5, deleted: false });
    const result = mergeLibrary([localDoc], [cloudDoc], 15);
    const merged = result.find((d) => d.id === "doc-1");
    expect(merged.deleted).toBe(true);
  });
});

describe("19D — tombstone merge: live doc changed after tombstone → live wins", () => {
  it("cloud doc revision newer than local tombstone → live wins", () => {
    const localDoc = makeDoc({ id: "doc-1", deleted: true, deletedAt: 2, deletedBy: "dev-a" });
    // Cloud doc has revision 10, which is > deletedAt 2
    const cloudDoc = makeDoc({ id: "doc-1", revision: 10, deleted: false, title: "Updated after delete" });
    const result = mergeLibrary([localDoc], [cloudDoc], 10);
    const merged = result.find((d) => d.id === "doc-1");
    expect(merged.deleted).toBe(false);
    expect(merged.title).toBe("Updated after delete");
  });

  it("local doc revision newer than cloud tombstone → live wins", () => {
    const localDoc = makeDoc({ id: "doc-1", revision: 12, deleted: false, title: "Local live" });
    const cloudDoc = makeDoc({ id: "doc-1", deleted: true, deletedAt: 4, deletedBy: "dev-b" });
    const result = mergeLibrary([localDoc], [cloudDoc], 12);
    const merged = result.find((d) => d.id === "doc-1");
    expect(merged.deleted).toBe(false);
    expect(merged.title).toBe("Local live");
  });
});

describe("19D — tombstone merge: both tombstones → keep earlier deletion", () => {
  it("keeps the tombstone with the lower deletedAt revision", () => {
    const localDoc = makeDoc({ id: "doc-1", deleted: true, deletedAt: 5, deletedBy: "dev-a" });
    const cloudDoc = makeDoc({ id: "doc-1", deleted: true, deletedAt: 10, deletedBy: "dev-b" });
    const result = mergeLibrary([localDoc], [cloudDoc], 10);
    const merged = result.find((d) => d.id === "doc-1");
    expect(merged.deleted).toBe(true);
    expect(merged.deletedAt).toBe(5);
    expect(merged.deletedBy).toBe("dev-a");
  });
});

// ── applyTombstone ────────────────────────────────────────────────────────

describe("applyTombstone", () => {
  it("marks the target doc as deleted and records revision + deviceId", () => {
    const docs = [makeDoc({ id: "doc-1" }), makeDoc({ id: "doc-2" })];
    const result = applyTombstone(docs, "doc-1", 7, "dev-x");
    const tombstoned = result.find((d) => d.id === "doc-1");
    expect(tombstoned.deleted).toBe(true);
    expect(tombstoned.deletedAt).toBe(7);
    expect(tombstoned.deletedBy).toBe("dev-x");
  });

  it("does not affect other docs", () => {
    const docs = [makeDoc({ id: "doc-1" }), makeDoc({ id: "doc-2" })];
    const result = applyTombstone(docs, "doc-1", 7, "dev-x");
    const unaffected = result.find((d) => d.id === "doc-2");
    expect(unaffected.deleted).toBe(false);
  });

  it("clears content to save space", () => {
    const docs = [makeDoc({ id: "doc-1", content: "lots of words here" })];
    const result = applyTombstone(docs, "doc-1", 7, "dev-x");
    expect(result[0].content).toBeUndefined();
  });
});

// ── gcTombstones ──────────────────────────────────────────────────────────

describe("gcTombstones", () => {
  const TOMBSTONE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

  it("keeps live docs untouched", () => {
    const docs = [makeDoc({ id: "doc-1", deleted: false })];
    const result = gcTombstones(docs, {});
    expect(result).toHaveLength(1);
  });

  it("keeps tombstone whose TTL has not expired", () => {
    const recentlyDeleted = Date.now() - 1000; // 1 second ago
    const docs = [makeDoc({ id: "doc-1", deleted: true, deletedAt: 1, deletedAtTimestamp: recentlyDeleted })];
    const result = gcTombstones(docs, { "dev-a": 99 });
    expect(result).toHaveLength(1);
  });

  it("removes expired tombstone when all devices have synced past it", () => {
    const longAgo = Date.now() - TOMBSTONE_TTL_MS - 1000;
    const docs = [makeDoc({ id: "doc-1", deleted: true, deletedAt: 5, deletedAtTimestamp: longAgo })];
    // Both known devices have synced past revision 5
    const result = gcTombstones(docs, { "dev-a": 10, "dev-b": 20 });
    expect(result).toHaveLength(0);
  });

  it("keeps expired tombstone if a device has NOT synced past it", () => {
    const longAgo = Date.now() - TOMBSTONE_TTL_MS - 1000;
    const docs = [makeDoc({ id: "doc-1", deleted: true, deletedAt: 15, deletedAtTimestamp: longAgo })];
    // dev-b has only synced to revision 3, which is < deletedAt 15
    const result = gcTombstones(docs, { "dev-a": 20, "dev-b": 3 });
    expect(result).toHaveLength(1);
  });

  it("keeps tombstone with no deletedAtTimestamp (safety guard)", () => {
    const docs = [makeDoc({ id: "doc-1", deleted: true, deletedAt: 1 })];
    // No deletedAtTimestamp → keep for safety
    const result = gcTombstones(docs, { "dev-a": 999 });
    expect(result).toHaveLength(1);
  });
});

// ── Device offline 7 days then sync ───────────────────────────────────────

describe("offline 7 days then sync — merge produces correct result", () => {
  it("cloud progress supersedes stale local progress when cloud revision is higher", () => {
    // Simulates a device that was offline for 7 days: local has low revision,
    // cloud has progressed further.
    const localDoc = makeDoc({
      id: "doc-1",
      revision: 2,
      position: 100,
      title: "My Book",
      modified: Date.now() - 7 * 24 * 60 * 60 * 1000,
    });
    const cloudDoc = makeDoc({
      id: "doc-1",
      revision: 50,
      position: 450,
      title: "My Book",
      modified: Date.now() - 60 * 1000,
    });
    const result = mergeLibrary([localDoc], [cloudDoc], 50);
    // Cloud revision is higher → cloud doc wins
    expect(result[0].revision).toBe(50);
    // Position is max(local, cloud) = max(100, 450)
    expect(result[0].position).toBe(450);
  });

  it("local additions made while offline appear in merge result", () => {
    const localOnly = makeDoc({ id: "doc-new", revision: 3, title: "New while offline" });
    const cloudDoc = makeDoc({ id: "doc-existing", revision: 10 });
    const result = mergeLibrary([localOnly, makeDoc({ id: "doc-existing", revision: 1 })], [cloudDoc], 10);
    const ids = result.map((d) => d.id);
    expect(ids).toContain("doc-new");
    expect(ids).toContain("doc-existing");
  });
});

// ── 19C: Staging cleanup for stale dirs ───────────────────────────────────

describe("19C — staging cleanup for stale directories", () => {
  it("cleanStagingIfStale deletes files when manifest is older than 24 hours", async () => {
    const staleTimestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
    const mockStorage = {
      readFile: vi.fn().mockResolvedValue(
        Buffer.from(JSON.stringify({ startedAt: staleTimestamp, completed: ["library.json"] }))
      ),
      listFiles: vi.fn().mockResolvedValue([{ name: "library.json" }]),
      deleteFile: vi.fn().mockResolvedValue(undefined),
    };

    await cleanStagingIfStale(mockStorage);

    expect(mockStorage.deleteFile).toHaveBeenCalled();
  });

  it("cleanStagingIfStale does NOT delete files when manifest is fresh", async () => {
    const freshTimestamp = Date.now() - 5 * 60 * 1000; // 5 minutes ago
    const mockStorage = {
      readFile: vi.fn().mockResolvedValue(
        Buffer.from(JSON.stringify({ startedAt: freshTimestamp, completed: ["library.json"] }))
      ),
      listFiles: vi.fn().mockResolvedValue([{ name: "library.json" }]),
      deleteFile: vi.fn().mockResolvedValue(undefined),
    };

    await cleanStagingIfStale(mockStorage);

    expect(mockStorage.deleteFile).not.toHaveBeenCalled();
  });

  it("cleanStagingIfStale is a no-op when no staging manifest exists", async () => {
    const mockStorage = {
      readFile: vi.fn().mockRejectedValue(new Error("not found")),
      listFiles: vi.fn(),
      deleteFile: vi.fn(),
    };

    // Should not throw
    await expect(cleanStagingIfStale(mockStorage)).resolves.toBeUndefined();
    expect(mockStorage.deleteFile).not.toHaveBeenCalled();
  });
});

// ── 19F: Checksum verification ────────────────────────────────────────────

// 19F checksum verification tested implicitly through downloadDocContent.

// ── mergeHistory ───────────────────────────────────────────────────────────

describe("mergeHistory", () => {
  it("unions sessions from both sides without duplicates", () => {
    const session = { date: "2026-03-20", docTitle: "A", wordsRead: 100, durationMs: 60000 };
    const local = { sessions: [session], totalWordsRead: 100, totalReadingTimeMs: 60000, docsCompleted: 0 };
    const cloud = { sessions: [session], totalWordsRead: 100, totalReadingTimeMs: 60000, docsCompleted: 0 };
    const merged = mergeHistory(local, cloud);
    expect(merged.sessions).toHaveLength(1);
  });

  it("takes max docsCompleted", () => {
    const local = { sessions: [], totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 3 };
    const cloud = { sessions: [], totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 7 };
    const merged = mergeHistory(local, cloud);
    expect(merged.docsCompleted).toBe(7);
  });

  it("uses cloud streaks when cloud lastReadDate is more recent", () => {
    const local = {
      sessions: [],
      totalWordsRead: 0,
      totalReadingTimeMs: 0,
      docsCompleted: 0,
      streaks: { current: 2, longest: 5, lastReadDate: "2026-03-18" },
    };
    const cloud = {
      sessions: [],
      totalWordsRead: 0,
      totalReadingTimeMs: 0,
      docsCompleted: 0,
      streaks: { current: 3, longest: 4, lastReadDate: "2026-03-20" },
    };
    const merged = mergeHistory(local, cloud);
    expect(merged.streaks.lastReadDate).toBe("2026-03-20");
    expect(merged.streaks.current).toBe(3);
  });

  it("uses max longest streak regardless of which side wins current streak", () => {
    const local = {
      sessions: [],
      totalWordsRead: 0,
      totalReadingTimeMs: 0,
      docsCompleted: 0,
      streaks: { current: 1, longest: 30, lastReadDate: "2026-03-01" },
    };
    const cloud = {
      sessions: [],
      totalWordsRead: 0,
      totalReadingTimeMs: 0,
      docsCompleted: 0,
      streaks: { current: 10, longest: 15, lastReadDate: "2026-03-20" },
    };
    const merged = mergeHistory(local, cloud);
    expect(merged.streaks.longest).toBe(30);
  });
});
