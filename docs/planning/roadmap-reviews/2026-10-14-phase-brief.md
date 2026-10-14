# Roadmap review 2026-10-14 — Phase brief

**Provenance:** Notion register `notion:database/3f87c96cc31e800580cfe019c89a56ca` (snapshot 2026-10-14T15:58:05Z, 84 items); `ROADMAP.md` on `eb/roadmap-review-2026-10-14` from `66f15981`; epic state on `eb/narrate-rebuild-1-p6` @ `f677353f`.

**Goal:** "Narration rebuilt", with the launch, quit and packaging defects that G2 surfaced fixed beside it.

## Head — Rebuild Narrate (NARRATE-REBUILD-1, epic, in flight)

P6 is at owner gate G2, and G2 is ready (`f677353f`): the production build includes main `ab5cead4`, the sample is relinked and `sourceFolder` is cleared on the owner's profile. After G2: UX-POLISH-1's close-out (checks (c), (e) and (f)), BUG-184 and BUG-185 to Complete, and `settings.json` restored from the G2 backup (`sourceFolder` only, once FOLDER-SCAN-PERF-1 is in; see below). **Finding for the epic:** Narrate's iframe key forwarder (`src/reader/modes/narrate/FoliateView.tsx:933-934`) drops `repeat`, like the three forwarders UX-POLISH-2 fixes.

## Buffer, in order

| # | Item | When | Specification | Prerequisite | Repository | External register | Environment |
|---|---|---|---|---|---|---|---|
| 10 | Stop a large source folder stalling every launch (FOLDER-SCAN-PERF-1, M) | **now** | pass | pass (none) | pass (P6 edits no file here) | pass (Queued, Full Spec) | full suite outside trial windows; owner re-measure after G2 |
| 11 | Finish every save before the app quits (QUIT-FLUSH-1, S) | **now; merge after 10** | pass | pass (none in code) | shares `main.js` with 10 (disjoint hunks) | pass | owner smoke on its own production build |
| 12 | Diagnose the reading band and the ResizeObserver flood (READER-VISUAL-DIAG-1, S) | **now** | pass (BUG-193 amendment) | pass | pass (docs only) | pass | live sessions with `sourceFolder` empty |
| 13 | Ship the icons, quiet the updater, relink stale samples (PACKAGING-FIX-1, S) | **now** | pass | pass | shares `package.json` with 10 (different keys) | pass | launch checks on scratch profiles; owner smoke |
| 15 | Keyboard and help-surface follow-ups (UX-POLISH-2, M, three waves) | **now** | pass | pass | the only shared-core touch (`src/types.ts`, one comment) | pass | owner smoke on its own production build |

**Buffer:** 5 dispatch-ready of 5. No gaps. Beyond it: stubs 16–21 (FOLDER-UNREACHABLE-GUARD-1 to specify next).

## Risks

- **BUG-195:** restoring the owner's Drive folder after FOLDER-SCAN-PERF-1 is safe only while the Drive is mounted at launch. Until FOLDER-UNREACHABLE-GUARD-1 merges, back up `library.json` and check the mount first.
- **Drive change events:** whether Google Drive's G: delivers recursive `fs.watch` events is unverified; FOLDER-SCAN-PERF-1's smoke stops for an owner decision if it does not.
- **Four production builds** (10, 11, 13 and 15 each smoke on their own build): each is made in its own worktree and never overwrites the G2 build.

## Lessons applied

See [2026-10-14-lessons-applied.md](2026-10-14-lessons-applied.md). LL-157 is the core of QUIT-FLUSH-1; LL-152's measure-first rule changed FOLDER-SCAN-PERF-1's main control.
