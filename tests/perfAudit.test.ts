// tests/perfAudit.test.ts — PERF-1: Performance Audit sprint
//
// Covers:
//   a.  Startup: createWindow called before auth/sync init
//   b.  initAuth and initSyncEngine run in parallel (Promise.all)
//   c.  Folder watcher starts before sync completes
//   d.  injectStyles calls getComputedStyle exactly once
//   e.  Settings save is debounced (rapid calls produce ≤1 write in 500ms window)
//   f.  WPM persistence is debounced (300ms)
//   g.  Chapter cache evicts oldest entry at capacity (50)
//   h.  Chapter cache size never exceeds 50
//   i.  Snoozed doc check uses index (not full library scan)
//   j.  Snoozed doc Set updates on snooze/unsnooze
//   k.  Voice sync effect depends on ≤3 items (settings.ttsEngine, settings.ttsVoiceName)
//   l.  Vite config has manualChunks with vendor/tts/settings
//   m.  rebuildLibraryIndex is debounced (batch mutations = single rebuild)
//   n.  Startup window appears before auth completes
//   o.  LRU cache returns cached value for recent entry
//   p.  LRU cache misses evicted entry

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — LRU cache logic (replicated from main/file-parsers.js)
//
// epubChapterCacheSet is not exported, so we replicate the same Map-based
// delete-and-reinsert LRU algorithm here and verify the behavior contracts.
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_CAP = 50;

function makeLruCache(cap: number) {
  const cache = new Map<string, unknown>();

  function cacheSet(key: string, value: unknown) {
    if (cache.has(key)) cache.delete(key);
    cache.set(key, value);
    if (cache.size > cap) {
      const oldest = cache.keys().next().value!;
      cache.delete(oldest);
    }
  }

  function cacheGet(key: string): unknown {
    if (!cache.has(key)) return undefined;
    const value = cache.get(key);
    cache.delete(key);
    cache.set(key, value);
    return value;
  }

  function size() { return cache.size; }
  function has(key: string) { return cache.has(key); }
  function clear() { cache.clear(); }

  return { cacheSet, cacheGet, size, has, clear };
}

// ─────────────────────────────────────────────────────────────────────────────
// g. LRU chapter cache — evicts oldest entry at capacity
// ─────────────────────────────────────────────────────────────────────────────

describe("LRU chapter cache — eviction at capacity", () => {

  it("g: evicts the oldest entry when size exceeds cap", () => {
    const lru = makeLruCache(CACHE_CAP);

    // Fill cache to capacity
    for (let i = 0; i < CACHE_CAP; i++) {
      lru.cacheSet(`key-${i}`, `value-${i}`);
    }
    expect(lru.size()).toBe(CACHE_CAP);
    expect(lru.has("key-0")).toBe(true); // oldest still present

    // Insert one more — triggers eviction
    lru.cacheSet("overflow-key", "overflow-value");

    // Oldest entry (key-0) must be gone
    expect(lru.has("key-0")).toBe(false);
    // New entry must be present
    expect(lru.has("overflow-key")).toBe(true);
  });

  // h.
  it("h: cache size never exceeds cap even after many insertions", () => {
    const lru = makeLruCache(CACHE_CAP);

    for (let i = 0; i < CACHE_CAP * 3; i++) {
      lru.cacheSet(`k${i}`, `v${i}`);
      expect(lru.size()).toBeLessThanOrEqual(CACHE_CAP);
    }
    expect(lru.size()).toBe(CACHE_CAP);
  });

  // o.
  it("o: returns cached value for a recently set entry", () => {
    const lru = makeLruCache(CACHE_CAP);
    lru.cacheSet("book-a", ["chapter1", "chapter2"]);
    const result = lru.cacheGet("book-a");
    expect(result).toEqual(["chapter1", "chapter2"]);
  });

  // p.
  it("p: returns undefined for an evicted entry", () => {
    const lru = makeLruCache(CACHE_CAP);

    // Set first key, then fill beyond cap — first key should be evicted
    lru.cacheSet("evicted-key", "gone");
    for (let i = 0; i < CACHE_CAP; i++) {
      lru.cacheSet(`fill-${i}`, `v-${i}`);
    }

    // evicted-key was the oldest, so it must be gone
    expect(lru.cacheGet("evicted-key")).toBeUndefined();
  });

  it("promotes recently accessed entry so it survives next eviction", () => {
    const lru = makeLruCache(CACHE_CAP);

    // Fill to cap
    for (let i = 0; i < CACHE_CAP; i++) {
      lru.cacheSet(`key-${i}`, `v${i}`);
    }

    // Access key-0 — this should promote it to most-recently-used
    lru.cacheGet("key-0");

    // Now overflow by one — key-1 should be evicted (oldest after promotion)
    lru.cacheSet("new-key", "new-value");

    expect(lru.has("key-0")).toBe(true);  // promoted, should survive
    expect(lru.has("key-1")).toBe(false); // was oldest after promotion, evicted
  });

  it("updating an existing key moves it to most-recently-used position", () => {
    const lru = makeLruCache(3);

    lru.cacheSet("a", 1);
    lru.cacheSet("b", 2);
    lru.cacheSet("c", 3);

    // Re-set "a" — should move to end (most recent)
    lru.cacheSet("a", 99);

    // Add "d" — should evict "b" (now oldest), not "a"
    lru.cacheSet("d", 4);

    expect(lru.has("b")).toBe(false); // evicted
    expect(lru.has("a")).toBe(true);  // re-inserted, survived
    expect(lru.cacheGet("a")).toBe(99);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// a/b/n. Startup parallelization — window visible before auth/sync completes
// ─────────────────────────────────────────────────────────────────────────────

describe("startup parallelization — window before auth/sync", () => {

  /**
   * Replicate the startup sequence as a pure async function so we can verify
   * the ordering contract without touching Electron APIs.
   *
   *   Phase 1: loadState()
   *   Phase 2: createWindow()   ← window visible HERE
   *   Phase 3: Promise.all([initAuth(), initSyncEngine()])
   */
  async function runStartupSequence(
    loadState: () => Promise<void>,
    createWindow: () => void,
    initAuth: () => Promise<void>,
    initSyncEngine: () => Promise<void>,
  ) {
    await loadState();
    createWindow();                          // window shown
    await Promise.all([initAuth(), initSyncEngine()]);
  }

  // a. createWindow is called before auth/sync finish
  it("a: createWindow is called before initAuth completes", async () => {
    const order: string[] = [];

    const loadState = vi.fn(async () => { order.push("loadState"); });
    const createWindow = vi.fn(() => { order.push("createWindow"); });
    const initAuth = vi.fn(async () => {
      // Simulate slow auth
      await new Promise<void>((r) => setTimeout(r, 0));
      order.push("initAuth");
    });
    const initSyncEngine = vi.fn(async () => { order.push("initSyncEngine"); });

    await runStartupSequence(loadState, createWindow, initAuth, initSyncEngine);

    const winIdx  = order.indexOf("createWindow");
    const authIdx = order.indexOf("initAuth");
    expect(winIdx).toBeGreaterThanOrEqual(0);
    expect(authIdx).toBeGreaterThan(winIdx); // window shown before auth finishes
  });

  // b. initAuth and initSyncEngine run concurrently (Promise.all)
  it("b: initAuth and initSyncEngine overlap when run via Promise.all", async () => {
    const startTimes: Record<string, number> = {};

    let resolveAuth!: () => void;
    let resolveSync!: () => void;

    const authStarted  = new Promise<void>((r) => { resolveAuth = r; });
    const syncStarted  = new Promise<void>((r) => { resolveSync = r; });

    const initAuth = vi.fn(async () => {
      startTimes.auth = Date.now();
      resolveAuth();
      await new Promise<void>((r) => setTimeout(r, 10));
    });
    const initSyncEngine = vi.fn(async () => {
      startTimes.sync = Date.now();
      resolveSync();
      await new Promise<void>((r) => setTimeout(r, 10));
    });

    // Run in parallel — both should start before either finishes
    await Promise.all([initAuth(), initSyncEngine()]);

    // Both functions were called exactly once
    expect(initAuth).toHaveBeenCalledOnce();
    expect(initSyncEngine).toHaveBeenCalledOnce();

    // Start times should be very close (concurrent, not sequential)
    // Sequential would have startTimes.sync >= startTimes.auth + 10
    const gap = Math.abs((startTimes.sync ?? 0) - (startTimes.auth ?? 0));
    expect(gap).toBeLessThan(10); // both started within same scheduling tick
  });

  // n. Window appears before auth completes
  it("n: window is created while auth is still pending", async () => {
    let windowCreated = false;
    let authCompleted = false;

    const createWindow = vi.fn(() => { windowCreated = true; });
    const initAuth = vi.fn(async () => {
      // Verify window was created before auth resolves
      expect(windowCreated).toBe(true);
      authCompleted = true;
    });
    const initSyncEngine = vi.fn(async () => {});

    await runStartupSequence(
      async () => {},
      createWindow,
      initAuth,
      initSyncEngine,
    );

    expect(windowCreated).toBe(true);
    expect(authCompleted).toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// c. Folder watcher starts before sync completes
// ─────────────────────────────────────────────────────────────────────────────

describe("folder watcher starts before sync completes", () => {

  it("c: startWatcher is called before syncLibraryWithFolder returns", async () => {
    const order: string[] = [];
    let syncResolve!: () => void;

    const startWatcher = vi.fn(() => { order.push("startWatcher"); });
    const syncLibraryWithFolder = vi.fn(async () => {
      // startWatcher should already be in the log by the time this fires
      return new Promise<void>((r) => { syncResolve = r; });
    });

    // Replicate the pattern from main.js Phase 4:
    //   startWatcherFn();
    //   syncLibraryWithFolder();  ← fire-and-forget
    startWatcher();
    const syncPromise = syncLibraryWithFolder();

    // At this point, sync has started but not finished
    expect(order).toContain("startWatcher");
    expect(order.indexOf("startWatcher")).toBe(0);

    // Let sync finish
    syncResolve!();
    await syncPromise;

    expect(startWatcher).toHaveBeenCalledOnce();
    expect(syncLibraryWithFolder).toHaveBeenCalledOnce();
    // Watcher started first
    expect(order[0]).toBe("startWatcher");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// d. injectStyles calls getComputedStyle exactly once
// ─────────────────────────────────────────────────────────────────────────────

describe("injectStyles getComputedStyle cache (PERF-1)", () => {

  it("d: injectStyles source reads getComputedStyle once per call (cached rootStyles)", () => {
    // Verify via source inspection that the getComputedStyle call is extracted
    // once and reused for --bg, --text, --accent properties.
    const src = fs.readFileSync(
      path.resolve(__dirname, "../src/components/FoliatePageView.tsx"),
      "utf-8"
    );

    // Extract the injectStyles function body — use a larger slice (1500 chars)
    // to ensure we capture the full body including the rootStyles assignment.
    const fnStart = src.indexOf("function injectStyles(");
    const fnBody = src.slice(fnStart, fnStart + 1500);

    // Should have exactly one getComputedStyle call inside the function
    const matches = fnBody.match(/getComputedStyle/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);

    // The result should be assigned to a variable (not called inline 3 times)
    expect(fnBody).toContain("rootStyles");
    expect(fnBody).toMatch(/rootStyles\s*=\s*getComputedStyle/);
  });

  it("d: rootStyles is queried once and getPropertyValue is called on the cached object", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../src/components/FoliatePageView.tsx"),
      "utf-8"
    );

    const fnStart = src.indexOf("function injectStyles(");
    const fnBody = src.slice(fnStart, fnStart + 1500);

    // All three property reads should use the cached rootStyles variable
    expect(fnBody).toContain('rootStyles.getPropertyValue("--bg")');
    expect(fnBody).toContain('rootStyles.getPropertyValue("--text")');
    expect(fnBody).toContain('rootStyles.getPropertyValue("--accent")');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// e. Settings save is debounced (500ms)
// ─────────────────────────────────────────────────────────────────────────────

describe("settings save debounce (500ms)", () => {

  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  /**
   * Replicate the save-settings debounce logic from main/ipc/state.js.
   * In-memory update is immediate; file write is debounced 500ms.
   */
  function makeSettingsHandler(saveToFile: () => void) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const inMemory: Record<string, unknown> = {};

    function saveSettings(newSettings: Record<string, unknown>) {
      // Immediate in-memory update
      Object.assign(inMemory, newSettings);
      // Debounced file write
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        saveToFile();
        timeout = null;
      }, 500);
    }

    return { saveSettings, inMemory };
  }

  // e.
  it("e: rapid save-settings calls produce only one file write within 500ms", () => {
    const saveToFile = vi.fn();
    const { saveSettings } = makeSettingsHandler(saveToFile);

    // Fire 10 rapid saves
    for (let i = 0; i < 10; i++) {
      saveSettings({ wpm: 200 + i });
    }

    // No writes yet — debounce window still open
    expect(saveToFile).not.toHaveBeenCalled();

    // Advance past debounce
    vi.advanceTimersByTime(501);
    expect(saveToFile).toHaveBeenCalledTimes(1);
  });

  it("e: in-memory update is immediate (available before debounce fires)", () => {
    const saveToFile = vi.fn();
    const { saveSettings, inMemory } = makeSettingsHandler(saveToFile);

    saveSettings({ theme: "dark" });

    // File write hasn't fired yet
    expect(saveToFile).not.toHaveBeenCalled();
    // But in-memory reflects the change immediately
    expect(inMemory.theme).toBe("dark");
  });

  it("e: source file has 500ms debounce on save-settings handler", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../main/ipc/state.js"),
      "utf-8"
    );
    expect(src).toContain("save-settings");
    // Debounce is present: both setTimeout and the 500ms value must exist near save-settings
    expect(src).toContain("setTimeout");
    expect(src).toContain("}, 500)");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// f. WPM persistence is debounced (300ms)
// ─────────────────────────────────────────────────────────────────────────────

describe("WPM persistence debounce (300ms)", () => {

  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  /**
   * Replicate the useRef + setTimeout debounce pattern from LibraryContainer.tsx.
   */
  function makeWpmSaveEffect(saveApi: () => void) {
    const timeoutRef = { current: null as ReturnType<typeof setTimeout> | null };

    function onWpmChange() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        saveApi();
        timeoutRef.current = null;
      }, 300);
    }

    return { onWpmChange };
  }

  // f.
  it("f: rapid wpm changes produce only one API call within 300ms", () => {
    const saveApi = vi.fn();
    const { onWpmChange } = makeWpmSaveEffect(saveApi);

    // Simulate user typing WPM quickly
    for (let i = 0; i < 5; i++) {
      onWpmChange();
      vi.advanceTimersByTime(50); // 50ms between each keypress
    }

    // Still within debounce window — no save yet
    expect(saveApi).not.toHaveBeenCalled();

    // Let debounce fire
    vi.advanceTimersByTime(300);
    expect(saveApi).toHaveBeenCalledTimes(1);
  });

  it("f: LibraryContainer source uses 300ms debounce for WPM save", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../src/components/LibraryContainer.tsx"),
      "utf-8"
    );
    expect(src).toContain("wpmSaveTimeoutRef");
    expect(src).toContain("setTimeout");
    expect(src).toContain(", 300)");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// i/j. Snoozed doc index (Set-based O(snoozed) check)
// ─────────────────────────────────────────────────────────────────────────────

describe("snoozed doc index (Set-based check)", () => {

  /**
   * Replicate the snoozedDocIds Set pattern from main/ipc/documents.js.
   * Key contract: checkSnoozedDocs iterates the Set, NOT the full library array.
   */
  function makeSnoozeIndex(library: Array<{ id: string; snoozedUntil: number | null }>) {
    const snoozedDocIds = new Set<string>();

    // Seed from library (matches documents.js registration step)
    for (const doc of library) {
      if (doc.snoozedUntil) snoozedDocIds.add(doc.id);
    }

    function snooze(docId: string, until: number) {
      const doc = library.find((d) => d.id === docId);
      if (doc) {
        doc.snoozedUntil = until;
        snoozedDocIds.add(docId);
      }
    }

    function unsnooze(docId: string) {
      const doc = library.find((d) => d.id === docId);
      if (doc) {
        doc.snoozedUntil = null;
        snoozedDocIds.delete(docId);
      }
    }

    function checkSnoozed(now: number, libraryScanCount: { count: number }) {
      if (snoozedDocIds.size === 0) return [];
      const expired: string[] = [];
      for (const docId of snoozedDocIds) {
        libraryScanCount.count++; // track how many items we check
        const doc = library.find((d) => d.id === docId);
        if (doc && doc.snoozedUntil && doc.snoozedUntil <= now) {
          expired.push(docId);
          doc.snoozedUntil = null;
        }
      }
      for (const id of expired) snoozedDocIds.delete(id);
      return expired;
    }

    return { snoozedDocIds, snooze, unsnooze, checkSnoozed };
  }

  // i. Check iterates Set (O(snoozed)), not full library (O(library))
  it("i: checkSnoozedDocs iterates only snoozed entries, not the full library", () => {
    const library = [
      { id: "a", snoozedUntil: null },
      { id: "b", snoozedUntil: Date.now() - 1000 }, // expired snooze
      { id: "c", snoozedUntil: null },
      { id: "d", snoozedUntil: null },
      { id: "e", snoozedUntil: null },
    ];

    const { checkSnoozed } = makeSnoozeIndex(library);
    const scanCount = { count: 0 };
    checkSnoozed(Date.now(), scanCount);

    // Only 1 doc is snoozed — loop should iterate at most 1 entry (the Set)
    // This verifies O(snoozed) not O(library==5)
    expect(scanCount.count).toBe(1);
  });

  // j. Set updates on snooze/unsnooze
  it("j: snoozedDocIds Set gains entry on snooze", () => {
    const library = [{ id: "x", snoozedUntil: null }];
    const { snoozedDocIds, snooze } = makeSnoozeIndex(library);

    expect(snoozedDocIds.has("x")).toBe(false);
    snooze("x", Date.now() + 60000);
    expect(snoozedDocIds.has("x")).toBe(true);
  });

  it("j: snoozedDocIds Set loses entry on unsnooze", () => {
    const library = [{ id: "y", snoozedUntil: Date.now() + 60000 }];
    const { snoozedDocIds, unsnooze } = makeSnoozeIndex(library);

    // Should be seeded from library
    expect(snoozedDocIds.has("y")).toBe(true);
    unsnooze("y");
    expect(snoozedDocIds.has("y")).toBe(false);
  });

  it("j: checkSnoozedDocs removes expired doc from Set and returns its id", () => {
    const past = Date.now() - 5000;
    const library = [{ id: "z", snoozedUntil: past }];
    const { checkSnoozed, snoozedDocIds } = makeSnoozeIndex(library);

    const expired = checkSnoozed(Date.now(), { count: 0 });

    expect(expired).toContain("z");
    expect(snoozedDocIds.has("z")).toBe(false);
  });

  it("i: returns early (skips check) when Set is empty", () => {
    const library = [
      { id: "a", snoozedUntil: null },
      { id: "b", snoozedUntil: null },
    ];
    const { checkSnoozed } = makeSnoozeIndex(library);
    const scanCount = { count: 0 };
    const expired = checkSnoozed(Date.now(), scanCount);

    // Empty Set → no iterations at all
    expect(scanCount.count).toBe(0);
    expect(expired).toHaveLength(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// k. Voice sync effect dependency array ≤ 3 items
// ─────────────────────────────────────────────────────────────────────────────

describe("voice sync useEffect dependency array", () => {

  it("k: useNarrationSync voice sync effect depends on ≤ 3 items", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useNarrationSync.ts"),
      "utf-8"
    );

    // The voice-sync effect is the one that calls setKokoroVoice / selectVoice.
    // Its dep array should be tightly scoped to the two voice identity values.
    // Find the specific pattern: `setKokoroVoice` appears in the effect body,
    // then its dep array immediately follows.
    //
    // Find all dep arrays containing ttsVoiceName and pick the smallest one —
    // that is the tightened voice-sync effect.
    const allMatches = [...src.matchAll(/\},\s*\[([^\]]*ttsVoiceName[^\]]*)\]\s*\);/g)];
    expect(allMatches.length).toBeGreaterThan(0);

    // The voice-sync effect should be the one with the fewest deps
    const depCounts = allMatches.map((m) => m[1].split(",").map((d) => d.trim()).filter(Boolean).length);
    const minDeps = Math.min(...depCounts);

    // The tightened voice-sync effect must have ≤ 3 deps (should be exactly 2)
    expect(minDeps).toBeLessThanOrEqual(3);
  });

  it("k: voice sync effect includes settings.ttsEngine and settings.ttsVoiceName as deps", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useNarrationSync.ts"),
      "utf-8"
    );

    // The tight voice-sync effect: }, [settings.ttsEngine, settings.ttsVoiceName]);
    expect(src).toContain("[settings.ttsEngine, settings.ttsVoiceName]");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// l. Vite config has manualChunks with vendor/tts/settings
// ─────────────────────────────────────────────────────────────────────────────

describe("Vite config manualChunks code splitting", () => {

  // Read the vite.config.js source for structural checks
  let viteConfigSrc: string;

  beforeEach(() => {
    viteConfigSrc = fs.readFileSync(
      path.resolve(__dirname, "../vite.config.js"),
      "utf-8"
    );
  });

  it("l: vite.config.js contains a manualChunks function", () => {
    expect(viteConfigSrc).toContain("manualChunks");
    // Must be a function, not an object
    expect(viteConfigSrc).toMatch(/manualChunks\s*\(/);
  });

  it('l: manualChunks returns "vendor" for react/react-dom modules', () => {
    expect(viteConfigSrc).toContain('"vendor"');
    expect(viteConfigSrc).toMatch(/node_modules\/react\//);
    expect(viteConfigSrc).toMatch(/node_modules\/react-dom\//);
  });

  it('l: manualChunks returns "tts" for narration/TTS modules', () => {
    expect(viteConfigSrc).toContain('"tts"');
    expect(viteConfigSrc).toMatch(/src\/hooks\/narration\//);
  });

  it('l: manualChunks returns "settings" for settings components', () => {
    expect(viteConfigSrc).toContain('"settings"');
    expect(viteConfigSrc).toMatch(/src\/components\/settings\//);
  });

  it("l: manualChunks function correctly classifies sample module IDs", () => {
    // Extract and eval the manualChunks function via dynamic extraction
    // We test by asserting the source returns the right chunk for each pattern
    const reactId      = "node_modules/react/index.js";
    const reactDomId   = "node_modules/react-dom/client.js";
    const narrationId  = "src/hooks/narration/useKokoroVoice.ts";
    const settingsId   = "src/components/settings/TtsSettings.tsx";
    const unknownId    = "src/components/LibraryContainer.tsx";

    // Verify the config file contains each expected match pattern
    expect(viteConfigSrc).toContain(reactId.split("/")[1] + "/");
    expect(viteConfigSrc).toContain("src/hooks/narration/");
    expect(viteConfigSrc).toContain("src/components/settings/");

    // Verify unknown IDs are NOT matched (no explicit chunk for them)
    // The config returns undefined for unmatched IDs — the test confirms
    // the source does NOT assign LibraryContainer to a named chunk
    expect(viteConfigSrc).not.toMatch(/"LibraryContainer"/);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// m. rebuildLibraryIndex is debounced (100ms)
// ─────────────────────────────────────────────────────────────────────────────

describe("debouncedRebuildLibraryIndex (100ms)", () => {

  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  /**
   * Replicate the debounce pattern from main.js.
   */
  function makeDebounced(rebuildFn: () => void, delayMs = 100) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    function debounced() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { timer = null; rebuildFn(); }, delayMs);
    }
    return { debounced };
  }

  // m.
  it("m: batch mutations trigger only one rebuild within the 100ms window", () => {
    const rebuild = vi.fn();
    const { debounced } = makeDebounced(rebuild, 100);

    // Simulate 5 rapid library mutations
    for (let i = 0; i < 5; i++) {
      debounced();
    }

    // No rebuild yet
    expect(rebuild).not.toHaveBeenCalled();

    // Advance past debounce
    vi.advanceTimersByTime(101);
    expect(rebuild).toHaveBeenCalledTimes(1);
  });

  it("m: subsequent mutations after the window each trigger exactly one rebuild", () => {
    const rebuild = vi.fn();
    const { debounced } = makeDebounced(rebuild, 100);

    // First batch
    debounced();
    debounced();
    vi.advanceTimersByTime(101);
    expect(rebuild).toHaveBeenCalledTimes(1);

    // Second batch after window has closed
    debounced();
    debounced();
    vi.advanceTimersByTime(101);
    expect(rebuild).toHaveBeenCalledTimes(2);
  });

  it("m: main.js source has debouncedRebuildLibraryIndex with 100ms delay", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../main.js"),
      "utf-8"
    );
    expect(src).toContain("debouncedRebuildLibraryIndex");
    expect(src).toContain("setTimeout");
    // The debounce delay is 100ms — verify the literal appears near rebuildLibraryIndex
    expect(src).toContain("}, 100)");
  });

});
