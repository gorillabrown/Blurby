# Phase Brief — 2026-10-10 (second review)

## Provenance

| Figure | Source | As of |
|---|---|---|
| Register state | monday:board/18432450217 via provider `external`; snapshot imported 2026-10-11T00:28:11Z after this review's two `create-item` writes (both readback-confirmed) | 2026-10-11 |
| Pace | `kpis --json` (plugin 1.13.0), deadline `mode-separation` | 2026-10-10 |
| Code facts | read-only investigations of `main` @ `95aae83e`, spot-checked by the planner | 2026-10-10 |

## Goal

Use idle executor capacity while mode separation waits on OS-1, without touching anything the separation branch changes.

## The belt, in sequence

| Seq | Item | State | Path |
|---|---|---|---|
| 1 | **Separate the four reading modes' runtimes** (READER-MODE-SEPARATION-2) | In Flight; paused at owner gate OS-1 | epic (excluded from the buffer) |
| 6 | **Stop the e-ink hover rule wiping overlay backgrounds** (EINK-HOVER-FIX-1) | Queued, Full Spec, dispatch-ready | dispatch, XS, chain 40m |
| 7 | **Fix command-palette settings routing and live "New"-dot clearing** (LIBRARY-SETTINGS-FIX-1) | Queued, Full Spec, dispatch-ready | dispatch, S, chain 1h20m |

**Buffer: 2 dispatch-ready of the policy target of 5.** Items 6 and 7 are file-disjoint from each other, from the separation branch and from the shared-core freeze set, so both can run now in parallel.

## Implementation highlights

- **E-ink fix:** one CSS rule. `[data-eink="true"] *:hover` becomes `[data-eink="true"] :where(button, a, [role="button"], [role="option"], [role="menuitem"], .queue-item, .page-word):hover`. Specificity is unchanged, so the Settings panel and about 25 other overlays stop going transparent while hovered. A regression test is added first and must fail alone (positive control). BUG-184 closes only after rebuild + owner smoke (rule 35).
- **Palette and "New" dot:**
  - Six `CommandPalette.tsx` edits: three bare `onOpenSettings()` calls → `"settings"`, `"text-size"` → `"layout"`, a label rename, and a new Reading Goals entry.
  - Three `MenuFlap.tsx` titles.
  - A small timer-based `seenBatcher` util saves seen cards a moment after their 1 s dwell and flushes on unmount. Both delays move to `src/constants.ts` beside `NEW_LIBRARY_DAYS`, clear of the separation branch's hunks.
  - Two new test files, both written first.

## Readiness per item (five findings)

| Item | Specification | Prerequisites | Repository | External register | Execution environment |
|---|---|---|---|---|---|
| EINK-HOVER-FIX-1 | PASS (U1–U10; edit sites verified on `95aae83e`) | PASS (none) | PASS (branch and base named; exact staging; Rule 5b merge) | PASS (created and confirmed 2026-10-11T00:27:10Z) | PASS (node/npm; owner needed only for the post-merge smoke) |
| LIBRARY-SETTINGS-FIX-1 | PASS (U1–U10; edit sites verified on `95aae83e`) | PASS (none) | PASS | PASS (created and confirmed 2026-10-11T00:27:38Z) | PASS (node/npm, Vitest fake timers) |

## Prerequisites into and out of the belt

- **Into:** none for items 6 and 7. READER-MODE-SEPARATION-2 needs the owner's OS-1.
- **Out:** mode separation still unblocks positions 2–5 and 10, which then need re-specification.

## Exit criteria and duration

About 2 executor hours for both items (uncalibrated), plus a 2-minute owner smoke test for BUG-184 after rebuild. Mode separation: OS-1 (about 45 minutes of owner time) plus under one executor session. Deadline 2026-11-30.

## Top risks

1. **The e-ink selector list may miss a hover row.** A non-listed, non-button row regains its hover background in e-ink mode (cosmetic, accepted). The owner smoke test catches anything that matters.
2. **`src/constants.ts` is shared with the separation branch.** The hunks are about 190 lines apart, so the merge should be clean. The spec says to keep both sides if not.

## Buffer gaps

| Item | Checks blocking | Why |
|---|---|---|
| NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1, NARRATE-SUBSCRIBER-CURSOR-1, UX-POLISH-1, CLEANUP-MODE-BARREL-1 | U2, U5 | Edit sites exist only after mode separation (owner priority) |
| KOKORO-EXPORT-1 | — | Deferred by choice |

## Lessons applied

See [2026-10-10-2-lessons-applied.md](2026-10-10-2-lessons-applied.md).
