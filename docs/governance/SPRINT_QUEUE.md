# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top sprint, paste into CLI, execute. After completion, remove it, log it, backfill to >=3.

**Full specs:** `ROADMAP.md` (see the Phase 6 sections for `TTS-6I`, `TTS-6J`, and `TTS-6K`)

**Queue rules:** FIFO — top sprint executes next. >=3 depth maintained.

---

```
SPRINT QUEUE STATUS:
Queue depth: 2
Next sprint: TTS-6J (Voice Selection & Persona Consistency)
Health: YELLOW — Queue depth below 3. Backfill needed.
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | Findings | Summary |
|---|-----------|---------|--------|------|----------|---------|
| 1 | TTS-6J | v1.20.0 | `sprint/tts-6j-voice-selection-consistency` | Full | — | Polish the voice surface: Web Speech fallback priority, voice/persona terminology, and consistency between settings and technical docs. |
| 2 | TTS-6K | v1.21.0 | `sprint/tts-6k-narration-personalization-quality-sweep` | Full | — | Larger TTS finish pass: align personalization surfaces, close remaining Narrate-mode docs/policy gaps, and sweep stale TTS bug/reference drift. |

**Full specs:** `ROADMAP.md` §Phase 6 (`TTS-6I`, `TTS-6J`, `TTS-6K`).

**Agent staging rule:** All queued TTS sprints are Full-tier and must explicitly stage `test-runner` -> `spec-compliance-reviewer` -> `quality-reviewer` -> `doc-keeper` -> `blurby-lead`.

---

## Deferred Sprints (Phase 1 supersedes)

| Sprint ID | Disposition |
|-----------|-------------|
| TD-2 | Deferred. Mode wiring is feature work. Specs stale. Re-triage post-Phase 2. |
| HOTFIX-1 | Deferred. Grid bugs may fold into Phase 1.5 or later. |
| Sprint 23 | Partially absorbed by Phase 1. Remainder re-triage post-Phase 2. |
| Sprint 25 | Deferred to Phase 5 (ROADMAP_V2). |

---

## Completed Sprints (Recent History)

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
| TTS-6I | 2026-04-04 | PASS | Per-book pronunciation profiles. Global + book override layering, merge resolver, scoped editor with scope toggle, book-aware cache identity. 11 new tests (1,107 total). v1.19.0. |
| TTS-6G | 2026-04-04 | PASS | Narration controls & accessibility polish. Kokoro bucket buttons in bottom bar, BUG-053 resolved, engine-aware aria labels. 8 new tests (1,096 total). v1.18.0. |
| TTS-6F | 2026-04-04 | PASS | Word alignment telemetry + improved timing heuristic. Punctuation-aware/token-length-aware word weighting, dev telemetry surface. 12 new tests (1,088 total). v1.17.0. |
| TTS-6E | 2026-04-04 | PASS | Pronunciation overrides foundation. Global override list, settings editor, preview, cache-safe Kokoro generation. 15 new tests (1,076 total). v1.16.0. |
| TTS-6D | 2026-04-04 | PASS | Kokoro startup/recovery hardening. Unified engine-status events, warming state, delayed prewarm, crash recovery UX. BUG-032 resolved. 11 new tests (1,061 total). v1.15.0. |
| GOV-6D | 2026-04-04 | PASS | Claude CLI agent staging alignment. `blurby-lead` scope-label model clarified, live governance terminology normalized, and roadmap/queue staging synced. v1.15.0. |
| TTS-6C | 2026-04-04 | PASS | Kokoro native-rate buckets (1.0x/1.2x/1.5x). Bucket resolver, cache identity, immediate restart, active-bucket warming. 18 new tests (1,050 total). v1.14.0. |
| TTS-SMOOTH | 2026-04-04 | PASS (implemented on `main`, unreleased) | Kokoro TTS smoothness stabilization: first-chunk priming, cache `wordCount` + lazy migration, scheduler `playbackRate`, punctuation-aware scheduling, Reading Now background warming, type surface green. 6 new tests (1,038 total). |
| EXT-5B | 2026-04-02 | PASS | Extension pairing UX — 6-digit short code, WS pair protocol, settings + popup UI. 10 new tests. v1.11.0. Phase 5 complete. |
| EXT-5A | 2026-04-02 | PASS | Chrome ext E2E + queue integration. 33 new tests. v1.10.0. Phase 5A complete. |
| READINGS-4C | 2026-04-02 | PASS | Metadata Wizard — scan, filename parser, batch update, modal. 16 new tests. v1.9.0. Phase 4 complete. |
| READINGS-4B | 2026-04-02 | PASS | Author normalization, first-run folder picker. 16 new tests. v1.8.0. |
| READINGS-4A | 2026-04-01 | PASS | Library cards, reading queue, "New" dot auto-clear. 17 new tests. v1.7.0. Phase 4 start. |
| FLOW-3B | 2026-04-01 | PASS | Dead code removal, edge case hardening, truncation fix. 8 new tests. v1.6.1. Phase 3 complete. |
| FLOW-3A | 2026-04-01 | PASS | Infinite scroll Flow Mode, shrinking underline cursor, foliate scrolled mode. 35 new tests. v1.6.0. |
| EPUB-2B | 2026-04-01 | PASS | URL→EPUB, Chrome ext→EPUB, legacy migration, single rendering path. 16 new tests. v1.5.1. Phase 2 complete. |
| EPUB-2A | 2026-04-01 | PASS | Formatting-preserving EPUB conversion, image embedding, DOCX support. 18 new tests. v1.5.0. |
| AUDIT-FIX-1F | 2026-04-01 | PASS | 6 moderate fixes, 9 deferred. v1.4.14. |
| AUDIT-FIX-1E | 2026-04-01 | PASS | Test timeout, console.debug guards, npm audit in CI. v1.4.13. |
| AUDIT-FIX-1D | 2026-04-01 | PASS | OAuth CSRF, path traversal, token encryption. v1.4.12. |
| AUDIT-FIX-1C | 2026-04-01 | PASS | Race conditions: stale closures, ref authority, null checks. v1.4.11. |
| AUDIT-FIX-1B | 2026-04-01 | PASS | Resource lifecycle: handler leaks, retry, sliding window. v1.4.10. |
| AUDIT-FIX-1A | 2026-04-01 | PASS | Correctness: broken IPC, sync data loss, silent catches. v1.4.9. |
| HOTFIX-11 | 2026-04-01 | PASS | ONNX worker thread crash patch. v1.4.8. |
