# REVISED SPEC PROPOSAL ONLY — BUG-222 readiness and display ownership

**NOT ADMITTED. Brain stopped the guard-only proposal. No new probes, source edits, branch/package changes, implementation, main merge, terminal completion or release are authorized.** This separate artifact proposes a bounded repair contract for Brain's technical decision. The old proposal remains in `readiness-dispatch-draft.md`, now headed STOPPED with its original content retained.

Base for any later separately admitted execution: combined held branch `eb/visibility-observer-verification-20261026`, tip `4c9724e60cd6bbab79ad78b0f11b25f78ad31ab7`; qualified shipping source `aa5f1485eb023ca232b5a8f8234ad6fdea51f2bb`; integrated docs-only main `85e6e5aaedccb0501c529dbc9f739e50a0689fd7`. Exact existing package remains WITHHOLD. No item identity, branch, register URL/Seq, execution owner or mutation approval is invented here.

## Independent evidence reviewed and bounds

Read current AGENTS, actual Zeus protocol, relevant LL-142/146/152/167, installed source and investigator final report `C:/Projects/Blurby/docs/studies/investigations/FOLIATE-STYLE-NULL.2026-10-26.md`. Independent reviewer `/root/independent_delivery_review` separately reviewed the raw precise continuation trace and source; its written report is `C:/Projects/Blurby-artifacts/parallel-style-diagnosis-20261026/readiness-independent-review.md`, final section.

Two separate obligations are proven:

1. **Active loading readiness:** real active connected View/iframe/Document lacks body while readyState=loading. Original scrolled and columnized render both throw on body style. Seven paired original-fail/narrow-defer-pass instance controls cover both paths. Six real native iframe load continuations preserve exact same View, Document and iframe identities, then execute original rendering with5293 words; body-ready opposite controls preserve styles for both layouts. These instrumented controls establish the boundary, not a repaired-package qualification.
2. **Stale post-await ownership:** at `21:35:11.286/.289` a connected Page paginator completes actual View.load await, attaches overlay and retains5293 words: active positive control. At `21:35:22.342–.345`, while paused at a later native load resolve after body/layout already ran, real foliate-view.close invokes original Paginator.destroy and View.destroy. Old paginator is disconnected; old getContents=[]; its #view was nulled. Actual old #display resumes at22.348, dispatches create-overlayer with null Document at22.350, and at22.352 restores its destroyed View into **that same old paginator's own #view**. This is not a synthetic promise/manual render substitute. The intervention controls scheduling; it is not a naturally timed production claim.

No separate active successor corruption is proved. The requested Page click did not create a successor before the stale write. Later Flow/Narrate use distinct connected renderers and render correctly. Do not label the old paginator's own-state resurrection cross-mode corruption. The earlier destroy-before-native-load attempt was INCONCLUSIVE because native load never fired; it proves no cancellation. The precise control begins after native body/layout work, so it proves neither parser/network cancellation nor all earlier callbacks safe.

Final destructive diagnostic route has scriptExit0 but routeQualified=false because intentionally closed Focus has0words. `control-summary.json` separately records2 error-log lines (1 style,0RO),0 dumps, unchanged normal hashes. Do not convert missing summary fields in the aborted route receipt into zero counts. PID43532 was proven exact ARM64 packaged candidate/scratch path before input and stopped/verified absent afterward.

## Exact evidence paths and hashes

All relative paths below are under `C:/Projects/Blurby-artifacts/parallel-style-diagnosis-20261026/`:

| Evidence | SHA256 |
|---|---|
| `identity-continuation-control/instance-events.json` | b67b7308667d70e3226b3d771028b851348163995ef56d3f3078eb9c2eac2c51 |
| `identity-continuation-control/control-summary.json` | 3a7a71cf2279cb7954c8b4a28a3735bc2d957f07e856bd0e0183f58da2b1d180 |
| `precise-continuation-control/paused-stages.jsonl` | 667f5da222e1a09b765d9430c744021a3a3f0724a90f73fddd8d37206abe17ae |
| `precise-continuation-control/runtime-events.json` | a64cb20ddaee620a1249f7c1adac576782096c516b7f75b7761305005419c8c7 |
| `precise-continuation-control/precise-capture.mjs` | a226eff2cdc5522485fb7297f709ea5066c009f18a1fc08f9163580950c7c976 |
| `precise-continuation-control/run-diagnosis.mjs` | e1c0405c8c20d4a1c95cd1ee431fbfa747059140e6efd8d67527fb630609003b |
| `precise-continuation-control/modes-receipt.json` | 868e30d9ef2f90b907539b6850118c8592116c7a0c76c591aa31081be0d37315 |
| `precise-continuation-control/control-summary.json` | d5abcf3563d5b9b63b1d9e6552dfef54d33849c5d8bcba88cf14392f20d85626 |
| `hashes.json` (62-file final investigation manifest) | 35980a1c07595746650bc6a5701a07d94fc74c19057a1f157c901bbe53344b91 |

Normal profile library/settings hashes remain respectively `1921551191807bb646f3567ffef07a0bec4487aecfdb6bc224ece9fb70573d1f` / `64483188e030adf062b7516389f69f5c0835649fc6f12bcf48c1b20042badfec`. Current package executable SHA `cdbc080ccc68b50565d0b51151082ab46e710083703f3d778951a8bfa80e5ac2`, ASAR SHA `26e7cc8bcaaa5af5dec04a298ffdf408ce8e340e1d1abaf6722afe72cbaca01e`; actual installed paginator SHA `7845a3faaddcffeccea1de5e0a846b1bbd2f192be688e0e31c6bcb5531389dbe`. Shipping source/package remain untouched.

## Source map: precise proposed fence

Actual installed file in base worktree: `C:/Projects/Blurby/.worktrees/visibility-observer-verification-20261026/node_modules/foliate-js/paginator.js`. Deliverable edits, if admitted, belong only to existing `patches/foliate-js+1.0.1.patch`; never commit installed files.

- View.load243–274: native load listener calls afterLoad, body/style/direction/range work, beforeRender, actual render, observer.observe, fonts-ready expand, resolve. Listener is not canceled by View.destroy.
- View.render277–282: current absent-layout/Document check, then actual columnize/scrolled dispatch. Body style helpers are195–198, scrolled284–298, columnize301–335.
- View.destroy410–413: unobserve current body and existing disconnect; does not remove iframe or invalidate load listener.
- Paginator.#createView660–673: destroys/removes previous owned View, installs new View into #view synchronously, appends and returns it. This establishes ownership **before** awaiting View.load.
- Paginator.#display1007–1036: first awaits section promise at1008; sets index; captures focus; #createView1012; afterLoad mutates styleMap/onLoad; bound beforeRender; `await view.load`1025; create-overlayer1026–1031; redundant #view restoration1032; subsequent anchor/focus1034–1036.
- Paginator.destroy1158–1164: existing observer disconnect and View.destroy, then #view=null. It currently supplies the ownership invalidation needed for a retained-identity fence.
- `node_modules/foliate-js/view.js:284–294`: close calls renderer.destroy/remove and clears progress/history; no sibling mode teardown edits proposed.

Packaged corresponding boundaries in `dist/assets/paginator-DVT_4TtX.js`: View.load native resolve column5135, #display post-await11925, post-assignment12046 (one-based on minified line1; raw breakpoint receipt is authoritative). Earlier error map View.render1:5276, scrolled1:5504, helper1:3579; Paginator render97:2960.

## Recommended narrow design for Brain: retained View ownership, plus readiness

Recommend **Option A** for the demonstrated post-load await window because source already changes retained identity on replacement and nulls it on destroy. This is a proposal, not selected functionality or admission.

A1. In View.render, retain absent-layout/absent-Document behavior and additionally defer only `doc.readyState === 'loading' && !doc.body` after one sampled Document read. Do not defer a complete/interactive body-null invalid state. Preserve actual dispatch, style/layout semantics and real native-load forwarding.

A2. Immediately after `await view.load(src, afterLoad, beforeRender)` and **before create-overlayer, any #view write and anchor/focus work**, require that this paginator still owns the captured `view`: `this.#view === view`. On mismatch return from this old #display invocation. This must be the lifetime/ownership fence at the actual demonstrated write boundary, not a generic `if (!document)` helper return. A disconnected-but-current View must not be silently treated as stale solely for being detached; retained identity is the proposed authority.

A3. Dispose **only the obsolete captured View**, never `this.#view` or a newly owned successor. Proposed mismatch cleanup calls captured `view.destroy()` to disconnect anything that the late native-load continuation reobserved, and removes `view.element` only if still attached. Both actions need idempotence/disconnected/null-Document controls with the actual class. If these exact cleanup calls throw, harm a successor, or require widening destroy semantics, STOP for Brain; do not add a null helper/try-catch. Existing two disconnect hunks must remain intact.

A4. On active identity equality preserve create-overlayer, retained View/Document, actual5293-word content, overlay attach, required anchor/scroll/focus continuation and promise settlement. The later `this.#view = view` may be retained under the fence for minimum delta; removing that redundant assignment is optional only if Brain explicitly approves and both active and stale controls prove equivalence. Do not decide this during implementation.

**Bounded limits:** this post-load fence addresses the directly proved resurrection after actual native body/layout. It does NOT prove stale work before the first `await promise` settles, afterLoad/beforeRender/onExpand during native load before this fence, fonts-ready expand, synchronous reentrancy during create-overlayer, or focus work after await scrollToAnchor safe. A newly demonstrated earlier or later effect returns to Brain for an exact additional boundary, rather than silently enlarging this patch. In particular, do not claim canceling all pending parser/load work, or safe reuse of an already destroyed paginator, from Option A.

## Alternative for Brain only: lifetime generation

Option B would add an explicit Paginator operation/lifetime generation, captured before initial await and invalidated at destroy/replacement, checking after initial section resolution **and** after View.load before state writes. This can express earlier operation invalidation, but changes ownership of concurrent displays, src-less anchor navigation and callback contracts beyond the direct post-load trace. It requires exact new field/invalidation sites, public-method concurrency semantics, callback fencing and tests specified by Brain. Do not combine it speculatively with Option A or implement it as a generic cancel-all rewrite.

Decision requested: admit the smaller Option A under its explicit limits and hard stops, or require independently specified Option B/extra callback scope first. A requirement to guarantee all pending display/load phases would exceed Option A and must select a precise revised lifetime contract; a green post-await test cannot satisfy that broader claim.

## Proposed file/test ownership if admitted

Exclusive dependency-patch/test window; no sibling runtime, shared mode store, ReaderContainer/types, teardown-order, view.js, styles/settings/defaults, manifest/lock/build/dependency changes. Existing library repair/observer disconnects remain intact. New source fence: only readiness hunk and agreed Paginator post-await ownership/disposal hunk in `patches/foliate-js+1.0.1.patch`. Proposed tests: `tests/foliateViewReadiness.test.js` and `tests/foliateDisplayLifetime.test.js` (Brain must confirm exact names). Coordinator owns primary governing docs/provider. Any unexpected source drift or shared ownership conflicts STOP.

Tests execute actual installed class/helpers/public continuation, never duplicate guard/lifecycle algorithms. Unexported View may be extracted/evaluated unchanged with provenance; no patched fake layout methods in place of production scrolled/columnize. Actual Paginator path must be reached by public navigation/load with controlled real section/iframe fixtures, not a test reimplementation of #display. Minimal constructor/browser-layout shims may support deterministic unit assertions only with explicit limits; native Chromium controls remain authoritative for real iframe continuation. Harness infeasibility under exact test fence is a technical return to Brain.

Required exact red/green assertions:

- BOTH actual loading/body-null layout paths fail base, defer candidate, then same native View+iframe+Document reaches real native callback and original layout with required styles/positive words. Native ready-body forwarding BOTH; complete/body-null BOTH still throw; absent-layout/Document unchanged.
- Deliver actual old native completion after real close/destroy: base resurrects the old paginator's own #view/overlay, candidate retains old contents empty/null and emits no stale create-overlayer, anchor/scroll/focus/relocate. Captured late View is disposed/disconnected without touching current ownership; old operation settles without hang/unhandled rejection.
- Deliver actual old completion after **same-paginator** #createView replacement: candidate current newer View/Document/overlay/index/anchor/focus/styleMap/header state remains correct, old captured View disposed; active newer completion succeeds. This distinct control was not proved by the diagnostic Page click and is required future verification, not current evidence.
- Paired active continuation: same retained View attaches actual overlay, preserves body/text/styles and required anchor/focus/scroll, settles normally. No-op stubbing or suppressing all completions cannot pass.
- Repeat-destroy/disposed/null-Document cleanup and late observer reattachment checks; no disconnected/0x0 body targets. Complete invalid body state still fails visibly.
- Negative earlier/later phase controls (first await pending, afterLoad/beforeRender/onExpand, fonts-ready and post-scroll focus) document explicit observation limits. **Any actual stale side effect outside admitted boundary blocks qualification and returns to Brain.** Do not expand source under a passing subset or label these phases canceled.

No more diagnostic probes are authorized now. These are future admitted implementation/test acceptance obligations, not directions to execute them under this proposal.

## Full execution/package contract to carry into any admitted dispatch

Read/admit -> fresh isolated branch/worktree -> exact base red controls -> prescribed patch -> clean npm ci/postinstall/patch-package -> installed red/green actual behavior -> targeted tests -> full npm test, npx tsc --noEmit, npm run build -> independent Solon/Plato read-only reviews -> exact candidate commit/current approved main -> native ARM64 --dir package -> ASAR/dist/main/compiled-patch/resource equality -> full live gates -> held memo/timing/receipt -> normal nonforce branch publication if admitted. No main merge, release, source-freeze lift or terminal state absent Brain confirmation and separate go. No hand-edit installed dependency as deliverable or reuse dependency junctions. Keep primary dirt/prior branches/packages/raw failure receipts untouched.

Required independent runtime gates on exact package, with zero non-enumerated errors/rejections/dumps across all families:

1. Exact unchanged original329s session.mjs: open15s, INTRODUCTION8s, Focus paused60s, Flow playing180s, final paused60s; actual action/timing/word advance assertions; NO ro-wrap/Debugger/runtime correction/shortened --minutes.
2. Separate existing ro-wrap Page->Focus->Flow census, no disconnected or0x0 body targets.
3. Actual Page/Focus/Flow/Narrate roots and5293-word content, plus exactly5 additional fixed-delay Flow/Narrate cycles from the admitted existing bounded script. No retry-until-green or unbounded stress.
4. Actual owned91 All/Archive grid/list/open/return/reopen; initial fields preserved, existing90/91 archived=true exit policy distinguished.
5. Additional fresh **PRODUCT-DEFAULTS full original session**: no library/settings seed or theme/mode/eink/text/zoom/rate override. Complete normal onboarding via visible controls; use built-in sample, no live folder. Record effective saved/DOM/computed defaults before executing unchanged full session with timing/action assertions. If defaults make route inapplicable, STOP for Brain rather than change defaults or silently adapt route.
6. Separate admitted active/stale lifetime acceptance on rebuilt actual package, including exact old close-at-native-resolve and same-paginator replacement cases, paired active forwarding, real identity and stale disposal/observer census. Controlled destructive case's deliberately closed root is not an ordinary four-mode pass; use specific negative/active assertions and retain strict error logs. Instrumentation establishes causal controls; the unmodified sessions remain clean-package authority.

Before any launch obtain exclusive desktop custody. Every route uses distinct fresh owned scratch profile/ports/artifacts and proves actual exe/PID/userData/arm64/isPackaged before input; normal library/settings hashes before/after; >=25s survival; full stdout/stderr/error.log/Runtime exceptions and rejections/dumps; only own PIDs stopped and absence verified. Never install/distribute or touch owner's profile. Current package path is `C:/Projects/Blurby/.worktrees/visibility-observer-verification-20261026/release/win-arm64-unpacked/Blurby.exe` and serves as held baseline, not a repaired candidate.

Fixture provenance: tracked Meditations blob `ffa271998c636c689761ac4eb5773dca92208bf0`, SHA `8be2ab1e681bbde194ded5ba05ffcad218533fd98abfefa8a3af7d699a6c2beb`; compare actual imported and package resource bytes. Unchanged original session SHA `ffeac5f30f6a71547699e3d12464e244f945355a1d7e49a4ec7daff40b290556`; recovered original launcher `C:/Projects/Blurby-artifacts/foliate-observer-leak-1/launch.ps1` SHA `96042b414e538b41519112c92764b835c34e38e6a397e37719fce20d681a7430`. Same source/default-profile provenance is not recovered old packaged-profile byte proof. Preserve both original visibility FAIL receipts and all later diagnostic failures.

## Decisions required from Brain before admission

- Choose Option A's exact post-load ownership/disposal boundary under stated limits, or specify an explicit broader generation/callback contract; confirm retained vs removed redundant assignment and cleanup exactness.
- Confirm exact source/test fence, actual-class/public-path harness and required same-paginator replacement/cleanup controls; any failed earlier/later control means return for scope, not waiver.
- Assign real item URL/Seq/prerequisites, exclusive owner/new branch, documentary writer and fresh origin/main pin. No current code admission exists.
- Confirm full defaults/onboarding session and all six package routes, bounded cycle script hash, independent reviewer acceptance and build-and-hold publication authority.

End state is a concrete reviewable specification proposal. Guard-only history is STOPPED; current package remains WITHHOLD. No functionality decision, lifecycle-safety certification or source authorization is supplied here.
