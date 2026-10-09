# OS-1 owner session — listening and live checks (READER-MODE-SEPARATION-2)

This is the one owner session the epic needs before it can be verified and published (Decision #13).
Automation has already recorded every mode transition, position, cursor count and speed value on both
the baseline build (B0) and the final build (F). What is left needs your ears and eyes.
**About 45 minutes in total. Headphones on.**

There are four parts:

| Part | What you check | Where you record it | Build | Time |
|---|---|---|---|---|
| A | Baseline listening | `g0-owner-observations.json` (existing) | B0 | about 20 min |
| B | The same listening checks | `os1-owner-observations.json` → `final` | F | about 15 min |
| C | The new speed dialog | `os1-owner-observations.json` → `speed` | F | about 5 min |
| D | Confirm two baseline behaviours and the removed cross-mode leaks | `os1-owner-observations.json` → `confirmations` | — | 2 min |

Fill every `observed` and `result` field. `result` is one of `as-expected`, `known-defect:<id>`, or
`new-problem`. Then write "done" in the `Answer:` slot of the OS-1 BLOCKER in
`docs/planning/epics/2026-10-09-reader-mode-separation-2/state.md`.

Every launch below opens Blurby in a throwaway profile. Your real library is never touched, and the
script checks that when you close the window. Keep every profile folder it prints; do not delete them.

## Part A — baseline (B0)

Follow `g0-owner-checklist.md` exactly: items H1–H8 and V1–V3, recorded in `g0-owner-observations.json`.

## Part B — the final build (F), same checks

Open PowerShell 7 and run:

```
cd C:\Projects\Blurby\.worktrees\reader-mode-separation-2
node docs\planning\roadmap-reviews\reader-mode-separation-2\live\build-candidate.mjs
pwsh -File docs\planning\roadmap-reviews\reader-mode-separation-2\live\live-run-g6.ps1 -Target candidate -Candidate (git rev-parse HEAD) -Owner -Label osonef
```

- Skip the first line if `C:\Projects\Blurby-artifacts\rms2-candidate-<first 12 characters of HEAD>` already exists.
  It refuses to rebuild an existing archive.
- The second line opens F with the same three test books.

Repeat items H1–H8 and V1–V3 from `g0-owner-checklist.md` on F, with one change:

- **H4 (rate change):** the speed buttons are now one control.
  1. Click the speed label in the bottom bar (it reads `1.00x`).
  2. Press → eight times to reach `1.40x`, then Esc.
  3. Listen for 5 seconds.
  4. Open it again, press ← eight times back to `1.00x`, and close it.

Compare each item with what you heard on B0. Behaviour should match B0, except for the known defects
(`KD-CURSOR-LEAD`, `KD-RATE-1.4-OVERLAP`) and the leak removals in Part D. Record each item under
`final.items`.

## Part C — the speed dialog (F; you can stay in the same window)

- **S1 — Focus.**
  1. Open a book and click **Focus**.
  2. Open the speed label using only the keyboard: Tab to it, press Enter.
  3. Press Home (should read `0.40x, 100 words per minute`), then End (`4.80x, 1200 words per minute`).
  4. Use ← to reach `0.45x`; the value shown should be `112.5 words per minute`.
  5. Press Esc. Focus should return to the speed label, and reading must not have started.
  6. Press Play: does Focus pace at the slower speed?
- **S2 — Flow.**
  1. Click **Flow**. The speed label should show Flow's own speed, not the 0.45x you just set for Focus.
  2. Change it to `1.20x`.
  3. Switch to Focus and back. Each mode should keep its own value.
- **S3 — Narrate speeds by ear.**
  1. Click **Narrate** and press Play.
  2. Set `0.80x`, then `1.05x`, then `2.00x`, listening about 5 seconds at each.
  3. Is each one audibly slower or faster as expected, with no overlapping voices, skipped words or new long pauses?
  4. Set it back to `1.00x`.
- **S4 — Page has no speed control.** Click **Page**. There should be no speed label in the bottom bar.
- Close the Blurby window. The script checks your real profile and records the result in its
  `result.json`, in the `-logs` folder it names. The executor reads it from there; you don't need to
  copy anything. A red `LIVE PROFILE CHANGED` error means stop and tell the executor.

## Part D — confirmations

- **C1 — Narrate at the end of a book.** In both builds, Narrate stops at the last word of the book.
  It does not open the next queued book; only Flow does that. Automation measured both builds
  stopping at the same final word (Decision #24). Is stopping acceptable as preserved baseline
  behaviour for this epic? Answer `yes`, or `no` with what you expect.
- **C2 — EPUB section change in Narrate.** This is item H5. If F behaved the same as B0 there, answer `same`.
- **C3 — removed cross-mode leaks.** Two things changed on purpose because one mode was leaking into
  another:
  - Narrate → Page now highlights the word you were on. B0 highlighted the first word (OBS-A3-1).
  - Narrate's bottom bar no longer shows Flow's leftover progress text.

  Did you see either one behave as described? Answer `yes`, `no` or `not seen`.
