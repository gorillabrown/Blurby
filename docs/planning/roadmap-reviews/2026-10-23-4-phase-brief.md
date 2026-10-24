# Roadmap Review 2026-10-23-4 — Phase Brief and Lessons

**Provenance:** register snapshot from 2026-10-24T01:28:08Z (155 items), plus this review's confirmed writes; ROADMAP.md on `eb/gov-roadmap-review-2026-10-23-4`. Audit, assessment and plan: [`2026-10-23-4-audit.md`](2026-10-23-4-audit.md).

## Goal
Unchanged: ship the Stage 8 release, then run the merge train. This review refills the post-release dispatch buffer.

## Dispatch buffer (5 of 5)

1. **Narrate's quit wait and a quick relaunch** (NARRATE-QUIT-LINGER-1, 86, M). Two waves, and the base is measured first.
   - **Tier-2 questions for Blurby.Brain or the owner, with the spec's recommendations:**
     - (T2-1) a relaunch during the linger opens its window only after the old process exits. Accept, since today nothing opens.
     - (T2-2) a possible gap of silence after resuming. Accept only if the after-measurement shows no more gaps than the base.
2. **Escape and undefined theme colours in the other overlays** (OVERLAY-THEME-SWEEP-1, 90, S). Every colour maps to an existing token, so there is no owner question. It is independent of EINK-CONTROLS-1: they edit different hunks.
3. **Narrate and Page ignore modified arrows** (READER-ARROW-GUARD-1, 91, S). Built and held on FLOW-KEYS-FIX-1's tip.
   - **Tier-2 question at the merge go:** in Page, Ctrl or Alt with ←/→ stop turning pages, and Shift with ←/→ moves only the highlight. The spec recommends accepting this.
4. **Full per-architecture Windows installers by default** (WIN-TARGET-NSIS-1, 92, S).
   - **Scope corrected:** Windows still writes one un-suffixed `latest.yml`, so the runbook's rename-and-merge step stays. Only the `-c.` overrides go.
   - It adds `build.publish` and `nsis.buildUniversalInstaller: false`.
5. **E-ink as a switch, and pure-black Dark** (EINK-CONTROLS-1, 96, S). Unchanged.

All five are build-and-hold until the release ships.

## Lessons
- **Applied:** each new specification cites its lessons, and `lessons --check` passes for each: LL-142, LL-152, LL-165 and LL-166, plus standing rules 41, 43, 45, 47, 48 and 50.
- **No promotions this review.**
- **Candidates carried:**
  - the FOCUS-KEYS-FIX-1 close-out lesson (`tagName` against CSS-selector case on XHTML);
  - JUMP-LANDING-SAVE-1's memo candidates c and d (a CDP or `--inspect` client holds `app.quit()`; the driver refuses busy debug ports);
  - BAND-ALIGN-2's memo candidate (foliate scrolls a closed shadow root, so `scrollTop` writes do nothing).

  They are decided at the close-outs of those items.

## Risks
1. Every buffer item is post-release, and the merge train is long. The `ReaderContainer.tsx` integration window orders JUMP-LANDING-SAVE-1 before BAND-ALIGN-2.
2. History-based estimates come out far below the spec authors' estimates (14–29 minutes against 2.5–6.5 hours), because packaged live checks dominate. Trust the authors' figures.

## Buffer gaps
None.

## Owner decisions open
- Release gate (2), the smoke re-check (deferred).
- The tier-2 questions in buffer items 1 and 3, due at their merge go.
- BLOCK-TAG-CASE-1's tier-2 before/after table, when Wave A reports.
