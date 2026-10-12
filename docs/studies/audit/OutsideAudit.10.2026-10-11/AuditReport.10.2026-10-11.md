# OutsideAudit.10 — Narrate removal and rebuild

Audit date: 2026-10-11 (America/Chicago). Source snapshot: `8ee49de3`. Package: `AuditPackage.10.2026-10-11.zip`, SHA256 `c0e210b722d824d3699a3a65a295d3f10ae55b0df894c85003a103a9b1e1c9e2`.

## A. Executive verdict

**Partially flawed. Keep the removal-then-rebuild direction, correct the removal's executable specification, and admit only a properly specified Phase 0 for the rebuild.** An exact lookup over a playback sample is a sound mechanism. It becomes an exact spoken-word cursor only if the table, word mapping, sample units and played PCM have been independently validated. The current implementation does not establish that premise.

The removal is substantially better specified than the earlier held drafts. It resolves retained diagnostics/tracing dependencies, moves legacy deletion into the correct wave, preserves the three reading-mode baselines, and explicitly retains migrated Flow preferences on code rollback. Remaining ingress, acceptance-command, smoke and restart defects prevent an unqualified dispatch-ready verdict.

The rebuild is honestly an epic stub. Absence of its new implementation is not a defect at this milestone. Its engine-proof experiment, however, lacks the contracts needed to decide its central question. The current patch has word/token correspondence weaknesses, and current consumer code can turn estimated timings into apparently trusted native timings. The package also omits the patch implementing its central timing feature.

### Frozen milestone and evidence scope

This is **design approval of the removal-then-rebuild strategy, including the removal's dispatch specification and the validity of the proposed engine-proof experiment**. It is not release authorization, executed removal acceptance, or acceptance of a rebuilt Narrate. Future pronunciation profiles, export, other voices/engines, device-delay modelling and other explicitly deferred features are score-neutral.

No application, speech model, audio playback, full npm suite, build, dependency install or live cloud account was run. Controlled evaluations of extracted source, a PowerShell parser, the closure checker and a disposable Git repository were used. Those establish the specific observations below, not whole-app behavior.

Three fresh reviewers received only the extracted package and the task. Timing and latency reviewers subsequently received explicitly labelled supplemental files from the same source commit. The coordinator has prior conversation history and previously reviewed the held removal plan. This report is useful technical audit evidence, **not fresh independent milestone authorization**.

### Assumption archaeology

| ID | Proposition | Classification | Evidence or cheapest resolving test |
|---|---|---|---|
| A1 | The packaged source corresponds to the named commit | Verified truth | All non-orientation file entries matched Git blob bytes at `8ee49de3`; no mismatches |
| A2 | The package contains every input needed to audit the timing producer | Falsified | It omits `patches/kokoro-js+1.2.1.patch` and `package-lock.json`; both were obtained separately with custody |
| A3 | Given a validated sample-indexed table, selecting the word at a playback sample can be deterministic | Verified mathematical proposition | Half-open intervals and explicit gap policy make the lookup determinate; this says nothing about table accuracy |
| A4 | The current Kokoro word table exactly matches spoken-word boundaries | Working assumption, unverified | Inspect actual token correspondence, exported tensor units and PCM, then compare with independently annotated speech |
| A5 | Native generation at the selected speed is supported | Verified input mechanism; performance unverified | Worker and supplemental patch pass numeric speed to synthesis; benchmark timing-enabled generation across all 25 rates |
| A6 | CPU Play and rate changes meet two seconds | Working assumption, unverified | Measure event-to-first-voiced-sample latency with cold/warm state and queue conditions recorded |
| A7 | Removing Narrate will preserve Page/Focus/Flow behavior | Working assumption about future implementation | Existing isolation and fixtures are inspected evidence; candidate replay, tests, build and owner smoke must still run |
| A8 | Every persisted settings ingress will normalize the removed mode | Falsified as currently specified | The retained `save-settings` handler bypasses the two proposed seams; an in-memory handler control accepted Narrate |
| A9 | The recorded base supports restart after publication | Falsified as currently specified | Disposable Git control reproduced the merge-base/trailer conflict after successful publication |
| A10 | The observed stalls and leads have one proved engine cause | Working assumption, unsupported | B0 observations describe several different events; source mechanisms require controlled isolation |

### Constraint classification

**Genuine technical constraints:** the table must describe the actual played PCM and use the actual tensor's units; unavailable timing must not be relabelled as exact; source boundaries and silence require defined semantics; concurrent audio cannot satisfy a unique speaking-word contract without a policy; persistence completion cannot be inferred from a void writer; a changing Git ancestry calculation is not an immutable base identity.

**Binding owner/project constraints:** remove Narrate now, retain dormant Kokoro and user assets, preserve Page/Focus/Flow behavior, preserve migrated Flow on rollback, retain the selected speed range and two-second target, and stop at the registered gates. These choices are revisable by the owner but are not silently relaxed in this audit.

**Revisable implementation choices:** chunk sizes, buffering, native generation queue discipline, cache reuse, where to run the producer probe, whether to begin the experiment before or after deletion, and the validation apparatus. The 30 ms observation precision is not itself proof of zero boundary error or an automatically authorized tolerance.

### Score custody

Scores are calculated from 28 status/evidence classifications with the fixed `reviewing-audit-readiness` rubric. Overall confidence is the calculated weighted result, not a separately assigned opinion. **Raw weighted score: 5.2/10. Applicable cap: 7.9/10. Final calculated score: 5.2/10. Milestone authorized: NO.** This is controlled-remediation status for the frozen design milestone, not a numeric assessment of an unbuilt product. The associated `AuditScorecard.10.2026-10-11.json` and `AuditScores.10.2026-10-11.json` contain the classifications and mechanical result. The decision is withheld regardless of score while the named gates remain unresolved. No historical numeric regression is claimed.

| Gate | State | Evidence / scope |
|---|---|---|
| Authority/reproducibility | Yellow | Included bytes verified; producer/dependency inputs required supplement and installed model is unverified |
| Code/design convergence | Red | Settings IPC and Page-cycle promises conflict with source |
| Acceptance custody | Red | Exact command/counter and resume controls fail |
| Modeling closure | Red | Phase0 lacks independent reference, unit/identity and acceptance semantics |
| State/transaction integrity | Yellow | Existing writer completion is not awaited; no corruption reproduced |
| Migration/recovery safety | Red | All-ingress normalization and publication recognition are incomplete |
| Independent verification | Not applicable | Internal coordinated audit; fresh analyst inputs do not authorize a runtime milestone |

## B. Current-state architecture summary

The renderer owns the thin router (`src/reader/useReaderModeOrchestrator.ts`) and separate Page, Focus, Flow and Narrate runtimes. Mode-owned lifecycle and brokered ports provide a useful boundary for removing one mode. `ReaderContainer.tsx` still hosts narration infrastructure and passes callbacks to keyboard and UI surfaces. These shell dependencies are correctly part of removal scope.

Current speech travels through `useNarration`, the Kokoro strategy, generation pipeline, segmentation and scheduler. The main-process engine delegates to a worker, which calls patched `kokoro-js` on CPU/q4. The worker returns PCM and an optional `wordTimestamps` field (`main/tts-worker.js:151-165`). Cache and Opus paths may substitute a different decoded waveform while reusing timing metadata. The production strategy uses native 1.0/1.2/1.5 rate buckets and renderer tempo processing for other selected rates.

The current cursor is not just `word = table(sample)`. It includes fallback timing weights, segmentation, waveform transformation, fixed cursor lag, word callbacks, truth-sync callbacks and interpolated progress. Current trusted timing subtracts 450 ms (`src/constants.ts:131-136`; `audioScheduler.ts:1007-1012`), despite stale comments describing 350 ms. These are code facts, not a measured attribution of the owner's perceptual defects.

Settings enter through startup, two cloud apply paths and the settings IPC handler. The proposed startup/cloud seams are a sensible extraction, but omit that retained IPC ingress. The atomic JSON writer is asynchronous, while `saveSettingsFn` discards its promise (`main.js:55-60,130`).

## C. Item-by-item audit

### NARRATE-REMOVE-1 — conditionally sound; specification corrections required

The objective and ownership fence are coherent. Preserved Kokoro/cache/model files are excluded from source deletion, and removing warm-up/cache initialization closes the inspected ordinary startup paths. The retained IPC handlers do not themselves initialize the engine on registration; removing fixed preload methods closes the inspected renderer routes. Unregistering every retained handler is optional hardening, not a demonstrated requirement of the agreed dormant posture.

The migration design changes only removed mode values, preserves other settings and supports the accepted downgrade behavior. A modeled v13 append run through the packaged migration runner preserved unrelated keys and was repeat/downgrade-idempotent. This is design support, not acceptance of an implemented v13 migration.

A heuristic retained-import check found no retained importer outside the declared edit sites. The actual removal tree has not been produced or typechecked. G4 byte stability, removal completeness, app startup and owner smoke remain future acceptance obligations.

The item must close findings F4-F7 below before its full-spec label is treated as dispatch authorization.

### NARRATE-REBUILD-1 — sound arithmetic direction; engine premise and experiment incomplete

The separation contract is a suitable foundation. Native selected-speed generation removes the existing time-stretch correspondence problem, and fail-closed behavior for missing timing is the right direction. One clock owner and a validated table can prevent much current cursor coupling.

The stub correctly gates implementation on Phase 0. It does not yet specify a sufficient experiment, word/token identity law, tensor-unit contract, silence policy, atomic rate-change handoff or stale-job resource policy. Those belong in the epic charter before implementation. The absence of a rebuilt runtime is expected; the absence of a decision-quality Phase 0 protocol is a current planning gap.

Kokoro is not rejected by this audit. A broken local adapter, missing dependency, wrong unit conversion or faulty measurement harness is not evidence that the speech engine is incapable. Repair/classify those failures before interpreting them as a bake-off trigger.

## D. Major contradictions and finding ledger

| ID | Severity | Finding | Primary coordinates | Effect |
|---|---|---|---|---|
| F1 | High | Original package omits the timing-producing patch and dependency lock | `package.json:27,123`; `main/tts-worker.js:157-164`; package inventory | A package-only auditor cannot establish the central producer implementation or installation identity |
| F2 | High | Current word timing does not establish exact correspondence; estimated tables can be marked trusted | `segmentKokoroChunk.ts:106-112,142-151,170-189`; `audioScheduler.ts:473-506`; supplemental patch:7/14 | Native-looking metadata may be a weighted estimate; rebuilding around the old trust predicate would violate the central requirement |
| F3 | High | Phase 0 lacks independent truth, unit/identity and latency/handoff contracts | `ROADMAP.md:680-706`; held storyboard A1/A8 and F2-F5 | A test can confirm its own modelled table while failing spoken-word alignment or the owner's interaction target |
| F4 | High | Retained `save-settings` IPC bypasses claimed normalization at every ingress | `main/ipc/state.js:22-40`; `preload.js:44`; `ROADMAP.md:348-353` | Current-schema settings can persist Narrate after the proposed seam tests pass |
| F5 | High | Acceptance checks contradict prescribed code or the documented shell | `ROADMAP.md:229,249-250,261,291,359,473` | Correct scoped implementation cannot satisfy all stated gates |
| F6 | High | Resume recalculates the base from moving publication ancestry | `ROADMAP.md:617,622` | A successfully published branch is rejected before the already-published path; integration can also change the calculated base |
| F7 | Medium | Save invocation is presented as completed persistence | `main.js:55-60,130,289-293`; `ROADMAP.md:239-246,473` | New tests do not prove durable normalization; existing fire-and-forget writer semantics remain |

### F1: package completeness and supplemental custody

The ZIP has nine outer entries, 756 non-directory entries across sub-zips, and 755 unique extracted files. Included non-orientation bytes match `8ee49de3`. File-count differences between ZIP entry counts and the manifest are directory entries, not missing files from those declared groups.

Nevertheless, `postinstall` applies `patch-package`, and word timestamps depend on that patch. The original package contains neither it nor the lockfile. The coordinator obtained these exact-commit supplemental files:

- `patches/kokoro-js+1.2.1.patch`: SHA256 `9f1af5fd98ba93e826e681c820bfa7fddf26167a1542a04eaec7cc5a318ab786`.
- `package-lock.json`: SHA256 `76e4a4362442497cdff8137187cd6852fcccf57ea388011feca16c527f05a3e0`.

The package also excludes its imported icon asset. Running the exact embedded closure checker against the extracted package returned exit 1 with three references to the same missing `blurby-icon.png`. This is an exclusion/reproduction limit, not a deletion defect in canonical source. Model binaries, recorded audio and EPUBs are explicitly absent. Build and audible-root-cause reproduction cannot be inferred from the ZIP.

### F2: native tensor is not automatically an exact word table

The supplemental CJS and ESM patches expose optional durations and attempt word alignment. Their timing functions agree statically. `_alignWordsToTimestamps` phonemizes each supplied word independently, ignores its supplied full phoneme sequence, and checks only an aggregate token-count difference of at most three. It assumes a BOS token, per-word spans and one separator. `computeWordTimestamps` checks finite/monotone times and total-duration drift bounded by the smaller of 40 ms and 5%.

Equal aggregate length does not prove interior boundaries. Two tables covering one second can put an internal boundary at 0.4 s and 0.7 s, respectively, while satisfying identical total-length and monotonicity checks. The correspondence must be demonstrated using the actual utterance token sequence used by synthesis.

Two supplemental/external conditional defects deserve explicit Phase 0 checks:

1. The current primary upstream tokenizer at revision `1939ad2a8e416c0acfeecc08a694d14ef25f2231` wraps each sequence in two special tokens. The patch counts full per-word token-array lengths. If the installed tokenizer follows that contract, ordinary n-word spans overcount by 2n; aggregate rejection or token underrun follows. This has not been run against the installed tokenizer.
2. The patch hardcodes 256 samples per duration bin. Current upstream `KPipeline.join_timestamps` describes 600 samples per `pred_dur` frame at 24 kHz. The actual exported model tensor—not a guessed hop—must determine conversion. Current upstream is context, not proof of the installed model's output semantics. See [tokenizer](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/blob/1939ad2a8e416c0acfeecc08a694d14ef25f2231/tokenizer.json) and [timestamp implementation](https://github.com/hexgrad/kokoro/blob/main/kokoro/pipeline.py).

The packaged consumer defect is unconditional: when native timestamps fail, segmentation creates a weighted fallback table. The scheduler treats a structurally valid table as trusted and labels telemetry `kokoro-duration-tensor`. Provenance and acoustic truth are therefore not enforced by the existing trusted predicate.

### F4: settings IPC is a third ingress

The actual registered `save-settings` handler was evaluated with in-memory dependencies. Applying both mode fields as Narrate to schema-13 settings and firing its captured debounce produced a saved Narrate value. TypeScript narrowing does not validate a raw JavaScript IPC payload. Add this handler to edit sites and normalize its merged state before readers or the queued save observe it. Test the actual registered handler and preserve unrelated keys.

Library import is not another confirmed settings ingress: it imports documents and ignores exported settings (`main/ipc/library.js:480-514`). This audit does not inflate the finding by counting that path.

### F5: exact acceptance repairs

- The specified `applyCloudSettings(ctx, data)` declaration plus two callers yields three literal `applyCloudSettings(ctx` matches, while line 249 expects two. Its body necessarily contains one `Object.assign(settings, data)`, while line 250 expects zero. Verify two call statements and one assignment inside the helper, with no other assignment sites.
- PowerShell parsing of line 229 split the intended regex into separate arguments. Line 261 produced `The string is missing the terminator: ".` Use PowerShell single-quoted literal regexes and distinguish ripgrep's no-match exit 1 from error exit 2. An error with empty stdout is not a clean census.
- D15 and smoke 16(f) say Page Shift+Space enters Focus/Flow. `ReaderContainer.tsx:889` supplies distinct cycle callbacks; keyboard line 249 invokes `cycleMode`; orchestrator lines 150-154 change only `lastReadingMode`. Amend the smoke to assert that Page remains active while its remembered-mode marker changes. Changing the Page routing instead would require an explicit behavior scope change.

### F6: post-publication recovery counterexample

A disposable repository outside the project was created with a base, C1-C5 commits, the recorded base trailer, and a successful no-ff publication merge. The branch was an ancestor of remote main, yet `git merge-base branch origin/main` returned the branch tip rather than the original base. The trailer equality check failed before the recipe could reach its n=5 publication recognition.

Read the immutable base from C1's validated trailer. Verify it is an ancestor of the branch; do not derive it anew from moving main. Recognize successful publication before attempting unfinished-work classification, with tested publication/evidence identity retained. Extend controls to main advancement, integration, merge-before-push, and interrupted close-out. Preserve all work on any mismatch.

### F7: persistence limit, not a new corruption claim

`writeJSON` waits for temp write and rename, but its wrapper returns undefined. A controlled deferred-write evaluation showed `await saveSettingsFn()` resumed after write start, before write/rename completion. The proposed synchronous clone sink demonstrates the object handed to the writer, not completed persistence. Either make the relevant writer contract awaitable and test failure/completion, or limit the claim to normalized save submission and explicitly define its durability boundary. No new corruption caused by removal was demonstrated.

## E. Sequencing analysis

Separation before removal is correct and complete in the supplied records. The removal runs alone over the shared-core freeze set. The timeout and e-ink fixes are file-disjoint from Narrate and need not wait for this audit, provided their own gates remain valid.

Live connector read at `2026-10-12 00:02:52 UTC` / `2026-10-11 19:02:52 CDT`: 73 items, no next page, four identified Queued/Full Spec items—timeout, e-ink, library/settings and removal. Rebuild is Blocked/Stub. Thus the earlier two-item queue deficiency has been backfilled at this observation. If those three prerequisites close without further backfill, only removal remains queued; Rule 5a then still stops dispatch. Blocked followers do not count. This is an operational obligation, not a reason to force premature rebuild specifications into a ready state.

Two viable paths:

| Path | Gain | Cost / assumption |
|---|---|---|
| Correct and complete removal, then run a scoped raw-engine Phase 0 | Honors the owner decision and stops exposing broken Narrate | The preserved engine/probe must remain usable without reopening renderer paths |
| Prepare/run a narrow producer experiment before large deletion | Captures current producer identity and can falsify units/mapping cheaply | Requires a bounded isolated experiment; must not drift into fixing old Narrate |

**Recommendation:** retain the approved removal sequence after F4-F7 corrections. Prepare the Phase 0 fixture/identity/protocol work in parallel where file ownership permits. Require its result before new Narrate implementation. Do not prolong old-runtime patching merely to obtain a baseline already known to be unwanted.

## F. Structural and modeling review

### What the arithmetic can prove

For a chunk with validated PCM sample rate r and source-relative sample intervals [s_i,e_i), the word at sample p is the unique interval containing p. In a gap there may be no spoken word; the highlight policy must explicitly say whether to hold the last word or show no active word. Do not assign silence to a guessed next word. Zero-duration punctuation, expanded numbers and source words containing several spoken tokens also require a source-to-spoken-token identity map.

The [upstream model](https://github.com/hexgrad/kokoro/blob/main/kokoro/model.py) uses rounded predicted durations to construct an alignment used by synthesis, with speed entering duration computation. That supports deterministic model-internal timing as a promising primitive. It does not independently establish the local patch's word grouping, tensor scale, vocoder boundary convention or the played-waveform identity.

### Current transformations that the new contract must avoid or account for

| Path | Established issue | Required rebuild contract |
|---|---|---|
| Independent per-word phonemization | Counts can differ from full-context synthesis tokens | Derive/validate mapping against the exact utterance token stream |
| Weighted fallback timestamps | Estimated timing becomes apparently native | Explicit provenance; missing/unverified timing never plays with a trusted cursor |
| Tempo stretching | Per-window shifts occur while timestamps are globally divided | Native selected-speed PCM; any future transformation needs its own exact map |
| Segmentation and joins | Gaps and offsets can change | Table describes final PCM after every operation, including silence |
| Crossfade | Current scheduler overlaps segments by 14 ms | No overlapping voiced samples under the one-speaking-word requirement |
| Opus/cache | Padding and no recorded original-length/lookahead compensation | Validate decoded PCM/table identity or use raw PCM first; preserve old cache without trusting it |
| Cursor/handoff clocks | Lagged comparator and raw-clock truth paths differ; segment ceiling is not word-at-sample | One committed sample/word authority for cursor and handoff |

The package establishes these mechanisms. It cannot assign their relative contributions to the B0 cursor-lead observation. H4's distorted 15-second rate change explicitly lacked overlap; H6 described possible overlap on converted content. They must not be collapsed into one proved cause.

### Speed-change commitment

If old speech continues while replacement speech is generated, a word captured at request time may already have played on arrival. If old speech stops, generation can introduce a gap. Define the old final sample, next unplayed word, partial-word policy, replacement epoch, allowable gap and timer origin. Test rapid/coalesced requests and stale jobs. Removing tempo stretching is useful, but does not by itself solve this race.

## G. Testing review and validation architecture

### Removal acceptance

1. Correct the exact shell commands, count assertions and Page smoke.
2. Add the registered settings IPC path to normalization and omission controls.
3. Verify normalized write completion or explicitly bound save submission semantics, including writer rejection/interruption.
4. Exercise immutable-base restart scenarios, including already-published work.
5. Run the actual removal candidate's typecheck, full tests, build, import/IPC/packaging census and unchanged Page/Focus/Flow replay. Do not rebaseline.
6. Record owner smoke on the built candidate at a nonzero saved word. Verify the integration tree, not only the sprint branch, before publication.

The revised scanner closes the previously missed side-effect import form. Its extra `vi.mock` matcher is still regex-based; add lookalike string/comment negative controls for that form before claiming strings/comments can never count. This bounded apparatus issue is separate from actual missing package assets.

### Minimal testable proposition

**Can the pinned raw engine produce the actual played PCM and a provenance-bearing word table whose independently checked boundaries satisfy the declared error bound, while the complete interaction path meets two seconds under the specified operating states?** One valid utterance does not establish the whole product range; one failure can identify the first missing dependency or falsify a specific capability claim.

### Phase 0 gates

| Gate | Required observation | Failure disposition |
|---|---|---|
| P0-1: identity and output availability | Hash model/tokenizer/library/patch; record CPU/OS/architecture/runtime; inspect actual model output names and duration tensor | Infrastructure/producer-availability issue; no exact-timing claim |
| P0-2: correspondence and units | Record full normalized text, source-word mapping, phonemes/token IDs, special tokens, durations, PCM samples/rate; establish sample conversion from actual output | Repair local mapping/export/unit defects; do not automatically blame the engine |
| P0-3: independent acoustic check | Two short passages at 0.8,1.0,1.4,2.0x with numeric expansion, punctuation, repeated words and boundaries; annotations independent of the table | Report per-boundary signed error, uncertainty, max error and coverage; reject circular validation |
| P0-4: selected-rate capability | All 25 rates, timing-enabled generation with words supplied; valid and invalid cache cases | Unsupported rate/quality/table condition blocks its claimed range |
| P0-5: latency and responsiveness | Cold worker with local assets, warm worker, idle-unloaded, valid/invalid cache; click-to-first-voiced-sample and request-to-new-speed; backlog and CPU/memory/renderer responsiveness | Keep failed cold/warm cases visible; a mean under two seconds is insufficient |
| P0-6: atomic playback | Click mid-word, pause/resume, adjacent/extreme and rapid rate changes, section/chapter crossing | No dropped/repeated content, overlapping voiced samples or stale-owner cursor |
| P0-7: negative failures | Missing/misaligned table, wrong PCM identity/rate, zero/invalid durations, worker crash/hang, stale result, section load failure | No unverified chunk playback; explicit status, stable anchor and recoverable ownership |

The owner's two-second target remains intact. A1 and F5 need an explicit decision about cold/loading scope: unconditional two seconds and an unbounded "once ready" exception cannot both define the same guarantee. Do not restart the timer at readiness or silently waive a cold failure.

The draft's approximately 30 ms recording precision must not be confused with proof of exactness. If the accepted boundary tolerance is 30 ms, measurement uncertainty must fit inside that bound; otherwise the result is inconclusive. Define annotation conventions for silence/coarticulation and distinguish source/table correctness from display-frame scheduling and device output delay. Device-delay modelling remains out of scope; use a controlled documented output route for the audit experiment.

Latency must include normalization, per-word phonemization, timing extraction and transport. A waveform-only benchmark omits production work. Record every failure and measured sample; use repeated trials and report tails/worst observed cases rather than presenting a small sample as an all-case guarantee. Bound corpus/maximum chunk size before making service guarantees.

### Validation cost-benefit

The first producer/output/token/unit checks are narrow and much cheaper than implementing a new runtime around an invalid table. Real owner-machine synthesis, latency and annotated-audio validation require an instrumented harness and owner participation; no measured duration for that work is available. Estimate and timebox it during epic authoring rather than presenting an invented completion time. Preserve the raw experiment evidence outside user profiles.

## H. Top risks

1. **False timing truth:** a valid-looking table can describe an estimate or the wrong tokens/PCM, causing the rebuilt cursor to reproduce the central defect.
2. **Undecidable Phase 0:** a circular or low-precision comparison can green-light a bad adapter or initiate an unnecessary engine bake-off.
3. **Rate-change race/backlog:** client-side invalidation does not cancel native work; old and new playback commitments can diverge.
4. **Executable removal gates:** correct work may fail bad commands/smoke checks, forcing unauthorized improvisation.
5. **Recovery after publication:** the moving merge-base check blocks recognition of work already landed.
6. **Settings and persistence:** a retained IPC ingress can bypass normalization; writer completion is not currently awaited.

These are risks tied to source or demonstrated controls. No release-level data corruption, secret exposure or actual rebuilt-audio failure is claimed.

## I. Missing work

- Add missing patch/lock custody to the auditor hand-off, and document excluded asset/model/audio reproduction limits.
- Correct F4-F7 in the removal spec and refresh/read back its registered item through the governed workflow.
- Define Phase 0 output identity, word/token/sample law, independently annotated reference, uncertainty/error policy, corpus/rates and cold/warm latency scope.
- Define atomic playback ownership, next-unplayed-word handoff, stale-job resource bounds and failure taxonomy before chartering the new core.
- Implement and execute those accepted experiments; then select Kokoro or a bake-off based on classified evidence.
- Preserve user-owned cache/model/settings and the three baseline fixtures throughout implementation and rollback.

## J. Proposed revised plan

### J1 — Correct removal specification

Planner/reviewer: include settings IPC normalization; fix acceptance commands and counters; preserve Page's preference-only cycle; use the immutable C1 base and recognize publication safely; clarify save completion. Gate: exact proposed edits satisfy their own source/gate checks and restart controls. This does not authorize coding in this audit turn.

### J2 — Complete the admitted removal

Implementation agent, after registered prerequisites and queue gate: execute the specified waves in isolation. Run candidate and combined-tree verification, preserve unrelated work, and obtain owner smoke before publication. Gate: Narrate is absent, Kokoro is dormant, user assets remain, and Page/Focus/Flow acceptance passes without rebaselining.

### J3 — Establish the engine proof

Experiment owner: execute P0-1/P0-2 first, then acoustic/rate/latency/ownership tests. On infrastructure/adapter failure, repair or clarify that layer and rerun; on genuine engine inability under the verified contract, invoke the bake-off. Gate: a recorded, independently assessable verdict supports the chosen engine and operating domain.

### J4 — Charter and build the new Narrate

Planner: turn the validated word/sample law, atomic handoff and failure behavior into exact module contracts and acceptance fixtures. Implementation follows only after that charter is admitted. Keep the simple first version on raw native PCM with validated timing unless a transformed/cache path has equivalent proof; preserve old cache without playing unvalidated entries.

## K. Final recommendation and scores

**Proceed with bounded specification remediation and a validation-first rebuild strategy. Do not dispatch removal from the present specification or certify the central word-timing assumption yet.** Confidence is high in the demonstrated source, shell and recovery defects; acoustic exactness and CPU latency remain explicitly unverified.

Numeric scores and gates are generated in the adjacent score files; the scorecard fixes this milestone and excludes missing future implementation from release penalties. Its seven dimension scores plus calculated overall satisfy the requested eight reported dimensions. The worksheet records all 28 classifications. No independently assigned overall confidence, arbitrary deductions or comparison to an incompatible earlier audit is used.

The prior qualitative reviews identified and then verified corrections to retained imports, wave ordering, saved-mode interaction and rollback policy. Current findings include new controlled counterexamples and timing-producer evidence. This is additional evidence, not proof that implementation regressed. OutsideAudit.9's historical score used a different implementation scope/rubric and is not numerically compared here.

**Minimum closure set for the declared design milestone:** F4-F7 executable corrections; original-package producer/dependency custody; a complete, non-circular P0-1 through P0-7 protocol with owner-approved cold/error/measurement semantics; then fresh review of those exact revised artifacts. Actual runtime guarantees require the resulting experiment evidence and subsequent implementation acceptance.

### Calculated eight-dimension assessment

| Dimension | Score |
|---|---:|
| Grounding in current codebase | 5.5 |
| Architectural coherence | 5.4 |
| Correct sequencing | 5.6 |
| Modeling soundness | 4.5 |
| Extensibility | 6.4 |
| Testability | 5.2 |
| Delivery practicality | 4.6 |
| Overall confidence (calculated weighted result) | 5.2 |

### Fixed-rubric worksheet

**Grounding in current codebase**

| Subcriterion | Status | Evidence | Awarded | Citations |
|---|---|---|---:|---|
| artifact_completeness | red | inspected | 3.0 | MANIFEST.md:3; package.json:27; AuditReport.10.2026-10-11.md:F1 |
| code_schema_correspondence | green | inspected | 6.5 | main/migrations.js:259; ROADMAP.md:231; custody.json |
| runtime_reproduction | yellow | inspected | 6.0 | g0-owner-observations.json:H1-H6; AuditReport.10.2026-10-11.md:A evidence scope |
| divergence_disclosure | green | inspected | 6.5 | ROADMAP.md:676; AuditOrientation.10.2026-10-11.docx:9 Notes and limits |

**Architectural coherence**

| Subcriterion | Status | Evidence | Awarded | Citations |
|---|---|---|---:|---|
| authority_ownership | green | inspected | 6.5 | src/reader/useReaderModeOrchestrator.ts:346; src/reader/ports/createReaderPorts.ts |
| boundary_consistency | yellow | inspected | 6.0 | main/ipc/state.js:22; ROADMAP.md:348 |
| transaction_failure_semantics | red | attacked | 3.0 | ROADMAP.md:617; git-resume-control-result.json |
| governance_consistency | yellow | inspected | 6.0 | ROADMAP.md:205; ROADMAP.md:359; src/hooks/useKeyboardShortcuts.ts:249 |

**Correct sequencing**

| Subcriterion | Status | Evidence | Awarded | Citations |
|---|---|---|---:|---|
| dependency_order | green | inspected | 6.5 | ROADMAP.md:215; ROADMAP.md:696 |
| entry_gates | green | inspected | 6.5 | ROADMAP.md:611; board-readback.json |
| exit_gates | red | attacked | 3.0 | ROADMAP.md:249; ROADMAP.md:261; powershell-command-controls.json |
| migration_cutover_order | green | inspected | 6.5 | ROADMAP.md:465; ROADMAP.md:473 |

**Modeling soundness**

| Subcriterion | Status | Evidence | Awarded | Citations |
|---|---|---|---:|---|
| equations_units | yellow | inspected | 6.0 | AuditReport.10.2026-10-11.md:F2; supplemental-source/patches/kokoro-js+1.2.1.patch:7; external-primary/tokenizer-provenance.json |
| invariants_edges | red | inspected | 3.0 | src/utils/audio/segmentKokoroChunk.ts:170; src/utils/audioScheduler.ts:473; ROADMAP.md:698 |
| calibration_identifiability | red | inspected | 3.0 | ROADMAP.md:700; AuditReport.10.2026-10-11.md:G Phase0 gates |
| law_behavior_match | yellow | inspected | 6.0 | main/tts-worker.js:157; src/utils/audio/tempoStretch.ts:93; ROADMAP.md:688 |

**Extensibility**

| Subcriterion | Status | Evidence | Awarded | Citations |
|---|---|---|---:|---|
| versioned_extension_points | green | inspected | 6.5 | src/reader/modes/ReaderModeAdapter.ts; src/reader/ports/ReaderPorts.ts |
| migration_compatibility | yellow | inspected | 6.0 | ROADMAP.md:231; main/ipc/state.js:25; main.js:130 |
| single_authority | green | inspected | 6.5 | src/reader/useReaderModeOrchestrator.ts; ROADMAP.md:342 |
| change_isolation | green | inspected | 6.5 | ROADMAP.md:600; tests/readerModeBoundaries.test.ts:203 |

**Testability**

| Subcriterion | Status | Evidence | Awarded | Citations |
|---|---|---|---:|---|
| executable_commands | red | attacked | 3.0 | ROADMAP.md:229; ROADMAP.md:261; powershell-command-controls.json |
| deterministic_inputs | red | inspected | 3.0 | ROADMAP.md:680; ROADMAP.md:700; AuditReport.10.2026-10-11.md:G Phase0 gates |
| negative_attacks | yellow | attacked | 6.0 | ROADMAP.md:539; git-resume-control-result.json; removal-findings.md:R1 |
| evidence_custody | green | attacked | 8.9 | custody.json; supplemental-source/custody.json; board-readback.json |

**Delivery practicality**

| Subcriterion | Status | Evidence | Awarded | Citations |
|---|---|---|---:|---|
| prerequisites | green | inspected | 6.5 | ROADMAP.md:215; ROADMAP.md:611; board-readback.json |
| executor_autonomy | red | inspected | 3.0 | ROADMAP.md:249; ROADMAP.md:359; AuditReport.10.2026-10-11.md:F5 |
| operational_safety | yellow | attacked | 6.0 | main.js:130; removal-findings.md:R5; git-resume-control-result.json |
| milestone_readiness | red | inspected | 3.0 | AuditReport.10.2026-10-11.md:D finding ledger; AuditReport.10.2026-10-11.md:G Phase0 gates |

### Audit evidence locations

- Immutable extraction and byte custody: `C:\Projects\Blurby-artifacts\outsideaudit-10-review-cfc4a61a\custody.json`.
- Supplemental producer files and hashes: `...\supplemental-source\custody.json`.
- External tokenizer identity: `...\external-primary\tokenizer-provenance.json`.
- Reviewer evidence: `...\timing-findings.md`, `...\latency-findings.md`, `...\removal-findings.md`.
- Executed controls: `...\git-resume-control-result.json`, `...\powershell-command-controls.json`, `...\closure-package-result.json`.

Only new audit/evidence artifacts were written. Project source, roadmap, existing audit package, user data, project branches and remote state were not modified by this audit. The separate disposable Git fixture contains only audit-control commits.

Portable supporting evidence is saved in `AuditEvidence.10.2026-10-11.zip`: five logical sub-zips plus a manifest, six outer entries. The original audit package is unchanged.
