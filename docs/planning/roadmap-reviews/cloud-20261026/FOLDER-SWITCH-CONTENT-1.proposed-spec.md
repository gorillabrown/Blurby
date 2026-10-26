# FOLDER-SWITCH-CONTENT-1 — proposed execution contract
Date: 2026-10-26. Planning owner: durable cloud thread 01a17a3a-dcdb-7308-8560-3989bd32a015.
Status of this document: PROPOSAL FOR PARENT/BRAIN ADMISSION ONLY. Not execution admission or a change to the authoritative In Flight / Stub register state (packet ROADMAP Seq120).
Baseline: gorillabrown/Blurby published handoff 762d38ac53f22245a56f89e489ab367c905dcd91, updated by protocol-only descendant f299675dd8251e550f06ab47abb7c4b6ff1889f2 (publication branch starts at the descendant); source diagnosis reviewed d8a65cb41f4095a93eb7a198bd91939833c5ea0d.
Publication branch: eb/cloud-folder-profile-specs-20261026. This planning task writes only new reports beneath docs/planning/roadmap-reviews/cloud-20261026/.

## Goal, preserved findings and design authority
Implement the human's existing choice: during a folder transition show loading instead of old-folder cards. Preserve records, word counts, positions, archive/favorite state, recent-folder trust and four independent reading modes. Visibility remains the first application fix. This proposal neither approves reduced mode isolation nor changes account/device settings.

The approved diagnosis is not reopened: real useLibrary produced header B + old A IDs + loadingContent=false while switch-folder remained pending. Its completion control returned B IDs. Real createFolderSync proved a hung old scan reaches a 30,000 ms cancellation budget; the opposite settled-old-run control begins the next scan at virtual 0 ms. Its save interval is a throttle, not a mandatory 30-second delay: a fast one-file run broadcasts at 100 ms; the controlled slow-last-batch case broadcasts at 30,100 ms. These virtual-time results do not apportion the historical 93.2-second observation.

Separate work products: (P) transition presentation and ownership regression; (M) bounded phase measurement. M does not authorize a timeout, scan, batch, extraction, pruning or persistence optimization. A loading indicator is not a latency fix.

Technical authority: Blurby.Brain thread 01a179e8-7a40-75c0-93f4-d3045ad99027. No thread-read/send/wait_threads capability is exposed in this cloud session. The choices below are recommendations, not Brain rulings. Parent must obtain and integrate a ruling on the exact proposed revision before dispatch.

## Exact read order
1. AGENTS.md, especially technical authority, lanes, shared-core freeze and package holds.
2. .codex/agents/zeus.toml, now read at f299675dd8251e550f06ab47abb7c4b6ff1889f2, and cloud-startup-addendum.md. The initial commit lacked this TOML; the descendant resolves that startup issue. The planning worker acts within the original parent's delegated task; no application implementation is performed.
3. docs/governance/LESSONS_LEARNED.md: LL-143 (real base/candidate detector), LL-152 (comparable production routes), LL-158 (end-to-end folder workload), LL-159 (deferred writers), LL-165 (per-launch profile identity), LL-167 (package).
4. ROADMAP.md: full FOLDER-SWITCH-CONTENT-1, LIBRARY-COMPLETION-VISIBILITY-1, FOLDER-SWITCH-HEADER-1, LARGE-FOLDER-SYNC and APP-TABS sections; current lane/freeze/disposition.
5. docs/planning/cloud-handoff/2026-10-26/{README.md,upload-manifest.json,admission.json}. admission.json grants only the separate Foliate scope, not this item.
6. docs/studies/investigations/FOLDER-SWITCH-CONTENT-1.2026-10-26.md, unchanged.
7. Packet evidence at docs/planning/cloud-handoff/2026-10-26/evidence/parallel-investigation-20261026/: folder-hook-probe.cjs, folder-hook-probe-result.json, folder-phase-probe.cjs, folder-phase-probe-result.json, investigation-validation.json. C: paths inside these files are provenance; do not execute them unchanged in cloud.
8. src/hooks/useLibrary.ts (folder methods near 77–108 and mount/subscription); src/components/LibraryContainer.tsx (hook near99, filtering289, keyboard dispatch386–399, LibraryView659–665); src/components/LibraryView.tsx (props20–56, filteredLibrary132, loading357, empty state643 and card rendering).
9. main/ipc/state.js (actual select-folder/switch-folder); main/folder-sync.js (runFullSync80, syncAll160); main/folder-watcher.js; main/constants.js; main.js broadcast/save producers.
10. tests/useLibrary.test.ts, tests/folderSwitchWatcherFirst.test.js, tests/folderSync.test.js; actual package.json scripts and test setup. Re-resolve anchors at admitted baseline; stop on semantic drift rather than applying line numbers blindly.

## Lane and source/test fence
Current writes: these planning reports only. Future P proposal: Library & Content / UI Surfaces, exclusive serialized integration after visibility owner releases LibraryView. No shared-core touches under the narrow option.
Narrow candidate fence: src/hooks/useLibrary.ts; src/components/LibraryContainer.tsx; src/components/LibraryView.tsx; tests/useLibrary.test.ts; new tests/folderSwitchPresentation.test.tsx. Existing folderSync and watcher tests are executed unchanged.
Forbidden: application source in this task; during later P, all main/preload/settings schema/constants/reader runtimes, src/types.ts, dependencies/lock/build/package, import caps, subfolder picker, account/device choices, profile reset and queue operations. No clearing/pruning library to hide cards. No foliate patch or peer files.
A stronger backend contract requires a separately admitted expanded fence, not an opportunistic edit: main/ipc/state.js, main.js, main/folder-sync.js only if producer tracing requires it, preload.js and src/types.ts for typed IPC, tests/folderSwitchWatcherFirst.test.js plus new tests/folderTransitionOwnership.test.js. src/types.ts requires the explicit shared-core window. Brain must approve exact touched producer list after source tracing. No speculative expansion is admitted here.
Merge order: visibility qualified/released for integration -> separately admitted folder P -> separately measured M -> any newly justified optimization. Foliate cloud work may proceed independently on its own surface. No main merge or terminal status is authorized by this report.

## Brain gate F1: request admission and main-owned end state
Recommendation for review: serialize accepted renderer folder operations FIFO through one hook-owned chain, including Browse/select and recent-folder switch. Do not drop or coalesce user requests. Maintain newest requested presentation intent while loading; main operations execute in invocation order. A->B->C therefore invokes B then C, and final main state is C if both succeed, B if B succeeds and C is refused/canceled. Two Browse requests also serialize dialogs. This avoids inventing backend latest-wins semantics from a renderer token.

Alternative F1-B: permit concurrent requests and add main-owned sequence/request IDs so a newer accepted request invalidates old main commits, saves, watcher starts, sync publication and response. This crosses IPC/main/source fences and is more invasive. Renderer-only latest-token checks are insufficient: access() for B may finish after C and commit B in the real main handler.
F1-C: prevent further input until settlement. This alters interaction availability and requires human functionality approval; it is not silently selected.

Brain may accept F1-A or F1-B technically; any change to accepted-request semantics must be referred to the human. Until ruled, no implementation dispatch. Record exact end states for success/refusal/cancel/rejection and multiple windows/external initiators; if another producer can switch folders, renderer-only serialization cannot claim global ownership.

## Brain gate F2: snapshot and broadcast ownership
The current event carries an unversioned library array, not folder/run provenance. A request token protects a local promise, not an already queued library-updated event or an unrelated producer's getState. Do not infer run identity from sourceFolder string; A->B->A defeats that inference.

Recommended robust option F2-B: main-issued monotonic folder epoch plus per-epoch library revision on authoritative state, folder responses and broadcasts. Same-folder repeated requests still have distinct request identity; accepted main ownership epoch advances only at the defined main commit. Renderer compares producer epoch/revision, never wall time. On completion publish a matching state snapshot before clearing the loader; ignore older envelopes afterward. Preserve existing payload compatibility through an explicitly reviewed IPC change, not a silent schema assumption. Brain must rule on epoch issuance at acceptance versus actual folder commit, transport compatibility and the expanded fence.

Narrow option F2-A: serialize all actual producers, suppress/buffer unversioned broadcasts throughout transition, fetch authoritative state at the final queue barrier, and prove no older broadcast can arrive after loader clear using actual main broadcast scheduling plus Electron delivery. No timer/grace period is a proof. If that ordering cannot be established, this option fails admission; use F2-B. At present this proposal does not certify that proof. The narrow presentation fix can remain scoped as a partial repair only if Brain explicitly accepts that limitation; it cannot claim full stale-publication acceptance.

## Proposed presentation and cancellation contract
The following is exact proposed behavior contingent on F1/F2 approval:
- Dedicated transition state, separate from document/URL/drop loadingContent. Keep an internal monotonically increasing intent ID, mounted flag and current ownership record. A shared boolean with unconditional finally is forbidden.
- Mark pending synchronously before invoking switch IPC. Preserve optimistic new-folder header for a recent-folder switch. Browse is pending while its dialog/IPC is unresolved; do not invent a chosen folder before main returns it. Preserve existing approved header behavior.
- Retain the underlying library and persisted data. While pending, replace the card/list content region with the existing loading treatment and omit old cards, empty-library messaging and card actions from the DOM/accessibility tree. An overlay over still-interactive old cards fails.
- Container keyboard/open-by-index paths must not open an old card while the region is loading. Keep non-card app controls available according to current behavior; do not disable the entire application or redesign navigation.
- Only the current intent may set visible folder/library/error or clear pending. A completion for an older intent cannot publish a snapshot or clear the successor loader. Internal serialized operations still settle and continue the chain even when their presentation is superseded.
- On final successful IPC, obtain the authoritative matching state; atomically publish settings/library plus settled transition (React batched update or equivalent). Intermediate raw broadcasts never remove pending or expose mixed-folder cards.
- Refusal, Browse cancellation or thrown IPC rejection: do not restore an arbitrarily captured A snapshot after another accepted request changed main. Reconcile with authoritative main state under F2; preserve data and present the existing error/toast behavior for the current intent. Catch rejections so they neither strand the chain nor become unhandled.
- Failed getState is not successful reconciliation. Keep old cards hidden under an explicit failed/unreconciled transition and report the failure using the existing error surface; no retry timer or speculative persisted rollback. Brain must approve whether this existing surface is sufficient before dispatch; a new visible Retry/cancel workflow requires human design approval.
- Unmount invalidates UI ownership, unsubscribes and ignores later settlements; it does not pretend to cancel an already sent main operation. Queued-but-unsent operations can be abandoned with explicit canceled results; sent main operations retain their real durable outcomes. Remount always reads main state.
- Cancellation of an obsolete folder sync remains the existing backend generation/cancel contract. Do not shorten 30,000 ms, fake abort support in an uncancelable filesystem call, resolve IPC early or call an old promise canceled when it actually completed. No watchdog may clear loading while ownership is unresolved.
- Current ready-document progress/visibility and All/Archive/home/status filters survive unchanged. No folder-containment filter may silently discard manual/URL records.

## Production-path red/opposite controls and acceptance
Run the final detector version on the pinned pre-change source and candidate. Capture command, named shell, exact node IDs, source hashes, raw stdout/stderr and exit codes. Missing test/harness failure is not red. Mock only Electron promise/data boundaries for hook tests; execute actual hook, real React effects and real view/container handlers. Do not reimplement production filtering or transition algorithms in tests.

| ID | Required assertion / decisive red | Opposite or preserved behavior |
|---|---|---|
| fs-loading-pending | Actual hook pending B exposes dedicated pending immediately; actual DOM has B header, loading, no A cards | A data still retained; settle B and real state refresh yields B exactly once |
| fs-old-cards-hidden | Grid and list hide card DOM, card actions and keyboard-open path while pending | Both render and open B after settlement; manual/URL policy and filters unchanged |
| fs-loading-finish | Loader clears only after matching authoritative snapshot | Deferred getState keeps loader even after IPC resolved |
| fs-loading-refusal | Current rejected recent folder reconciles to actual main folder/data | Accepted recent folder still switches; no trust bypass |
| fs-loading-rejection | IPC throw and refresh throw do not create unhandled rejection or stale cards | Next accepted request still executes; no automatic retry |
| fs-select-cancel | Browse cancel restores reconciled state and ends its owned pending state | Browse success waits for sync, then publishes selected folder |
| fs-loading-race | A->B->C, both resolution orders at each allowed await; no old completion clears C | Exact main end state matches approved F1; do not fake impossible concurrency under serialized option |
| fs-aba | A->B->A with delayed B getState/broadcast cannot overwrite final A | Latest legitimate A update still appears |
| fs-event-owner | Deliver old broadcast before/during/after final snapshot, and reenter callbacks | Old envelope rejected under F2-B; current same-epoch newer revision accepted |
| fs-unmount | Unmount in IPC and getState gaps prevents UI writes/settlement leaks | Fresh mount reads real final main state |
| fs-import-independent | Folder settlement cannot clear unrelated content loading | Existing doc, URL and dropped-file imports still complete normally |
| ws-wait | Execute unchanged actual state IPC watcher-before-sync/wait tests | select/switch remain pending until real sync ends |
| phase-controls | Retain actual folderSync cancellation/interval controls, including late old run returning | Fast scan/broadcast and cancellation-before-cap still work; stale run does not prune new run |

For F2-A, fs-event-owner must prove actual producer ordering instead of manufacturing a tagged API. An injected delayed unversioned event after the barrier exposes the option's limitation; do not delete the case to pass.

## Measurement-only M contract
No optimization source writes. Use approved observation-only harness, actual createFolderSync/IPC/save/broadcast path, owned synthetic local fixtures; no Windows artifact script executed unchanged. Assign independent session/request/run IDs, monotonic clock and UTC correlation. Record cancel requested/settled/abandoned; scan start/end; listing/stat spans/counts/errors; batch start/end; first/last added doc; save requested/start/end; broadcast requested/sent; renderer receipt; first visible current-folder card. Distinguish requested vs durable save and requested vs delivered broadcast.

Control fixtures: one fast supported file; batch-size+one with delayed final extraction; old scan settles promptly; old scan remains hung through 29,999/30,000 boundary then returns late; unreachable root preserves existing library; at least one nested owned folder. Use virtual time for deterministic budget contracts, real monotonic time for process route. No owner Drive access in this cloud task. Any later Drive experiment needs authorized content access and cannot recover the original event's missing timing.

Every event includes source/package hash, profile identity, producer identity and request/run ownership where observed. Missing backend ID is recorded missing, not inferred. Overlapping phases are not blindly summed. No numeric user-perceived latency threshold is invented from the original 93.2 s. Brain admits a performance threshold only after controlled phase evidence.

## Bounded waves, failure handling and handoff
Each future wave targets fewer than40 tool uses; split before limit. At most two repair passes, then Brain:
A: fresh pins/lane/writer/register readback; F1/F2 ruling; integrate exact spec under parent ownership; establish immutable base and detector red/opposite controls. No source edit without all gates.
B: exclusive narrow P patch (or separately approved expanded fence), targeted actual-production controls, self-diff against fence; preserve all failed runs.
C: independent compliance/quality review, npm test, npm run typecheck, npm run build using actual package scripts; record baseline failures separately. No test weakening to pass.
D: later local native Windows ARM64 exact-candidate package qualification per standing holds, verified PID/exe/userData/getDataPath before input after EVERY launch, normal hashes/metadata before/after, errors/rejections/dumps and shutdown receipt. Instrumented controls are separate from clean routes. >=25 s native survival and package byte parity remain required; cloud cannot supply these receipts.
M: separate bounded phase-observation wave after admission; end with measured table and unresolved budgets, not a performance-fix claim.

Stop on scope drift, inability to reproduce decisive red, unreliable recorder, unowned source mutation, unreconciled main state, conflicting writers or unexpectedly changed functionality. Preserve user data and failed receipts. Rollback only admitted item source via a scoped revert, never profile reset/library prune.
Parent handoff must include exact proposal hash, Brain ruling for F1/F2, live item URL/Seq/status readback, integrated ROADMAP hash, admitted branch/source baseline, exclusive writer lease and native holds. Until then the CLI pointer is deliberately NON-DISPATCHABLE: FOLDER-SWITCH-CONTENT-1 / packet Seq120 / live URL and final baseline to be supplied by parent / proposed spec at this path. No main merge, release, source-freeze lift or terminal status.
