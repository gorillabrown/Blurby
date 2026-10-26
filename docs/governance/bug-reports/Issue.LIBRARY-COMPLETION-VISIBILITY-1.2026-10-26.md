# Package-gate issue — LIBRARY-COMPLETION-VISIBILITY-1

## 1. tl;dr
The original visibility source repair passes its tests and functional package route, but strict package confirmation is withheld because the native package logs the pre-existing BUG-187 ResizeObserver flood.

## 2. Executive Summary
The original candidate0dd4d940 and unchanged baseline36ac7466 both emit the same unhandled observer-notification family. Neither raw package receipt passes the clean-log gate; a positive baseline does not waive it. Blurby.Brain reviewed artifacts independently, accepted the source repair as built and held, and authorized a separate isolated combined verification window using the existing observer repair. No source/main merge or release permission is granted.

## 3. Evidence of issue
- Candidate:1465 identical-family error.log lines over26,007ms; baseline:1471 over26,013ms.
- Both native ARM64 packaged identities and distinct scratch userData paths were proved before input; normal library/settings hashes match before/after; no dumps and no captured CDP exceptionThrown events. The error.log still contains renderer window-error notifications.
- Candidate's completed-card list/grid/Archive checks and actual91-word EPUB open/return/reopen pass. Initial rendering preserves fixture fields; existing reader-exit policy changes the owned fixture to position90/91 and archived=true.
- Raw evidence: C:/Projects/Blurby-artifacts/library-completion-visibility-1-20261026/candidate-v3-package-result.json and baseline-v2-package-result.json, package logs/screenshots, asar-parity.json.
- Executable SHA2565e9cae9911e0eafcba67581c9833a9b7af07eb9a0c70410f48d0dafd7b73d608; ASAR SHA25636882f3894b9008e798e6473094031b78c633c55952ead626ed22a5b09090a5e. Brain and the independent reviewer rechecked21 renderer files and main-source parity.

**Tried and failed:** the retained worker artifacts are the mechanical source for these attempts; no central guards dispatch journal was created for this parent run. Initial manual-TXT fixture reopened through an existing re-import fallback, so it was replaced by a valid owned EPUB. Ordinary DOM recursion could not inspect Foliate's closed tree; renderer.getContents() proved the actual91 words. The valid EPUB run completed functionality but failed on error.log. Raw attempts remain intact; do not repeat the obsolete fixture or DOM detector.

## 4. Possible cause(s)
1. Existing BUG-187 Foliate observer lifetime leak: historically reproduced in packaged builds and already has a built held patch; both current package receipts show its exact error family.
2. If the existing observer patch does not clear this route, the current loop mechanism requires new technical investigation. Matching message text alone does not prove that every loop shares one cause.
No evidence implicates the visibility predicate edit; the unchanged package control already floods.

## 5. Likely solution(s)
Brain expressly approved a separate isolated integration/verification branch, eb/visibility-observer-verification-20261026, preserving original branches. Integrate approved main → visibility docs-only successor a8e31b73 → observer51759276, with the exact pre-existing two disconnects and named tests. The [admission packet](../../planning/roadmap-reviews/2026-10-26-visibility-observer-admission.md) retains the full observer15s/8s/60s/180s/60s route, separate census, visibility regression route, clean install, full suite/typecheck/build and all standing-rule53 checks. A new package/commit/hash set needs fresh Brain confirmation. If loops or any non-enumerated error remain, stop with counts/census; no scope expansion or noise exception.

## 6. Confidence in cause and solution identification
7 — baseline and historical intervention support the existing observer-repair direction; the new combined route is not yet qualified. This issue is open until its named gates pass and Brain confirms.

## Decision history
- Owner delegated technical rulings to Blurby.Brain; design decisions remain with the owner.
- Brain: WITHHOLD original package confirmation; no observer-noise exception.
- Brain: APPROVED separate isolated combined build-and-hold window, no main merge/freeze lift/release/terminal completion.
- Parent: source/test quality, governance60d11b42 and both bounded investigation reports independently approved; combined qualification pending.

Exported issue documentation path: docs/governance/bug-reports/Issue.LIBRARY-COMPLETION-VISIBILITY-1.2026-10-26.md


## Combined verification update

Brain's separate admission produced combined source aa5f1485. Its full329,236ms original observer route, separate4observer/4target census and owned91-word completion route are clean. This establishes the observer repair on those actual controls; it does not rewrite original FAIL receipts.

The separate four-mode check still fails strict standing-rule53 with one captured/logged style-null TypeError, already tracked as BUG-222. No package confirmation, code/main merge, freeze lift or release go is granted. A read-only exact-stack investigation is producing the next technical decision input for Brain; no speculative guard, suppressed log or new source scope is approved.
