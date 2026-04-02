# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top sprint, paste into CLI, execute. After completion, remove it, log it, backfill to ≥3.

**Full specs:** `ROADMAP.md` §Phase 2

**Queue rules:** FIFO — top sprint executes next. ≥3 depth maintained.

---

```
SPRINT QUEUE STATUS:
Queue depth: 2
Next sprint: READINGS-4C — Metadata Wizard
Health: YELLOW — Queue depth below 3. Need to spec one more sprint.
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | Findings | Summary |
|---|-----------|---------|--------|------|----------|---------|
| 1 | **READINGS-4C** | v1.9.0 | `sprint/readings-4c` | Full | — | Metadata Wizard — batch scan, filename parsing, local enrichment. |
| 2 | **EXT-5A** | v1.10.0 | `sprint/ext-5a` | Full | — | Chrome extension E2E tests + queue integration. Phase 5 start. |

**Note:** Queue depth below 3. Backfill needed at next planning session.

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
