# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top sprint, paste into CLI, execute. After completion, remove it, log it, backfill to ≥3.

**Full specs:** `ROADMAP.md` §Phase 2

**Queue rules:** FIFO — top sprint executes next. ≥3 depth maintained.

---

```
SPRINT QUEUE STATUS:
Queue depth: 3
Next sprint: EPUB-2B — Pipeline Completion (URL→EPUB, Legacy Removal)
Health: GREEN — Phase 2 EPUB Pipeline. EPUB-2A complete.
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | Findings | Summary |
|---|-----------|---------|--------|------|----------|---------|
| 1 | **EPUB-2B** | v1.5.1 | `sprint/epub-2b-pipeline` | Full | BUG-075, BUG-079 | URL articles → EPUB (not PDF). Chrome ext → EPUB. Legacy migration. Remove text renderer fallback. Single rendering path. ≥10 new tests. Doc-keeper updates all governance docs + Phase 2 exit gate. |
| 2 | **FLOW-3A** | v1.6.0 | `sprint/flow-3a-redesign` | Full | — | Phase 3: Flow Mode infinite scroll redesign. Reading zone, WPM timer cursor, line transitions. Spec needed. |
| 3 | **FLOW-3B** | v1.6.1 | `sprint/flow-3b-polish` | Full | — | Phase 3: Flow Mode polish — edge cases, keyboard nav, performance. Spec needed — placeholder for queue depth. |

**Note:** FLOW-3A and FLOW-3B are placeholders to maintain ≥3 queue depth. Full specs to be written after EPUB-2B completes, per ROADMAP_V2.md §Phase 3.

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
| EPUB-2A | 2026-04-01 | PASS | Formatting-preserving EPUB conversion, image embedding, DOCX support. 18 new tests. v1.5.0. |
| AUDIT-FIX-1F | 2026-04-01 | PASS | 6 moderate fixes, 9 deferred. v1.4.14. |
| AUDIT-FIX-1E | 2026-04-01 | PASS | Test timeout, console.debug guards, npm audit in CI. v1.4.13. |
| AUDIT-FIX-1D | 2026-04-01 | PASS | OAuth CSRF, path traversal, token encryption. v1.4.12. |
| AUDIT-FIX-1C | 2026-04-01 | PASS | Race conditions: stale closures, ref authority, null checks. v1.4.11. |
| AUDIT-FIX-1B | 2026-04-01 | PASS | Resource lifecycle: handler leaks, retry, sliding window. v1.4.10. |
| AUDIT-FIX-1A | 2026-04-01 | PASS | Correctness: broken IPC, sync data loss, silent catches. v1.4.9. |
| HOTFIX-11 | 2026-04-01 | PASS | ONNX worker thread crash patch. v1.4.8. |
