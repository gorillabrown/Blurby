# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top sprint, paste into CLI, execute. After completion, remove it, log it, backfill to ≥3.

**Full specs:** `ROADMAP.md` (see Phase 5 and Phase 6 sections)

**Queue rules:** FIFO — top sprint executes next. ≥3 depth maintained.

---

```
SPRINT QUEUE STATUS:
Queue depth: 2
Next sprint: EINK-6A (E-ink Display Mode)
Health: YELLOW — Queue depth below 3. Backfill 1 sprint.
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | Findings | Summary |
|---|-----------|---------|--------|------|----------|---------|
| 1 | EINK-6A | v1.12.0 | `sprint/eink-6a-display-mode` | Full | — | E-ink as independent display mode. Decouple from theme. `einkMode` boolean + `[data-eink]` CSS. |
| 2 | GOALS-6B | v1.13.0 | `sprint/goals-6b-reading-goals` | Full | — | Daily/weekly reading goals. Progress ring in library header. Goal-met toast. |

**Full specs:** `ROADMAP.md` §Phase 6 (EINK-6A, GOALS-6B).

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
