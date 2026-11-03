# Independent delivery review — 2026-10-26

Reviewer: independent_delivery_review (Solon/Plato review roles). Read-only review of author outputs; no source, shared governance document, evidence, Git or provider mutation. No desktop/app launch. This review does not grant merge/release or terminal close-out authority.

## Folder transition investigation — APPROVED as a bounded diagnosis

Read the full report, hook/phase probes, results and production useLibrary, state IPC, folder-sync and JSON-store paths. The hook probe imports/transpiles the actual useLibrary implementation and uses actual React state/effects; only IPC promises/data and constants loading are infrastructure substitutions. It observes sourceFolder B with old-A cards and loadingContent=false, then observes new-B after the real deferred path completes. This establishes the missing transition-loading state rather than merely copying its predicate.

The phase probe executes actual createFolderSync with injected dependencies/virtual time. It observes hung-old-run cancellation at30000ms with a settled-old-run0ms opposite control. Its import controls distinguish a slow final extraction delaying first broadcast until30100ms from a fast single-file broadcast at100ms. The report correctly calls these controlled sequencing measurements, not elapsed Drive performance, and does not add two30-second constants to invent the old93.2-second budget.

The proposed presentation repair names actual hook/container/view sites, preserves persisted/library data and existing timeout/pruning behavior, includes success/refusal/rejection/stale/out-of-order tests, and explicitly retains the rapid-selection state-contract gate. Source repair and complete performance qualification remain future work. No material correction required.

## Profile queue investigation — APPROVED as a bounded diagnosis

Read the full report, queue probe/result, and actual state IPC, sync-queue and JSON-store. The scratch probe uses actual save-settings/flush, queue and durable JSON paths, replacing only IPC registration, window side effect and sync revision. WriteFile/rename guards cover the actual store operations and refuse targets outside its artifact root; sentinel and normal-file hashes are checked. No-call, identical-setting and changed-setting controls exercise opposite detector outcomes. The same settings bytes can be rewritten while a timestamped queue operation changes the queue; this is an actual production-path result.

The report explicitly distinguishes file-byte preservation from no-write isolation, application timestamp/filesystem mtime correlation from PID attribution, and supplied data-path correctness from actual startup-profile correctness. It neither attributes the original18:02 writer nor prescribes a queue reset/sourcefix without that evidence. Its per-relaunch PID/path receipt and OS/process recorder experiment is actionable and includes an owned positive control. OriginalPID remains unresolved; this is a justified historical evidence limit, not a reason to reject the bounded investigation. No material correction required.

## Evidence integrity

Independently recomputed all hashes in investigation-validation.json:7 production source files,3 probe scripts,3 probe results and2 reports exactly match. Source links resolve to the actual named symbols. Existing probe results were not overwritten by rerunning the scripts. Source inspection validates the detector assertions; no runtime timings were invented.

## Visibility code/test candidate0dd4d940 — APPROVED for scope, specification and code quality

Compared candidate0dd4d94026f2574f735031b2b1569aee09d17120 againstd8a65cb4. Exactly2 changed paths: src/components/LibraryView.tsx and tests/libraryCompletionVisibility.test.tsx. The sole production edit removes the upper wordCount exclusion from readingNow and preserves engagement threshold3, sorting, existing upstream tab/type/search filters and the notStarted partition. No Card, progress, IPC, schema, settings or mode code changes.

The179-line test file renders actual LibraryView and actual cards in grid/list with lawful Electron infrastructure stubs. lv1/lv2 cover91/91 All/Archive and data/callback preservation; lv3 covers91/92 reopen callbacks; lv4 covers missing/0/2/3/90/91/92 against known/zero/missing wordCount and grouping; lv5 uses actual status/type/search controls with inclusion/exclusion; lv6 rerenders progress/archive transitions. No copied filter or mocked card certifies the fix. The final Search helper opens the real search control. The reported12 base missing-card failures/6 controls align with the final18-case structure.

No material semantic, architecture or fence issue found. Package acceptance remains PENDING: worker is preserving earlier fixture-driver failures and completing valid91-word EPUB reopen/return evidence. Do not treat this code/test approval as package approval, merge go or release qualification. Governance review was not requested against a final committed tree yet and is outside this artifact at this point.

## Final visibility package evidence — behavior verified; strict package gate FAIL

Reviewed candidate-v3-package-result.json and baseline-v2-package-result.json plus the actual CDP driver assertions. The valid owned91-word EPUB is read through actual Foliate contents, opened, returned to the library in its actual resulting status, then reopened. Real grid/list All/Archive card IDs are asserted; rendering alone preserves fixture progress/archive fields. Existing completion policy archives the opened fixture on exit and remains explicitly outside this sourcefix. Earlier invalid legacy-fixture attempts were preserved rather than reported passed.

Candidate0dd4d940 survives26007ms; baseline36ac7466 survives26013ms. Each launch has an observed packaged nativeARM64 PID/executable/userData identity matching its separate scratch profile before interaction. Both receipts retain equal normal-profile library/settings hashes before/after process stop; that is content preservation, not a claim of no possible write. Both show no dump files and no captured rendererErrors.

The strict no-error-log assertion FAILS on both: candidate logs1465 instances and baseline1471 instances of the same exclusive family, `Unhandled: ResizeObserver loop completed with undelivered notifications.` Counts are observations, not tolerances. This supports pre-existing exposure but does not satisfy rule53 or create a new noise exception. Recommendation: approve the source/test delivery as BUILD-AND-HOLD; keep main merge/release and terminal acceptance held pending the designated technical ruling. No packagePASS is granted here.

Independently loaded actual @electron/asar from the candidate worktree and extracted21 renderer entries in memory; each equals both current dist and the parity manifest. The executable and app.asar whole-file SHA256 match asar-parity.json; archived main.js equals source and contains the profile override. The review command initially used assert.match with a string, a reviewer-only instrumentation error; corrected to an includes assertion and the complete independent hash/extraction command exited0. No package or source was modified.

## Governance current-tree review — static/protection APPROVED, finalization pending

Reviewed the16-action sweep report/current owned documents, approved registry preview, preservation manifests, source/parser and parity checks. Independently rehashed all426 original protected files and87 existing files newly covered by archive roles: all513 match their recorded pre-edit byte hashes. Rehashed all10 backup copies against manifest hashes: all match. Both original technical-reference sections2/5 are retained verbatim in the clearly marked historical appendix, while current asyncI/O/CSS/security invariants remain current.

Registry differences are exactly the previewed9 new roles plus governance-sweep as a board generator writer; no other existing role changed. Historical archive roles remain append-only with review/close-out writers; the sweep gains no archive/terminal mutation authority. New empty ChangeLedger accounts for the514th current protected target. The final findings store individually owns eight follow-ups; F-001 keeps seven evidence gaps open after64 metadata descriptions were applied. Metadata descriptions do not close statuses or change Seq.

The current report maps all16 approved actions, transparently notes12 actual pointer identities instead of the older11, records link/parity/4TOML/U9U10 and data checks, and preserves source-order/parser warning as a finding. No source files are part of its12-path authored commit fence. The report currently marks final board/commit work pending; this review is not a claim those steps have completed. Final named commit/path set and appended finalization will be checked when provided by parent.

## Governance named-commit final review — APPROVED

Verified final commit `60d11b4285447f6b1d9496a7564c0be911848906` on the governance branch. Its path set exactly matches the12 approved authored paths in owned-paths.json, excluding generated roadmap-board.html. No application source, preload, package definition or lockfile differs from baseline in this commit. The committed sweep report matches the current file and now marks actions14–16 complete with the parent-confirmed64-row readback,193-item snapshot2026-10-26T20:43:19Z, final registered board generation and exact-path commit-only handoff.

The report preserves the known single physical-order warning and the eight durable findings, admits unrun runtime/binary adapters, and reports free-space attribution as not computable rather than inventing a cleanup saving. No deletion, terminal/archive alteration or code/package acceptance is inferred. The parent's newer technical-routing steering is reflected consistently without waiving package/release gates. The governance deliverable is APPROVED for its authorized documentation/commit-only scope; merge/push remains outside that sweep approval.

## Package decision boundary after technical routing

The parent reports designated technical confirmation is withheld. The existing observer-leak repair must have its own admitted integration/verification window before a clean combined package can be claimed. This review grants no such window and no warning waiver. The candidate source/test and bounded investigations remain approved as delivered, while strict package qualification stays FAIL/HELD until the independently routed condition is satisfied.

## Explicitly admitted combined verification aa5f1485 — source/evidence APPROVED; overall package HELD

The new admission names base d8a65cb4 → visibility a8e31b73 (source0dd4d940) → observer51759276 and permits only an isolated integration/build-and-hold experiment. Reviewed combined source aa5f1485eb023ca232b5a8f8234ad6fdea51f2bb and that admission document. Relative to base, application/dependency scope is the already-approved LibraryView predicate, the existing20-line patch-package artifact adding the two observer disconnects, and their two test files. Other deltas are the specified admission/memo/timing/BUG187 source-status documentation. No mode runtime, teardown order, ReaderContainer, types, package definition, lockfile or new dependency change is present.

Clean npm-ci/postinstall/patch-package logs show foliate-js1.0.1 patched, and node_modules is a real Directory rather than a junction. The installed positive control observes both destroy() disconnect assertions fail on the real unpatched dependency; the candidate has both installed disconnects. The183-file suite reports2471 passed/2 skipped/0 failed. Typecheck/build succeeded per their logs. Source hashes/blobs of all4 approved application/test inputs match input-blobs.json and the named combined commit.

Independently extracted all21 renderer entries from the actual combined app.asar into memory and compared each to both dist and the parity manifest. Both exact patched minified destroy() fragments occur in the actual packaged paginator; archived main.js equals worktree main.js and includes BLURBY_USER_DATA_DIR. Whole executable/asar SHA256 match the manifest. An initial reviewer command expected the older parity-file key named path; the new manifest uses file. The schema-corrected complete command exited0; no source/package was changed by review.

### Original full uninstrumented route — PASS for the observer criterion

Session receipt329236ms names the correct nativeARM64 packaged executable/PID and own scratch userData before input, unchanged normal library/settings bytes, no dumps and zero total/ResizeObserver/style error lines. The original session.mjs hash matches its current bytes and comparability record; arguments include neither --minutes nor --instrument. The wrapper proves no __rvd instrumentation before or after. Actual observed route timing meets every required minimum: open15013ms, INTRODUCTION wait8023ms, Focus paused60032ms, Flow playing180228ms, final pause60011ms. The178 real cursor samples advance187→1069, while probes identify actual Focus/Flow view modes. A null sample list or failed click cannot satisfy the wrapper's assertions.

### Separate instrumented census — PASS for its named criterion

Census survives60835ms with zero total/ResizeObserver/style errors and no dump. Its wrapper injection is separate from the error-count session; the production session is not rerun instrumented as a substitute. The census reports4 live observers and4 concrete targets, with actual callbacks and a connected nonzero-size body. Zero invalid targets is non-vacuous. The wrapper only defines a manual leaked-observer intervention; this census never invokes that intervention. The actual Page→Focus→Flow route and original census script/hash are retained.

### Fixture/driver provenance and limits

Independently rehashed all6 comparability paths: recovered launch.ps1, original session.mjs, tracked and actual imported Meditations EPUB, current route driver and visibility driver. The tracked fixture Git blob is ffa271998c636c689761ac4eb5773dca92208bf0 at both51759276 andd8a65cb4; source/current imported SHA256 is8be2ab1e681bbde194ded5ba05ffcad218533fd98abfefa8a3af7d699a6c2beb. The original recovered launcher path/hash is included in comparability.json, and no claim is made that missing historical packaged/profile bytes were recovered. The current actual Meditations render has5293 INTRODUCTION words; parser total80479 describes the full book, not that section.

The current route driver explicitly seeds dark/page settings; source DEFAULT_SETTINGS uses blurby/focus. Therefore source-fixture/original-route provenance must not be summarized as byte-identical historical settings/profile conditions. This observation was sent to the parent for technical-routing accuracy; it does not invent a new baseline rerun requirement after Brain's stated acceptance of fixture provenance.

### Visibility91-word route — PASS for its named behavior

candidate-combined-package-result.json passes at26008ms with the actual combined aa5f1485 package identity, no renderer errors/error.log/dumps and equal normal-profile before/after hashes. It asserts real completed All/Archive cards in grid/list, render-only progress/archive preservation, actual91-word Foliate open, correct resulting archive/status card after exit, and actual91-word reopen. Existing reader-exit position90/91 and archived=true is recorded without relabeling the separate completion-confirmation feature fixed.

### Four-mode route — material package failure remains

The independently read modes receipt survives40079ms and proves actual Page/Focus/Flow/Narrate roots with5293 rendered words, but logs one `TypeError: Cannot destructure property 'style' of 'r' as it is null.` and captures the same exception over CDP. It explicitly records routeQualified=true and packageQualified=false. The clean session/census/visibility subroutes cannot erase this failure. The parent was alerted immediately. Recommendation: retain all four raw receipts, keep overall standing-rule53 package confirmation/merge/release HELD and route the remaining error to Brain under the existing admission boundary. No new patch, warning waiver, terminal acceptance or main merge is authorized by this review.

Owned91-word EPUB fixture hashes read independently for the handoff:
- C:\Projects\Blurby-artifacts\visibility-observer-verification-20261026\candidate-combined-profile\blurby-data\owned91.epub — SHA256 b00c16d45bcc1c0c5a1ac8f9242c19d7855972685208316215a18a3f1d5914b2



## Exact parent documentation publication audit

Reviewed publication-paths.json: 81 unique existing paths, comprising eight named documentation/snapshot files and 73 current-run provider recovery records. Primary HEAD is the approved governance commit 60d11b4285447f6b1d9496a7564c0be911848906. Manifest contains no application, test, patch, package, build, terminal ledger or additional style investigation path. All recovery records are resolved succeeded with successful confirmations: four authorized In Flight starts, 64 governance metadata reconciliations, five progress records. The sole prerequisites mutation is the Brain-directed visibility dependency on FOLIATE-OBSERVER-LEAK-1; no terminal status or Seq write appears. Current snapshot has 193 items, taken at 2026-10-26T21:00:18Z.

Parent review and issue update preserve original FAIL receipts and the combined strict four-mode BUG-222 hold; clean observer/session/census/91-word subsets do not become whole-package acceptance. Documentation publication is a separate parent authorization and grants no source integration or release. Both investigation reports remain bounded and preserve unknown historical attribution.

One minor machine-readable clarification requested before exact publication approval: validation visibility.blocker names the original BUG-187 ResizeObserver failure without a historical field label, and requiredTechnicalNextWork describes the original combined-route prerequisite despite captured current receipts. Rename those fields to originalBlocker/originalTechnicalNextWork, or explicitly distinguish current BUG-222 hold and next technical ruling. All other reviewed publication scope and claims are APPROVED for this documentation-only bundle. Repository independent-review copy should be refreshed from this artifact immediately before staging, as parent proposed.

Final publication disposition: APPROVED exact 81-path documentation-only manifest after independently verifying originalBlocker/originalTechnicalNextWork and currentBlocker/currentTechnicalNextWork distinguish historical BUG-187 from current BUG-222. Repository review copy matched the owned artifact before this final disposition append. Refresh that copy once more to include this approval. Strict package hold, original FAIL receipts, source integration prohibition and release/terminal completion gates remain intact.
