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
5. Independent PP1 reviews follow shipped Zeus: MarcusAurelius specification compliance, then Plato quality, then MarcusAurelius documentation. Review only the admitted source/targeted evidence and explicitly retain unrun full verification. PP1's documentation output is the fenced external receipt below; canonical governance fold-in belongs to Root's separate authority, not an implicit repository-doc write here. Record local held-candidate identity and actual PP1 receipt with 45-minute/40-call budget usage. No full suite, typecheck, build, app/native launch or package work in PP1. No merge, push or terminal/provider change is implied by a local held candidate.

## Later PP2 and package acceptance — separate admissions

PP2 is not launched or authorized by PP1 completion. It later runs `npm test`, `npm run typecheck`, `npm run build` on the accepted integrated source; each must exit0. Reserve one heavy slot, one test worker and a process-local2GiB JavaScript heap as already ruled. Its exact base, host, input consumption, timing and fence need a separate written cut.

Final package acceptance remains later and separately admitted: standing rule53 and the applicable architecture route, final commit/origin-main inputs, executable/package hashes, ASAR checks, scratch-profile proof and required native launch. Changed `dist/**/*` means “package unchanged” does not apply; do not substitute x64 evidence for ARM64 gates. Exact-package UI acceptance on owned fixture reads forward/backtracks, verifies ordered labels/focus at normal/narrow widths, independently exercises Keep and Move, reopens at each corresponding word/CFI and checks Enter/Escape. A hook or PP1 targeted pass is not package proof. KEEP-FURTHEST acceptance, authorized integration window and package/merge confirmations remain required before final closure. No stage/status is promoted here.

## Lane ownership and fences

- Product lane UX polish; execution surface C (display component/test), with E for separately admitted own documentation.
- Production fence: `src/components/BacktrackPrompt.tsx`. New test fence: `tests/backtrackPrompt.test.tsx`.
- Shared-core touches: none. Forbidden: ReaderContainer, progress hook, shared types, mode runtimes, CSS, page constants, backend, user books/profiles and unrelated test expectations.
- PP1 claims only the fenced component/new test in its isolated worktree. Do not assume a parallel launch from this draft; Brain must confirm no other owner of those paths. Package/native resources are unused in PP1; later scheduling is separate.
- Ruled branch/base/worktree are `eb/position-prompt-copy-1`, `ac19ea60b6cd8b4fff3e5413b111925b7ef78485`, `C:\Projects\wt-position-prompt-copy-1`. No rebase or broader source exception.
- PP1's local held-candidate commit contains only the fenced component and new test. No canonical Timing file, staging memo, BUG_REPORT subcase, ROADMAP, lessons, registry, provider or other repository documentation write is part of PP1. Those may be handled only through a separately admitted governance step; their absence is not an entry blocker for this source-only exception. Required execution evidence stays in the exact external paths below. No helper timing call or broad staging/cleanup is implied.
- Merge order: KEEP-FURTHEST-FIX acceptance plus the approved integration window first; source merge only after current package confirmation and authorized merge go. FURTHEST-PERSIST-1 is separate future schema work, not an invented prerequisite or an excuse to alter arithmetic here.

## Exact external PP1 evidence and accounting

Prospective owned root: `C:/Projects/Blurby-artifacts/position-prompt-copy-1-pp1-20261102/`. Its absence, parent ownership and suitability must be recorded before the separately admitted PP1 creates it. Do not overwrite, delete or reuse an unidentified existing root. If it already exists, preserve it and obtain a separately named destination through Brain; do not choose a hidden suffix.

Exact owned outputs under that root:

- `logs/admission-accounting.jsonl` — append-only UTF-8 JSONL, one complete record per admission, command/control outcome, review checkpoint and stop. Record actual UTC start/stop/deadline, aggregate executor/worker calls used and remaining, exact argv/working directory/environment mode, source/test/control input hashes, complete stdout/stderr/exit code, expected causal/opposing assertions and status. No guessed elapsed duration or transport-as-consumption claim. The six run IDs are `base-red`, `candidate-green`, `wrong-order`, `wrong-value`, `wrong-wire`, `final-green`; clean-mode values are explicitly recorded as absent.
- `control-receipt.json` — final UTF-8 receipt for this admission, with item/PP1 identity, immutable input/ruling commit and hashes, actual host/worktree/branch/HEAD/tree, admitted limits and actual usage, the six command records or their exact JSONL event references, ordered review identities/verdicts, excluded later gates, final two-file checkpoint/diff/hashes and status `held-source-candidate`, `partial` or `failed`. Missing/failed controls never become PASS. A PP1 source result is not terminal completion or package acceptance.
- `control-receipt.json.tmp` — explicitly owned completed-file staging name for that final JSON receipt. Publish only after complete serialization, exclusive temporary creation, awaited write/sync/close and byte readback; create the final name exclusively using a same-volume hard link, then verify final bytes. Preserve both names, including partial failure evidence; no rename-overwrite, delete or direct-write fallback. If either already exists, stop rather than overwrite. A later admission needs its own separately named evidence root. This evidence-only publication does not change the production fence or introduce a helper dependency.

Retain incomplete command evidence in the append-only log and publish the final receipt before the admitted stop boundary, reserving receipt time inside PP1. Existing log records are not rewritten during either permitted repair pass. No user-content/native/profile data is read or written here. Root later folds accepted summaries through its own governance authority; PP1 does not author canonical time/memo/bug files merely to satisfy a close-out convention.

## Failure handling

Changed handlers/base/integration conflict: stop and return to Brain/Roadmap. Missing runtime/host/access: hold without local fallback. Two repair passes maximum for failures within this fence; then preserve receipts and obtain disposition. Existing regression failure never authorizes changing its oracle. Package/owner-check failure keeps work held; no release acceptance. Rollback, if authorized after implementation, reverts this item's own commits; never reset/clean or restore user library state. No retry of a native route beyond its separately written ceiling.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Qualified isolated inputs and exact source contracts are read back | calculable | preflight | bounded | medium | 5m | — | — |
| 2 | Six component controls and external wrong-order/value/wire seam produce valid base-red proof | calculable | positive-control | bounded | medium | 12m | — | — |
| 3 | Scoped two-button edit produces green, three negative receipts and final green | calculable | ui-fix | bounded | low | 10m | — | — |
| 4 | Ordered independent reviews and exact local-held receipt preserve every later hold | calculable | source-review-closeout | bounded | medium | 8m | — | — |

**Total:** mechanical chain15m · sum15m; 4 of4 rows priced from recorded history. Separate prospective serial planning chain35m · sum35m; planner estimates uncalibrated as elapsed-time forecasts. Planner estimates only, not measured medians or an ETA. PP1 cap45m/40calls leaves10m reserve; stop before the cap when the remaining required review/receipt cannot fit. Unresolved host/custody/dependency access is an entry gate, not work to absorb silently into the reserve. PP2/package durations are not estimated here; they require separately scoped cuts. No material mixed-effort investigation is included; unexpected diagnosis returns to Brain.

##### Lessons applied

Current applicability census: read the actual registered `docs/governance/LESSONS_LEARNED.md` through LL-175, applying the last append-only status for each identifier. Raw source SHA256 `47460439db0db7613103922f170aefb39eae07cd8dab5db17463cfc58475bde8`:147 identifiers,121 live and26 promoted/retired/superseded excluded from the live set. The inventory partition below accounts for every live identifier exactly once. No older cached live count or original status overrides a later append. If this source changes before the final pointer, refresh the census/U9 check; no live lesson is globally waived.

**Applied to PP1 —22 live lessons:**

- LL-002, LL-063 — one isolated, small two-file local checkpoint; preserve pre-existing work and exact source provenance. The named PP1 local-only exception governs publication; generic historical push advice does not grant a PP1 push or main merge.
- LL-006, LL-097, LL-098, LL-137 — exact deterministic external receipt names, complete-file exclusive publication and explicit UTF-8; preserve failed/partial records before reporting an outcome. Evidence is not exempt from persistence integrity.
- LL-017, LL-025 — bp6 uses fresh callbacks after rerender and proves old spies stay unused; production remains React-owned JSX. Intentional negative DOM/click mutations are test-only, applied after rendering and removed without leaking into later cases.
- LL-030, LL-073 — no new engagement, progress or anchor write. Keep/Move retain the existing actions and CFI/page values; unchanged hook tests guard2673-versus416 semantics. Do not reinterpret the protected anchor to match the new words.
- LL-066 — no swallowed assertion, runner, evidence-publication or cleanup error; record failure and stop within the admitted fence.
- LL-068 — narrow component patch, raw before/after hashes and diff/stat/truncation check; do not reconstruct the component. Brain's explicit PP1 exception defers full build to PP2, so a targeted PP1 pass is never reported as full verification.
- LL-090, LL-128 — read the actual component/router/hook contract at the fixed cut and check whether `tests/backtrackPrompt.test.tsx` already exists before authoring it. Unexpected retained work is preserved and reconciled, never overwritten as a supposedly new file.
- LL-096 — wrong-order/value/wire injection is explicitly opt-in in the test harness only. Clean base/green/final-green runs remove the environment variable; no instrumentation reaches production props or runtime behavior.
- LL-113 — only the one admitted new test is collected; external logs/receipts remain outside repository discovery. Do not introduce a second scratch test or copied source tree.
- LL-116, LL-144 — final immutable input includes the complete card, source-separation ruling and this enrichment; retain original source/base identities and checkpoint parents rather than recomputing a resume base against a moved publication target.
- LL-142, LL-143 — exact command/shell/input identities, causal assertion failures on base and the three wrong variants, clean candidate/final greens and exact exits. A label, nonzero crash or unexecuted command is not detector proof; targeted source checks are not package/native acceptance.
- LL-172 — no timing-helper backfills or canonical time/ledger writes; external admission accounting is explicitly fenced above. Stage only component/new test.
- LL-174 — preserve callback signatures and wiring at every existing hop; bp2/bp6 test actual production-component callback association. No helper/adapter widening is admitted.

**Applied only to later acceptance; not exercised by PP1 —5 live lessons:**

- LL-140 — use the already-observed owner smoke and settled copy/order decision; do not reopen design or replace the later exact-package owner route with a source-only check.
- LL-152 — any later unexpected package/owner discrepancy needs a like-for-like base route before cause attribution. PP1 grants no native A/B run.
- LL-160, LL-161 — future word/CFI reopening checks use the app's numbering and the actual word text/occurrence, not only a numerical position. PP1 uses literal page props and does not tokenize a book or qualify a runtime.
- LL-165 — later native input first proves the initialized scratch profile and preserved live files. No PP1 launch/profile permission is implied.

**Considered, not applicable to PP1's component-copy/evidence scope —94 live lessons:**

| Untouched domain / reason | Complete live identifiers considered |
|---|---|
| No main-process/security/storage/model/dependency architecture, CSS/window-drag, EPUB conversion or performance change. Existing boundaries remain intact; no new policy is inferred from these domain lessons. | LL-003, LL-004, LL-007, LL-008, LL-018, LL-024, LL-026, LL-027, LL-032, LL-065, LL-067, LL-069, LL-084, LL-089, LL-092, LL-095, LL-106, LL-107, LL-115, LL-119 |
| No animation/layout/pagination, canonical selection or wrapping, audio generation/playback/streaming, mode hook/alias/state ownership, global shortcut policy, async reader lifecycle or shutdown change. The dialog's existing capture listener is tested unchanged; no new global target guard, engine generation guard, heard-clock fake or mode behavior is added. | LL-014, LL-015, LL-016, LL-019, LL-020, LL-021, LL-022, LL-023, LL-028, LL-029, LL-031, LL-033, LL-034, LL-070, LL-071, LL-072, LL-074, LL-075, LL-076, LL-077, LL-078, LL-079, LL-080, LL-081, LL-082, LL-083, LL-085, LL-086, LL-087, LL-099, LL-100, LL-101, LL-102, LL-103, LL-104, LL-105, LL-108, LL-109, LL-110, LL-111, LL-114, LL-120, LL-121, LL-122, LL-123, LL-124, LL-125, LL-126, LL-127, LL-132, LL-139, LL-157, LL-159, LL-162, LL-169, LL-170, LL-173 |
| No parallel source writers, extraction/line-reduction refactor, directory reorganization/reference rewrite, epic/audit cycle, deletion, connector formula/text/mapping/sequence mutation, installer operation or generated PDF fixture. LL-175's PDF whitespace exception does not apply to TSX or JSON; ordinary text integrity checks remain strict. | LL-088, LL-093, LL-094, LL-117, LL-118, LL-129, LL-131, LL-133, LL-134, LL-145, LL-150, LL-154, LL-155, LL-163, LL-168, LL-171, LL-175 |

Promoted guards are inherited through their current standing rules, not counted/cited as live lessons: exact-path fence41; dispatch pointer42; causal red43 and dry-run44; owner observation45; permissions46; host placement47; later type/build48; source/status verification49; unchanged-oracle protection50; no lesson-status downgrade51; discovery52; later package53; actual committing trigger54; state-reading detector55. Retired sizing does not replace the currently ruled PP1 cap or plugin sizing. This document records semantic consideration of all121 live lessons; it does not claim the qualified mechanical U9 check or implementation controls have run.

## Unresolved inputs and five separate findings

1. **Specification:** draft enrichment only; six controls/seam unimplemented, actual execution receipts absent. Current121-live lesson applicability census is complete above; qualified protected mechanical U9/U10 and ordered independent planning reviews have passed; final byte-bound receipts are external planning evidence, not executed component controls. Numeric task rows are uncalibrated planning estimates. Copy/order settled; no Ready verdict.
2. **Prerequisites:** KEEP-FURTHEST-FIX-1 stays merged/In Flight pending its existing acceptance/closeout. The named Brain exception separates PP1 source entry only; it clears no later integration/package/final-acceptance wait.
3. **Repository:** ruled base/branch/worktree and exact external receipt paths are explicit above; actual quiet-host custody, source identity readback and fresh external-root absence/ownership remain unverified. Canonical time/memo/bug writes are excluded, not an entry dependency. This audit HEAD is not a launch base.
4. **External register:** latest complete parent SQL census is 2026-11-02T23:54:55Z,202 unique rows with affected status/Seq unchanged; this draft neither refreshes nor mutates provider state. Re-read current live prerequisites before source entry using the guard.
5. **Execution environment:** actual host/transfer/access, qualified dependency reuse and consumed PP1 input receipt need proof. PP1 excludes suite/typecheck/build/native/package; PP2 and final architecture-specific package custody/receipts remain separately unresolved. No host access verified here.

Remaining entry facts: **fresh quiet-host/worktree ownership and source/dependency readback, accepted absence/ownership of the exact external root, current live-provider read and actual consumption of the final published PP1 inputs.** Base/branch/source exception, copy/order and evidence-path recipe are settled; do not reopen them as owner design questions. Later PP2/integration/package custody receives its own admission and does not require canonical PP1 time/memo/bug writes.

Updated only this authorized planning draft using read-only source/lesson inspection. No code/runtime/test execution, provider/helper writes or executor contact; no prospective external evidence path was created.
