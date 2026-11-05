# NARRATE-ARROW-PAUSE-1 — readiness enrichment draft

Date: 2026-11-02. Status: PLANNING ONLY / TECHNICAL QUESTIONS OPEN. This draft does not amend the approved source fence, declare Ready, admit execution, publish source, merge, or release. Brain alone coordinates executors. No owner design question is reopened.

## Identity and unchanged outcome

Actual ROADMAP lookup: NARRATE-ARROW-PAUSE-1, Seq99, heading at ROADMAP.md:821 in planning checkout HEAD bc736ccda7e3ba77b52b52959eb4b437c01a8357. Full parent specification remains ROADMAP.md#narrate-arrow-pause-1-spec (the existing section is identified by its exact sprint heading if that anchor is absent).

Owner ruling2026-10-25: while Narrate plays, Left/Right with Shift, Ctrl, Alt, Meta, or combinations pauses; cursor holds its word; Space resumes. Plain Left/Right and PageUp/PageDown retain existing browse/page behavior. No sibling-mode behavior changes.

## Evidence and exact existing path

Source was inspected read-only through local Git objects at held READER-ARROW-GUARD-1 tip51202c1c. These are that commit's line numbers, not claims about a future execution base. Re-grep the actual admitted source before editing.

| Location | Observed fact |
|---|---|
| src/reader/modes/narrate/ModeView.tsx:11–15 | NarrateModeBody calls useNarrateModeBindings(runtime), then spreads viewProps into NarrateFoliateView. |
| src/reader/modes/narrate/useModeBindings.ts:10–15,48–72 | Return type declares viewProps as the complete NarrateFoliateViewProps; object explicitly assembles current callbacks, without onModifiedArrow. |
| src/reader/modes/narrate/FoliateView.tsx:268–327 | Props interface and function destructuring; callback refs/current updates around345–350. |
| FoliateView.tsx:933–938 | Section-document keydown is forwarded to window, preserving ctrl/shift/alt/meta. |
| FoliateView.tsx:1424–1444 | Window listener first requires renderer, then isNarrateBrowseKey; browse path marks browse-away and calls renderer.next/prev. Listener is removed on effect cleanup. |
| src/reader/modes/narrate/helpers/narrateBrowseKey.ts:8–11 | Modified Left/Right are false; PageUp/PageDown remain true with modifiers. |
| src/reader/modes/narrate/ModeRuntime.ts:306–312 | pause checks alive/playing, calls engine.pause, clears playing and notifies. |
| ModeRuntime.ts:461–463 | handleCommand ignores commands other than go-to-href. |
| src/hooks/useKeyboardShortcuts.ts:229–236,286–287 | Shared routing can emit seek/paragraph commands; this file remains forbidden. |
| tests/readerModes/narrateBrowseKey.test.ts | Existing guard assertions cover modified/plain keys and must remain unchanged. |
| tests/narrate/narrate.mode.test.ts:23–35,185–190 | Existing real-runtime/fake-infrastructure and actual NarrateModeView mount patterns are read-only references; no permission to edit this file follows. |

The held guard's staging memo is present in that Git object at docs/governance/close-outs/Memo.READER-ARROW-GUARD-1.GovernanceStaging.2026-10-23.md. It records the base/fix live controls and unchanged guard semantics. Its earlier Narrate-keeps-playing check remains valid for that historical build; the owner explicitly changes the successor behavior here.

## Existing source fence — no silent extension

- M src/reader/modes/narrate/helpers/narrateBrowseKey.ts
- M src/reader/modes/narrate/FoliateView.tsx
- M src/reader/modes/narrate/ModeView.tsx (the parent's previously unnamed mode view)
- M tests/readerModes/narrateBrowseKey.test.ts
- A scripts/narrate-arrow-pause/probe.mjs
- Standard item governance staging memo and admitted external evidence/accounting.

useModeBindings.ts, ModeRuntime.ts, engine files, another test file, shared hooks, Page/Focus/Flow, ReaderContainer.tsx, FlowScrollEngine.ts and src/types.ts are NOT added by this draft. No sibling imports or shared mutable mode store.

## Technical questions for Brain

1. **Callback contract/fence:** a required onModifiedArrow prop makes the existing complete viewProps construction incomplete. Specify the exact callback ownership/typing path: optional prop explicitly supplied by ModeView, or an approved binding-layer amendment. Do not let the executor choose or silently edit useModeBindings.ts.
2. **Outer-path regression:** prescribe the exact mechanical test contract proving actual ModeView/binding output reaches runtime.pause, beyond the helper predicate. Existing fenced narrateBrowseKey.test.ts can be considered for added coverage, but approve its concrete mock/runtime setup; any new test path needs an explicit fence amendment. A test that directly calls runtime.pause without traversing the view prop is insufficient (LL-174).
3. **Listener behavior:** settle callback freshness and placement relative to the existing renderer-availability check, and whether this listener claims browser default handling. Preserve shared routing; unexpected resume/seek/browse from that path stops for Brain rather than widening scope.
4. **Held prerequisite/source exception:** specify whether source may cut directly from held51202c1c while READER-ARROW-GUARD-1 remains In Flight, or must wait for its merge. Existing stacking text is not a terminal-status claim or a new exception. Pin the full actual accepted hash and source/spec custody before source entry.
5. **Probe coverage/artifact custody:** pin the actual guard probe bytes/hash and transfer route. Existing live rows cover Shift/Ctrl/Alt in both directions plus Ctrl+Shift+Right, while owner behavior also includes Meta/all combinations. State whether existing live rows plus complete predicate/outer tests are adequate or name the additional packaged rows. No changed design is requested.
6. **Execution/decomposition:** confirm bounded source/native outcomes below, with setup and ordered reviews counted honestly inside each admission. No old clock, permission or package result transfers to a changed candidate.

## Acceptance outcomes to freeze after ruling

- m1: Left/Right crossed with Shift/Ctrl/Alt/Meta/Ctrl+Shift produce true from isNarrateModifiedArrow.
- m2: plain Left/Right, PageUp/PageDown with/without modifiers, Ctrl+Up/Down and Space produce false; all existing isNarrateBrowseKey assertions remain unchanged.
- m3: Brain-prescribed outer view/binding test proves callback delivery to actual pause behavior, rejects missing wiring, and does not substitute a direct pause call for the outer path. It proves paused invocation does not resume/seek/browse.
- Red tests are committed alone and fail by intended assertions on the exact base; original controls pass. Missing export is dynamically addressed so collection itself succeeds. Wrong-wiring control must fail even when the predicate works.
- PowerShell7: targeted helper/outer tests; tests/narrate and tests/readerModes; npm test; npm run typecheck; npm run build. Exact exit0 is acceptance, with raw logs retained. Do not weaken assertions or edit unrelated tests.
- Packaged route remains Meditations → INTRODUCTION → Narrate. After each prescribed modified-arrow press, immediate and1s reads show playing=false, stable engine cursor/highlight/page, isBrowsedAway=false. Space resumes from the held word or next word. Plain Right remains browse/page control. Guard package base remains playing on modified arrows. Retain every row's evidence.
- Hold-word observations also record word text/correspondence (LL-161), not an index-only screenshot. Audio fakes must not equate scheduling head with heard position (LL-173).

## Proposed separately admitted waves — not active budgets

| Wave | Existing tasks | Original estimate | Prospective ceiling |
|---|---|---:|---|
| AP1 | red helper/outer tests15m; implementation25m; suite/typecheck/build15m | 55m | <=60m / <=40 aggregate tool uses |
| AP2 | packaged probe/controls, rule53, ordered reviews, documents/accounting and source checkpoint | 50m | <=60m / <=40 aggregate tool uses |

Original sum105m is retained, not replaced by a mechanical price or a promise. Standard Marcus specification compliance precedes Plato quality; the older parallel-review wording is superseded only through the final accepted amendment. Reviews, receipts and every worker call count. If setup or remaining checks cannot fit, preserve a partial checkpoint and return for disposition; no extension, automatic successor or compressed evidence claim.

## Placement, persistence, failure handling and close-out boundaries

Sustained work belongs on RodneySr under rule6b. Name the actual host, exclusive worktree/branch, exact source and immutable planning inputs, dependencies, probe/model/fixture receipts and transfer/access prerequisites before each launch. Brain obtains actual consumed input/start receipts and remains sole executor coordinator.

Use current rule53 placement: x64 checks and x64/arm64 package pair on RodneySr, with the prescribed same-commit ARM64 launch on Rodney at merge under its explicit admission. Fresh origin/main reconciliation and Brain package confirmation remain necessary; neither held guard verification nor static tests qualify the successor package. Live profile/sync-queue isolation/custody must be proved before first input. No direct package/app launch is authorized here.

Proposal for external accounting: C:/Projects/Blurby-artifacts/narrate-arrow-pause-20261102/<wave>/logs/admission-accounting.jsonl, UTF-8, recording consumed start, UTC deadline and aggregate calls. This is an external receipt, not a timing-helper mutation. Keep raw output/hashes and failed evidence; no F-011 timing write. Exact evidence paths and absent-target checks belong in the final immutable pointer.

At most two scoped repair passes for an identified mismatch within the same remaining admission; no unchanged-command retries over retained artifacts. Cursor drift, shared-routing interference, ambiguous callback/source fence, missing custody, environment/startup failure or package failure stops for Brain. No speculative engine/shared-hook repair. Never reset, clean, stash, delete retained evidence/locks, or prune branches.

Stage only accepted fence paths and exact approved item docs; preserve unrelated dirt. Standard Marcus governance staging applies in a worktree. Hold source on eb/narrate-arrow-pause-1. Merge only after READER-ARROW-GUARD-1, moved-main reconciliation, fresh package verification, Brain confirmation and the designated merge go. No completion ledger, whole-item completion, release or successor elevation from this draft.

## Lessons/readiness record

Standing rules36/41/42/43/44/45/46/47/48/49/50/51/52/53/54/55 govern pins, accounting/reconciliation, red controls, exact exits, owner/native checks, provider boundaries and package/held-state evidence. LL-174 applies to every callback hop; LL-173 to lagging audio fakes; LL-161 to word correspondence; LL-165 to scratch profile proof. LL-113 keeps external probe copies outside test discovery; LL-128 requires absent-target checks; LL-137 preserves explicit UTF-8/raw bytes; LL-066 forbids silent failures. Other lesson applicability and protected read-only U9/U10 checks remain for final pointer review, not performed by this draft.

No source/tests/runtime/helper/provider writes or executor contacts occurred. Only this standalone planning draft was authored. Real technical questions above remain for root to route to Brain; no Ready/admission is asserted.
