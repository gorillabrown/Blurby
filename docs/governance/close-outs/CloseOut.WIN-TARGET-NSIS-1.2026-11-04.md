---
dispatch: WIN-TARGET-NSIS-1
date: 2026-11-04
runtime: 33m
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: WIN-TARGET-NSIS-1

## Dispatch Brief

**Goal:** Make the full NSIS installer (`nsis`, named `Blurby-Setup-<version>-<arch>`) the build target in `package.json`, so the release runbook no longer needs command-line overrides.
**Result:** The `build` block in `package.json` now sets target `nsis`, the artifact name and the GitHub publish owner and repo; the release runbook, TECHNICAL_REFERENCE, the auto-update e2e doc and CLAUDE.md lost the old overrides and the stale `nsis-web` name; a new test file `tests/winTargetNsis.test.js` pins the four rules (w1 to w4).
**Learned:** No new lesson — the one slip (the spec's own gate 7 pattern matched its own header sentence) is a spec-authoring slip, recorded in the memo.
**Recommend:** Close it; the only follow-up is the updater feed still naming 1.1.2, which matters at release time, not at this close.
**Bottom line:** The installer target is fixed in `package.json`, proved by x64 and ARM64 builds on the item's branch, and now integrated on main.

## Time

Log: `docs/governance/close-outs/Timing.WIN-TARGET-NSIS-1.jsonl`, complete. Actual 33m (33.3). Waited 0 on every row. Predicted: none recorded (the log header reads "0m"). Per-row estimate is shown in minutes; no row was added or flagged.

| Row | Kind | Estimate | Predicted | Actual | Waited | Added | Flag |
|---|---|---|---|---|---|---|---|
| 1 | positive-control | 20 | - | 5.7 | 0 | no | none |
| 2 | config-change | 20 | - | 1.7 | 0 | no | none |
| 3 | measurement | 40 | - | 9.6 | 0 | no | none |
| 4 | measurement | 45 | - | 9.2 | 0 | no | none |
| 5 | verify | 25 | - | 5.0 | 0 | no | none |
| 6 | close | 10 | - | 2.1 | 0 | no | none |

## Findings

Source: the group 2 evidence check on origin/main 14ce3d24 and the item's memo. "Memo" means taken from the memo, not re-run.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---|---|---|---|---|---|---|
| 1 | Red first | (w1) fails alone on the base | exit 1 | `d87f9e46`; exit 1, `expected 'nsis-web' to be 'nsis'` (memo) | Pass | n/a (new) | Pass |
| 2 | The change | `node -p` line; test exit | specified line; exit 0 | line printed from `package.json` on origin/main; `tests/winTargetNsis.test.js` has (w1) to (w4) | Pass | n/a | Pass |
| 3 | Base builds with overrides | x64 and ARM64 build | both build | both built, all `throw` checks passed (memo) | Pass (memo evidence, not re-run) | n/a | Pass |
| 4 | After builds, no overrides | x64 and ARM64 build | both build, same sizes | built; installers 248,443,387 and 247,400,709 bytes, equal to base (memo) | Pass (memo evidence, not re-run) | n/a | Pass |
| 5 | Artifacts match | spec script | `MATCH`, exit 0 | exit 0, `MATCH` (memo); not re-runnable now | Pass (memo evidence, not re-run) | n/a | Pass |
| 6 | Merged feed | arch selection | x64 and arm64 pick their own exe | `x64 -> ...-x64.exe`, `arm64 -> ...-arm64.exe`, exit 0 (memo) | Pass (memo evidence, not re-run) | n/a | Pass |
| 7 | Runbook has no overrides | grep on origin/main | exit 1, empty | exit 1, empty | Pass | n/a | Pass |
| 8 | No stale name | grep on origin/main | exit 1, empty | exit 1, empty | Pass | n/a | Pass |
| 9 | Suite, typecheck, build, collection | counts | green; list gains one file | memo: 2,455 passed, typecheck 0, build 0, list 181 to 182 | Pass | n/a | Pass |
| 10 | Fence | changed files | package.json, four docs, one test | exactly those, plus memo and time log | Pass | n/a | Pass |
| 53 | Package verification (rule 53) | `--dir --arm64`, 25 s launch, asar | no error or crash | recorded in memo, logs under `C:\Projects\Blurby-artifacts\win-target-nsis\rule53\` | Pass (memo evidence, not re-run) | n/a | Pass |

## Interpretation

No row failed. Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. Run 6 on 14ce3d24 had 3,048 passed, 0 failed, typecheck 0 and 0 crashes. No row of this item depends on those unjudged rows. Row 9 rests on the memo's own counts plus run 6.

Memo evidence, not re-run: the package match (rows 3 to 6). The `win-arm64-unpacked` folders the match script compares are gone from `base\` and `after\` in the artifacts folder, so the script cannot be run again; the memo is the record. No later commit changed `package.json` or the runbook since `d96435a1`.

## Proposed Dispositions

- **Accept:** close the item. Authority: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.
- **Log:** Plato's note that CLAUDE.md still says "CI/CD active via GitHub Actions" is a follow-up candidate, not a fold-in.

## Mid-Dispatch Decisions

- 2026-10-23, tier 1 (recorded in the memo): the spec's runbook header sentence "Overrides moved into `package.json` by WIN-TARGET-NSIS-1." would itself match gate 7's pattern. It was written "The command-line overrides moved into `package.json` by WIN-TARGET-NSIS-1." — same meaning, passes. This is a spec-authoring slip, not a criterion change.

## Lessons

- **New:** No new lesson — the one slip is a spec-authoring slip; claims were proved by building (LL-142) and base and after were built the same way on one machine (LL-152); standing rules 36, 41, 43, 44, 46, 49, 50, 52 and 53 cover the rest.
- **Applied:** LL-142 — held: the target was proved by x64 and ARM64 builds, not by reading config.
- **Applied:** LL-152 — held: same recipe, same machine for base and after; installer sizes equal.
- **Applied:** standing rules 36, 41, 43, 44, 46, 49, 50, 52, 53 — held: re-grep found only a one-line drift (`CLAUDE.md:373`); red first `d87f9e46`; no register writes; vitest list gained exactly one file; the rule 53 section exists in the memo.

## Files Created

- **Removed (temporary):** none
- **Committed:** memo `Memo.WIN-TARGET-NSIS-1.GovernanceStaging.2026-10-23.md` and `Timing.WIN-TARGET-NSIS-1.jsonl` earlier; this report is committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

None needed. The memo adds no fold-ins ("Lessons added: none"). LL-168 (Brain's x64 install check) and the ROADMAP "Release observation" about the updater feed are already in place.

## Roadmap & Queue Movement

- **Retired:** WIN-TARGET-NSIS-1 — retired from In Flight; no sequence change.

## Next Work

No change from this close-out.

## Gates

- Integrated identity: branch tip `d96435a1` is an ancestor of origin/main; merged by `c5bb507f` (RC-INTEGRATION-WINDOW); tested tree 14ce3d24.
- RC window package record: x64 pair on RodneySr at `70d64237`, Brain1's confirmation, arm64 launch on Rodney from `c5bb507f` (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). Raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- No owner check for this item (spec: "There is no owner check").

## Git Hand-Off

- [ ] Committed by Blurby.Roadmap.
