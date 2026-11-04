---
dispatch: WS-TOKEN-REGEN-1
date: 2026-11-04
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: WS-TOKEN-REGEN-1

## Dispatch Brief

**Goal:** Stop "regenerate pairing token" from saving the extension pairing token in plaintext, and keep the token out of the settings file whenever OS encryption (safeStorage) is missing.
**Result:** `encodePairingToken` and `decodePairingToken` now live in `main/ws-server.js`, and the regenerate handler in `main/ipc/misc.js` uses the encoder. By Blurby.Brain's 2026-10-22 amendment, without safeStorage the token is session-only and any stored plaintext is deleted (`loadPairingToken`); a legacy plaintext token is re-encrypted in place when safeStorage exists. `schemaVersion` became optional in `src/types.ts`.
**Learned:** No new lesson — standing rules 36, 41, 43, 44, 46, 47, 48 and 50 covered it.
**Recommend:** Nothing further is owed by this item. Without safeStorage the extension must pair again after every restart, which is the ruled behavior. The memo's low note, no end-to-end regenerate test through the real server, stays logged.
**Bottom line:** No plaintext pairing token is written anywhere, and this is on `main`.

## Findings

Rows are the item's Done-when list plus the amendment rows r1 to r4, checked read-only against origin/main 14ce3d24.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Positive control | vitest on commit 0cb517a7 | red by assertion | 4 failed (memo); amendment reds in cc028528 | Pass | — | Pass |
| 2 | Tests (o), (a), (b), (c) and the parity test | test files | present and passing | `settingsKeyTrust.test.js:344/346` expects `enc:new-token`; `wsTokenRegen.test.js` lines 46, 53, 62; parity describe at 135 | Pass | — | Pass |
| 2r | Amendment rows r1 to r4 | test files | present | r1, r2, r3 at `wsTokenRegen.test.js:77,87,100`; r4 at `settingsKeyTrust.test.js:350` | Pass | — | Pass |
| 3 | No plaintext write in misc.js; one encoder call | `git grep` | exit 1; count 1 | exit 1; `main/ipc/misc.js:1` | Pass | — | Pass |
| 4 | `encryptString(_pairingToken)` only at the pair-flow line | `git grep -n -F` | two lines (pair flow and helper) | one line, `main/ws-server.js:241` | Pass | — | Pass |
| 5 | `schemaVersion?: number;` | `git grep` | one line | `src/types.ts:141` | Pass | — | Pass |
| 6 | npm test, typecheck, build | gate | all exit 0 | run 6 3,048 passed, typecheck 0; memo: 2,439 passed on 274a2270 | Pass | — | Pass |
| 7 | Fence | `git diff --name-status 47ae6e1f 48c311f6` | M ws-server.js, M misc.js, M types.ts, M settingsKeyTrust test, A wsTokenRegen test | exactly those five product paths plus the memo | Pass | — | Pass |

Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun (tree 14ce3d24: 3,048 passed, 0 failed, typecheck 0, 0 crashes). No row of this item depends on those unjudged rows.

## Interpretation

No non-pass row. Row 4's count differs from the spec's line count: the spec expected a second match inside the helper, but its own implementation detail gives the helper a `token` parameter, so the helper line reads `encryptString(token)`. This is a spec miscount that the memo already recorded, not an amendment to the criterion; the intent holds, since `startServer` has no direct encrypt call left. Memo evidence, not re-run here: the red-first results, the owner-machine counts on 274a2270 and the independent review.

## Proposed Dispositions

- **Log:** the memo's low note, no end-to-end regenerate test through the real server.

## Mid-Dispatch Decisions

- **2026-10-22, no plaintext token anywhere (Blurby.Brain, tier 1).** Recorded in the memo and ROADMAP.md: without safeStorage the token is session-only and any stored value is deleted. Applied on the existing branch in three commits (ea9c0032, cc028528, a38cc994, with 274a2270 correcting r4).

## Lessons

- **New:** No new lesson — LL-164 and standing rules 36, 41, 43, 44, 46, 47, 48 and 50 already cover what this dispatch met.
- **Applied:** Standing rule 36 — held: every site re-grepped on 47ae6e1f and matched.
- **Applied:** Standing rule 43 — held: tests committed alone in 0cb517a7 (4 failed); the amendment tests alone in cc028528.
- **Applied:** Standing rule 44 — held: Done-when 3 to 5 were run and recorded, and the row 4 miscount was found by running it.
- **Applied:** Standing rule 50 — held: test (o) in `settingsKeyTrust.test.js` was updated inside the fence.
- **Applied:** Standing rule 41 — held: the memo records no departure; the fence matched exactly.
- **Applied:** Standing rule 46 — held: the memo records no register write.
- **Applied:** Standing rule 47 — held: full suite on the owner's machine, 2,439 passed on 274a2270.
- **Applied:** Standing rule 48 — held: typecheck and build exited 0.

## Files Created

- **Removed (temporary):** none
- **Committed:** the memo `docs/governance/close-outs/Memo.WS-TOKEN-REGEN-1.GovernanceStaging.2026-10-23.md` (committed earlier); no time log was kept; this report is committed with the close-out.
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

None. The memo proposes no fold-in.

## Roadmap & Queue Movement

- **Retired:** WS-TOKEN-REGEN-1 — retired from In Flight. No sequence change: it held no Seq slot at the head.

## Next Work

Unchanged. The next dispatch comes from the queue through `/next-dispatch`.

## Gates

- **Integrated identity:** branch tip 48c311f6 is an ancestor of origin/main; merged by c5bb507f (RC-INTEGRATION-WINDOW); tested tree 14ce3d24. The one shared-core line (`src/types.ts`) landed inside that declared window.
- **Package:** the RC window's package record covers this item: x64 pair on RodneySr at 70d64237, Brain1's confirmation, and an arm64 launch on Rodney from c5bb507f (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). The raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- **Authority to close:** Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus this item's own evidence; owner approval of the close-out plan on 2026-11-04.

## Git Hand-Off

Committed by Blurby.Roadmap.
