# Performance Sprint — Overnight

## Phase 1: Main Process I/O ✅
- [x] Replace `readJSON` sync calls with async `fsPromises` equivalents
- [x] Replace `writeJSON` sync calls with async `fsPromises` equivalents
- [x] Make `getDataPath()` initialize once + cache (single startup `mkdirSync`)
- [x] Make `backupFile()` async
- [x] Replace all remaining sync `fs.*` calls (extractMobiCover, covers dirs, opf checks, log-error)
- [x] Debounce `saveLibrary()` writes (500ms coalesce) + `saveLibraryNow()` for shutdown
- [x] Debounce `broadcastLibrary()` (200ms coalesce) + `broadcastLibraryNow()` for user actions
- [x] Add `Map<id, doc>` index — O(1) lookups in 8 IPC handlers via `getDocById()`
- [x] Flush pending writes on app quit

## Phase 2: Startup & Loading ✅
- [x] Lazy-load jsdom + Readability + pdfkit (`getJSDOM()`, `getReadability()`, `getPDFDocument()`)
- [x] Make `syncLibraryWithFolder()` non-blocking at startup (`.then()` instead of `await`)
- [x] Extract content in parallel batches of 4 via `extractNewFileDoc()` + `Promise.all()`

## Phase 3: React Rendering ✅
- [x] Memoize `getFilteredAndSorted()` in LibraryView → `useMemo` with proper deps
- [x] Wrap `DocCard` in `React.memo`
- [x] Wrap `DocGridCard` in `React.memo`
- [x] Memoize derived counts (activeLibrary, favCount, archivedCount, etc.) in single `useMemo`

## Phase 4: Reader Modes ✅
- [x] RSVP: throttle `setWordIndex` React state syncs to ~100ms (10fps vs 60fps)
- [x] Flow mode: same 100ms throttle for `setFlowWordIndex`, sync on stop
- [x] Throttle progress saves to every 5s instead of every word change
- [x] Sync final position on playback stop (both useReader and ScrollReaderView)

## Phase 5: Data Transfer ✅
- [x] LRU cache for cover image base64 results (100 entries) in `get-cover-image` handler
- [x] Debounced broadcasts (200ms coalesce) reduce IPC chatter

## Impact Summary
| Area | Before | After |
|------|--------|-------|
| Startup blocking | `await syncLibrary` + eager `require` of jsdom/pdfkit | Non-blocking sync, lazy module loading |
| Library writes | Sync `writeFileSync` on every change | Async + 500ms debounce |
| IPC lookups | `.find()` O(n) linear scan | `Map.get()` O(1) |
| Content extraction | Sequential | Parallel batches of 4 |
| RSVP re-renders | 60fps React re-renders | 10fps state syncs |
| Flow re-renders | Every word → React update | 100ms throttled + 5s progress saves |
| Cover images | Re-read file on every grid render | LRU cache (100 entries) |
| Library filter/sort | Recomputed every render | `useMemo` with dependency tracking |
| Card components | Re-render on any parent change | `React.memo` shallow comparison |
