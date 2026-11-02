# POSITION-PROMPT-COPY-1 — bounded specification enrichment draft

Date: 2026-11-02. Planning draft only; no implementation, readiness verdict, integration permission or launch. Root Roadmap reviews and folds this independently. Brain coordinates execution. The parent relayed actual Brain ruling `POSITION-PROMPT-COPY-1-SOURCE-SEPARATION-20261102`; root persists that ruling independently. Its bounded source exception below is distinct from consuming a dispatch/input receipt.

## Identity and recommendation

Existing identity is **POSITION-PROMPT-COPY-1**, Seq134, Queued / Full Spec, UX polish; do not create a BACKTRACK-PROMPT-COPY-1 item. Existing card: `ROADMAP.md:1901–1938`. Register URL recorded by approved smoke intake: https://app.notion.com/p/4057c96cc31e81e7b4b6f475807e73cb?pvs=204 . The live provider controls identity/status; this draft makes no provider change.

Recommendation: use the ruled PP1 isolated source-only exception once its host/dependency/input custody is verified; retain all later prerequisite acceptance and merge/package waits. The owner already settled labels/order; do not ask again.

Outcome: the save-position dialog shows **Keep Previous Position (pgN)** first and **Move Position (pgN)** second, preserving their existing values, actions, focus and keyboard behavior.

## Evidence and baseline

- Owner input ledger `docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:37` (SMOKE-R3): “First Keep Previous Position (pg#); second Move Position (pg#); preserve anchor meanings.” Its detailed card at line240 repeats the association. This draft uses that narrow input, not a blanket approval inference.
- Source observed in this checkout at `f9cf99b698056a8fe17effadc3e36b51c5e26525`. Existing card pins historical source `d8e44864708d40e2a472f3e6436d936e9ee96bfa`. Observed HEAD is an audit location, not an authorized replacement execution base.
- Brain's relayed source-separation ruling names **`ac19ea60b6cd8b4fff3e5413b111925b7ef78485`**, branch **`eb/position-prompt-copy-1`**, prospective isolated worktree **`C:\Projects\wt-position-prompt-copy-1`**. Prior source contracts are stated unchanged from d8. Independently verify that exact base, source identities and isolated custody on the named host before entry; this planning agent has not done so.
- `ROADMAP.md:616–618`: KEEP-FURTHEST-FIX-1 merged, In Flight, closeout held for owner smoke. Its archived specification remains the acceptance source. `ROADMAP.md:313` records Keep reopening on the furthest page and the required backtrack/reopen smoke.
- Node24 is the current CI major (`.github/workflows/ci.yml:19`); package scripts are `package.json:7–17`; `dist/**/*` is shipped under `build.files` (`package.json:40`). No current host/runtime/package was tested here.

## WHERE — read in order at the eventual admitted source cut

1. AGENTS.md, plugin Virtuoso/Zeus protocol plus registered overlays, relevant live lessons and existing ROADMAP card; preserve the guarded registry policy.
2. `src/components/BacktrackPrompt.tsx:3–15` props; `:16–29` capture key listener/cleanup; `:32–48` dialog/buttons (only production edit site).
3. `src/components/ReaderContainer.tsx:632` callback destructuring and `:827–832` prompt wiring, read only.
4. `src/hooks/useProgressTracker.ts:308–337` backtrack/page/action contract, read only. The Keep-reopen selection constant is at `:13`, read only.
5. `tests/keepFurthest.test.tsx:27–81` and `tests/useProgressTracker.test.ts`, read only; then new `tests/backtrackPrompt.test.tsx`.

Line numbers above were read on this audit baseline. Re-grep at the admitted cut; if behavior differs, return to Roadmap/Brain rather than silently widening the fence.

## Exact change and invariant mapping

| Current button | Prescribed button | Invariant |
|---|---|---|
| First: `Save at page {currentPage}` | Second: `Move Position (pg{currentPage})` | `onClick={onSaveAtCurrent}`, secondary class, type button |
| Second: `Keep at page {furthestPage}` | First: `Keep Previous Position (pg{furthestPage})` | `onClick={onKeepFurthest}`, primary class, `autoFocus`, type button |

Leave interface, dialog role/aria-label and key listener unchanged. Keep `currentPage={backtrackPages.current}`, `furthestPage={backtrackPages.furthest}`, `onSaveAtCurrent={handleSaveAtCurrent}`, `onKeepFurthest={handleKeepFurthest}` at the router unchanged. No new constants or page arithmetic. Enter/Escape still call Keep, prevent default and stop propagation. Move retains its existing current-position/high-water behavior; Keep retains existing furthest-position/CFI behavior.

## Six production-component controls

New `tests/backtrackPrompt.test.tsx`: jsdom, real React component/createRoot/act, attached DOM container, per-test cleanup. These are proposed exact test names/assertions; not executed evidence.

1. `(bp1) renders Keep Previous Position before Move Position with their own page values`: currentPage40/furthestPage53 produces exactly two buttons, ordered exact text `Keep Previous Position (pg53)`, `Move Position (pg40)`.
2. `(bp2) first button calls only Keep once and second button calls only Move once`: use fresh mounts for the two clicks; correct callback count1, opposite count0; primary/secondary classes stay associated with Keep/Move.
3. `(bp3) focuses the first Keep button on mount`: attached DOM `document.activeElement` equals the first button; Move has no autofocus.
4. `(bp4) Enter and Escape each invoke Keep once and suppress propagation`: parameterize fresh mounts over both keys; dispatch cancelable/bubbling KeyboardEvent from the dialog; Keep1/Move0, defaultPrevented true, downstream bubbling observer0.
5. `(bp5) unmount removes the capture key listener`: unmount, dispatch Enter/Escape, and assert neither callback count changes.
6. `(bp6) rerender updates both page labels without swapping actions`: rerender currentPage7/furthestPage19 with fresh spies, assert exact ordered labels pg19/pg7 and independently prove each button calls only its matching current callback once. Old spies remain0.

Preserve unchanged existing `tests/keepFurthest.test.tsx` tests: line54 “Keep saves the furthest page reached (2673) with that page's cfi, not the open position”; line61 “the prompt offers the furthest page: the mark has risen to 2673”; line67 “with no turn past the open position, Keep saves the open position with the cfi the book opened with”; line77 “control: Save at page saves the on-screen page and its cfi”. Fixture opens at1290, advances to2673, backs to416: Keep persists2673/cfiAt2673, Move persists416/cfiAt416. These hook tests protect semantics but do not by themselves prove packaged button wiring.

## PP1 — isolated source and targeted proof, prospective

Brain's source-only exception does not require KEEP-FURTHEST-FIX's terminal acceptance before PP1 source work. That prerequisite/status and final acceptance wait remain intact for later integration/closeout. PP1 is capped at **45 minutes /40 calls**, with no automatic successor. Its outcome is a local held candidate plus a bounded receipt, not sprint completion.

1. Before entry, verify consumed input/ruling receipt, quiet execution host, exact base/branch/worktree custody and qualified dependencies. Do not infer consumption from a queued message. Record Node/npm versions, lockfile/dependency identity and old source contracts; stop on divergence. Use existing qualified dependencies only; installation/repair/transfer needs its separately admitted exact paths and capability. No fallback to the everyday computer.
2. Write the six component controls and external negative-control seam inside the one new test file. Keep the same committed target command for base-red and candidate-green:

   ```text
   npx vitest run tests/backtrackPrompt.test.tsx tests/keepFurthest.test.tsx tests/useProgressTracker.test.ts
   ```

   Baseline receives only the admitted new test file, not a changed production component. Base-red must fail bp1 on exact new labels/order; classify each failure and preserve old hook-test results. An import/dependency failure is not the required red. Preserve input hashes, stdout/stderr and exact exit codes. Candidate-green exits0 after only the prescribed two-button edit; retained hook tests stay byte-unchanged. Save exact before/after component and test hashes and inspect diff/stat/fence.
3. Negative-control mechanism: the new test file reads test-only environment variable `PP1_NEGATIVE_CONTROL`; unset means the actual production component with no injection. Valid variants are `wrong-order`, `wrong-value`, `wrong-wire`; unknown nonempty input throws. After each real component mount/rerender and before assertions, the selected test-harness variant must (a) swap the two rendered DOM buttons, (b) replace Keep's displayed page with the supplied currentPage, or (c) attach capturing click interceptors on both buttons that prevent the normal click, call `stopImmediatePropagation`, and invoke the opposite current spy. The wrong-wire injector changes neither label nor DOM order. Clean up all injected listeners after each test and avoid cross-test/global leakage. No production prop, source branch edit, baseline mutation, preload, runtime or shared-core alteration implements this seam.
4. Run the same committed target command three additional times on the exact green candidate with one variant selected per process; in PowerShell set `$env:PP1_NEGATIVE_CONTROL = 'wrong-order'` (then separately `wrong-value`, `wrong-wire`) before the command and restore the variable's original state in `finally`. Use one outer try/finally around all six invocations: capture the original variable, remove it before base-red and candidate-green, set exactly one variant per negative process, remove it before final-green, and restore the original state only after the entire sequence. Record the exact mode for every invocation; a clean run must never inherit a variant. Expect assertion exit1 for each variant: wrong-order must fail bp1 order; wrong-value must fail bp1 value; wrong-wire must fail bp2 callback association. Record the specific expected assertion and opposing clean assertions, and source/test hashes proving no file mutation. A crash, missing module, timeout or unrelated assertion alone does not qualify. Then unset injection and rerun the target command, exit0. Six target invocations total: base, green, three negatives, final green. If real runner uses a distinct documented assertion exit code, resolve that contract before claiming receipt qualification; never accept an arbitrary nonzero.
5. Independent PP1 reviews follow shipped Zeus: MarcusAurelius specification compliance, then Plato quality, then MarcusAurelius documentation. Review only the admitted source/targeted evidence and explicitly retain unrun full verification. Record local held-candidate identity and actual PP1 receipt with 45-minute/40-call budget usage. No full suite, typecheck, build, app/native launch or package work in PP1. No merge, push or terminal/provider change is implied by a local held candidate.

## Later PP2 and package acceptance — separate admissions

PP2 is not launched or authorized by PP1 completion. It later runs `npm test`, `npm run typecheck`, `npm run build` on the accepted integrated source; each must exit0. Reserve one heavy slot, one test worker and a process-local2GiB JavaScript heap as already ruled. Its exact base, host, input consumption, timing and fence need a separate written cut.

Final package acceptance remains later and separately admitted: standing rule53 and the applicable architecture route, final commit/origin-main inputs, executable/package hashes, ASAR checks, scratch-profile proof and required native launch. Changed `dist/**/*` means “package unchanged” does not apply; do not substitute x64 evidence for ARM64 gates. Exact-package UI acceptance on owned fixture reads forward/backtracks, verifies ordered labels/focus at normal/narrow widths, independently exercises Keep and Move, reopens at each corresponding word/CFI and checks Enter/Escape. A hook or PP1 targeted pass is not package proof. KEEP-FURTHEST acceptance, authorized integration window and package/merge confirmations remain required before final closure. No stage/status is promoted here.

## Lane ownership and fences

- Product lane UX polish; execution surface C (display component/test), with E for separately admitted own documentation.
- Production fence: `src/components/BacktrackPrompt.tsx`. New test fence: `tests/backtrackPrompt.test.tsx`.
- Shared-core touches: none. Forbidden: ReaderContainer, progress hook, shared types, mode runtimes, CSS, page constants, backend, user books/profiles and unrelated test expectations.
- PP1 claims only the fenced component/new test in its isolated worktree. Do not assume a parallel launch from this draft; Brain must confirm no other owner of those paths. Package/native resources are unused in PP1; later scheduling is separate.
- Ruled branch/base/worktree are `eb/position-prompt-copy-1`, `ac19ea60b6cd8b4fff3e5413b111925b7ef78485`, `C:\Projects\wt-position-prompt-copy-1`. No rebase or broader source exception.
- Only exact item docs may accompany PP1. Existing candidate paths are this item's own BUG_REPORT subcase, `docs/governance/close-outs/Memo.POSITION-PROMPT-COPY-1.GovernanceStaging.2026-10-26.md`, and `Timing.POSITION-PROMPT-COPY-1.jsonl`; exact receipt path, any bug-subcase write and timing/log permission still need enumerating before their first write. No helper timing call is implied. Root owns folding this draft; no broad staging/cleanup.
- Merge order: KEEP-FURTHEST-FIX acceptance plus the approved integration window first; source merge only after current package confirmation and authorized merge go. FURTHEST-PERSIST-1 is separate future schema work, not an invented prerequisite or an excuse to alter arithmetic here.

## Failure handling

Changed handlers/base/integration conflict: stop and return to Brain/Roadmap. Missing runtime/host/access: hold without local fallback. Two repair passes maximum for failures within this fence; then preserve receipts and obtain disposition. Existing regression failure never authorizes changing its oracle. Package/owner-check failure keeps work held; no release acceptance. Rollback, if authorized after implementation, reverts this item's own commits; never reset/clean or restore user library state. No retry of a native route beyond its separately written ceiling.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Qualified isolated inputs and exact source contracts are read back | calculable | preflight | bounded | medium | 5m | — | PP1 |
| 2 | Six component controls and external wrong-order/value/wire seam produce valid base-red proof | calculable | positive-control | bounded | medium | 12m | — | PP1 |
| 3 | Scoped two-button edit produces green, three negative receipts and final green | calculable | ui-fix | bounded | low | 10m | — | PP1 |
| 4 | Ordered independent reviews and exact local-held receipt preserve every later hold | calculable | source-review-closeout | bounded | medium | 8m | — | PP1 |

**Total:** prospective serial chain35m · sum35m; 0 of4 estimates calibrated. Planner estimates only, not measured medians or an ETA. PP1 cap45m/40calls leaves10m reserve; stop before the cap when the remaining required review/receipt cannot fit. Unresolved host/custody/dependency access is an entry gate, not work to absorb silently into the reserve. PP2/package durations are not estimated here; they require separately scoped cuts. No material mixed-effort investigation is included; unexpected diagnosis returns to Brain.

##### Lessons applied

- LL-073 (`LESSONS_LEARNED.md:2118`): preserve persistent protected anchors; do not reinterpret Keep.
- LL-090 (`:2271`): sites and current handler wiring read before prescribing the copy edit.
- LL-143 current status (`:3149`): literal same-command base/prescribed/wrong-variant receipts, exact identities/exits; no base-only qualification.
- LL-165 (`:3042`) and standing rule53/LL-167 (`:3064`): prove initialized scratch profile and final exact package before native input/acceptance.
- LL-174 (`:3141`): forwarding-chain audit is read-only here; callbacks/props remain unchanged at every hop.
- LL-172 (`:3122`): timing helper is not assumed read-only; this draft invokes no helper or timing write.
- Full live-lesson applicability census is not completed by this narrow audit; do not represent this section as a U9 pass.

## Unresolved inputs and five separate findings

1. **Specification:** draft enrichment only; six controls/seam unimplemented, actual receipts and full live-lesson census absent. Numeric task rows are uncalibrated planning estimates. Copy/order settled; no Ready verdict.
2. **Prerequisites:** KEEP-FURTHEST-FIX-1 stays merged/In Flight pending its existing acceptance/closeout. The named Brain exception separates PP1 source entry only; it clears no later integration/package/final-acceptance wait.
3. **Repository:** ruled base/branch/worktree are explicit above; actual quiet-host custody, source identity readback and exact item-doc/receipt path enumeration remain unverified. This audit HEAD is not a launch base.
4. **External register:** latest parent-provided SQL census is 2026-11-02T22:39:26Z; this draft neither refreshes nor mutates provider state. Re-read current live prerequisites before source entry using the guard.
5. **Execution environment:** actual host/transfer/access, qualified dependency reuse and consumed PP1 input receipt need proof. PP1 excludes suite/typecheck/build/native/package; PP2 and final architecture-specific package custody/receipts remain separately unresolved. No host access verified here.

Remaining technical inputs: **Who owns the named isolated worktree on which verified quiet host; which qualified dependency tree may it reuse; what exact PP1 input-consumption and item-doc receipt paths are admitted; and what later PP2/integration/package custody cuts preserve KEEP-FURTHEST acceptance?** Base/branch/source exception are settled by the named ruling; do not re-ask them or the copy/order design.

Prepared with read-only source inspection and one authorized new draft file. No code/runtime/test execution, provider/helper writes or executor contact.
