# POSITION-PROMPT-COPY-1 — bounded specification enrichment draft

Date: 2026-11-02. Planning draft only; no source admission, implementation, readiness verdict, integration permission or launch. Root Roadmap reviews and folds this independently. Brain coordinates execution.

## Identity and recommendation

Existing identity is **POSITION-PROMPT-COPY-1**, Seq134, Queued / Full Spec, UX polish; do not create a BACKTRACK-PROMPT-COPY-1 item. Existing card: `ROADMAP.md:1901–1938`. Register URL recorded by approved smoke intake: https://app.notion.com/p/4057c96cc31e81e7b4b6f475807e73cb?pvs=204 . The live provider controls identity/status; this draft makes no provider change.

Recommendation: retain the small copy/order fence, add the concrete controls below, and resolve prerequisite acceptance and execution-base custody before any source entry. The owner already settled labels/order; do not ask again.

Outcome: the save-position dialog shows **Keep Previous Position (pgN)** first and **Move Position (pgN)** second, preserving their existing values, actions, focus and keyboard behavior.

## Evidence and baseline

- Owner input ledger `docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:37` (SMOKE-R3): “First Keep Previous Position (pg#); second Move Position (pg#); preserve anchor meanings.” Its detailed card at line240 repeats the association. This draft uses that narrow input, not a blanket approval inference.
- Source observed in this checkout at `f9cf99b698056a8fe17effadc3e36b51c5e26525`. Existing card pins historical source `d8e44864708d40e2a472f3e6436d936e9ee96bfa`. Observed HEAD is an audit location, not an authorized replacement execution base.
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

## Execution sequence and mechanical success criteria — prospective

1. Brain resolves the exact source base, acceptance wait, source window, execution host and package custody below. No source work before this.
2. Implement tests and obtain actual base-red and prescribed-green receipts using the same committed targeted command, plus a separately identified wrong-order/value/handler variant receipt demonstrating detector sensitivity. Preserve each input hash, stdout/stderr and exact exit code under standing rule44; no planner surrogate counts. Base should fail exact new text/order while retained behavior controls distinguish the change. Wrong variant is a test artifact on an explicitly admitted verification surface, never an unreviewed production baseline.
3. Make only the two-button text/order edit, then run:

   ```text
   npx vitest run tests/backtrackPrompt.test.tsx tests/keepFurthest.test.tsx tests/useProgressTracker.test.ts
   npm test
   npm run typecheck
   npm run build
   ```

   Each exits0; existing tests remain byte-unchanged. Inspect `git diff --stat` for truncation and exact changed paths. Record Node/npm versions and resolved dependency-lock identity.
4. Independent reviews follow shipped Zeus: MarcusAurelius specification compliance, then Plato quality, then MarcusAurelius documentation. Review evidence is not prerequisite/release acceptance.
5. Package the final admitted source under standing rule53 and the applicable written architecture route; changed `dist/**/*` means “package unchanged” does not apply. Record final commit, origin/main input, package/executable hashes, ASAR checks, launch/profile proof and native evidence. Fresh scratch-profile launch and package scenarios must use the assigned host and its required architecture; do not substitute x64 evidence for an ARM64 gate.
6. On owned fixture only, exact-package UI acceptance: read forward/backtrack enough to trigger the dialog; record labels/order and first focus at normal/narrow widths; choose Keep, reopen at its furthest word/CFI; repeat independently with Move and reopen at its current word/CFI. Test Enter/Escape retaining Keep. Persisted-state readback and visible landed word/CFI must agree. A hook pass alone is insufficient.
7. Complete only this item's admitted documentation/closeout; preserve source-freeze, merge and release holds. No terminal register/Seq change from this draft.

## Lane ownership and fences

- Product lane UX polish; execution surface C (display component/test), with E for separately admitted own documentation.
- Production fence: `src/components/BacktrackPrompt.tsx`. New test fence: `tests/backtrackPrompt.test.tsx`.
- Shared-core touches: none. Forbidden: ReaderContainer, progress hook, shared types, mode runtimes, CSS, page constants, backend, user books/profiles and unrelated test expectations.
- No parallel execution is admitted. A later parallel plan must prove disjoint component/test/docs ownership and reserve any package/native resources; otherwise serialize.
- Proposed branch remains `eb/position-prompt-copy-1`, from the exact accepted base Brain names; no implicit rebasing/source exception.
- Existing docs staging candidates remain this item's own BUG_REPORT subcase, `docs/governance/close-outs/Memo.POSITION-PROMPT-COPY-1.GovernanceStaging.2026-10-26.md`, and `Timing.POSITION-PROMPT-COPY-1.jsonl`; exact admission/custody must precede use. Root owns folding this draft into governing specs. No broad staging or cleanup.
- Merge order: KEEP-FURTHEST-FIX acceptance plus the approved integration window first; source merge only after current package confirmation and authorized merge go. FURTHEST-PERSIST-1 is separate future schema work, not an invented prerequisite or an excuse to alter arithmetic here.

## Failure handling

Changed handlers/base/integration conflict: stop and return to Brain/Roadmap. Missing runtime/host/access: hold without local fallback. Two repair passes maximum for failures within this fence; then preserve receipts and obtain disposition. Existing regression failure never authorizes changing its oracle. Package/owner-check failure keeps work held; no release acceptance. Rollback, if authorized after implementation, reverts this item's own commits; never reset/clean or restore user library state. No retry of a native route beyond its separately written ceiling.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Six component controls distinguish prescribed text/order/actions from base and wrong variants | calculable | positive-control | bounded | medium | 4m carried from existing card; calibration source unverified | — | A |
| 2 | The two-button component renders the approved contract within the fence | repeat | ui-fix | bounded | low | 5m carried from existing card; calibration source unverified | — | A |
| 3 | Automated gates, independent reviews, package evidence and own documentation are complete | calculable | packaging-verify | bounded | medium | 12m carried from existing card; host/owner wait excluded; calibration source unverified | — | B |

**Total:** provisional serial chain21m · provisional sum21m from carried card values only; 0 of3 calibration sources independently verified here. Expanded controls/package obligations require repricing before dispatch; these values are not an ETA. No invented duration for unresolved custody, host or owner waits. Target waves remain ≤40 tool calls and ≤60 minutes; actual wave budgets are unresolved. Materially different effort is separated into implementation and verification/review waves.

##### Lessons applied

- LL-073 (`LESSONS_LEARNED.md:2118`): preserve persistent protected anchors; do not reinterpret Keep.
- LL-090 (`:2271`): sites and current handler wiring read before prescribing the copy edit.
- LL-143 current status (`:3149`): literal same-command base/prescribed/wrong-variant receipts, exact identities/exits; no base-only qualification.
- LL-165 (`:3042`) and standing rule53/LL-167 (`:3064`): prove initialized scratch profile and final exact package before native input/acceptance.
- LL-174 (`:3141`): forwarding-chain audit is read-only here; callbacks/props remain unchanged at every hop.
- LL-172 (`:3122`): timing helper is not assumed read-only; this draft invokes no helper or timing write.
- Full live-lesson applicability census is not completed by this narrow audit; do not represent this section as a U9 pass.

## Unresolved inputs and five separate findings

1. **Specification:** draft enrichment only; six controls not implemented/run, exact receipts absent, task pricing needs confirmed calibration/repricing and the full lesson census remains pending. Copy/order design is settled.
2. **Prerequisites:** KEEP-FURTHEST-FIX-1 remains merged/In Flight pending existing acceptance/closeout. Obtain exact current provider acceptance and approved integration window; do not manufacture a held-source exception.
3. **Repository:** Brain must name exact accepted execution tip and branch custody, reconcile historical pin with that tip, and confirm source/test/docs fence. This audit HEAD is not a launch base.
4. **External register:** latest parent-provided SQL census is 2026-11-02T22:39:26Z; this draft neither refreshes nor mutates provider state. Re-read current live prerequisites before source entry using the guard.
5. **Execution environment:** Brain must identify/verify quiet host, repository/artifact transfer, Node24/runtime dependencies, architecture-specific package verifier and required final native/profile evidence. No host access verified here.

Technical question for Brain: **Which exact accepted tip and source window admit Seq134 after KEEP-FURTHEST-FIX acceptance, and which verified quiet-host/package custody route supplies final required architecture evidence?** No design re-ask is needed.

Prepared with read-only source inspection and one authorized new draft file. No code/runtime/test execution, provider/helper writes or executor contact.
