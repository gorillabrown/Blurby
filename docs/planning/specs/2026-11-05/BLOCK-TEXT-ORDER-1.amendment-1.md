# BLOCK-TEXT-ORDER-1 — Amendment 1: the certified stamp yields on a time budget

*Planner: Blurby.Roadmap, 2026-11-05. This amends [the full specification](../2026-11-03/BLOCK-TEXT-ORDER-1.md). It supersedes TQ-B3's "no yield" and the sentences of The change that repeat it; everything else in the specification stands. Ruling: `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.BLOCK-TEXT-ORDER-1.amendment-1.2026-11-05.md` (Blurby.Brain1, CLAUDE.md rule 11). Evidence, on RodneySr: `C:\Projects\Blurby-artifacts\block-text-order-1\` (`D3-boundary`, `J1c`, `J1d`, `J1e`).*

**State: dispatch-ready.** Blurby.Brain1's addendum (2026-11-05) ruled the rerun question the planner raised, and it is folded in below.

## What the evidence proved

- Section 17's certified wrap is one main-thread task of about 258 ms. On `14ce3d24`, the first slice is 73 ms and the rest yields.
- Certify is 11 to 15 ms. Stamp is 177 to 238 ms, of which native `replaceChild` is about 80%. `Intl.Segmenter` does not appear in the profile.
- B5's 44.7 ms timed a detached document. Each `replaceChild` costs 0.33 ms attached against 0.004 ms detached.
- Within a document the cost is linear in stamped nodes. The cost per call rises with document size (0.16 ms at 58 elements, 0.33 ms at 1,024), so a synchronous stamp could block for over a second on a larger chapter (extrapolated, not measured).

## Why (root cause, rule 6c)

TQ-B3 made the certified branch synchronous, so a section that certifies lost the legacy path's yields. Why attached calls cost 80 times more stays unknown. It does not change the remedy: a yield bounds the task whatever the answer, and the cost is Chromium's. No item is opened for it.

## Amended design

In all four `src/reader/modes/<mode>/helpers/foliateWordWrapping.ts` copies, which stay blob-identical:

1. `stampCertifiedPlacements` becomes async, and `wrapWordsInSpans` awaits it. All callers already await or hold the promise.
2. After each node, if more placements remain and the time since this slice began is at least `WRAP_STAMP_SLICE_MS`, it does `await new Promise<void>((resolve) => setTimeout(resolve, 0));` and starts a new slice. The time comes from `performance.now()`.
3. `WRAP_STAMP_SLICE_MS = 8`, defined beside `WRAP_BATCH_SIZE`. The budget is by time, not node count, because the cost per node depends on the document.
4. Certify stays synchronous. `onCertification({ok:true})` still fires once, before the first yield. Contract B.2 is otherwise unchanged.
5. The per-node `isConnected && data === captured` re-check keeps running before every node, so a change during a yield stops stamping and reports `dom-changed` second.
6. The doc comments that say "with no yield" and "synchronously" are updated.
7. **A superseded run stops (addendum).** Only Page waits for a running wrap (`sectionWrapsRef`), and the three other restamp effects unwrap without waiting. Once the certified stamp yields, a stale run can stamp an untouched node with the old numbering between the live run's slices, and the live run then reports `dom-changed`. So each helper copy keeps a private `WeakMap<Document, object>` token, which `wrapWordsInSpans` and `unwrapWordSpans(doc)` each replace.
   - **Certified run:** it checks the token before each node, ahead of the re-check. If the token was replaced, it stops with no report.
   - **Legacy run:** it checks the token after each `await` and stops when replaced, with no report and no other change. The commoner case is a load wrap on the legacy path that the book's words overtake. With no superseding run it behaves exactly as before. The yield statement stays text-identical, because the census anchors it.
   - **Return value:** a superseded run's return value is not used for numbering. The live run's completion is what counts.

**Rejected:** hoisting the Segmenter (not in the profile), and stamping a detached clone or replacing a parent's subtree (it replaces nodes foliate holds, just before release).

## Done when

New rows are red first on `d3184d0b`.

| # | Criterion | Verify |
|---|---|---|
| C1 | **Yields.** With a clock that passes the budget on each node, after the report and a microtask flush some nodes are unstamped; after timers, all are | Test in each helper copy's suite, red on `d3184d0b` |
| C2 | **Mid-yield change.** A text node changes during a real yield: `dom-changed` comes second, stamping stops, and no span sits at a stale offset | Same suite |
| C3 | **Rerun during a yielding wrap, in Page, Flow, Focus and Narrate.** Two cases: (a) a certified run superseded mid-yield, and (b) a legacy load wrap superseded mid-yield by a certified restamp. Both end with spans 1 to 1 with the slice, none duplicated, and the document certified | Each mode's runtime test |
| C4 | **Page turn and word click during a yield.** A turn onto an unstamped page holds and then saves the right word; a click on unstamped text does nothing | Page runtime test |
| C4a | A superseded run makes no report, of either kind | Test in each helper copy's suite |
| C5 | `(rr-c)` is the named rule 50 exception. Only its observations that change because of the yield change | The memo quotes each observation before and after |
| C6 | B5 passes: 18 of 18 in all four copies, under the Electron ICU runtime | B5 exits 0 on the amended tip |
| C7 | **No long task.** With the poller off, at the 16 to 17 crossing and on arrival into section 17, in Narrate and Page: no wrap task over 50 ms, and section 17 stamps 7,171 spans, 1 to 1 with the slice | Trace in the evidence folder |
| C8 | The three D3 1.00x boundary sessions pass again | D3 on the amended tip, read knowing F-036 is open |
| C9 | Package: the rule 53 x64 pair on RodneySr, with `origin/main` at `c630f9a4` or later as its base, and arm64 B8 on Rodney, which Blurby.Brain1 runs | Blurby.Brain1's confirmation |
| C10 | `npm test`, `npm run typecheck` and `npm run build` exit 0 | Gate output in the memo |
| C11 | The four helper copies stay blob-identical | `git rev-parse` of each copy prints one hash |

## Test rules

- Tests that drive the budget stub `performance.now()`, so they do not depend on machine speed.
- Any test that fakes `setTimeout` (`fakeTimeouts`) also pins that clock. Otherwise a slow run passes the budget and parks the wrap on a timer that never fires. This is test setup, not a rule 50 change.

## Fence, host and order

- **Fence:** the specification's fence stands. The constant and the token live in the helper files already in it. No new sibling import and no shared core. If a view needs an edit, STOP to Blurby.Brain1 with the lines.
- **Census:** the policy allows a module singleton in a mode directory only when `allowedModuleSingletons` lists it, and the new `setTimeout` sits in a new function. Expect `tests/readerModeOwnership.test.ts` to fail on the four tokens and the four `setTimeout` sites. That is the fence's conditional `boundary-policy.json` path: record the failure first, then add exactly those entries, and list them in the memo.
- **Review focus:** a superseded run now returns early, so the lines after its `await` run sooner. Check Flow's and Focus's `bookStampedDocsRef.current.add(doc)`, which can mark a document book-stamped while the live run is still stamping. If that changes behaviour, STOP to Blurby.Brain1 with the lines, as for any caller that depends on the run having finished.
- **After this lands:** the planner re-reads FLOW-RESTAMP-CURRENT-1, FOCUS-RESTAMP-CURRENT-1 and NARRATE-RESTAMP-CURRENT-1, because the token closes part of their race. All three stay registered.
- **Host:** RodneySr, in its `.worktrees\block-text-order-1`; arm64 B8 on Rodney (rule 6b). Its disk was freed on the owner's approval, and Blurby.Brain1 confirms the free space before launch.
- **Order:** after Job 2b and ahead of Jobs 3 and 4 (Blurby.Brain1, 2026-11-05).
- **Branch:** `eb/block-text-order-1`. Push with `HEAD:refs/heads/eb/block-text-order-1`.
- **Merge:** on Blurby.Brain1's package confirmation and Blurby.Roadmap's merge go. It stays second in the release merge set, after the ERROR-LOG fix, which merged as `c630f9a4`.

## Failure handling

- **A row needs a view edit:** STOP to Blurby.Brain1 with the lines.
- **C7 finds a wrap task over 50 ms:** STOP. Do not lower the budget without a ruling.
- **Any section reports `ok:false` in B5:** STOP to Blurby.Brain1, as the specification says.
- **Rollback:** nothing is merged until the merge go.

## Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red rows C1 to C4a, committed alone | calculable | positive-control | bounded | medium | 30m | — | C |
| 2 | Yielding stamp and supersede token in the four helper copies; `(rr-c)` and census entries updated | calculable | implementation | cross-cutting | high | 30m | — | C |
| 3 | Suite, typecheck, build, B5 | calculable | verify | bounded | low | 20m | — | C |
| 4 | Trace C7 in Narrate and Page | calculable | live-check | bounded | medium | 30m | — | C |
| 5 | Three D3 sessions | calculable | live-check | bounded | low | 25m | — | C |
| 6 | Rule 53 pair and arm64 B8 | calculable | packaging-verify | bounded | low | 30m | — | C |
| 7 | Memo, time log, push, Blurby.Brain1's confirmation | calculable | docs | bounded | low | 10m | — | C |

**Total:** chain 2h55m · sum 2h55m; 0 of 7 estimated tasks calibrated

## Lessons applied

- **LL-142:** the remedy follows measurement. The 44.7 ms figure was real but measured the wrong document, and C7 measures the live one.
- **LL-152:** one recipe for base and tip.
- **LL-160:** B5 runs under the app's Electron ICU.
- **Standing rule 43:** new rows are committed red first.
- **Standing rule 50:** `(rr-c)` is the only named pinned-test exception.
- **LL-139:** the fence was re-read against the census, which is how the token's singleton entries were found.
- **Standing rule 53:** both architectures, with Blurby.Brain1's confirmation.
