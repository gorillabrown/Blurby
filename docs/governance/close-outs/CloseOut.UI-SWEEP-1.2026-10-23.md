# Close-out — UI-SWEEP-1: Press every control on every screen and report what breaks (2026-10-23)

runtime: not measured in full (rows 1–3 ran without a measured time; partial time log below)

**Goal:** a CDP-driven sweep that presses every control on every screen of a packaged build, on a scratch profile, and a report of what each press did, with every broken control as a bug candidate.
**Result:**
- `scripts/ui-sweep/sweep.mjs` (Node built-ins only, plus a README) and the report `docs/studies/investigations/UI-SWEEP-1.2026-10-23.md`, merged at `420efa85`. No product code.
- Full run 4 on a `--dir` x64 package of the release-fix sha `97527896`: 369 controls on 57 surfaces. 145 OK, 97 ERROR, 107 NO-EFFECT, 10 SKIPPED-SAFETY, 0 SKIPPED-DIALOG, 10 UNREACHABLE, 0 UNKNOWN (67.4 min).
- All 97 ERROR rows are BUG-187's ResizeObserver flood (the positive control, 34 rows on Flow surfaces). No other error.
- 104 NO-EFFECT bug candidates plus three unreachable-for-a-code-reason surfaces (W1–W3) went to UI-SWEEP-TRIAGE-1, which filed them (BUG-210–BUG-216).
- The owner's live profile hashes were equal before and after.

**Learned:** No new lesson — the run followed standing rule 43 (the positive control re-confirmed on the moved base before the full run) and LL-142, LL-146 and standing rule 46. What the sweep could not see is recorded as lessons by UI-SWEEP-TRIAGE-1, which measured it.
**Recommend:** Nothing further on this item. Its findings now run through the triage's bugs and FOCUS-KEYS-FIX-1 / FLOW-KEYS-FIX-1.
**Bottom line:** every reachable control was pressed once; apart from the known flood, nothing errored, and the silent controls were sorted by the triage.

## Evidence (Done-when, verified 2026-10-23 on `eb/gov-roadmap-review-2026-10-23`)

The base moved from `47ae6e1f` to `97527896` by Blurby.Roadmap's decision (below), so rows 2 and 8 read `97527896`.

| # | Criterion | Evidence | Result |
|---|---|---|---|
| 1 | Script exists, no new dependency | `node --check scripts/ui-sweep/sweep.mjs` exits 0 (re-run at close-out). `git diff --name-status 420efa85^1 420efa85` lists no `package.json` or lockfile. | pass |
| 2 | Positive control (BUG-187 ERROR rows on Flow) | Report, Totals: "Positive control: PASS. 34 ERROR row(s) on Flow surfaces"; a Flow-only control run (`ctl97527896`, 25 rows) before the full run. | pass |
| 3 | Method per control | Report's Method paragraph; `sweep.mjs` | pass |
| 4 | Coverage: one section per surface, no UNKNOWN, unreachable with reasons | 57 surface sections, UNKNOWN 0; 12 surfaces unreachable with reasons, W1–W3 with a code reason | pass |
| 5 | Summary: totals, ERROR and NO-EFFECT candidates; screenshots not committed | Report, Totals and Bug candidates; screenshots under `C:\Projects\Blurby-artifacts\ui-sweep-1\full4\` | pass |
| 6 | Live profile untouched | Report, Live profile: `library.json` `d4b884bd…cffbdf6` and `settings.json` `1a4a40c6…818debd4` before = after | pass |
| 7 | Fence | `git diff --name-status 420efa85^1 420efa85`: `A` memo, time log, report, `scripts/ui-sweep/README.md`, `scripts/ui-sweep/sweep.mjs` | pass |
| 8 | No product code | The same diff touches no `src`, `main`, `preload.js` or TypeScript | pass |

Accepted population: the 369 controls of full run 4. Excluded: earlier full runs 2–4a (superseded or stopped, see the memo). Open: none on this item.

## Mid-Dispatch Decisions

- **Pause and base move (Blurby.Roadmap, 2026-10-23).** The item was parked while the release fixes went first, and resumed after BOOK-TYPE-SCALE-1 merged. The run used the release-fix sha `97527896` (tree `4cda8d7c`) in place of `47ae6e1f`, because the shipping tree is the one that matters. FOLIATE-OBSERVER-LEAK-1 is not merged there, so the positive control still held. No issue file was opened.
- **Merge during the freeze** (planner's tier-1 call, in the spec): `scripts/` is not in `build.files`.

## Governance staging

`Memo.UI-SWEEP-1.GovernanceStaging.2026-10-23.md` carries no fold-in instructions; its lesson candidate (a harness that names its build takes the sha as an argument) was fixed in the harness (`--build`) and is a one-time correction, not a lesson. The memo stays as the run's record.

## Lessons

No new lesson — the specification's lessons all held: standing rule 43 (LL-138: the positive control gated the run and was re-confirmed on `97527896`), LL-142 (every result from a measurement), LL-146 (the script lives under `scripts/`, not a collectable test name), standing rule 46 (LL-153: nothing written to the register) and standing rule 41 (LL-136: the fence exempts the time log and memo). LL-164 was checked: no lesson-status line was appended. The hard-coded-sha fault was a one-time harness correction (`--build`). The sweep's blind spots are recorded as lessons by UI-SWEEP-TRIAGE-1's close-out.

## Time

| Row | Task | Kind | Model | Effort | Predicted | Actual | Waited | Added | Flag | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Sweep script that enumerates and presses every control and classifies each press, dry-run on one surface | feature | claude-opus-5-5 | medium | 9 min (median of 3 runs) | not measured | — | — | — | — |
| 2 | Full run on a `--dir` build of 47ae6e1f, positive control red on BUG-187, every surface covered | diagnosis | — | medium | 120 min (timeboxed) | not measured | — | — | — | — |
| 3 | Report written with totals and bug candidates; live profile hashes equal; merged and pushed | docs-and-merge | — | medium | 3 min (median of 62 runs) | not measured | — | — | — | — |
| +4 | Zeus: load spec, reconcile, plan; build --dir of 47ae6e1f | setup | claude-opus-5-5 | high | 1 min (median of 9 runs) | 12 min | — | yes | possible unseen wait | spec read; worktree 78f8e2ef; detached 47ae6e1f worktree: npm ci 0, vite 0, electron-builder --dir arm64 0 (release/win-arm64-unpacked); surface map from source |

Estimate 2h12m (the first listing, sequential rows) · Actual 12m (measured working time, sequential rows)
Partial: rows 1, 2, 3 ran without a measured time, so neither total goes to the ledger. Row +4 is flagged (over 3× its prediction); it was not confirmed with the owner at this close-out and stays out of the pricing history. Cost: not computable (no dispatch binding for UI-SWEEP-1).

## Files Created

- The script, README, report, time log and memo: committed with merge `420efa85`.
- This close-out, the terminal record and the archived specification: committed on `eb/gov-roadmap-review-2026-10-23`.
