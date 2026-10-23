# Dispatch Close-Out Governance Staging — SMOKE8-DIAG-1

**Run setup:**
- **Branch:** `eb/smoke8-diag-1` from `refs/remotes/origin/main`. `origin/main` was taken in at `7cef0513` (the Mid-Dispatch Amendment) and again at `dc8c2c30`.
- **Worktree:** `C:\Projects\Blurby\.worktrees\smoke8-diag-1`.
- **Build diagnosed:** an ARM64 `--dir` build of the frozen `47ae6e1f`, copied to `C:\Projects\Blurby-artifacts\smoke8-diag-1\build`.
- **Machine:** the owner's ARM64 Windows 11 machine.

**What the run did not touch:**
- **Scratch profiles only.** The owner's live profile was never opened. The one exception is a read-only grep of its `error.log` for the string `setEnd`, which found no line.
- **The owner's installed Blurby,** which was running during some sessions, was left alone.
- **Owner books** were used only as hash-named copies.
- **Nothing was written to the register** (standing rule 46). No product code was committed.

## Report

`docs/studies/investigations/SMOKE8-DIAG-1.2026-10-23.md`

| Bug | Verdict | Fix spec in the report |
|---|---|---|
| BUG-201 | Reproduced (3 of 3 attempts; attempt 3 is the smoke's two-session route) | PAGE-REOPEN-CFI-1, with a regression test that fails on `47ae6e1f`. It touches `ReaderContainer.tsx` (shared-core freeze set), so it needs the integration window |
| BUG-202 | Reproduced with a real click, so not a harness artifact | FOLDER-SWITCH-HEADER-1 |
| BUG-207 | Slow quit, but not paused-specific: 11 of 13 measurements over 3 s | Direction needs a Blurby.Brain ruling (below) |
| BUG-206 | Not reproduced. The positive control (the smoke's own book) also did not reproduce, so the live 0 is not a frequency. Static exposure: 15 of 40 owner books (38%) | None: the stack is needed first |
| BUG-208 | Reproduced. The cause is the book's `color: initial`, not E-ink | BOOK-TEXT-COLOUR-1 (tier 2 for Brain) |

## For Blurby.Brain (raised separately)

1. **BUG-207, gate or not.**
   - **Measured:** 11 of 13 quit measurements took over 3 s, paused and playing alike. The time is the uncapped wait for in-flight Kokoro generations. Pausing does not stop read-ahead.
   - **Directions:**
     - (a) stop read-ahead on pause;
     - (b) smaller head chunks;
     - (c) accept the lingering process.
2. **BUG-208's fix rule.** **Decided by the owner (2026-10-23, relayed by Blurby.Brain), verbatim:** "Yes: book text always uses the theme's text colour (the general rule). Readability beats a book's own coloured text. Links keep their colour."
   - BOOK-TEXT-COLOUR-1 uses the general `body *:not(a) { color: inherit !important }` in each mode's injected foliate styles.
   - Brain added a test that a link's descendants inherit the link colour, not the body `fg`.
   - The acceptance test is unchanged: 4.5:1 contrast under every theme, with E-ink on and off, failing on `47ae6e1f`.
3. **BUG-206, next step.**
   - **Recommended:** a `logError` of the stack where Narrate surfaces start errors, shipped with the release fix. The alternative is an owner repro with DevTools open.

## Planner fold-ins (not edited here; ROADMAP is outside the fence)

- **Register PAGE-REOPEN-CFI-1, FOLDER-SWITCH-HEADER-1 and BOOK-TEXT-COLOUR-1** as the release fix items, each merging "into the frozen release line".
- **Gate (1) and the smoke re-run** run on the fix sha.
- **New stub from a side finding:** in BUG-201's attempt 3 and in the BUG-206 relaunch control, a relaunch reopened the book at a stale place: the first session's cfi, or the preface. PAGE-REOPEN-CFI-1 covers the in-session case. The spec's live check (Done-when 3) must include a relaunch.

## Lessons

- **Applied:**
  - LL-142: every verdict rests on a live measurement. BUG-208's first hypothesis (E-ink) was refuted live.
  - LL-161: positions were checked by cfi and landed page, not by index alone.
  - LL-146: no harness script was committed.
  - Standing rule 46: no register writes.
  - INSTRUMENT-CONTROL: the BUG-206 null is reported as no measurement, because the control failed.
- **Candidate (for the planner):** a fault reported at a line whose arithmetic cannot produce it points at a different caller. BUG-206's `foliateHelpers.ts:165` clamps its offsets, so the error comes from elsewhere. Confirm the reported line can throw before speccing a fix there.
