---
dispatch: NARRATE-TRACE-LABELS-1
date: 2026-11-04
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: NARRATE-TRACE-LABELS-1

## Dispatch Brief

**Goal:** Remove the old "nano" labels from the real-app trace in `main.js`, make the latency launcher reject a bad `--rates` list, and send `latency-e2e.json` to the `--out` folder.
**Result:** The four labels in `main.js` now read `real-app-narrate-kokoro` (twice), `narrate-kokoro-${slug}` and `narrate-kokoro-${slug}-live-evidence`; a new parser `scripts/narrate-rebuild/lib/rates.mjs` (`parseRates`) makes the launcher `p5-latency-e2e.mjs` exit 2 on `"1.0 2.0"`; `latency-e2e.json` is written into `--out`.
**Learned:** No new lesson — the check slip is a known PowerShell behaviour, covered by the memo's note.
**Recommend:** Close it; nothing waits on it.
**Bottom line:** The labels and the rate-argument check are fixed and still hold on main.

## Findings

Source: the group 2 evidence check on origin/main 14ce3d24 and the memo. No time log was kept, so there is no Time section.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---|---|---|---|---|---|---|
| 1 | Positive control | test alone on base | red | `3c698144`; exit 1, `Cannot find module .../rates.mjs` (memo) | Pass | n/a (new) | Pass |
| 2 | `parseRates` cases; grid ends equal `src/constants.ts` | 8 cases | all pass | memo: 8 of 8; file on origin/main exports `parseRates`, `RATE_MIN 0.8`, `RATE_MAX 2.0` | Pass | n/a | Pass |
| 3 | Launcher on `"1.0 2.0"` | exit code, children | exit 2, nothing launched | exit 2, message printed, Electron child count unchanged (memo, via `app-node.ps1`) | Pass (memo evidence, not re-run) | n/a | Pass |
| 4 | Labels | grep on origin/main | old labels gone | `real-app-selected-nano`, `moss-nano-13`, `selected-nano` in tests, scripts, src, main: each exit 1; new values at `main.js:185,187,192,193` | Pass | n/a | Pass |
| 5 | `latency-e2e.json` location | grep | goes to `--out` | `path.join(RECORDS_DIR, "latency-e2e.json")` exit 1; `path.join(OUT, ...)` once (`p5-latency-e2e.mjs:277`) | Pass | n/a | Pass |
| 6 | Suite, typecheck, build | counts | green | memo: 2,438 passed, typecheck 0, build 0 | Pass | n/a | Pass |
| 7 | Fence | changed files | four files plus memo | exactly `main.js` (4 lines), the launcher, `rates.mjs`, the new test, memo | Pass | n/a | Pass |

## Interpretation

No row failed. Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. Run 6 on 14ce3d24 had 3,048 passed, 0 failed, typecheck 0 and 0 crashes. No row of this item depends on those unjudged rows (they are string, parser, source-text and build checks).

Spec slip: the spec's Done-when 3 command uses plain `node`, which exits 3 because the launcher's first import is an ICU guard (`lib/app-icu-guard.mjs`) that refuses plain Node. The memo ran the same check through `app-node.ps1`, under the app's Electron. This is a spec-authoring slip, recorded here; the criterion was not changed. Row 3 is memo evidence, not re-run.

Later edit: NARRATE-ARRIVAL-SYNC-1 (`48ac770d`) edited the launcher afterward; Done-when 5 still holds on 14ce3d24. The memo records a self-review only (XS item), not an independent review.

## Proposed Dispositions

- **Accept:** close the item. Authority: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.

## Mid-Dispatch Decisions

- 2026-10-23 (recorded in the memo): the spec's plain-`node` launcher command exits 3, so Done-when 3 ran through `app-node.ps1`. Spec slip; no criterion amended.

## Lessons

- **New:** No new lesson — the `Select-String` pipeline masking `$LASTEXITCODE` is a known PowerShell behaviour, noted in the memo for gate commands; LL-151, LL-160 and standing rules 36, 43, 44 and 50 covered the work.
- **Applied:** LL-151 — held: `"1.0 2.0"` exits 2 and launches nothing; a bad argument is never a default pass.
- **Applied:** LL-160 — held: the launcher check ran under the app's Electron through `app-node.ps1`.
- **Applied:** standing rules 36, 43, 44, 50 — held: re-grep matched every cited site; red commit `3c698144` alone; no existing test needed rewriting.

## Files Created

- **Removed (temporary):** none
- **Committed:** memo `Memo.NARRATE-TRACE-LABELS-1.GovernanceStaging.2026-10-23.md` earlier; this report is committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

None needed. The memo has no fold-ins.

## Roadmap & Queue Movement

- **Retired:** NARRATE-TRACE-LABELS-1 — retired from In Flight; no sequence change.

## Next Work

No change from this close-out.

## Gates

- Integrated identity: branch tip `08da0030` is an ancestor of origin/main; merged by `c5bb507f` (RC-INTEGRATION-WINDOW; integration commit `7e0b6beb`); tested tree 14ce3d24.
- RC window package record: x64 pair on RodneySr at `70d64237`, Brain1's confirmation, arm64 launch on Rodney from `c5bb507f` (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). Raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- No owner check for this item.

## Git Hand-Off

- [ ] Committed by Blurby.Roadmap.
