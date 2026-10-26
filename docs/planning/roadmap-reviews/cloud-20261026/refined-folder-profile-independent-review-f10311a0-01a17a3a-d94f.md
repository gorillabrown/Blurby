# Independent review: refined folder/profile planning at f10311a0

Date: 2026-10-26  
Independent reviewer: durable cloud task `01a17a3a-d94f-760e-8d37-5805cd713020`  
Repository: `gorillabrown/Blurby`  
Review branch: `eb/cloud-independent-review-20261026`

## Disposition

| Artifact / gate | Exact disposition | Bounded meaning |
|---|---|---|
| `FOLDER-SWITCH-CONTENT-1.proposed-spec.md` revision 2 | **APPROVE** | Approve as a portable planning contract for the already-selected F1/F2 design and as a source-trace/question set for F3. This is not source admission. F3 global-writer ordering remains an explicit Brain gate. |
| `PROFILE-QUEUE-ISOLATION-1.proposed-spec.md` revision 2 | **APPROVE** | Approve as a documentation-only future experiment contract. This does not qualify WPR, a parser, the clean package, the observer, a harness, native capture, or an application repair. |
| `FOLDER-PROFILE.handoff.md` revision 2 | **APPROVE** | Approve as an accurate non-dispatchable handoff for the two reports above. |
| `foliate-display-lifetime-1-cloud-entry-hold.md` at `16117282` | **WITH_CONCERNS** | No correction commit exists at review time. The previously identified `91-book` / `91-word` error and missing explicit normal sync-queue custody in final local holds remain open. |

These dispositions approve bounded documentation quality only. They do not state implementation-ready, native-qualified, package-qualified, merge-ready, release-ready, or terminal completion.

## Exact reviewed objects

Planner branch head: `f10311a0d8440bcf00c7a3a1a57be2e94601996e`, three commits ahead of the previously reviewed `460cd25dd37dbfd92e628c4756a364a604bb6a04`, with only the three planning reports modified.

| File | Report update commit | Git blob SHA-1 | Independently recomputed SHA-256 |
|---|---|---|---|
| `FOLDER-SWITCH-CONTENT-1.proposed-spec.md` | `07011a533ea4353765344eb5ec06b04b7bcc3937` | `298f154c63f4c2942b7b76ba1c1b30fc86114f4e` | `332fb3beaa2f39de2f33460de15654d1335a3acda0194c8641c0b457e263279c` |
| `PROFILE-QUEUE-ISOLATION-1.proposed-spec.md` | `523038a281b8a2e5c4806623b12b11d512ea004f` | `61abfd41463ee7282acbc38b57f0b18032f0e7a2` | `976362f48ef19082b8742aef597468b3a530fe34323bd2b774309c2fb7a03566` |
| `FOLDER-PROFILE.handoff.md` | branch handoff tip `f10311a0d8440bcf00c7a3a1a57be2e94601996e` | `c8c241a4ed5cc625dc9bbadef483354aef875e0f` | `e36c9344729c2e995d8b724149d7406e76806705d81898748edede8c5196ce2f` |

The report-declared SHA-256 values for the folder and profile specifications match independent decoding and hashing of the exact GitHub blobs. The reviewed production/test source remains `762d38ac53f22245a56f89e489ab367c905dcd91`; `f299675dd8251e550f06ab47abb7c4b6ff1889f2` remains protocol/docs-only.

Controlling independent matrices read before this review:

- `repair-blocker-review-16117282-and-folder-refinement-gate.md`, blob `a063268a18c1b50b29e580d4d3a0d803da3cb525`.
- `profile-refinement-review-gate-p1-p3.md`, blob `a99175d3c13b317b51e6c3a382ba47058755436a`.

## Folder contract findings

The revision replaces the earlier alternatives with the selected design:

1. One main-process FIFO is created outside a window/renderer and is shared by legacy and additive select/switch handlers. Admission assigns a distinct request identity even for the same path. Dialog, validation, commit, settings persistence, watcher start, real sync outcome and response construction remain within the queue turn. Failure recovery advances the tail without converting the failed caller's result into success.
2. The synchronous COMMIT boundary advances the main epoch even for same-path commits and changes no epoch for precommit refusal/dialog cancellation. It explicitly separates in-memory folder selection from later durable-save, watcher and sync outcomes.
3. Precommit and postcommit outcomes are different in the response schema. A postcommit failure remains committed and reports the actual selected folder/epoch; no renderer rollback or “reject means no commit” inference is allowed.
4. The additive preload/IPC contract names exact methods, channels and envelopes while preserving legacy `getState`, `selectFolder`, `switchFolder`, `library-updated` array shape and the existing settings sanitizer. `src/types.ts` is explicitly in the future typed fence.
5. `mainSessionId`, request ID, folder epoch and monotonic publication revision have distinct scopes. Snapshots are synchronously captured, deep-cloned/coherent and sanitized. Getter/event bootstrap is version-guarded; the new consumer unsubscribes from raw legacy arrays instead of treating raw and versioned events as coequal authorities.
6. The renderer keeps authoritative snapshot state separate from newest presentation intent. Cards, keyboard targets and seen effects remain excluded until the matching settlement/barrier is accepted, and an older result cannot clear a successor. Import loading remains independent. Postcommit or snapshot failure stays unreconciled on existing error surfaces with no new retry design.
7. The source trace names actual hazards in `main.js`, `main/ipc/state.js`, `main/folder-sync.js`, folder watcher/notice, preload/types, `useLibrary`, container/view/settings, startup and all separately found asynchronous/global writers. Checks occur at captured origin and immediately before effects, including after awaits; old work cannot be relabeled with a new epoch.
8. The test matrix exercises actual registered handlers/modules and includes cross-sender/remount FIFO, same-path ABA, pre/postcommit failures, immutable alias controls, session/revision barriers, delayed watcher/scan/save callbacks, legacy bridge preservation, DOM/keyboard/seen exclusion, independent import loading and existing cancellation boundary cases. It forbids a baseline red caused only by absence of the new API.

Source spot checks at `762d38ac` confirmed the documented anchors: current select/switch handlers are separate in `main/ipc/state.js`; current folder-sync generation joins by folder path; delayed scan/per-file paths mutate/save/broadcast after awaits; `rescan-folder` performs a whole-library replacement; dropped-file, URL and WebSocket conversion paths span awaits; cloud merge/force-download and content-hash paths can apply later; and `useLibrary` currently combines unversioned `getState`, raw `onLibraryUpdated` and local setters.

### Folder hold that remains

Section 6 correctly identifies F3 rather than silently claiming complete producer ownership. Brain must accept or amend exact semantics for obsolete rescan, drop/import provenance, detached conversion patching, cloud merge rebasing, force-download overlap and content-hash patching before a final writable fence or source admission. In particular, force-download ordering is explicitly OPEN. This open technical ruling is not a defect in the bounded planning artifact because the artifact makes it a hard non-dispatchable gate; it would be a defect if later receipts treated this approval as source authority.

## Profile contract findings

The refinement implements the relayed P1–P3 planning direction without fabricating host capability:

1. WPR/FileIO is preferred, but the relayed `wpr.exe 10.0.26100` / `tracerpt.exe` presence is explicitly not recorder/parser qualification. Exact executable path/version/architecture/hash/signature, OS, profile bytes/hash, collectors/providers/keywords/levels, buffer/logging mode, commands, parser/export hashes and actual host schema remain entry gates.
2. The FileIO contract requires process start identity, executable, thread, file object/key/IRP, canonical path/file identity, rename endpoints, outcome/status and complete create/write/set-info/replace/delete/rename/flush/cleanup/close coverage. PID/TID/file-object reuse and missing mappings remain UNKNOWN/INCONCLUSIVE.
3. Event loss is first-class: every session must report `EventsLost`, available buffer/log counters, warnings, parser unknown/decode errors, map gaps and unpaired operations; unavailable fields are null with reason, never zero. Nonzero loss or a target mapping gap blocks a no-write/isolation verdict.
4. Same-configuration controls cover quiet/no-call, equal-byte rewrite, actual temp-to-target atomic replacement, create/delete/flush/failed outcome and a second process sentinel. Filtering only the scratch PID is forbidden.
5. Instrumented scratch and clean packaged observations are separate under the same OS recorder. Every launch must establish actual PID/start/executable/isPackaged, userData, initialized data path and queue destination before input. A standalone forced queue initialization does not prove production startup.
6. The 120-second per-run schedule is fixed from recorder start through owned recorder stop, includes at least 25 seconds native survival, explicit no-input/same-value/different-value/durable-flush/quit phases, records cleanup overruns as failure/inconclusive and limits harness repair to two passes.
7. Normal library/settings/sync-queue metadata, hashes and identity are read-only, with current queue preserved. Raw ETL/export remains restricted local evidence; only a content-free index is publishable. Broader raw scope requires narrowing or an explicit ruling before capture. Unexpected normal-target writes stop input and permit shutdown only of the owned scratch process.
8. Historical writer identity remains UNKNOWN and the application repair fence remains empty until a real culprit is proven.

The cited Microsoft material supports the limited grounding claimed: ETW sessions can lose events and expose `EventsLost`; profiles determine collectors/providers/buffering; the FileIo family distinguishes create/delete/set-information/rename/read/write/flush/operation-end events; write events expose IRP/thread/file-object/file-key/requested byte count; and OpEnd can correlate IRP completion/status. The report correctly does not infer a qualified local decoder, destination rename field or complete built-in WPR profile from those generic schemas.

Primary references read:

- https://learn.microsoft.com/en-us/windows-hardware/test/wpt/sessions
- https://learn.microsoft.com/en-us/windows/win32/etw/fileio
- https://learn.microsoft.com/en-us/windows/win32/etw/fileio-info
- https://learn.microsoft.com/en-us/windows/win32/etw/fileio-readwrite
- https://learn.microsoft.com/en-us/windows/win32/etw/fileio-opend

## Repair correction gate

The repair branch still resolves to `161172823c1c0840ac3ada4bf4873582f00d6f68`; no correction descendant is available. Therefore its earlier **WITH_CONCERNS** disposition is unchanged:

1. Correct “owned 91-book visibility” to the required owned **91-WORD fixture route**.
2. In final local qualification holds, explicitly retain normal **sync-queue** custody/preservation/metadata/hash/attribution unknowns alongside library/settings.

No further network/dependency probe, source edit, test implementation or wait for a prohibited cloud repair is authorized.

## Preserved qualification holds

This review does not waive native Windows ARM64/owner-machine execution; exclusive desktop normal-profile custody; per-launch real PID/exe/userData/getDataPath/isPackaged; original full observer/census/four-mode/owned-91-WORD/product-defaults/onboarding routes; exact package/ASAR/dist parity; clean error/rejection/dump/shutdown evidence; or final Brain exact-package confirmation. Existing package **WITHHOLD** remains. No main merge, install, distribution, release or terminal completion is approved.

Direct cross-chat read/send/wait capabilities remain unavailable in this reviewer environment. Peer state is derived only from exact published GitHub refs and parent-relayed decisions, not an invented live monitor.
