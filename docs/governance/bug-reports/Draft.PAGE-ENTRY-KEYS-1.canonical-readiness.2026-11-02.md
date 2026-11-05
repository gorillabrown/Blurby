# PAGE-ENTRY-KEYS-1 — canonical readiness enrichment draft

Date2026-11-02. Existing Seq119, Queued / Full Spec, Reader Engine. PLANNING ONLY / NOT READY / NO EXECUTION ADMISSION. Preserve prepared serial order **117 →123 →119**, each in its own actual isolated worktree. The2026-10-31 stop is historical; the owner subsequently resumed work and directed Brain to coordinate. Fresh item-specific source admission, custody and qualified inputs remain necessary, with no renewed owner design approval implied. Brain alone coordinates execution/technical custody. This supplements the existing ROADMAP card and historical2026-10-30 amendment, not a new registered item or replacement specification.

## Authority, closed P-Q1 and outcome

Read `ROADMAP.md:1785–1826` with `docs/planning/specs/2026-10-30/PAGE-ENTRY-KEYS-1.amendment.md`. The amendment supersedes the named stale rows. Current `ROADMAP.md:1787` closes its final Brain question: **P-Q1 — ek6 runs only in the scratch arrow-guard run until READER-ARROW-GUARD-1 lands.** Do not re-ask, silently commit guard-policy tests into an incompatible primary branch, or invent a requirement that the guard first land on main before this source work can qualify.

Outcome: Page's own section-document key event reaches its existing window paginator handler before asynchronous first wrapping yields, exactly once per physical key and without surviving effect teardown. Keep Page's existing renderer-existence gate, modifier policy, held-turn persistence and all sibling runtimes unchanged. Pre-renderer input remains a no-op; no key replay queue is added. CHAPTER-STEP-CFI-1 is stopped and neither a prerequisite nor a base input.

## Source recipe and fresh custody gap

Historical primary input: held Page-stack tip **79e1d9d0f738d7db47a18a67a056161f47287303**, integrating approved main. Stack order beneath it: TOC-JUMP-SAVE-1 →PAGE-HELD-TURN-FAIL-1 →PAGE-SAVE-RESTAMP-3 →JUMP-LANDING-SAVE-1 →RESTAMP-RERUN-RACE-1. The historical amendment's clean merged tree **aa049ff2** applied to main88e82ba5 only. Do not reuse that whole-tree result against newer main or claim fresh source conflict qualification from it.

Arrow-guard compatibility input is **51202c1cf81bc6b7349222193e2b5f8e3aebfa52**. It was not in the historical primary base/main; its historically clean source merge/docs-status-only conflict is context, not current acceptance. Brain must identify current primary tree and separate guard scratch tree, record actual conflict inventory and only ruled resolutions. New source/test conflicts stop to Brain. If the guard has actually landed by the cut, refresh primary integration and rerun Done-when1–4 before merge go; do not silently treat prior scratch evidence as the moved primary's final pass.

This audit read actual Git objects at79e1d9d0 for Page FoliateView, pagePositionSave.test.tsx and boundary-policy.json, and at51202c1c for pageTurnKey.ts. No source was checked out, changed, merged or executed. Prospective branch remains `eb/page-entry-keys-1` with explicit eventual refspec `HEAD:refs/heads/eb/page-entry-keys-1`; exact final integration commit/tree and its ancestry require fresh custody/readback.

Quiet host coordination uses actual common repository **C:/Users/estra/Projects/Blurby/.git**, not assumed mutation of old detached bq-main/stashes/RUN4. Brain must read actual branch/worktree path/local dirt/checkpoint owner, qualified dependency inputs, current Windows/runtime/resource capacity, fetch/push and artifact-transfer facts before a separately admitted launch. No current host receipt or consumption is asserted here.

## WHERE and exact source/census contract

Read actual AGENTS, shipped Virtuoso/Zeus/overlays, relevant live lessons, governing card/amendment/P-Q1, then actual admitted Page-stack files below. Re-grep all symbols and line numbers at the final immutable cut. Held-object locations agree with the historical amendment; they are not asserted current-main locations.

1. `src/reader/modes/page/FoliateView.tsx` at79e1d9d0:
   - Effect-local `cancelled`529; `onSectionLoad`645; wrap creation671, await673. There is no earlier await inside this handler in the inspected object.
   - Anonymous section key registration797–803; load registration806.
   - Strict Mode early-return cleanup1071 and full cleanup1076–1092.
   - Window `handleKey`1202–1214 retains its early return before renderer existence; do not alter that policy.
2. Existing `tests/readerModes/pagePositionSave.test.tsx`, especially **u at452–472**:60 block groups, section3/global offset20, held first wrap at batch50, provisional word1 eventually saved as `["doc-1",21,"cfi:3:Word1"]`. This is held-turn persistence, **not the new mouse-next control**.
3. `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json` privateCopyMap's Page doc:keydown row581 in historical base (583 in guard variant). Match resourceId+mode+copy.file, not a broad global string replacement.
4. Read-only `page/helpers/pageTurnKey.ts` from51202c1c: any modifier makes ArrowLeft/Right ignored; PageUp/PageDown still turn. No direct helper call substitutes for the outer document-event ek6 control.

Prescribed repair:

- Declare ONE effect-scoped `forwardSectionKeyDown(ke:KeyboardEvent)` and ONE `Set<Document>` of documents registered by that effect. The handler returns immediately if cancelled, otherwise dispatches a new window KeyboardEvent with **key, code, keyCode, ctrlKey, shiftKey, altKey, metaKey, repeat, bubbles:true, cancelable:true**. Copy current fields, do not add synthetic replay/alternate shortcut policy.
- In onSectionLoad, register that same function and add doc to the set synchronously before wrap construction/await on every path, including sectionStart<0/no-wrap. Guard cancelled loads rather than admitting a new stale effect's listener. DOM same-function/same-document registration is idempotent; no per-event function allocation or cross-runtime handler store.
- Delete only the late anonymous registration797–803. Keep wrapping/stamping, canonical offsets, Page save/held-turn and other document listeners intact.
- Both cleanup exits set cancelled and remove that exact function from each document in this effect's set, then clear the set. Do not remove another effect's or sibling runtime's handlers, close other resources, or assume the retained document disappears at unmount.
- Change only the matched Page doc:keydown `copy.anchor` from the existing anonymous-registration text to **`doc.addEventListener("keydown", forwardSectionKeyDown);`**, correctly JSON-escaped. Keep Focus/Flow/Narrate privateCopyMap rows, resource identity, and historical ownership.json byte-unchanged. This is the already ruled census amendment, not new ownership policy.

Exact production/test/census fence: **src/reader/modes/page/FoliateView.tsx**, **tests/readerModes/pagePositionSave.test.tsx**, and the one Page copy.anchor in **docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json**. Own docs only: BUG_REPORT subcase, Memo.PAGE-ENTRY-KEYS-1.GovernanceStaging.2026-10-26.md and Timing.PAGE-ENTRY-KEYS-1.jsonl at their registered paths after explicit admission. No new test file.

Forbidden: other census rows/ownership.json, pageTurnKey.ts changes, parent/router/shared-core, all sibling runtime/source copies, persistence/schema/settings defaults, wrapping algorithm/constants, replay-all-key logic, unowned docs/status/Seq/user-profile mutation. ReaderContainer.tsx, FlowScrollEngine.ts and src/types.ts stay unchanged.

## ek0–ek6 — exact causal and lifetime controls

Extend the actual FoliateView test harness, not a replacement key-forwarding implementation. A deferred wrap Promise or the real batch50 yield provides deterministic control; arbitrary timing sleeps are not the cause detector. WRAP_BATCH_SIZE50 means block groups, not words. Use the existing60-paragraph section3 fixture; each row explicitly retains/counts the real fake renderer's next/prev calls and actual save/CFI events.

| Row | Required assertions and opposing control |
|---|---|
| ek0 real mouse-next control | While first wrap is held before release, click actual `[aria-label="Next page"]`; renderer.next count becomes1 immediately. This passes on the base in the exact state where native section keys fail. Do not rename u as ek0 or replace this click with a direct runtime/handler call. |
| ek1 early PageDown | Dispatch native PageDown on the actual section document before release/any mouse input; next becomes1 immediately (base0). While provisional wrapping/canonical numbering is pending, no premature progress save; after canonical stamping completes, landed text/CFI saves once. Preserve existing u's exact Word1/global21 fixture association when using that landing. |
| ek2 early PageUp | Same held state, native section PageUp calls prev exactly once immediately (base0); retain corresponding landed canonical word/CFI persistence and no duplicate save. Freeze the concrete previous-page fixture/CFI at the admitted test cut rather than inventing a result from current snapshot text. |
| ek3 after wrapping | One physical native key after settled wrapping yields exactly one renderer turn; forwarded modifier/repeat fields remain the actual original event fields, not manufactured defaults. |
| ek4 repeated same-doc load | Re-dispatch load for the same retained section document; one native key yields one turn/window forward, never duplicate listeners. Include the no-wrap/sectionStart<0 path so early registration is not conditional on stamping. |
| ek5 both cleanup exits | After full unmount, retained doc forwards no window key and causes no renderer turn. Also exercise the Strict Mode cancelled-effect early-return cleanup; its stale retained doc forwards nothing. A fresh active document/physical key is the positive control that the event/turn detector still works. |
| ek6 guard scratch only until landed | Merge actual item tip with51202c1c in a separately owned scratch worktree; forwarded Ctrl+ArrowRight turns0, forwarded Ctrl+PageDown turns1. Invoke through section document, preserve all modifiers/repeat. Rerun ek rows there. Do not push this compatibility merge, delete its evidence, or commit guard-only ek6 into incompatible primary source before the guard lands. |

Keep existing u unchanged: it asserts no save during first wrapping and exactly one save after canonical numbering. Its existing mouse click does not count/establish the new immediate-next detector; ek0 separately proves that control. Preserve held-turn failure, stale-load, restamp, jump and modifier controls; this narrow forwarding fix does not repair arbitrary missing renderer initialization.

Base/prescribed/wrong-variant receipt work remains prospective under standing rule44: same committed command with recorded source/test/fixture identities and exact output/exit, actual base failure on absent early forwarding while ek0 passes, prescribed pass, and an admitted opposing late-registration/omitted-field/omitted-cleanup variant detected by corresponding rows. Do not call an import error, timer timeout, unexecuted test or direct-helper surrogate a causal red. Exact wrong-variant bytes/evidence paths must be frozen before their admitted invocation, never patched into the primary baseline silently.

Primary exact targeted command from the standing card, expected0 on prescribed bytes:

```text
npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/readerModes/foliateViewTeardown.test.tsx tests/readerModeBoundaries.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts
```

Use that complete targeted command again in the declared scratch guard variant with ek6 present on its admitted test-only surface. Scratch commit/tree, test overlay, doc conflict resolution and evidence custody are separate inputs, not assumed from historical auto-merge. P-Q1 allows this compatibility run; it does not create an unmet main-landing prerequisite for the primary source checkpoint. Once guard actually lands, explicitly incorporate its test/policy into final integration and rerun Done-when1–4.

## Full verification, packages and release

Fresh `npm test`, `npm run typecheck`, `npm run build` each exit0 on final accepted bytes in separately sized quiet-host verification. Targeted control acceptance is not full verification. Source/guard compatibility, full verification and package/probe work each need independently bounded, separately consumed admissions; no automatic successor.

Preserve the historical rule53 temporary placement: final commit with approved current origin/main integrated, `--dir --x64` and `--dir --arm64` builds on RodneySr. dist/, main/, main.js, preload.js, package.json match across the pair; record both raw app.asar SHA256 values and architecture-specific exception scope where applicable. Built main.js must support scratch override; LL-165 actual initialized scratch profile proof precedes input. X64 scratch25s launch has no error/unhandled-rejection/crash/dump; named live library/settings byte hashes unchanged. ASAR lists renderer parity and any changed main/ files introduced by the integrated base. ARM64 launch remains required at merge; limited x64 verification must be labelled accordingly, not complete native acceptance.

The amendment's package probe is external, under **C:/Projects/Blurby-artifacts/page-entry-keys-1/package-probe/**, using the exact x64 packaged exe and owned fixture section with >50 block groups. Freeze actual probe bytes/commands, focus/input mechanism, CFI/paginator detectors and output-custody readback before launch. During held early wrapping (fewer stamped spans than groups), focus the real section and send PageDown then arrows before mouse navigation; record paginator position/CFI before/after and repeat after settling. Preserve current pre-renderer no-op as a separate observation. Do not treat a jsdom or source-only event as native focus qualification.

Owner-observed section-focus PageDown/Left/Right during early wrapping and settled state remains on release gate2. Build and hold; Brain package confirmation then Roadmap merge go, neither supplied by this draft. No package/native waiver, installer, release, terminal completion or provider mutation.

## Ownership, stop and checkpoint

Reader Engine product lane; owned Page UI/event surfaceC and test/census surfaceB/E. Shared-core touches empty. Reserve exclusive Page view/test/census-row ownership, serial with Page stack edits; no parallel code run is authorized here. Preserve prepared117→123→119 order and final stack integration acceptance/window. Reading modes remain independent.

If the integrated base cannot reproduce absent native forwarding with passing ek0, stop for diagnosis without weakening detector. If modifier/persistence/held-turn/cleanup controls regress, preserve evidence and held work. Changed source contracts, unknown local checkpoint, new merge conflict, missing dependency/host custody or fixture mismatch returns to Brain. No inference of shared root cause, replay policy or changed save semantics. At most two identified scoped repairs within the actual remaining cap, otherwise preserve partial checkpoint and request disposition. Rollback only this item's commits with authorized git revert, stopping on conflict; never reset/clean/stash/delete user or sibling work.

Future staging includes only exact fenced files/hunks and explicitly admitted own docs; inspect cached paths/diff/stat/protected hashes. Keep all scratch compatibility and failed evidence. No timing helper/backfill writes or assumed deletion/pruning; no automatic reinstall. Commit/push only per actual separately consumed branch/refspec/admission instructions; no main merge from a source checkpoint.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Exact primary/guard inputs, custody and site contracts are read back | calculable | source-preflight | bounded | medium | 5m | — | — |
| 2 | ek0–ek5 expose the early native-key gap with real mouse/cleanup/persistence controls | calculable | positive-control | bounded | high | 12m | — | — |
| 3 | One early effect-local forwarder and its one census anchor satisfy all event/lifetime assertions | calculable | renderer-fix | bounded | medium | 10m | — | — |
| 4 | Separately held arrow-guard scratch tree satisfies ek rows and ek6 without primary policy drift | calculable | compatibility-check | bounded | medium | 8m | — | — |
| 5 | Final full verification and ordered independent source reviews pass | calculable | source-verification | bounded | medium | 20m | — | — |
| 6 | Paired packages, native probe and own held documentation satisfy written gates | calculable | package-verify | bounded | high | 20m | — | — |

**Total:** provisional serial chain75m · sum75m, 0of6 estimates calibrated. These are new planner estimates, not carried historical24m medians, measured wall time or an ETA. Unresolved access/custody and owner waits are unpriced. Brain must split actual source/control, guard compatibility, full verification and package cuts with explicit deadlines/call limits, each≤60m/40aggregate calls; no automatic allowance/clock follows. Mechanical U10 remains pending.

##### Lessons applied

- LL-090: inspected actual held wrap/listener/window-handler/test/census locations, not just the original report or mistaken u description.
- LL-031, LL-169: effect cancellation and retained section-document lifetime remain separate; cancelled event handlers do nothing, cleanup removes only this effect's registrations, already-completed resources are not reowned.
- LL-087, LL-088: stable effect-local handler/set declarations precede use; one owner and exact identifier prevent duplicate forwarding functions or concurrent Page edits.
- LL-068: protected stack bytes, complete diffs/stat and final syntax/type/build verification detect accidental file truncation; no copied partial view reconstruction.
- LL-108, LL-161: held-turn acceptance checks exact landed canonical word/text and CFI, not a DOM index or snapshot that can look unchanged while the save is wrong.
- LL-139: actual event registration and sole Page privateCopyMap anchor are matched by resource/mode/file; no unrelated sibling/census ownership row changes.
- LL-143 latest retained Observation annotation; standing rule44: exact real command/input/exit receipts and causal/opposing controls; import failure or planner surrogate is not the red.
- LL-165: package driver proves initialized actual scratch profile before real input; no profile-label/native-qualification shortcut.
- LL-174: every original KeyboardEvent field crosses the section→window→pageTurnKey consumer hop; ek6 drives the outer section entry rather than testing the helper alone.
- LL-142: no structural/mock test is labelled actual native focus, complete CPU/audio/runtime or owner acceptance.
- LL-172: exact item-doc/accounting fence; no timing/helper backfills outside it.
- LL-175: unrelated accepted Business PDF bytes and format-specific checks remain outside this source/census fence.
- Standing rules43/44/55 require ek0 positive mouse control in the same held-wrap state, actual renderer next/prev and CFI detectors, fresh active-doc controls for teardown nulls. Rules41/42/46/47/48/50/51/52/53/54 preserve exact staged inputs, statuses, host, final verification/package and committing-trigger evidence.
- Considered not applicable to the narrow edit: LL-106/107 (no IPC/language protocol), LL-157/159 (no quit/writer implementation), LL-168 (no install), LL-170 (no canonical stamping/grouping behavior change), LL-171 (no provider/helper sequence mutation), LL-173 (no audio fake). Persistence tests protect existing save behavior without claiming to repair its separate defects.

Full current-live semantic U9 census/mechanical U9 is not asserted by this bounded lesson pass. Parent owns protected final checks and ordered independent pointer review; historical retired/promoted entries do not regain live status.

## Five readiness findings

1. **Specification:** closed P-Q1, amended early-forwarding/cleanup/census and ek0–6 contracts carried forward; final exact previous-page fixture, selected-base wrong variants/probe bytes/commands, pricing/splits and complete U9/U10/final independent review remain pending. NOT READY.
2. **Prerequisites:** actual Page-stack and authorized integration windows remain to verify. Prepared117→123→119 is execution order, not a new source dependency requiring117 to merge first. Guard scratch compatibility is required separately; guard-main landing is not invented as a primary prerequisite. Historical stop does not override the subsequent owner resume; fresh item-specific admission is still required.
3. **Repository:** immutable current primary and guard scratch trees/conflict inventories and actual branch/worktree/local-dirt/checkpoint owner remain unverified; aa049ff2 is historical only.
4. **External register:** parent must verify current Seq119/status/prerequisites and matching immutable published pointer through guarded provider flow; this draft performs none.
5. **Execution environment:** fresh quiet host/dependencies/runtime/access/resource-slot/artifact custody and actual input consumption are pending; no old bq-main recipe, native package path or queued message counts as that receipt.

Only this new planning draft is authored. No helper/provider/source/runtime/test/executor action was performed. Root owns publication/folding; Brain alone coordinates execution.
