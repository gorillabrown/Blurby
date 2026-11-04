---
dispatch: NARRATE-KEY-REPEAT-1
date: 2026-11-04
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: NARRATE-KEY-REPEAT-1

## Dispatch Brief

**Goal:** Make Narrate's page-document key forwarder pass the key-repeat flag (`repeat: ke.repeat`), as Page, Focus and Flow already do.
**Result:** One line in `src/reader/modes/narrate/FoliateView.tsx` (the forwarder, now `:940` on main) gained `repeat: ke.repeat`, byte-identical to Flow's; a new test in `tests/foliate-bridge.test.ts` reads Narrate's real file to pin it.
**Learned:** No new lesson — a one-line parity fix covered by the spec's listed lessons.
**Recommend:** Close it; held-Space in Narrate now fires once, and no follow-up is needed.
**Bottom line:** Narrate now forwards the repeat flag like the other three modes, and the source-text test keeps it that way.

## Findings

Source: the group 2 evidence check on origin/main 14ce3d24 and the memo. No time log was kept, so there is no Time section.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---|---|---|---|---|---|---|
| 1 | Positive control | test alone on base | red | `ea149851`; exit 1, `expected ... to contain 'repeat: ke.repeat'` (memo) | Pass | n/a (new) | Pass |
| 2 | New test | exists in `tests/foliate-bridge.test.ts` | present | `:46` "narrate FoliateView forwards the iframe keydown's repeat flag"; memo: 7 of 7 pass | Pass | n/a | Pass |
| 3 | All four modes forward `repeat: ke.repeat` | `git grep -c` | flow, focus, narrate, page each 1, exit 0 | each `:1`, exit 0 on origin/main | Pass | n/a | Pass |
| 4 | Suite, typecheck, build | counts | green | memo: 2,431 passed, typecheck 0, build 0 | Pass | n/a | Pass |
| 5 | Fence | changed files | two files plus memo | `M narrate/FoliateView.tsx`, `M tests/foliate-bridge.test.ts`, memo | Pass | n/a | Pass |
| extra | Mode-isolation census | boundaries, isolation, ownership tests | not flagged | 50 of 50 (memo) | Pass | n/a | Pass |

## Interpretation

No row failed. Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. Run 6 on 14ce3d24 had 3,048 passed, 0 failed, typecheck 0 and 0 crashes. No row of this item depends on those unjudged rows (they are source-text and build checks).

The test reads source text only, as specified; held-key behaviour is not asserted by a live check. The file was edited afterward by `6fd999ca`, `695c658d`, `59cffaa7` (READER-ARROW-GUARD-1) and the BAND-ALIGN integrations; `repeat: ke.repeat` is intact at `:940`. The memo's independent read-only review approved it; its two concerns were procedural.

## Proposed Dispositions

- **Accept:** close the item. Authority: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.

## Mid-Dispatch Decisions

None

## Lessons

The memo has no Lessons section; the list below is the spec's own "Lessons applied" (rule 43 with LL-138, rule 44 with LL-143, rules 36, 41, 46 to 48).

- **New:** No new lesson — a one-line parity fix; LL-138, LL-143 and standing rules 36, 41, 43, 44 and 46 to 48 covered it.
- **Applied:** standing rule 43 / LL-138 — held: red commit `ea149851` alone, failing by assertion, before the fix `2a80b163`.
- **Applied:** standing rule 44 / LL-143 — held: the fix touches one line and one test; the isolation census passed 50 of 50.
- **Applied:** standing rule 36 — held: the memo re-grepped the forwarder at `:934` and the other three modes on `77f1502c`.
- **Applied:** standing rules 41, 46 to 48 — held: the memo records no contrary event (no register writes; the unstaged `tests/perf-baseline-results.json` was left out).

## Files Created

- **Removed (temporary):** none
- **Committed:** memo `Memo.NARRATE-KEY-REPEAT-1.GovernanceStaging.2026-10-23.md` earlier; this report is committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

None needed. The memo has no fold-ins.

## Roadmap & Queue Movement

- **Retired:** NARRATE-KEY-REPEAT-1 — retired from In Flight; no sequence change.

## Next Work

No change from this close-out.

## Gates

- Integrated identity: branch tip `8b5e9789` is an ancestor of origin/main; merged by `c5bb507f` (RC-INTEGRATION-WINDOW; integration commit `34c15980`); tested tree 14ce3d24.
- RC window package record: x64 pair on RodneySr at `70d64237`, Brain1's confirmation, arm64 launch on Rodney from `c5bb507f` (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). Raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- No owner check for this item; the memo adds none.

## Git Hand-Off

- [ ] Committed by Blurby.Roadmap.
