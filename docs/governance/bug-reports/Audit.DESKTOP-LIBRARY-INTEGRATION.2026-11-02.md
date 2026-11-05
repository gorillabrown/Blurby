# Desktop integration — observer, visibility and display-lifetime stack

2026-11-02. **PLANNING INVESTIGATION ONLY / NOT READY / NO MERGE OR EXECUTION ADMISSION.** Recommendation: prepare the existing observer → visibility → display-lifetime stack as ONE declared integration unit, with separately bounded source reconciliation, portable qualification, packages and native evidence. Resolve the exact per-branch qualification/merge mechanism with Brain before writing dispatch pointers. CPU profiling is not a universal integration prerequisite. No new item, resequence, general freeze lift, Native resumption or executor scheduling is proposed.

## Authority and read scope

Read COMPLETE `Brain.DESKTOP-INTEGRATION-CPU.2026-11-02.md`, raw SHA256 `3987c5c064279beb20ce95f65f730bfd3cf12e473c5d57b6b49b76a4e22e73b2`, actual message `exec-782b8b6d-fa54-4456-b38e-671b933a8c76`. It preserves all12 release requirements, the existing integrated-RC scope exception, per-branch moved-main/Rule53/Brain confirmation/Roadmap go and ARM64 launch at merge. It grants no merge or runtime. Read current ROADMAP19/206/576–580/1007–1008/1696–1724, the completed release-order disposition, and Brain1's retained dependency/release ruling. The opening roadmap's older post-release wording does not override the later owner-confirmed integrated-RC exception. This audit scopes one stack; it does not reorder the other declared train groups (including BUG-235/BAND/EINK) or clear their gates.

From local Git objects, read COMPLETE held `docs/studies/investigations/FOLIATE-DISPLAY-LIFETIME-1.native.2026-10-30.md` and `LIBRARY-COMPLETION-VISIBILITY-1.package.2026-10-30.md` at4ac4ff76. Read source diff/path/graph inventories and selected test names; this is NOT a fresh full source/spec-compliance review of all378 changed paths or a full read of raw historical runtime artifacts. Raw blob hashing below covers complete bytes without executing them. No source/helper/test/Node/app/package/import was run. Only Git read operations, including network `ls-remote`, were used; no fetch/index/ref/object/worktree mutation or merge-tree write-tree.

Live register facts are attributed to Root's actual SQL supplied for this task, not a child provider query: Observer In Flight67/no prerequisite/branch eb/foliate-observer-leak-1/archive2026-10-23 spec; Display In Flight68/prerequisite Observer/branch eb/foliate-display-lifetime-1/ROADMAP anchor; Visibility In Flight116/prerequisite Observer/branch eb/library-completion-visibility-1/ROADMAP anchor. Preserve those identities/statuses/Seq. Logical merge dependency order is not numeric resequencing or a new register row.

## Independently observed current remote and local object identities

Two read-only `git ls-remote origin` reads agreed; final read2026-11-03T05:46:53Z. Origin URL is `https://github.com/gorillabrown/Blurby.git`. All four listed commit objects are present locally; no fetch was required. Remote equality proves the reported ref value at observation, not quiet-worktree custody, locks, dirt, installed dependencies or future merge eligibility.

| Remote ref | Actual tip | Local tree |
|---|---|---|
| refs/heads/main | `ac19ea60b6cd8b4fff3e5413b111925b7ef78485` | `b08fdf6e354e191962ae158396e17d50b2afe785` |
| refs/heads/eb/foliate-observer-leak-1 | `5175927659228e2cf9c87cc74210e6d943371b41` | `ec0e126979e5c93794e258820988dc5c614db58b` |
| refs/heads/eb/library-completion-visibility-1 | **`a8e31b7363da5c8dd1d8d059915081195d3cc3b6`** | `400071c255be9e77647ebafdbca75c1201fff4e0` |
| refs/heads/eb/foliate-display-lifetime-1 | `4ac4ff76c89bbde25f87319cc9b0c6ff314d89c7` | `7179e8c510dd40ec07d5839e8ad3275e72d4e501` |

Visibility implementation is `0dd4d94026f2574f735031b2b1569aee09d17120` (tree `b11a7547da5379dd8869181f0e2188103b60aa71`), not its current branch tip. `git diff --name-only 0dd4d940 a8e31b73` lists ONLY that item's GovernanceStaging memo and Timing JSONL; no additional production change. Do not retarget/reset the actual published branch to its implementation commit.

Combined old package source is `2d5772d3aa8a032118b973a4cf94af03ac759864`, tree `2d747e32a44a74b6691682aa02c82857b893cc2e`, ordered parents `[2df0f920a7963f8fa81ff2e68eeef352e4d8a418,e29117b2bc65ef464dcaaac809b9c75a293fef45]`. Later ea02d903 adds native harness/memo;4ac adds visibility package memo. Full diff2d5772→4ac consists only of these two investigation docs and the14 harness files listed below. Those additions still require precise tool/source review before execution, but do not make old package inputs equal to current main.

### Actual topology versus logical order

`merge-base --is-ancestor` independently confirms observer51759276, visibility0dd4d940 AND its tipa8e31b73 are ancestors of4ac4ff76. Observer51759276 is NOT an ancestor of visibility tipa8e31b73. The branches were originally built independently; their required observer→visibility ordering is integration policy, not a claimed linear branch chain.

Actual combined joins:

- `314dbf3b` parents486b3a72/a8e31b73: integrate held visibility for verification.
- `aa5f1485` parents314dbf3b/51759276: integrate held observer disconnect patch.
- Later e1c1c11c implements display/retained-view lifetime;2df0f920 preserves its hold.
- `2d5772d3` merges that candidate with old main e29117b2;ea02d903 then4ac add package evidence/harness.

None of observer51759276, visibilitya8e31b73 or combined4ac is an ancestor of current mainac19 (the4ac check was independently repeated; the actual Brain ruling supplies the individual non-landed checks). No already-landed/completed assumption. The first stack critical path is **exact current source/host reconciliation and merge-mechanism ruling → final-byte qualification of the declared unit → package/native evidence and distinct branch merge gos → integrated RC gates**. CPU T/profiling is outside that dependency path; resource contention still requires serialization of builds/native checks versus genuine profiling.

## Changed paths, ownership and read-only merge preview

Common base of current mainac19 and combined4ac is **e29117b2bc65ef464dcaaac809b9c75a293fef45**. Relative to that base, current main changes90 paths and held4ac changes378 paths. Current main changes NO application/test/package/patch path in this comparison. The sole changed-path intersection is `docs/governance/BUG_REPORT.md`.

### Production and transitive build-input comparison

All90 current-main changes since e29117b2 classify as AGENTS.md1, CLAUDE.md1, ROADMAP.md1, docs49 and Virtuoso38. Thus this particular moved-main delta is governance/documentation/registry metadata ONLY; it changes neither production nor tracked transitive build inputs. Explicit filtered diffs show no change in src/, main/, main.js, preload.js, package.json/lock, patches/, scripts/, .github/, assets/, resources/, public/, index.html, vite.config.js or tsconfig.json. This describes exact currentac19, not future main movement or a waiver.

All16 paths2d5772→held4ac are exactly the two investigation docs plus14 harness scripts, NOT production/build/postinstall/package/lock changes. package.json and package-lock.json have IDENTICAL Git blobs at currentac19, oldpackage2d5772 and held4ac: ea85d9ee18a09ecb2724bdd082396c3a9f2b21b4 / a38259b66ddfbcf07201e55ad0443b0998708023. The harness scripts are not called by the actual package build/postinstall scripts: actual scripts are build=`vite build`, postinstall=`patch-package && node scripts/patch-onnxruntime.js`; that root patch script is unchanged in these comparisons. Harness effects/qualification still matter to native evidence.

Actual package build.files at ac19 (unchanged package bytes) is `main.js`, `preload.js`, `main/**/*`, `dist/**/*`, `assets/icon.ico`, `assets/tray-icon.png`. extraResources copies resources/**; asarUnpack lists onnxruntime-node/common, kokoro-js, phonemizer, transformers and @napi-rs packages. Vite configuration reads package.version and produces dist/. The integration's LibraryView and dependency-paginator patch affect renderer compilation/installed runtime even though generated dist is ignored/uncommitted and no tracked dist diff is available. Therefore **no tracked dist change is NOT a no-impact proof**. Exact fresh dist/asar/installed-patch/dependency/native inputs still need qualification/readback; equal source inputs do not establish deterministic package bytes, current native compatibility or the exact-current-main Rule53 gate. This audit claims NO package-unchanged exemption or qualification reuse permission. These exact comparisons inform Brain's per-branch versus one-unit decision only.

Read-only preview command actually used: `git merge-tree --trivial-merge e29117b2 ac19ea60 4ac4ff76`. It reported ONE `changed in both` section, BUG_REPORT; ZERO conflict-marker lines. Its displayed BUG-187 hunk changes OPEN to RESOLVED-in-source. This legacy preview produces a textual suggested merge, NOT an actual merge, resolved index/tree, commit hash, rename-aware modern ort proof or accepted semantic resolution. Do not describe “changed in both” as a proven conflict. No new merged tree was written. Full preview included large historical evidence contents and was not semantically read in full; only bounded path/conflict metadata and relevant BUG hunk were inspected.

Individual read-only previews against current main likewise had zero conflict markers: observer common base48f473c5a5a8ec28c705b6b957d73a2a4429995a, one shared changed path BUG_REPORT; visibility common based8a65cb41f4095a93eb7a198bd91939833c5ea0d, zero shared changed paths. Those are independent comparisons against ac19, NOT a simulation of the future sequential observer→visibility→display merges. Moved-main/new provider-governance publication can change this map; actual admitted reconciliation must rebind it.

| Product lane / execution surface | Exact application/test ownership carried by held tip | Constraints |
|---|---|---|
| Reader Engine; legacy A/B | `patches/foliate-js+1.0.1.patch`; `tests/foliateObserverPatch.test.js`; `tests/foliateDisplayLifetime.test.js`; `tests/foliateViewReadiness.test.js` | Observer first adds two destroy-disconnect lines; display's492-line patch extends the SAME patch path with disposal/display/currentness/anchor/load guards. One owner/integration slot for this shared dependency patch; no parallel observer/display writers, no patch replacement dropping disconnects. |
| Library & Content; legacy C/B | `src/components/LibraryView.tsx`; `tests/libraryCompletionVisibility.test.tsx` | One-line removal of the readingNow upper-wordCount bound at line245; engagement threshold3, sorting/filtering/persistence unchanged. APP-TABS later integrates visibility; no concurrent LibraryView writer. |
| Platform qualification + governance; legacy B/E |14 existing `scripts/foliate-display-lifetime/` files plus exact item evidence/docs | No generic runtime/source edits or broad governance import approval. Freeze full cumulative378-path inventory plus current-main preservation before actual merge. Many held additions are historical cloud evidence/agent/governance files; a source-only six-path account is NOT the full Git fence. |

All three shared-core freeze files (`ReaderContainer.tsx`, `FlowScrollEngine.ts`, `src/types.ts`) are untouched by the held application delta; keep them frozen. No sibling-runtime import/shared mutable store or Page/Focus/Flow/Narrate behavior redesign is proposed. Qualification still checks all modes because their Foliate dependency is shared. No main/preload/package.json/package-lock application change appears in the six-path application/test delta.

Harness files: `ab.sh`, `band-probe.js`, `cdp.mjs`, `census.mjs`, `ctrlopen.mjs`, `cycles.mjs`, `modes.mjs`, `owned91.mjs`, `ro-wrap.js`, `route3.mjs`, `route5.mjs`, `run.mjs`, `session.mjs`, `wait25.mjs`. Existing ab.sh hardcodes OLD output/fixture/model paths, bare `node`, ports and per-build labels. It is evidence of historical argv, NOT a launch-ready new command. A fresh spec must pin interpreter, exact inputs/paths/ports/output manifest, no-overwrite ownership and process closure; do not run that wrapper blindly into its old roots.

Docs-only BUG_REPORT conflicts, if an actual merge produces them, use the already ruled N-Q3 policy: keep main status lines plus branch-only new entries/resolutions. No global ours/theirs. The current legacy preview has no conflict markers, so no immediate unresolved source-conflict hunk is claimed. Any actual semantic source conflict, discarded patch hunk or unexpected path is STOP→Root→Brain; N-Q3 does not resolve production code, register snapshots or agent configuration. Historical2d5772 accepted theirs for then-ROADMAP/snapshot is not blanket authority for future conflicts.

## Raw complete-blob pins independently checked

The following complete blobs were read via binary `git cat-file blob` into memory and hashed, with no newline conversion. Body-read limits above remain explicit; hashing a complete test/patch is not claiming a full semantic review.

| Path at4ac4ff76 | Bytes | SHA256 |
|---|---:|---|
| investigation FOLIATE-DISPLAY-LIFETIME-1.native.2026-10-30.md |7654|`8127fedb3414ee97697868bd1b556916b16b3376956e38b8bfbb8b8bf7ffcfc2`|
| investigation LIBRARY-COMPLETION-VISIBILITY-1.package.2026-10-30.md |3720|`25ccb6b9108e3e618e73226dc346badf83c0cf28b15a6e315b1d6e10e8b6a5aa`|
| patches/foliate-js+1.0.1.patch |20234|`9e9c4ea2303c3a7d9705878e381153d347fc0e0b9635f75ffd9a34d75c4c34ca`|
| src/components/LibraryView.tsx |36915|`89f2a63c0ad782e078eb3fb9dab596f481e77dcb4e4b93c93f93adc64a3dbeec`|
| tests/foliateDisplayLifetime.test.js |32627|`742bf47d586488a6b3cf482dc4a7d8aa027e0d442737f5df068c47b19fcc944f`|
| tests/foliateObserverPatch.test.js |1751|`5eec09966a6eb935d6ec7b83400e103b5c069cab417a9d1cddd21589c8345002`|
| tests/foliateViewReadiness.test.js |5465|`aa174c378c6490fdc8b3afe6458e6157e2433362d099233150121bb804a17623`|
| tests/libraryCompletionVisibility.test.tsx |8828|`915dd91838886ca2c752274dac8f72f902d389d488f4b1b93b960667c0da90ad`|

Git blob IDs: patchcd80a0019c6283284aff606c5e028324d17e865f; LibraryViewb0fa7ba672b8c5342f8a361a31c816bfb55b9515; displaytest51e73dfb2197b4358e2f8332a94d2a4dcaabfc33; observertest1ef90dd6597d76396eaac5a889880b9346841de0; readinesstestf56708ef1a2d8e64dff9f857ef872308526dbabb; visibilitytest25ac4c97f1147033cea6d42cceb3bff35130f3d6. Native/package docs5ff4b30f9f514382f1637a7b2ca012f31b0a1d8e / cbae426b3db077a4c0bb648d8a588d54dd7824dd.

## Historical proof: usable inputs, not fresh eligibility

The complete native memo reports2d5772 based on e29117b2, x64 RodneySR and a separate observer-fixed/no-display control10332e5a. Native R1 session×5 plus R2 census/R3 four modes+five cycles/R4 owned91/R5 fresh defaults had candidate zero style-null and zero observer-loop lines; control had one style-null in R3, flooded base36ac had observer loops. Source gates report2523passed/1skipped/0failed, typecheck/build0; observer+display suites40/40. The later visibility memo reports67/67 targeted, grid/list All/Archive initial-state checks and91-token open/return/reopen. Historical ctrlopen1–4 regex failures are retained HARNESS failures, not app baselines; final fifth control reads91.

Native memo records x64+ARM64 directory packages with identical old app.asar SHA `c58a2b3aab023baac7acd2423de472cf9e82427757291d3996466edb86d532d9`; source/dist/patched paginator parity;25second x64 scratch launch, no error/crash, no force-stop/leftover, live hashes unchanged. ARM64 native launch is EXPLICITLY outstanding. Current mainac19 was not merged into that old package. Historical statuses/counts/hash cannot be reused as a fresh Rule53 PASS on an unbuilt integration candidate.

The uninstrumented original observer source package had a style-null line recorded without a pass mark. Visibility alone originally failed Rule53 on observer loops. These explain one-unit qualification and are relevant to the per-branch merge-mechanism decision below; do not suppress errors or declare each intermediate standalone branch package-clean merely because the combined package was clean.

## Remaining technical decisions for Brain — finite and source-specific

1. **Exact integration topology and per-branch Rule53 evidence:** does the declared one-unit route prepare/qualify a final combined current-main candidate, then issue three explicit ordered branch merge gos with an exact reviewed parity/ancestry mechanism, or qualify separately moved-main branch candidates at each step? Existing ruling requires EACH actual branch's moved-main reconciliation/package confirmation/go; it does not itself define a shared-package waiver. Observer alone has known historical style-null and visibility alone has observer-loop failures. Recommendation: preserve one coherent combined qualification unit, but ask Brain to specify the exact per-branch final commits, package evidence applicability and ordered merge procedure that satisfies Rule53 without pretending an intermediate dirty-error package passed. Do NOT choose/cherry-pick/squash/retarget or grant a per-branch exception here.
2. **Candidate/control and route applicability on moved main:** bind a same-main observer-fixed/no-display A/B control and final combined candidate or expressly accept prior causal source controls plus defined fresh packaged Done-when routes. Do not blindly reuse10332e5a/e291 as the current counterfactual or revert production to manufacture it. Old R1/L1–L7 native observation design was superseded by R-2026-10-30-1; portable51case coverage is not a requirement to revive parked Native observation. Freeze exact fresh route count/fixture/control/output and source fence before dispatch. This is technical qualification scope, no owner design reask.
3. **Actual future conflict only:** initial previews show no semantic conflict. If admitted modern merges find unexpected source/config/register/agent conflicts, Brain must rule exact hunks/fence; N-Q3 remains docs-only. Exact current aggregate path inventory/commit policy must be part of the source-entry recipe, particularly historical agent/cloud records, not a generic take-held-tree instruction.

Host identity/availability, full fixture/model/harness raw identities, tool/dependency custody, current source/dirt/locks, quiet test/build slot and ARM64 verifying host are factual missing inputs, not new design choices. The current ruling says ARM64 at merge; actual ARM64 placement/transfer must be named and verified rather than assume x64 RodneySR can launch native ARM64. Root/Brain already own the designated package confirmation and merge-go process. No speculative owner approval or CPU dependency is needed.

## Proposed bounded qualification planning cuts — not dispatches

These are dependent cuts within the EXISTING three-item stack, not new FIFO items. Each requires its own investigated Full Spec, WHERE/task rows/causal controls/finite output manifest, independent compliance-first then quality, current protected checks/provider facts, named quiet host/input custody and consumed Brain admission. Every wave≤60minutes/40aggregate calls (a smaller cut may be chosen); no automatic successor or shared clock. Duration below is a proposed ceiling, not an ETA/history estimate; stop PARTIAL if required gates cannot fit. Keep at least THREE genuinely queued fully specified registered items before actual implementation dispatch; these In Flight components do not themselves establish that queue depth or authorize status changes. Root must verify live depth and backfill specs if below3.

| Proposed cut | Prospective bound / exact outcome | Inputs and qualification obligations |
|---|---|---|
| Source-base preparation |≤45m/30calls; held exact reconciled source/graph/path receipts only | After Brain decisions, fresh remote-main/three-branch refs, full actual checkout/ownership/dirt/locks, explicit normal merge recipe and permitted docs resolutions, no source repair. Freeze complete actual staged tree and ordered parents, protected current governance+all required held blobs; actual detector/opposing controls before acceptance under SR44. No merge-to-main, dependencies/app/package launch or assumed tree hash. |
| Dependency + portable verification |Separate≤60m/40calls; actual command/source receipts on accepted exact candidate | Exact tool/dependency/script/patch admission and fresh own worktree; no blind npm ci over populated dependencies. `npm ci` only after fully reviewed ordinary install/activation route for this tree; verify foliate patch actually applied. Targeted commands below, full `npm test`, `npm run typecheck`, `npm run build` require exact argv/raw logs/counts and source unchanged. If dependency preparation plus checks cannot fit, split before admission; never omit checks or borrow PP2/Focus D0 allowance. |
| x64 directory package |Separate≤60m/40calls; package/source/dist/asar receipt plus25s x64 scratch launch | Quiet RodneySR actual x64 native host and exclusive build/package slot; final source with current-main reconciliation. Explicit `npx electron-builder --win --dir --x64 --publish never` only as a future spec command with pinned local launcher/deps. Fresh output path required; verify build.files/patched paginator/main/preload/dist identities and native module inputs. Actual LL-165 inspector proof before input, APPDATA/LOCALAPPDATA scratch, live-profile named files and broader required snapshot preserved; no error/crash/dump/leftover. |
| Native route evidence, split into finite A/B batches |Each separate≤60m/40calls; exact route/raw data and profile/closure receipts | Complete pinned fixture/archive and model pair plus committed harness; bounded exclusive fresh output names. Historic R1~329s×5 is ~27.4min PER build, ~54.8min for both before other routes/reviews, so do NOT squeeze10sessions+R2–R5/build/reviews into one60min wave. Use distinct admitted per-build R1 batches and a separate R2–R5/visibility batch if the final Brain-approved fresh matrix requires all of them. Full cross-batch identities held constant; any candidate change invalidates affected evidence. No genuine CPU profiling concurrently. |
| ARM64 package/static and native merge-time gate |Separate admitted build/transfer/launch cuts as needed, each≤60m/40calls | Explicit `npx electron-builder --win --dir --arm64 --publish never`; compare each asar/source/dist against ITS own build (do not require cross-arch byte identity merely because old pair happened to match). Transfer exact immutable package, source commit, asar/native hashes, fixture/harness and receipt to named actual ARM64 verifier; verify readback before25s native scratch launch/packaged Done-when. x64 emulation cannot substitute; owner machine only for separately admitted brief native verification placement. No assumed access or launch now. |
| Per-branch integration closeout and final RC |Separate admitted gates, not automatic | After exact applicable packages/routes/reviews/Marcus and Brain confirmation, Root issues designated ordered merge gos under the Brain-resolved topology, native ARM64 gate at each required merge. Main movement after qualification requires exact reconciliation/requalification, no generic docs-only exemption. Then SAME integrated RC undergoes all12 existing release requirements/full gate(1), applicable D3/D6/zero-crash and owner batched gate(2). Other smoke/train fixes keep their own dependencies; no three-branch package substitutes for final RC gates. |

Portable source command candidates from existing full contracts (freeze exact final executor/entry/argv in the eventual spec, no execution here):

```text
npx vitest run tests/foliateObserverPatch.test.js tests/foliateDisplayLifetime.test.js tests/foliateViewReadiness.test.js
npx vitest run tests/libraryCompletionVisibility.test.tsx tests/folderNoticeBanner.test.tsx tests/useLibrary.test.ts tests/saveLibraryMerge.test.js
npm test
npm run typecheck
npm run build
```

The test totals are actual results to collect, not mandated historical2523/67 counts. Full source/operator testing must preserve the library lv1–lv6 real-card oracles, observer disconnect tests and display/readiness controls; no surrogate filter/native claim from jsdom. Exact current tooling/Node2GiB/worker/resource/timeout/output integrity rules require final source-bound specification, not a new command permission from this audit.

## Placement, failure and non-claims

Sustained source preparation/dependency/test/build/native batches belong to quiet placement with Brain as sole scheduler; root everyday computer remains coordination/review. Transfer current exact refs/objects, published specs/rulings/lessons, manifest-bound owned fixture91/public-domain books, required model pair and qualified tooling to the declared executor WITHOUT borrowing other dirty worktrees/dependency trees or copying unknown private profiles. Existing archive fixture source55640bed/26-file SHA256SUMS and model hash prefixes04cf570c/2eccfc53 are historical pointers; recover full hashes/actual custody rather than prescribe prefixes. Current raw runtime artifact bodies remain uninspected and require readback/projection limits in the eventual receipt.

Source conflict/out-of-fence path, moved main, missing input, dependency/patch drift, harness error, failed package/positive control, live-profile difference, error/crash, unconfirmed process closure or exhausted budget => preserve candidate and all failures, STOP to Brain/Root. Do not delete/reset/stash/clean, suppress error families, reuse output directories, run retry-until-green, restore owner data without exact authorization, sweep Native processes or manufacture release eligibility. Finite corrective work requires explicit reviewed fence and remaining admission.

Applicable rules/lessons: actual source and byte identity (LL-090/068/137), lifecycle/current resource ownership (LL-031/109/169), causal actual-command proof versus native inference (LL-142/143/SR44), native scratch/profile proof (LL-165), Rule53/LL-167 packages on final current-main source, bounded phases (LL-134), independent raw-output integrity (LL-176), correct Python/JS/display-layer interpretation (LL-177). Current lesson statuses and any later guidance must be bound by final Root checks; this audit makes no mechanical U9/U10 PASS. No CPU measurement, parked NATIVE-PATH-ATTESTATION-1 clock/monitor, Business charter gate, source-freeze policy or release requirement was changed.

This audit establishes a finite technical path and exact remaining questions; it does not substantiate a2–4week ETA, launch a wave, accept the source or package, merge/push, change provider statuses/Seq, terminalize any item or claim owner acceptance. Only this new planning document was written.
