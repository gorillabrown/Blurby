# BUG-222 readiness and ownership — consolidated v3 proposal

**IMMUTABLE SPECIFICATION PROPOSAL. IMPLEMENTATION ADMISSION WITHHELD.** Read Brain's actual latest ruling in thread `01a179e8-7a40-75c0-93f4-d3045ad99027` (turn `01a17a2a-ecaa-74c0-bf57-893bd86072af`). No probes, source, branch, package, main, release or terminal-state changes are authorized. Guard-only and late-only drafts remain STOPPED history. Any amendment to this artifact requires a separately named successor and fresh hash/review.

Base: held combined tip `4c9724e60cd6bbab79ad78b0f11b25f78ad31ab7`, shipping commit `aa5f1485eb023ca232b5a8f8234ad6fdea51f2bb`; approved docs main already integrated is `85e6e5aaedccb0501c529dbc9f739e50a0689fd7`. Parent-reserved identity is FOLIATE-DISPLAY-LIFETIME-1, Seq68 (free after observer67 before visibility116, no reordering), Reader Engine / Reader Runtime Solidification; branch eb/foliate-display-lifetime-1 from combined4c9724e6 containing current main/origin85e6e5aa. Parent live provider refresh reports193items and9Queued Full Spec. Parent owns ROADMAP/provider registration and documentary writes; exclusive execution owner remains to be named in separate admission. Item URL is pending real creation; parent records it in an admission manifest referencing this immutable contract hash, without editing this file. All pins/owner/readback remain mandatory before source dispatch.

## Evidence, limits and custody

Final report `C:/Projects/Blurby/docs/studies/investigations/FOLIATE-STYLE-NULL.2026-10-26.md`, SHA256 `042952153b003bb9e175208324190ea09f229e6971dd6caafd1aaabfbf50c8e7`. Independent audit `C:/Projects/Blurby-artifacts/parallel-style-diagnosis-20261026/readiness-independent-review.md`.

Active loading/no-body layout fails both scrolled and columnized paths. Seven paired controls cover both branches; six real native recoveries preserve same View/iframe/Document and5293 words (native recovery layouts are scrolled, NOT six native columnized recoveries). Both ready-body branches have paired manual style controls. Future tests still require both native recovery layouts, malformed-ready and pending-layout-change cases.

Actual stale continuation after real close restores a destroyed View into its OLD disconnected Paginator's OWN state. Active native continuation at21:35:11.286/.289 succeeds; close/destroy22.342–.345 leaves old contents[]; actual postawait22.348, null-document overlay22.350 and assignment22.352 resurrect old state. NO distinct successor corruption was proved. Earlier pre-native-load cancellation attempt was inconclusive. Final destructive route intentionally fails Focus0-word assertion; scriptExit0 is not a pass. Later Flow/Narrate remain independent positives.

Evidence root `C:/Projects/Blurby-artifacts/parallel-style-diagnosis-20261026/`:

| Relative path | SHA256 |
|---|---|
| `precise-continuation-control/receipt-index.json` | fcb4f33637aeecce2e4471529f4fdeabd9808140ea7f94e3c96114fb5fb7b853 |
| `precise-continuation-control/paused-stages.jsonl` | 667f5da222e1a09b765d9430c744021a3a3f0724a90f73fddd8d37206abe17ae |
| `precise-continuation-control/runtime-events.json` | a64cb20ddaee620a1249f7c1adac576782096c516b7f75b7761305005419c8c7 |
| `precise-continuation-control/modes-receipt.json` | 868e30d9ef2f90b907539b6850118c8592116c7a0c76c591aa31081be0d37315 |
| `precise-continuation-control/control-summary.json` | d5abcf3563d5b9b63b1d9e6552dfef54d33849c5d8bcba88cf14392f20d85626 |
| `precise-continuation-control/shutdown-proof.json` | 19ac0f3e1d9119835bd638da8f5c915cb0a35da0aa442fa82eccd0323ad77789 |
| `identity-continuation-control/instance-events.json` | b67b7308667d70e3226b3d771028b851348163995ef56d3f3078eb9c2eac2c51 |
| `identity-continuation-control/control-summary.json` | 3a7a71cf2279cb7954c8b4a28a3735bc2d957f07e856bd0e0183f58da2b1d180 |

Final summary records2 log lines,1 style,0RO,0 dumps, routeQualified=false. PID43532 was exact ARM64 packaged executable/fresh profile before input and absent21:37:54.498Z. Normal library/settings hashes before/after/current readback remain `1921551191807bb646f3567ffef07a0bec4487aecfdb6bc224ece9fb70573d1f` / `64483188e030adf062b7516389f69f5c0835649fc6f12bcf48c1b20042badfec`. No missing receipt field is a zero count.

## Exact admitted-fence request

Propose ONLY `patches/foliate-js+1.0.1.patch` (paginator.js changes through normal patch-package), `tests/foliateViewReadiness.test.js`, `tests/foliateDisplayLifetime.test.js`, plus item-owned memo/timing/receipt. Retain both existing observer disconnect calls. No sibling runtime/shared core/ReaderContainer/types/view.js/teardown-order/helper algorithms/settings/defaults/manifest/lock/build/dependency change, no blanket null guard, filter, catch-all, timer/retry or navigation redesign. Unexpected required scope returns to Brain.

Installed-source line anchors refer to held `node_modules/foliate-js/paginator.js`: fields near417–441; View.load243–274/render277–282/destroy410–413; #createView660–673; #beforeRender697–772; #display1007–1036; #goTo/onLoad1041–1056; setStyles1136–1154; destroy1158–1164; anchor/scroll923–979. Existing `view.js:284–294` close calls renderer.destroy/remove; read only. Packaged native resolve is line1 column5135; #display postawait/postassignment are line97 columns11925/12046 (one-based), not line1. Actual breakpoint receipts govern.

## Concrete ownership model

Use TWO separate authorities, not one obsolete display predicate everywhere:

- **Display-operation currentness `opCurrent(op)`**: paginator not closed and captured operation generation equals current generation. Capture/issue generation synchronously BEFORE first #display await; every newer display request invalidates older publication/scroll/focus operations. Destroy invalidates generation and closes lifetime BEFORE cleanup. A destroyed Paginator is not revived; normal app replacement creates another. Do not add reopen behavior.
- **Retained-View liveness `viewLive(record, doc?)`**: paginator not closed, this exact record is retained, #view equals captured View, View not disposed, and when a Document is supplied it equals both captured/current iframe Document. This is independent of the generation that originally loaded the View. Replacement/destroy invalidates the record. Src-less anchor navigation does NOT invalidate retained View's native load/font/resize/onExpand liveness.

Keep one retained View record containing View, section index, native-load promise/outcome, disposal state and overlay-publication state. No global/shared mode state. Operation record references the intended retained record. Successful native load outcome stays successful permanently; display operation can independently become stale.

### 1. First await and same-View pending anchor

At #display entry issue op; do NOT cancel/dispose a retained loading View merely because op generation changes—the unresolved request may be src-less. After `await promise`, require opCurrent BEFORE #index/focus/#createView. For src-bearing result, create a new record: invalidate/dispose prior record exactly once, install new View, start its actual load. Only this real replacement invalidates old View liveness. If the section promise resolves after close/replacement by newer op, return inertly before any publication.

For src-less result, capture still-retained record and **adopt/wait for its existing native-load promise**. Do not cancel it, create another View, scroll body-null content or assume locking makes this impossible. If close/replacement occurs while waiting, opCurrent and viewLive both fail and this op returns inertly. If load succeeds and this op still owns publication, it proceeds with that same ready View. Old original display may now be stale, but retained load callbacks remain legitimate because viewLive is true. No stale original display may publish overlay or anchor afterward.

After adoption, use the retained record's real section index; do not publish an arbitrary src-less result's different index. Existing normal same-index anchor behavior is preserved. A mismatch outside that contract returns to Brain rather than silently designing cross-section navigation.

### 2. Native load and exact cancellation semantics

Extend View.load internally with retained-View liveness/cancellation support; keep real native iframe callback. Store its pending listener/settler once. Check liveness at native callback entry, after afterLoad, after beforeRender, after actual render/expand and before observing/resolve. Invalidation removes that pending listener and resolves **still-pending** load once with an explicit internal canceled outcome. Never reject valid cancellation as an unhandled error or catch genuine invalid current document failures as success.

If native load already fulfilled when close happens before display resumes (the exact proved boundary), its fulfillment remains unchanged. opCurrent/viewLive reject the stale DISPLAY continuation separately; display settles inertly without claiming retroactive load cancellation. Clear only the pending cancel record on successful settlement; keep retained View lifetime for future font/resize/expand work. Font callback checks retained record/Document, not original display generation.

View.render retains absent-layout/Document no-op and additionally defers only actual `loading && !body`; complete/interactive body-null still throws via original algorithms. Native beforeRender computes current layout after pending resize/flow; never replay cached obsolete dimensions. Destroy samples own body once, unobserves only an actual present Element, ALWAYS disconnects existing observer, cancels pending load once, and is idempotent. This is precise observer-target validity, not a blanket layout/helper null guard.

### 3. Load callbacks, #createView/onExpand and current layout

afterLoad/style injection/styleMap/onLoad effects require viewLive(record,doc) before each effect and after reentrant callback/event. beforeRender checks same retained record immediately before header/background/direction/layout updates and returns actual current layout; recheck afterward before continuing load. These are View-lifetime callbacks, so a src-less adopting op does not incorrectly disable them. Old/new record identity prevents replaced callbacks from mutating successor.

Explicitly change #createView's onExpand closure: capture its View record; BEFORE parent #scrollToAnchor effect require viewLive. For valid expansion, capture CURRENT applicable display/scroll generation when starting anchor work, combine it with viewLive, and pass that predicate through async scroll. Do not freeze onExpand to original load's generation. Expanding a live retained View after same-View src-less navigation must still update layout/anchor; close/replacement/newer anchor makes already-started old work inert.

Actual View ResizeObserver/font expand retain live View work; canceled/disposed Views cannot reobserve or invoke parent expand effects. All checks precede effects; a post-render check alone is insufficient.

### 4. setStyles intended View/Document and deferred callbacks

Name setStyles1136–1154 in patch fence. Preserve public call behavior: update stored #styles as before; capture intended retained View+Document/style nodes for that invocation, rather than later dereferencing whichever #view happens to be current. Existing no-view style-storage behavior remains. Style-node writes and deferred RAF background/font expand require those captured objects still live/current. Normal calls and same-retained-View updates keep working; an anchor-only op generation change must not disable valid font/style work.

For onLoad -> setStyles, pass retained ownership context internally from #display/#goTo callback (without exposing a new user setting/schema or changing external load-event detail). Check context before old-section unload/style/event effects and after reentry. RAF uses captured View.docBackground only while that View+Doc retained; fonts.ready expands captured View only while live. Never finish an old callback through `this.#view` pointing to a successor. Tests cover public and display-owned paths; no global cancel-all RAF/font behavior.

### 5. Overlay, publication and post-await writes

After successful load/adoption await require opCurrent AND viewLive before create-overlayer, #view write or anchor. Same retained View may be adopted by newer op: overlay publication belongs to current publication op, not necessarily original loader. Use record state/actual View.overlayer to avoid duplicate attachment. Already attached live overlay is retained. If a previous publication op became stale before attach, current adopting op may issue publication for that same ready View; stale closure never attaches. A dispatch record token distinguishes unpublished/publishing/attached ownership without waiting on its own synchronous event.

Attach closure checks publication op and retained View+Document at INVOCATION, including deferred attach. After synchronous create-overlayer dispatch recheck: listener can close/replace/start newer same-View op. No stale #view assignment or anchor follows. No callback may clear successor ownership or dispose it. Preserve real active overlay, text, selection and settlement. Require a reentrant same-View adoption control, not just close/replacement.

### 6. Anchor, scroll, focus and disposal

Before function-anchor evaluation require opCurrent+viewLive; recheck after evaluation (it can reenter). Thread optional current predicate through this display's scrollToAnchor/#scrollToAnchor/#scrollToRect/#scrollToPage/#scrollTo. Guard #anchor, animation-frame/container writes, bounds and afterScroll/relocate, and focus after await. Default behavior for other callers stays intact; onExpand supplies its freshly captured applicable token. No new animation algorithm or global mode navigation policy.

Cancellation disposes only captured obsolete record/View/listener/element, once. If native load is live and same-View op adopts, do NOT dispose it. If newer record owns #view, old cleanup cannot clear/remove/disconnect it or mutate newer index/header/style/anchor. A canceled old record's late callbacks cannot restore anything. Disposed body-null cleanup must not unobserve(null), and repeated destroy must still be harmless. Genuine malformed CURRENT ready documents remain visible errors.

## Concrete red/green tests (actual installed behavior)

Final detector version runs against original base and candidate, exact node IDs/raw logs; no harness exceptions counted as red. Tests execute actual installed View/helpers/Paginator public navigation+native continuation, not duplicated guard/#display algorithms. Unexported View extraction may expose unchanged source with provenance; do not stub scrolled/columnize into fake returns. Minimal constructor/layout shims disclose limits; actual Chromium package controls prove native continuation independently. Harness impossibility returns to Brain.

- R1: BOTH loading/body-null layouts fail base/defer candidate, same View/iframe/Document native load forwards original layout/styles/positive text; BOTH ready-body and loading-body-present forward; complete/interactive body-null BOTH still throw; absent layout/Document unchanged. Pending resize/flow uses current beforeRender layout.
- L1: delayed first section result after destroy/newer display cannot set#index/create. Active result still works.
- L2: real close/replacement inside afterLoad/onLoad/beforeRender/render prevents all later old callback/style/header/layout/observe effects; active retained load remains valid after src-less generation changes.
- L3: exact close-after-native-resolve/before-display-microtask: native outcome stays fulfilled, old display returns inertly, no resurrection/overlay/anchor/focus. Separate destroy-before-native-load pending case settles canceled exactly once without hanging.
- L4: actual same-Paginator replacement: old publication/cleanup cannot touch newer View/Doc/index/header/styleMap/overlay/anchor/scroll/observer. Paired newer active completion succeeds. Current evidence did not prove successor corruption; this is future acceptance.
- L5: onExpand valid after same-View anchor still scrolls using fresh token; old expand/scroll after close/replacement inert. Public and display-owned setStyles RAF/fonts: active same View updates; replaced/destroyed View cannot change newer background/expand; never dereference newer#view for old task.
- L6: same-View src-less anchor DURING native load adopts/waits without dispose/body-null scroll; original load may succeed, stale original display cannot publish; new op publishes overlay once/anchors correctly. Close/replacement while waiting settles inertly. Cover src-less reentry during overlay dispatch and delayed old attach.
- L7: event/anchor callback reentry, close/replacement during scroll/animation, deferred attach and after-await focus: old mutation blocked; active overlay/anchor/flow/resize/focus behavior unchanged. Old pending work settles; repeat destroy/cancel/body-null cleanup leaves no listener/observer leaks or double-disposal errors.

Instrumented causal controls are not clean-package passes. Deliberately closed0-word root uses specific negative assertions; never label ordinary four-mode route passed. Stop for unlisted required source or changed functional navigation semantics.

## Bounded execution waves after separate admission

Parent must first complete real provider item/readback, full ROADMAP, owner/fence/branch/current-main admission. All waves target <40 tool uses; split before dispatch, never exceed ceiling to finish opportunistically.

A: read/pins/writer check, fresh isolated worktree, clean baseline, R1/L1–L7 final detector red controls. B: prescribed patch plus clean normal npm ci/postinstall/patch-package; installed behavioral green; exact source-fence review/commit. C: targeted suites/full npm test/typecheck/build; independent read-only Solon/Plato review (parallel eligible). D: exact final candidate+approved main ARM64 --dir packaging and byte/architecture/compiled-patch proof; serialized package routes with persisted intermediate receipts (split D1/D2 if tool ceiling). E: package completeness, independent final review, item-owned memo/timing/receipt and allowed normal nonforce build-and-hold branch publication. Parent owns governing/provider writes. No main merge, terminal completion, freeze lift, installation/distribution or release without separate Brain confirmation/go.

All original standing package gates remain: >=25s native survival; all dist renderer bytes match ASAR, actual main override/compiled dependency/source/resource/scripts/PE ARM64 verified; every run actual exe/PID/userData/arm64/isPackaged before input, fresh owned profile/distinct port, exclusive desktop window, normal hashes before/after, full stdout/stderr/window/Runtime errors/rejections/error.log/dump census, own process shutdown+absence. No installed-module hand edit/junction/retry-until-green/filter/Debugger/corrective wrapper on clean routes. Preserve all prior FAIL receipts.

Required independent exact-candidate routes: unmodified original329s session(open15s,INTRODUCTION8s,Focus paused60s,Flow playing180s,paused60s) with actions/timings/word advance; separate ro-wrap Page->Focus->Flow census no disconnected/0x0body targets; all4 roots/5293words plus5 fixed-delay Flow/Narrate cycles; actual owned91 All/Archive grid/list/open/return/reopen(initial fields preserved; existing90/91 archived=true exit policy distinguished); ADDED fresh PRODUCT-DEFAULTS unchanged full original session with NO library/settings/theme/mode/eink/text/zoom/rate seed/override, normal visible onboarding/built-in sample/effective-default capture; and native causal R1/L1–L7 controls. All clean routes zero non-enumerated errors/rejections/dumps. Inapplicable defaults route -> Brain, never silently adapt.

Fixture blob `ffa271998c636c689761ac4eb5773dca92208bf0`, SHA `8be2ab1e681bbde194ded5ba05ffcad218533fd98abfefa8a3af7d699a6c2beb`; actual imported/package bytes compared. Original session SHA `ffeac5f30f6a71547699e3d12464e244f945355a1d7e49a4ec7daff40b290556`; original launcher `C:/Projects/Blurby-artifacts/foliate-observer-leak-1/launch.ps1` SHA `96042b414e538b41519112c92764b835c34e38e6a397e37719fce20d681a7430`. Source/default-profile provenance is not recovered original-profile-byte proof. Held baseline executable/ASAR SHA `cdbc080ccc68b50565d0b51151082ab46e710083703f3d778951a8bfa80e5ac2` / `26e7cc8bcaaa5af5dec04a298ffdf408ce8e340e1d1abaf6722afe72cbaca01e` remain unchanged.

## Required next ruling

Independent reviewer checks THIS immutable final hash against all5 Brain amendments and full contract, then parent supplies live item/full ROADMAP/current pins. Brain admits or amends concrete design/test/source fence. No implementation approval, lifecycle-safety certification or package confirmation is supplied by this specification.
