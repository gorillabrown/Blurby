# Blurby Audit Package — Reviewer Orientation

## What This Package Is

This is a structured codebase audit of **Blurby**, an Electron-based speed reading and narration application (v1.4.7). The audit was conducted on 2026-03-30 and produced 62 findings across the full codebase. This package contains the audit report, all referenced source files, and governance documentation — everything a third-party reviewer needs to evaluate the findings independently.

## How To Use This Package

1. **Start with the audit report:** `docs/audit/audit-step1-initial-review.md` — this is the primary deliverable. It contains all 62 findings with severity ratings, file/line citations, evidence, and recommended fixes.

2. **Verify findings against source:** Every finding cites a specific file and line number. The source files are included at their original paths so you can cross-reference directly.

3. **Understand the architecture:** For broader context, read `docs/governance/TECHNICAL_REFERENCE.md` (architecture, data model, feature inventory) and `CLAUDE.md` (project configuration, standing rules, current system state).

4. **Understand the roadmap context:** `docs/project/ROADMAP_V2.md` is the forward-looking plan this audit evaluates. The audit's Section J recommends sequencing changes to Phase 1.

## Package Contents (71 files, 304KB compressed)

### Audit Report
- `docs/audit/audit-step1-initial-review.md` — 62 findings, sections A through K

### Main Process (23 files)
| File | Role |
|------|------|
| `main.js` | App lifecycle, startup, context object |
| `preload.js` | Context bridge — security boundary between main and renderer |
| `main/ipc/tts.js` | TTS IPC handlers (contains MAIN-01) |
| `main/ipc/library.js` | Library CRUD IPC (contains MAIN-12) |
| `main/ipc/reader.js` | Reader IPC handlers |
| `main/ipc/state.js` | State/settings IPC |
| `main/ipc/misc.js` | Miscellaneous IPC (URL extraction, etc.) |
| `main/ipc/documents.js` | Document management IPC |
| `main/tts-engine.js` | Sprint TTS worker lifecycle (contains MAIN-02, MAIN-08) |
| `main/tts-engine-marathon.js` | Marathon TTS worker lifecycle |
| `main/tts-worker.js` | Shared ONNX inference (runs in worker threads) |
| `main/tts-cache.js` | Opus-compressed disk cache (contains MAIN-03) |
| `main/epub-converter.js` | Universal EPUB conversion pipeline |
| `main/legacy-parsers.js` | Non-EPUB format parsers (PDF, TXT, MD, HTML) |
| `main/sync-engine.js` | Offline-first cloud sync (~1K LOC) |
| `main/sync-queue.js` | Operation queue with compaction |
| `main/auth.js` | OAuth2 — Microsoft MSAL + Google PKCE (contains MAIN-06) |
| `main/ws-server.js` | Chrome extension WebSocket server (contains MAIN-05, MAIN-07) |
| `main/epub-word-extractor.js` | Main-process EPUB word extraction |
| `main/window-manager.js` | BrowserWindow, tray, menu (contains MAIN-15) |
| `main/cloud-onedrive.js` | OneDrive App Folder integration |
| `main/cloud-google.js` | Google Drive appDataFolder integration |
| `main/migrations.js` | Schema migrations with backup |
| `main/folder-watcher.js` | Chokidar-based folder watching |
| `main/cloud-storage.js` | Cloud provider factory |

### Renderer (30 files)
| File | Role |
|------|------|
| `src/App.tsx` | Thin orchestrator |
| `src/components/ReaderContainer.tsx` | Main reader (~1.5K LOC, contains REND-01 through REND-04) |
| `src/components/LibraryContainer.tsx` | Library view (~1.4K LOC, contains REND-11) |
| `src/components/FoliatePageView.tsx` | EPUB renderer via foliate-js (~800 LOC, contains REND-10) |
| `src/components/ReaderBottomBar.tsx` | Unified reading controls (contains REND-09) |
| `src/components/ScrollReaderView.tsx` | Scroll/flow reader (contains REND-14) |
| `src/components/ErrorBoundary.tsx` | React error boundary |
| `src/modes/PageMode.ts` | Page-turn reading mode |
| `src/modes/FocusMode.ts` | RSVP focus reading mode |
| `src/modes/FlowMode.ts` | Infinite scroll reading mode |
| `src/modes/NarrateMode.ts` | TTS narration mode |
| `src/hooks/useNarration.ts` | Narration state machine (contains REND-05) |
| `src/hooks/useReaderMode.ts` | Mode orchestration hook |
| `src/hooks/useProgressTracker.ts` | Reading progress tracking (contains REND-16) |
| `src/hooks/useLibrary.ts` | Library data hook (contains REND-18) |
| `src/hooks/useKeyboardShortcuts.ts` | 30+ keyboard shortcuts |
| `src/hooks/useEinkController.ts` | E-ink display optimization |
| `src/utils/audioScheduler.ts` | Audio playback scheduling (contains REND-03, REND-06) |
| `src/utils/generationPipeline.ts` | TTS generation pipeline (contains REND-13) |
| `src/utils/backgroundCacher.ts` | Background TTS caching |
| `src/utils/audioPlayer.ts` | PCM audio playback |
| `src/utils/FlowCursorController.ts` | Flow mode cursor |
| `src/utils/text.ts` | Tokenization and text processing |
| `src/constants.ts` | Application constants |
| `src/types.ts` | TypeScript type definitions |
| `src/types/foliate.ts` | Foliate-specific types |
| `src/types/narration.ts` | Narration-specific types |
| `src/contexts/SettingsContext.tsx` | Settings React context |
| `src/contexts/ToastContext.tsx` | Toast notification context |
| `src/styles/global.css` | All styles (CSS custom properties, WCAG 2.1 AA) |

### Test Infrastructure (4 files)
| File | Role |
|------|------|
| `src/test-harness/electron-api-stub.ts` | 73-method IPC stub for browser testing |
| `src/test-harness/mock-kokoro.ts` | Synthetic TTS audio generation |
| `src/test-harness/stub-loader.ts` | Dev-only stub injection |
| `tests/setup.js` | Test polyfills |

### Configuration (4 files)
| File | Role |
|------|------|
| `package.json` | Dependencies, scripts, electron-builder config |
| `vite.config.js` | Build and test configuration |
| `tsconfig.json` | TypeScript compiler options |
| `.github/workflows/ci.yml`, `release.yml` | CI/CD pipelines |

### Governance Documentation (5 files)
| File | Role |
|------|------|
| `CLAUDE.md` | Project configuration, architecture summary, standing rules |
| `ROADMAP.md` | Current sprint roadmap |
| `docs/project/ROADMAP_V2.md` | Forward-looking v2 roadmap (7 phases) |
| `docs/governance/TECHNICAL_REFERENCE.md` | Architecture, data model, feature inventory |
| `docs/governance/BUG_REPORT.md` | Known open bugs (9 active) |
| `docs/governance/LESSONS_LEARNED.md` | Engineering discoveries and guardrails |

## Architecture Quick Reference

Blurby is an Electron app with three layers:

- **Main process** (Node.js/CommonJS): File I/O, TTS engine (Kokoro ONNX via worker threads), cloud sync, IPC handlers. All system access lives here.
- **Preload** (`preload.js`): Context bridge exposing `window.electronAPI`. Security boundary — no Node.js in renderer.
- **Renderer** (React 19/TypeScript/ESM): 4 reading modes (Page, Focus, Flow, Narrate), library management, settings UI.

Key subsystems relevant to the audit:
- **Dual-worker TTS**: Sprint worker (real-time) + Marathon worker (background caching), coordinated via Opus-compressed disk cache.
- **Cloud sync**: Offline-first with revision counters, operation log, tombstones. Supports OneDrive and Google Drive.
- **EPUB pipeline**: All formats (PDF, MOBI, TXT, HTML, DOCX) convert to EPUB on import.

## Audit Methodology

Three parallel audit agents read the full codebase simultaneously:
1. **Main process agent**: All main-process files, IPC handlers, TTS engine, sync, auth
2. **Renderer agent**: All React components, hooks, utilities, modes, types
3. **Test/CI agent**: All 25 test files, configuration, CI/CD pipelines, test harness

Findings were cross-referenced against actual source code before inclusion. Each finding includes file path, line number, code evidence, impact assessment, and recommended fix.

## Severity Definitions

| Level | Meaning |
|-------|---------|
| **CRITICAL** | Data loss, crash, broken functionality, or security vulnerability. Must fix before shipping. |
| **MAJOR** | Significant bug, meaningful UX degradation, or security hardening gap. Should fix in current phase. |
| **MODERATE** | Performance issue, architectural violation, edge case, or maintainability concern. Fix when touching the area. |
| **MINOR** | Code quality, documentation drift, or cleanup opportunity. Low urgency. |
| **NIT** | Style, convention, or nice-to-have. No functional impact. |

## What's NOT In This Package

- **Test files** (25 files, 5.6K LOC): Only `tests/setup.js` is included. The test agent's findings are in the audit report but the individual test files are not bundled. If you need them, they're in `tests/` in the full repo.
- **Node modules**: Not included. Run `npm install` against the `package.json` if you need to build.
- **Assets**: Images, fonts, sample EPUBs, and Kokoro model files are not included.
- **Git history**: This is a flat snapshot, not a repository clone.
