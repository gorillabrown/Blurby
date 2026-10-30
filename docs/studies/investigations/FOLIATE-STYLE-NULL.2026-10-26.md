# FOLIATE-STYLE-NULL — packaged callback diagnosis

Date: 2026-10-26. Scope: read-only diagnosis; no corrective source/configuration/dependency changes or admission. Candidate `aa5f1485eb023ca232b5a8f8234ad6fdea51f2bb`, verification worktree `C:/Projects/Blurby/.worktrees/visibility-observer-verification-20261026`.

## Current disposition after final Brain controls

**WITHHOLD. Guard-only repair admission is not justified yet.** The active pre-body loading race is proved, and same-Document continuation/both-layout controls pass. The final actual asynchronous close-before-resolution control also proves that `#display` can reassign a View after its renderer was destroyed. That lifecycle behavior requires Brain's disposition before treating a readiness-only repair as sufficient. No source repair is admitted or implemented. Earlier proposal text below is conditional and does not supersede this disposition.

## Finding

The independent four-mode route reproduces one uncaught TypeError in the exact packaged ARM64 candidate. The exact null argument is **the EPUB Document's `body`**, passed by `View.scrolled` to `setStylesImportant`. The failure is delivered by the **Paginator ResizeObserver**, not the previously documented `setStyles` RAF dereference of a null `#view`.

The Narrate click was recorded at `2026-10-26T21:12:19.232Z`; the full exception arrived at `21:12:19.273Z`, 41 ms later. The preceding Flow click was at `21:12:14.131Z`. The route had rendered all four real roots with 5,293 stamped words each. This is a Flow → Narrate transition reproduction, rather than only the fast open/close scenario described by BUG-222. Object identity of the failing View was not captured, so naming it definitively as the outgoing Flow instance would overstate the evidence.

## Exact stack and source mapping

Full event: `C:/Projects/Blurby-artifacts/parallel-style-diagnosis-20261026/full-exceptions.jsonl`.

| Packaged paginator-DVT_4TtX.js (one-based) | Installed node_modules/foliate-js/paginator.js | Operation |
|---|---|---|
| 1:8426 | 423 | Paginator ResizeObserver invokes `this.render()` |
| 97:2960 | 773–779 | Paginator.render invokes retained `#view.render(...)` |
| 1:5276 | 277–282 | View.render chooses scrolled layout |
| 1:5504 | 284–298, specifically 294 | `setStylesImportant(doc.body, ...)` |
| 1:3579 | 195–198 | `const { style } = el` throws |

The immediately preceding `setStylesImportant(doc.documentElement, ...)` completed; this stack therefore identifies a present Document/root with a null body at the second call. View.render checks only `!layout || !this.document`; it does not require a body. The installed View's document getter reads iframe.contentDocument (240–242).

## Direct active-versus-obsolete identity proof (later bounded capture)

The follow-up `identity-capture/paused.jsonl` resolves the initial identity uncertainty. At `2026-10-26T21:16:42.956Z`, the failing scrolled frame reported:

- Document exists; body absent; documentElement present; readyState `loading`; root tag `html`; body count 0.
- View element and iframe both connected; iframe.contentDocument is the exact failing Document; Document.defaultView.frameElement is that iframe.
- Active mode root `rm-narrate-root`.
- The Paginator call frame is connected and exactly equals the active foliate-view.renderer.
- Its identity differs from the retained outgoing Flow renderer; its Document and iframe also differ from the retained outgoing Flow Document and iframe. The outgoing Flow renderer and foliate-view are disconnected.

Therefore this failure is **new active Narrate layout before the EPUB body exists**, not an obsolete outgoing callback. A preceding failure at `21:16:19.158Z`, 62 ms after the Flow click, directly showed the same connected/loading/no-body state in active Flow. A third same-helper failure on initial book open traversed columnize and directly identified its Paginator as active/connected; its body metadata was not captured by that run's scrolled-only probe.

At the end of the same run, explicit actual active Narrate renderer.render() passed with body present and 5,293 words. All four roots rendered. Three style errors remain in the unmodified source package. This rules out an obsolete-only/disconnected-only skip as a sufficient repair. It does not establish that every historical BUG-222 event has the same cause.

A separate earlier Debugger-enabled capture produced zero exceptions, so no pause identity there. That negative run is timing-sensitive observation, not a repair pass or a replacement for the retained positive failures. It also directly passed active Narrate layout. Full receipts for both runs retain normal profile hash equality and exact package/process identities.

## Lifecycle evidence and limit

Flow cleanup at `src/reader/modes/flow/FoliateView.tsx:1156–1173` nulls its view ref, schedules `closing.close()` on the next animation frame, then immediately clears the host. The same pattern is mirrored in Page:1060–1075, Focus:1081–1097 and Narrate:1212–1228. `node_modules/foliate-js/view.js` close calls renderer.destroy and removes it. Paginator observes its container at paginator.js:551, but its destroy/disconnect does not execute until close (1158–1164). Thus host detachment precedes observer disconnection in the source, creating an exposed callback interval.

This was the initial suspect path; the direct active/loading identity proof above disproves obsolete detachment as the cause of those captured active events. It remains **not a proven causal teardown repair**. The run captured the failure stack and timing without pausing or wrapping in-page observers. It did not pause the failing frame to inspect iframe readiness, object identity, connection state or pending load. It cannot exclude a new Narrate iframe in a partially constructed document. Do not change teardown order, add a speculative null guard, or silently suppress this error based only on this report.

## Controls

The artifact-local `structural-control.cjs` evaluates the actual installed View class and helper unchanged using jsdom Documents. Valid body → passes; remove only body while retaining Document/root → exact style-null failure; restore body → passes. This is a positive failure and opposite control for the nullable-body precondition. An inert ResizeObserver substitute is used only to construct View; no resize delivery is simulated. No layout methods are replaced.

The detached-iframe control passes in jsdom with its body still present. Consequently this test **does not reproduce Chromium detachment timing**, and is not evidence that host detachment necessarily causes the null body. A package-level causal opposite control remains required before selecting a lifecycle fix.

## Package custody and result

First owned scratch launch: `release/win-arm64-unpacked/Blurby.exe`, PID 4564, ARM64, isPackaged true. Main-process proof confirmed the exact executable and userData `C:/Projects/Blurby-artifacts/parallel-style-diagnosis-20261026/modes-profile` before route input. Own PID was stopped and verified absent after the route; desktop window released to coordinator.

Receipt: `C:/Projects/Blurby-artifacts/parallel-style-diagnosis-20261026/modes-receipt.json`. Alive 40,142 ms; all four roots/word counts pass; one style TypeError; zero ResizeObserver-loop errors; zero dumps. Route qualifies; strict clean-package gate **fails**. Exit code 2 intentionally records this failed package gate, not a crashed app. Normal profile library/settings hashes are identical before and after. Hash manifest: `.../hashes.json`.

The route differs from the prior driver only by artifact output/profile/port and click timestamps plus full Runtime exception event retention. It adds no app-side observer wrapper, debugger pause, corrective code or warning filter. Such observation still cannot prove absence of timing perturbation.

## Actual packaged captured-instance counterfactual

`instance-control/paused.jsonl`, `counterfactual-pause.jsonl` and `instance-events.json` retain two paired controls on exact active View instances captured at real exceptions. No production file was edited. While paused, the probe called that instance's original production render with a scrolled layout: it reproduced the exact style-null error while the real iframe Document was loading and had no body. An own-method wrapper on only that captured instance skipped only `Document.readyState === 'loading' && !Document.body`. Calling the same instance through that wrapper returned without error. It preserved original forwarding for every other state; no helper, prototype, observer callback or error logger was suppressed.

Instance id 0: loading/no-body skip and paired failure/control at `21:18:22.040Z`; actual post-load original production render forwarded with body present, complete state and 5,293 words at `21:18:22.178Z` and `22.198Z`.

Instance id 4: same paired control at `21:18:28.106Z`; actual production render forwarded with body present, complete state and 5,293 words at `28.240Z`, `28.258Z`, and explicit final connected Narrate layout at `29.587Z`.

The first throwing invocation in each case was already in progress when paused and was deliberately allowed to propagate on resume. The run therefore retains two uncaught errors and fails the strict package gate. This is a positive failure/opposite control on actual production class/iframe objects, **not a clean repaired-package qualification**. Debugger pause, manual render invocation with diagnostic dimensions and runtime wrapper are timing/layout interventions, and cannot qualify uninstrumented application timing. The eventual real load callback's original forwarding and word counts show that the control does not mask the required connected layout.

## Narrow candidate repair and test fence (proposal only)

At `node_modules/foliate-js/paginator.js:277`, retain the existing no-layout/no-Document guard and additionally defer View.render's layout dispatch only while the actual Document is **loading and lacks a body**. For example, sample the Document once, return for `!layout || !doc || (doc.readyState === 'loading' && !doc.body)`, and otherwise keep current columnize/scrolled behavior. `load()` already calls actual render after its iframe load handler has accessed/styled body and selected its contents (245–265). This is a readiness boundary supported by the paired package control, rather than a blanket `setStylesImportant` null guard or obsolete-view cancellation.

This proposal covers the observed pre-body active-layout failure. It is not a claim that every historical BUG-222 teardown failure is repaired. A complete Document with a missing body must remain an observable invalid state, not silently accepted; do not broaden the condition without evidence. Do not alter the established deferred close, other modes or observer patch under this scope.

If Brain separately admits this repair, test both scrolled and columnized dispatch on real body-null loading Documents and native body-ready Documents, including explicit connected render forwarding, preserved style application and positive word counts. The opposite invalid complete-Document/body-null control must still fail. Use the same exact candidate package routes without runtime wrapper/Debugger, including initial book open, Page/Focus/Flow/Narrate transitions and bounded repeat transitions. Then rerun existing observer/completion qualification and normal profile hashes. A no-error subset is insufficient because the unmodified Debugger run also occasionally produced zero errors.

## Owned launch summary

| Capture | PID | Duration | Style errors | Normal profile unchanged |
|---|---:|---:|---:|---|
| Baseline full stack | 4564 | 40,142 ms | 1 | yes |
| Paused-capture attempt | 51336 | 40,154 ms | 0; no pause triggered | yes |
| Active identity with 5 additional Flow/Narrate cycles | 6796 | 55,312 ms | 3 | yes |
| Captured-instance readiness controls with same bounded cycles | 36612 | 55,355 ms | 2 intentionally retained | yes |

All used the same candidate ARM64 packaged executable and separate fresh owned scratch profiles, with pre-input main-process path/profile/architecture/isPackaged proofs. All owned PIDs were stopped; desktop custody released. All routes rendered four real mode roots with 5,293 words; zero ResizeObserver-loop errors or dumps. The original unmodified positive baseline remains the clean-package gate evidence. There is no repair install, merge, release or completion approval.

## Existing work and next decision

BUG-222 at `docs/governance/BUG_REPORT.md:92–97` already tracks this exception family. The older observer staging memo records it at count-only level; current standing rule 53 forbids treating that as a waiver. Avoid creating a duplicate unrelated bug. This report expands BUG-222 evidence to a normal four-mode transition and supplies its exact callback/body-null signature.

Direct paused identity now identifies a required pre-load readiness boundary. The separately authorized ephemeral captured-instance counterfactual below supports a narrow readiness repair proposal; no shipped repair is admitted by this investigation. Preserve the S1 setStyles RAF reason when evaluating lifecycle changes. A blanket helper null guard would merely defer failure to setImageSize's doc.body query and would not establish correct rendering.

Any admitted repair should rerun this same sample/INTRODUCTION Page → Focus → Flow → Narrate route against the exact rebuilt package with full exceptions and real roots/words, then the original five-minute observer session, observer census, completion visibility route and existing package gates. Require zero non-enumerated errors; no release/completion/merge approval is supplied here.


## Brain-required same-Document and both-layout controls

Read Brain's live ruling before this follow-up. Evidence directory: `C:/Projects/Blurby-artifacts/parallel-style-diagnosis-20261026/identity-continuation-control`.

Seven real loading/body-absent captured View instances exercise both original `render({flow:'scrolled',...})` and `render({flow:'paginated',...})`: each original path throws the exact style-null error, and the narrowly conditional instance wrapper defers both without error. Six normal instances then reach the real native iframe load callback. The recorder checks strict identity of captured View, Document and iframe, and iframe.contentDocument equality: all remain the same through loading/body-absent → complete/body-present.

On id0, actual original production render is called from `e.addEventListener.once` at packaged paginator:1:5062 at `21:29:57.100Z`, before the diagnostic native load listener at `57.106Z`. It has the same captured Document and 5,293 words with actual scrolled body max-width720px. Thus this is a real load-triggered continuation, not a manually substituted render or replacement Document.

The native listener subsequently checks both ready-body paths through original forwarding on each of the six same Documents. Scrolled control: root column-width/height `auto`, body max-width `600px`, margin `auto`. Columnize control: root column-width/height `600px`, body max-width `none`, margin `0px`. Both have 5,293 words and no error; the actual saved production layout is restored afterward. `control-summary.json` validates these assertions.

One id1 was replaced with Page while loading. The next frame shows old renderer/View disconnected, old Document unavailable. There is no old native-load callback or real load-triggered render after this retirement. Thirty seconds of ownership samples show old getContents remaining empty; the explicit later old render call leaves active header/anchor/current renderer/text unchanged. **This alone was INCONCLUSIVE for stale asynchronous completion**: no cancellation/settlement was proved, and quiet observation/manual old render cannot replace actual #display continuation. The following final control addresses that gap.

This instrumentation records 7 intentional uncaught style failures and 1 ResizeObserver-loop error while manually exercising/restoring both layouts. Do not attribute that extra loop conclusively to a specific operation without a separate causal control. The run is not a qualification receipt. PID43000,81,582ms; exact ARM64 packaged candidate/profile identity proved, no dumps, normal hashes unchanged, own PID stopped.

## Final precise asynchronous continuation control — lifecycle failure retained

Evidence directory: `.../precise-continuation-control`. This is the one final bounded check authorized by Brain; no further probing follows it.

Debugger breakpoints at packaged paginator zero-based `(0,5135)`, `(96,11920)`, `(96,12046)` observe, respectively, the actual native View.load resolver call, real #display continuation after await, and the instruction after `this.#view = view`. Full callframes and breakpoint IDs are retained. These are production instructions, not manually invoked render substitutes.

The recorder first observes the active INTRODUCTION control complete normally: native resolve, post-await at `21:35:11.286Z`, then post-assignment at `11.289Z`, connected Page renderer with 5,293 words and an overlayer.

At the next 5,293-word native load resolver boundary, the body/layout has completed but the native Promise has not yet resolved. The control calls the actual owning foliate-view.close() synchronously before allowing the resolver to execute. Thin instance-only destroy wrappers record original Paginator.destroy and View.destroy start/finish, preserving their observer-disconnect paths. After close at `21:35:22.345Z`, old renderer is disconnected, old contents empty, captured iframe Document unavailable, lastLocation null.

The native resolver is then allowed to execute normally. At `21:35:22.348Z`, the actual old #display resumes after await while disconnected; old contents are still empty. It dispatches real `create-overlayer` with null Document at `22.350Z`. At `22.352Z`, the post-assignment breakpoint shows old getContents repopulated with index2, null Document and no overlayer. **The destroyed renderer's private current View has been reassigned by the actual asynchronous continuation.** Source anchor: paginator.js1010–1034, specifically await view.load → create-overlayer → #view assignment; destroy at1158–1164 has no cancellation generation protecting that continuation.

The requested Page click did not establish a replacement reader before that continuation. At those breakpoints the active root still points to closed Focus and its old disconnected renderer; header INTRODUCTION remains and lastLocation is null. Therefore this proves destroy-before-await-completion and stale View reassignment, **not corruption of a later active replacement renderer**. The body/native load work had already run before close: it is distinct from network/parser cancellation before native load, which the preceding test could not prove.

The standard Focus root/word-count gate fails (0words), as expected for this deliberately destructive scratch control. Later separate Flow/Narrate load/await/assignment traces render independently; this does not erase the retained lifecycle failure. Observer-disconnect execution is recorded via real destroy paths, but private observer live-target counts are not exposed by this control. No blanket helper guard, timer retry, exception suppression, source edit or installed-profile write was introduced.

PID43532 used the exact candidate/package and a fresh owned profile; before/after normal library/settings hashes match. Own PID stopped. `control-summary.json` records error counts/dumps and the deliberate route assertion failure. **Stop guard-only implementation admission and route this concrete lifecycle trace to Brain.** A revised, separately admitted specification must explain stale async completion rather than claiming that pre-body readiness alone makes destroyed work safe. No additional lifecycle repair is proposed or implemented by this report.
