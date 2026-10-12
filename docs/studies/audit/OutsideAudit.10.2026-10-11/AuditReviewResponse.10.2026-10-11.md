# OutsideAudit.10 — Independent response review (D4)

**Reviewed:** 2026-10-11. **Response package identity:** `AuditResponse.10.2026-10-11.zip`, SHA256 `892f09139654ee5ee2f4286f82a246722d3c3278a8e35b024068fc7674de6bcb`.

**Recommendation:** retain removal followed by a validation-first rebuild. Correct the remaining restart and integration defects before removal dispatch, narrow the claims to their demonstrated scope, and admit Phase 0 through a concrete charter. **The frozen design milestone is not authorized as packaged.** This verdict does not reject the direction or require expansion of the removal's code scope.

## 1. Independence, scope and custody

This review used only `C:\Projects\Blurby-artifacts\outsideaudit-10-d4-f1a51951`. I read the orientation, D3, D2, proposed diff and revised specifications, controls, original-source snapshot, supplemental patch/lock custody, and relevant packaged CLAUDE/lessons. I did not read the live project, memories, profile, model files, audio, or network. Contemporaneous findings from other fresh package-only reviewers were checked against these same packaged coordinates; their conclusions were not substituted for source inspection.

I independently checked all **863 entries in the extraction's `custody.json` against their listed SHA256 hashes: zero mismatches**. I also hashed the included original ZIP: `c0e210b722d824d3699a3a65a295d3f10ae55b0df894c85003a103a9b1e1c9e2`, matching D2. The response ZIP identity above is recorded in `custody.json:2-5`; its outer ZIP is not separately present in this extraction, so I do not claim an independent rehash of that outer ZIP. The model/tokenizer hashes in `06_supplemental_custody/CUSTODY.md:9-10` are custody declarations, not model bytes that I inspected.

My additional execution was limited to read-only hashing, parsing packaged JSON, and in-memory checks. In particular, the final renderer API search pattern parsed without errors and matched **68** lines in the packaged original `src` tree; the two packaged null-table consumer logs each contain **9/9 trusted word advances**. I did not execute the packaged scripts that load models, reach the original workspace/profile, or remove disposable Git fixtures. No application, model, audio, full test suite, build, or live register was run in D4.

The milestone remains D2's **design approval of direction, removal dispatch specification and validity of the engine-proof experiment** (`D2:13-17`). An unbuilt core or unexecuted future Phase 0 is expected, not a present implementation defect.

Citation abbreviations below are exact paths relative to the review root:

- **D2:** `01_D2_audit_report/AuditReport.10.2026-10-11.md`
- **D3:** `02_D3_remediation_plan/AuditRemediationPlan.10.2026-10-11.md`
- **WD:** `02_D3_remediation_plan/WorkingDesigns.md`
- **RM:** `03_proposed_diff/revised/ROADMAP.md`
- **HB:** `03_proposed_diff/revised/docs/planning/holding/2026-10-11-narrate-rebuild.md`
- **LL:** `03_proposed_diff/revised/docs/governance/LESSONS_LEARNED.md`
- **E:** `04_verification_controls/remediation/`
- **S:** `original-source/`
- **PATCH:** `06_supplemental_custody/patches/kokoro-js+1.2.1.patch` (the minified added implementations are lines 7 and 14).

R1–R12 are recorded owner decisions (`D3:128-145`) and remain binding. I do not reimpose the waived queue gate, restore an unconditional two-second cold target, require manual annotations or device calibration, enable old cache reuse, reroute Page Shift+Space, or move Phase 0 before removal.

## 2. Every D3 §3 response-matrix row

| ID | D4 disposition | Decisive assessment and coordinates |
|---|---|---|
| F1 | **Accept** | The patch and lockfile are now supplied, with explicit asset/model/audio/profile exclusions (`06_supplemental_custody/CUSTODY.md:3-12`; `00_orientation_manifest/MANIFEST.md:10-15`). This closes the omitted producer/dependency-input custody defect for static review, while the absent model and audio still limit reproduction. |
| F2 | **Accept with narrowing** | The present pinned producer exposes no durations, and the packaged current path turns missing native tables into weighted tables carrying the predeclared native label (`E/F2-producer-probe/f2-producer__probe1.out:1,10-21`; `S/src/utils/audio/segmentKokoroChunk.ts:126,142-189`; `S/src/utils/audioScheduler.ts:478-491`). Keeping the inert patch during removal and repairing it only in Phase 0 is coherent (`RM:208,393,748`), but “every table ever used/since v1.44.0” is a historical inference conditional on unchanged artifacts, not an executed history census. |
| F3 | **Accept with narrowing** | Moving runtime P0-6/P0-7 into mandatory Core acceptance is acceptable because the offline engine probe cannot establish playback ownership; the requirements remain explicit before core implementation (`RM:770-777`). Phase 0 is a useful experiment specification, but its verdict must distinguish exact frame/token construction from measured acoustic anchors, retain the unresolved merged-unit owner gate, and state the additive interaction budget (`RM:748-764`; defects D4-06/D4-07 below). |
| F4 | **Accept** | The real handler currently assigns the raw payload before scheduling its save (`S/main/ipc/state.js:22-39`), and the two-line normalization seam plus omission control is specific and tested (`RM:243-265,511-514`; `E/post-apply/ipc__logs__a-base-strict.log.txt:4-18`, `b-edited-strict.log.txt:4-7`, `c-omit-strict.log.txt:4-18`). The Medium specification / Low ordinary-runtime distinction is reasonable in the bounded retained-renderer scenario; it does not negate the raw IPC ingress. |
| F5a | **Accept with narrowing** | Exact call-site/assignment/save counts now agree with the prescribed helper (`RM:267-276,505-510`), so rewording the helper is no longer a route to satisfy contradictory counts. These are wiring checks, not proof of behavior by themselves; the packaged post-apply command inventory still has the earlier `-cF` call checks rather than final `-cwF` (`E/post-apply/gates__gates.txt:17-20`), so the final command replay claim needs its version recorded accurately. |
| F5b | **Accept with narrowing** | The named PowerShell 7 surface, `\x22` quote spelling, exact exit-code rule, and base positive controls address the actual failure mechanisms (`RM:221,693`; `E/F5b-shell-gates/F5b-shell__parse_pwsh7.txt:7,19`). Cross-shell results are real recorded controls, but are not proof that every final amended command was replayed: the logs still use the older renderer API search returning 82, while the final excluded-settings pattern returns 68 (`E/post-apply/gates__gates.txt:6`; `gates__g_ps7.txt:6`; `RM:282`). |
| F5c | **Accept** | Page calls the preference-only cycle while Focus/Flow calls mode entry (`S/src/hooks/useKeyboardShortcuts.ts:249,265`; `S/src/reader/useReaderModeOrchestrator.ts:150-161`); revised smoke and slot review preserve this behavior (`RM:316,349,370,388-392`). Deferring stale help/replica-test cleanup to UX-POLISH-1 respects R8 and avoids a removal behavior change. |
| F6 | **Accept with narrowing** | Taking the immutable base from C1 and excluding n=0 from publication recognition fixes the demonstrated original failure (`RM:667-671`; `E/F6-resume-recipe/F6-remedy__control-output.txt:25-27,47-64`). The revised recipe is not fully closed: existing-merge recognition is ancestry-only, and permitted C4 amendments and partial C1 work conflict with resume/base-measurement rules (D4-01–D4-03). |
| F7 | **Accept with narrowing** | The writer drops its promise, so “submission” accurately bounds the seam tests (`S/main.js:55-60,130,289-293`; `RM:240-261,382-383`). Keeping that writer unchanged and filing BUG-185 honors R9; normalization is re-established at each load/apply/IPC, while completed on-disk persistence and rollback retention remain expressly conditional on a successful save. |
| SEC | **Accept with narrowing** | Native-speed/raw-PCM generation, no overlap, provenance from actual output and one clock are appropriate charter rules (`RM:798-805`; `S/src/utils/audio/tempoStretch.ts:93-103,121-156`; `S/src/utils/audioScheduler.ts:587,619,631`). Numeric Opus/tempo observations are bounded control results or reported verifier results, not universal waveform laws or a measured single cause of H1–H6; narrow the “21 of 22/only 2x” wording as explained under C10. |
| GOV-1 | **Accept** | The final text puts the read-only prerequisite check before the In Flight mutation and records R1's one-dispatch waiver (`RM:218,385,658-661`). Rule 5a and standing rule 8 re-arm at removal close-out; this review does not silently revoke the owner's waiver. |
| GOV-2 | **Accept** | Code Phase 0 begins after removal, while only charter drafting may run in parallel (`RM:648-652,743`; R11 at `D3:144`). The lane B ownership and explicit Kokoro/patch/package/CI freeze address the earlier overlapping fence and prerequisite contradiction. |
| GOV-3 | **Accept with narrowing** | The final scanner uses a syntax tree for literal `vi.mock` calls and strips CSS comments, closing the named comment/string controls (`RM:555-605`; `E/GOV-closure-check/gov-sequencing__census-repo.json:2-12`). This is bounded import-closure apparatus: it deliberately excludes other mock forms and does not parse CSS strings; do not turn the seven-form self-test into a universal “all strings/comments can never count” claim. |
| GOV-4 | **Convert into documentation-only correction** | Excluding the imported icon is a package limitation already distinguished from canonical source by D2 (`D2:109`), and the response manifest now declares images absent (`00_orientation_manifest/MANIFEST.md:15`). No source deletion repair follows from this package-only failure. |
| G6 / J2 | **Accept with narrowing** | Checking a differing integration tree before pushing is correct, and identical-tree reuse avoids needless duplicate verification (`RM:634-639`). However the changed-tree branch omits `npm run build`, despite the inherited UI/dependency build rule (`RM:113`), and the recovered integration HEAD is not sufficiently authenticated (D4-01/D4-04). |
| A10 | **Convert into documentation-only correction** | Removing the assertion of one proved cause is right (`RM:784`; `D2:181`). Keep “the present pinned path produces estimates” separate from the stronger historical assertion that every H1–H6 observation used those exact artifacts; the package does not provide a complete historical artifact chain. |
| Standing rule 38 | **Convert into documentation-only correction** | The new supersession clause removes the conflict between preserving the old lag rule and a fresh no-fixed-lag core (`RM:151,799`). It should preserve the source-derived qualification of the old trusted label without implying an independently measured acoustic offset. |
| Independence | **Accept** | D2 expressly disclosed coordinated internal authorship (`D2:19`), and this fresh package-only review supplies the requested independent assessment of the response under R12 (`D3:145`). Independence closes an evidence-role gap; it does not turn unfinished plan corrections or absent runtime acceptance into an authorization. |

## 3. Every D3 §2 correction, C1–C11

| ID | D4 disposition | Decisive assessment and coordinates |
|---|---|---|
| C1 | **Accept with narrowing** | The installed-artifact claim is supported by saved CJS output names and null tables plus the ESM output report (`E/F2-producer-probe/f2-producer__probe1.out:1,10-21,24-35,38-49,52-63`; `probe__run-esm.log.txt:1-4`; `probe__probe-out-esm.json:126,387,511,639,900,1024`). This proves the reported 10/10 control generations and the conditional current code path, not an unrestricted production-history “always.” |
| C2 | **Accept with narrowing** | Pre-generation declaration and the scheduler's production trust/default are correctly located (`S/src/hooks/narration/kokoroStrategy.ts:368`; `S/src/utils/generationPipeline.ts:523-525`; `S/src/utils/audioScheduler.ts:488-508`). The decisive missing-table control is **9/9**, not the response's 12/12: both saved logs' `A_native_missing_fresh.wordAdvance` arrays have nine trusted entries (`E/F2-consumer-trust/F2-consumer__run2.log.txt:194-231`; source corpus at `F2-consumer__harness.ts:13`). |
| C3 | **Accept with narrowing** | Wrapped tokenizer IDs, in-context phoneme changes and the 600-versus-256 defect are demonstrated in the installed-control outputs (`E/F2-producer-probe/probe__probe-out-esm.json:30-58,84-91`; `f2-producer__probe3.out:5-17,79-116`; `PATCH:7,14`). The `.data.length` read is also present in both patched implementations, with `audioHasDataField:false` in the controls; int64 conversion is a statically identified hazard and remains inferred, as D3 correctly says. |
| C4 | **Accept with narrowing** | The intended retained renderer emits valid mode literals/cycle values, so routine runtime impact is lower than the broad original severity; nevertheless optimistic settings merging does not itself validate raw IPC (`S/src/contexts/SettingsContext.tsx:31-33`; `S/main/ipc/state.js:22-25`). The normalization repair and actual-handler test remain necessary to make the promised ingress invariant true (`RM:374-382`). |
| C5 | **Accept** | The old counts described text rather than the intended declaration/calls, and `git grep -c` returns path-qualified counts; final text states exact `main/sync-engine.js:1` outputs and the prescribed helper (`RM:267-276,507-509`; `E/F5a-count-gates/F5a-counts__scripts__helper_check.js:2-7`). “Necessarily fails” should be replaced by “contradicts the prescribed spelling and can reward a renamed/half-wired variant,” which is the response's correction. |
| C6 | **Accept with narrowing** | The parser artifacts show both argument splitting and an unterminated string (`E/F5b-shell-gates/F5b-shell__parse_pwsh7.txt:7,19`; `F5b-shell__parse_ps51.txt:7,19`), and the response's quote-free native argument patterns address Windows 5.1 behavior. Missing `rg` is a reported owner-shell/environment observation, not a timeless system property; final execution correctly requires an actual command plus exact exit and stream results (`RM:221`). |
| C7 | **Accept with narrowing** | Current Page selection-only routing and the positional callback risk are source-grounded (`S/src/components/ReaderContainer.tsx:889`; `S/src/hooks/useKeyboardShortcuts.ts:77-78,249,265`; `RM:370,392`). The specific historical commit/date is a reported history attribution in this package, not something independently reconstructed from a supplied Git history; the current behavior repair does not depend on that attribution. |
| C8 | **Accept** | Publication, rather than an unrelated main advance, is the demonstrated ancestry trigger (`E/F6-resume-recipe/F6-remedy__control-output.txt:13-15,47-54`). An n=0 branch cannot be treated as published solely because it is an ancestor; the final published-chain check correctly requires n=5 (`RM:669-671`), but the separate integration-recovery shortcut still needs D4-01. |
| C9 | **Accept** | A returned writer promise would make the already-existing `await saveSettingsFn()` propagate rejection from `loadState`; startup awaits that function before creating its window (`S/main.js:293,611-615,635-636`). Adding awaitability without a caller failure policy is therefore a behavior change, and separating BUG-185 from removal is justified (`RM:382`). |
| C10 | **Accept with narrowing** | Timestamp division, tail copy/truncation and the live lag sites are correctly identified (`S/src/utils/audio/tempoStretch.ts:93-103,148-156`; `S/src/utils/audioScheduler.ts:587,619,631`). The universal “21 of 22 unchanged; only 2.00x stretches” formulation is too strong: short buffers return unchanged before searching, and zero/periodic/identical-correlation ties select the first candidate rather than uniquely selecting the exact continuation (`tempoStretch.ts:114-118,189-207`); describe the tested control signals/sizes instead. |
| C11 | **Accept** | The final recipe fixes the before-mutation queue gate, assigns lane B, fences preserved Kokoro files and removes the e-ink parallel contradiction (`RM:218,648-661`). The waiver is an explicit owner choice, not an implicit exception invented by the response; remaining resume defects are separately identified below. |

## 4. The README facts, checked claim by claim

### 4.1 One output, no native tables, estimates labelled trusted (`README_D4.md:21`)

**Accept the current-artifact mechanism; narrow the historical quantifier.** `E/F2-producer-probe/f2-producer__probe1.out:1` lists only `waveform`; the ESM log independently records the same output name (`probe__run-esm.log.txt:3`). Four CJS and six ESM saved generations returned null tables. Given those artifacts, PATCH's `if(_dur)` branch cannot create durations and its guarded aligner cannot run (`PATCH:7,14`). “Timing code never ran” means that production timing branch; the verification probes deliberately invoked alignment directly with synthetic/exposed data, so the literal assertion that none of that function's code ever executed would be false.

The current consumer path is stronger evidence than the label: the segmenter preserves the predeclared `timingTruth` while substituting word-weight boundaries, and the scheduler trusts structural validity (`S/src/utils/audio/segmentKokoroChunk.ts:126,142-189`; `S/src/utils/audioScheduler.ts:478-491`). The saved full-path missing-native control has 9/9 trusted advances. Historical “every table since v1.44.0,” all H1–H6 dates, and the 4,505-sidecar/4,861-Opus totals remain reported observations/inferences: the response contains no complete historical hash chain or packaged cache-census output. R10's prohibition on old cache reuse stands independently of those counts.

### 4.2 Waveform samples = 600 × sum of duration frames at four rates (`README_D4.md:22`)

**Accept the saved length evidence; narrow the four-rate evidence classification.** Five saved exposed-duration rows support 600 samples/frame at speed 1: for example 41,400/69 and 88,800/148 (`E/F2-producer-probe/f2-producer__probe3.out:5-15,66-76`); the script fixes `speed:1` (`f2-producer__probe3.cjs:30-35`). The four-rate script exists (`E/F3-phase0-units/f3-remedy__units.cjs:13-20`), and WD reports its successful two-passage execution at 0.8/1.0/1.4/2.0 (`WD:172`), but its requested per-rate numeric console output is not supplied. Thus the four-rate result is a transcribed verifier result, not raw rows independently rechecked here.

This law establishes **total-length/unit consistency**, not interior acoustic alignment. A thousand-millisecond table can place a boundary at either 400 or 700 ms while retaining identical endpoints and length. Exact source/token grouping and proof that the exposed tensor is the forward pass's alignment improve model-relative identity; neither the 600 ratio nor comparing two constructions from the same durations constitutes an independent measurement of the audible interior word boundary. The exposed probe's `contextSpansSec` and `correctedPatchMethodSec` are such same-duration constructions (`f2-producer__probe3.cjs:55-69`). No acoustic exactness or latency guarantee is accepted from these controls.

### 4.3 Gate dry-runs and disposable-repository resume replay (`README_D4.md:23`)

**Accept that the recorded controls ran; narrow exact-final-artifact coverage.** Saved PowerShell 7, Windows 5.1 and bash gate outputs are supplied (`E/post-apply/gates__g_ps7.txt`, `gates__g_ps51.txt`, `gates__g_bash.txt`), and the 19-state replay demonstrates the original published-base failure and the corrected principle (`E/F6-resume-recipe/F6-remedy__control-output.txt:25-27,47-64`). The later scenario replay is genuine Git-control evidence, but it stubs `npm ci`, typecheck, closure and tests (`E/post-apply/recipe-v3__recipe_v3.sh:40-44`): its zero exit rows prove recipe branching, not application verification.

The copied gate inventory predates final `-cwF`, the final `ttsCacheEnabled` exception, and the exact trailer extractor (`E/post-apply/gates__cmds2.txt:15-16,25,64`; compare `RM:268-269,282,668`). The replay's last FRESHM row quotes the older unconditional-empty step 4 (`recipe-v3__out.txt:228-230`), whereas final `RM:689` explicitly exempts the memo and timing log. **That particular fresh-status issue is fixed**, not a current defect; the stale output remains evidence of version drift. The missing controls are the current n=4 amendment, n=0 partial-test and improper existing-integration-HEAD cases below, not a reason to deny all prior replay value.

## 5. New defects and exact fixes

These are defects in the present proposed plan or its claims. None is a complaint that a future core or Phase 0 has not yet been implemented.

### D4-01 — Existing integration HEAD can bypass the required no-ff merge

**Location:** `RM:635-639`, particularly line 636. An ancestor predicate alone treats `HEAD == branch tip` as “an earlier run already made the merge”; identical trees then skip verification and the recipe pushes the tip directly to main. A clean existing merge worktree parked on C5 is accepted even though it contains no publication merge, contradicting the no-ff contract and the subsequent already-published check at `RM:671`.

**Fix:** authenticate the recovered integration commit before reuse: require the intended two-parent merge, second parent exactly the current C5 tip, and first parent the recorded integration-base main commit. Reject HEAD equal to the branch tip or an unrelated descendant; preserve the tree and route to (C). Add replay controls for clean HEAD=C5, an unrelated descendant and a valid interrupted merge.

### D4-02 — Post-C4 corrections cannot resume under the stated dirt fence

**Location:** `RM:630` versus `RM:673-676`. Line 630 allows review/diff-fence fixes to renderer or main files to be amended into unpublished C4. If interrupted before the amend, n=4 makes the “next commit” C5, whose allowed paths are the memo/time log; the resume rule rejects the permitted correction files as conflict.

**Fix:** add an explicit n=4 correction/amendment state keyed to the current C4 SHA and recorded review issue, with exact allowed correction paths within the sprint fence. Resume that amendment before C5, rerun required gates and reviews, invalidate any smoke attached to the old C4 SHA, and then proceed to C5. Add a control interrupted after a renderer/main correction is written but before C4 is amended.

### D4-03 — n=0 partial C1 tests contaminate the “base” measurement

**Location:** `RM:625,669,673,675,688-695`. With no committed C1, the recipe permits the next C1 test paths as local work, then unconditionally runs step 4's base suite on that dirty tree. Those new positive-control tests intentionally fail the base; their presence can incorrectly produce the red-base hard stop instead of resuming their authoring.

**Fix:** measure the immutable base on an untouched base tree, or reuse an authenticated pre-test base record, while preserving unfinished C1 tests. Run the intended positive-control failures separately on the candidate test tree. Add a replay/control with both C1 tests written or staged, no C1 commit, and successful underlying base verification.

### D4-04 — A different integration tree is pushed without rebuilding it

**Location:** `RM:637`; inherited obligation at `RM:113` and `03_proposed_diff/revised/CLAUDE.md:193,224,246`. When main moved, the merged tree receives typecheck, closure and tests but no build. C4's earlier build and smoke verify a different tree, so a combined dependency/UI/build failure can escape publication acceptance.

**Fix:** include `npm run build` in the differing-tree gate and bind the outputs to the integration SHA. Retain the Page/Focus/Flow forbidden-scope stop; if integration materially changes owner-smoked UI/runtime paths, renew the affected smoke on the built integration tree. An identical-tree merge may reuse the branch evidence.

### D4-05 — Executed evidence, inferred history and final-version evidence are conflated

**Location:** `D3:17-21,40-42,159-164`; `RM:276,393,769,784,800-801`; `LL:2757-2758`; `HB:81`. Specific errors/overreach include 12/12 versus saved 9/9 advances, historical “every” claims without historical artifact custody, an absent raw cache census, four-rate numeric outputs represented as independently inspectable raw evidence, and dry-run claims that exceed the copied final-command inventory.

**Fix:** correct 12/12 to 9/9; label cache totals as reported and historical conclusions as conditional code-path inferences; distinguish five saved speed-1 unit rows from the transcribed four-rate result; narrow universal tempo wording to the tested signals/lengths. Attach exact-final-command/reconciliation results to the final artifact hash, or explicitly state which final edits have only inspection/in-memory validation. Expensive model or profile reruns are not needed merely to narrow these statements.

### D4-06 — Phase 0's decision claim exceeds its acoustic coverage

**Location:** `RM:750,752-757,764,766,789`; `HB:81,129-135`. R4 intentionally permits no manual interior annotations, but resolved pause/onset anchors do not bound unmeasured interior acoustic errors. In addition, displaying a merged run is a unit cursor rather than the original “each word exactly while spoken” contract; exact current-word finishing and next-word entry under R7 cannot automatically be inferred from a run containing multiple words.

**Fix:** keep R4 unchanged, but report separately (i) model/token/sample construction, (ii) acoustic error and uncertainty at independently identified reference anchors, and (iii) unresolved interiors. Before measurement the charter must state how an acoustic anchor is associated with a source unit without consulting the tested table, and fix its reference method and coverage threshold as already required by `RM:754`. Keep the line-750 merged-unit option as an explicit **later owner gate**, not an automatic per-word pass; if chosen, the verdict must name the F2/F3/R7 contract change and obtain that approval before core implementation. This is claim/contract clarification, not a demand for forbidden manual annotation or proof from nonexistent future code.

### D4-07 — The two-stage latency rules need one explicit additive budget

**Location:** `RM:761-763,777`; targets at `D3:136` and `HB:98,142`. A harness generation trial can pass at nearly two seconds while transport, queued native work, leading silence and playback start make speech late. “The same budget” should not be executable as a separate two-second allowance for each stage.

**Fix:** state the equations and timer origins in the charter: warm request-to-first-voiced-output latency, including all queued/generation/transport/playback contributions, is at most 2 s; cold Play-to-first-voiced-output latency is at most 8 s. Record harness latency as a component, then measure the remaining budget and total in Core acceptance, including idle unload, backlog and the old-word completion contribution for R7. This preserves R3 rather than undoing its readiness distinction.

## 6. Minimum closure set and final authorization

### 6.1 Minimum closure for this design milestone

1. Correct D4-01–D4-04 in the **removal specification**, then replay the exact final recipe's added states. Preserve the repaired F4 handler tests, fixed shell/count gates, Page smoke, bounded save semantics, R1 waiver, owned lanes and immutable base.
2. Correct/narrow D4-05 in D3 and the revised governing docs; identify the final tested artifact by hash. Patch/lock custody and exclusions are already supplied and do not need a second package-completeness repair.
3. Clarify D4-06/D4-07 in the rebuild stub/charter instructions. Before Phase 0 execution, the charter must select concrete passages/chunk bounds, reference method/source-unit association/uncertainty/minimum coverage, fixed trial texts/counts and the mapping policy. These are expressly future charter obligations at `RM:743,748,754,762`, not grounds to demand the future experiment's results during D4.
4. Review those exact corrections, then complete D5's merge/register read-back/audit record (`D3:125-126,174-175`). Live prerequisites and register state must still be verified at dispatch; this offline review does not establish them.

**P0-6 transfer: accept.** Runtime handoffs, pause/resume, coalescing, stale-job bounds and no drop/repeat/overlap may move into mandatory Core DoD before core implementation (`RM:770-774`). Phase 0 is engine/adapter evidence, not interaction acceptance.

**P0-7 transfer: accept with narrowing.** Worker/runtime failure ownership may move into Core acceptance (`RM:775`), but malformed/missing durations, unreconciled mapping and wrong PCM identity must already fail the Phase 0 producer checks (`RM:747-751`); moving a runtime failure list cannot make invalid producer data acceptable. Neither transfer drops a requirement or authorizes a runtime claim before execution.

BUG-185 may remain deferred under R9 because the removal invariant is normalized memory/save submission, not write completion (`RM:382-383,730`). Precise on-disk durability for the rebuild must use an explicit awaited failure policy or wait for that bug (`RM:805`). No old cache cleanup, old Narrate repair, new voice scope, manual annotations, per-device calibration, or queue backfill before the waived removal dispatch is added here.

### 6.2 Separate verdicts

| Subject | Verdict | Meaning |
|---|---|---|
| Removal-then-rebuild direction | **Authorized** | Coherent with the recorded owner decisions and the current missing-producer/trust evidence. Kokoro remains a reasonable candidate; an export/adapter defect is not proof of engine incapability. |
| Removal dispatch specification, as supplied | **Not authorized** | D4-01–D4-04 leave reproducible state-classification or integration-verification gaps. Correct the docs and replay those cases before dispatch; the code scope need not expand. |
| Phase 0 decision quality | **Authorized with conditions for chartering; not an executed engine proof** | The revised producer/unit/provenance/rate experiment is worth carrying into a concrete charter, with D4-06/D4-07's claim and budget limits and the explicit mapping/merged-unit owner gate. It does not currently certify interior spoken-word accuracy, full range quality or interaction latency. |
| Overall frozen design milestone, as packaged | **Not authorized** | Fresh review and most original remediation are now present, but final executable-plan corrections remain. D5 can reconcile the named corrections and return their exact artifacts for closure; no arbitrary readiness score or release authorization is implied. |

The next work is bounded documentation and control closure. Actual removal acceptance still requires the specified candidate tests, build, unchanged Page/Focus/Flow evidence and owner smoke; a rebuilt Narrate still requires its Phase 0 evidence and later Core acceptance.
