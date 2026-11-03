# FOCUS-WORD-ONLY-1 — canonical readiness enrichment draft

Date2026-11-02. Existing Seq123, Queued / Full Spec, Reader Engine. PLANNING ONLY / NOT READY / NO EXECUTION ADMISSION. Preserve the prepared serial order **117 →123 →119**. The historical prepared run was stopped2026-10-31; the owner subsequently said resume and delegated execution coordination to Brain. That direction does not supply this item's fresh source admission, custody or qualified inputs. Brain alone coordinates execution and technical custody. This supplements the existing ROADMAP card and historical amendment; it creates no replacement registered item/specification or new epic.

## Authority, closed choices and outcome

Read `ROADMAP.md:1835–1874` and `docs/planning/specs/2026-10-30/FOCUS-WORD-ONLY-1.amendment.md` together. The amendment supersedes its named stale card rows, and the current card's resolved F-Q1–3 supersede the amendment's final open questions. Do not re-ask these choices:

- **F-Q1, Brain1:** keep the now-unused Focus helpers; cleanup is a separate LOW follow-up. Keep their pure helper-math tests unedited.
- **F-Q2, owner2026-10-30:** Focus has no leading or trailing space. Its word follows Flow's shared Top / Top third / Centre anchor, but section edges clamp to available scroll range as before R7; first text starts at the top. Anchor controls stay only in Flow's bar, not Focus's.
- **F-Q3, Brain1:** remove `rm-focus-view--band-off` from Focus. External probe authoring must use the new mask/inset/cursor contract; the old open probe-class question is not a design blocker.

Outcome: focus reading retains its exact word cursor, paused/playing selection, RSVP and private anchor scroll while removing its horizontal dimming mask, R7 leading/trailing space and band-only controls. Flow, Narrate and Page retain their own behavior. No fix to FOCUS-PAUSED-HANDOFF-1 or Narrate visual defects is claimed.

## Source recipe, audit evidence and custody

Historical primary input is held PLAY-FIRST-TEXT `ebea731111f82b162690f5a1306e9ed50c54cc9f`, containing BAND-ALIGN-2 R8 `e8e6de06510d96e029653ae59cc5d7d6cd5747a9`, then approved main integrated. The historical amendment was inspected against main88e82ba5 and describes a docs-only BUG-236 Status conflict, retaining main status. Those old merge results are not proof against a moved main or an undiscovered local checkpoint.

This audit read the actual ebea Git objects for Focus FoliateView, mode.css, bottom bar and existing band tests. The symbols/locations below agree with that held object. No source was checked out, changed, merged or run. The amendment says those key production files are byte-identical after its historical main merge; the future integrated base still needs fresh immutable readback.

The amendment's explicit fallback is e8e6de06 plus approved main only if PLAY-FIRST-TEXT is not verified at dispatch. This is a **separate named variant**, not an executor choice or permission to silently exclude it. Brain must fix the actual variant and exact merged commit/tree; its tests/probe must describe only that chosen tree. If the fallback lacks focusPlayFirstText.test.ts, do not quietly drop it from the amended command: resolve the future command and later PLAY-FIRST integration gate explicitly before that cut. The original merge order remains BAND-ALIGN-2 →PLAY-FIRST-TEXT →this item.

Use the actual quiet-host common repository `C:/Users/estra/Projects/Blurby/.git` as the custody anchor; do not infer permission to mutate the old detached bq-main, its stash or RUN4 evidence. Prospective branch remains `eb/focus-word-only-1`; actual worktree path, branch/local dirt/checkpoint owner, qualified dependency tree, host capacity, origin access and artifact transfer must be read back by Brain before any launch. Do not create an alternate worktree over unknown local work. Existing historical host/path/npm-ci recipe is not current consumed authority.

## WHERE and exact fenced edit contract

Read actual AGENTS, shipped Virtuoso/Zeus and registered overlays, live lessons, frozen governing card/amendment/F-Q rulings, then these held-object sites in order. Re-grep all final sites against Brain's immutable admitted base; line drift does not authorize a new behavior decision.

1. `src/reader/modes/focus/FoliateView.tsx` in ebea:
   - Imports around36–39: remove only unused `collectParagraphAround`, `computeParagraphBandEdges`, `computeLeadingInsetPx`, `computeTrailingInsetPx` imports. **Do not delete their helper implementations.**
   - Delete `setFlowInsetsForRenderedDocs`473–487, `getFlowLeadingInsetPx`500–506 and `getFlowTrailingInsetPx`509–516 and their call/dependency references.
   - Both real `injectStyles` call sites, section load800–803 and settings reinjection1283–1286, explicitly pass `{flowLeadingInsetPx:0, flowTrailingInsetPx:0}`. Keep unrelated settings and style behavior unchanged.
   - `bandLayout`491 becomes anchor-only from `normalizeBandAnchor(settings.flowZonePosition)`. Its refs/comparison shapes no longer contain `on`; layout-change detection1316–1318 compares anchor only. Focus must not read flowBandEnabled for a visual/scroll effect.
   - Delete `hideBand`524–530 and `placeBandAroundSpan`533–556 and all calls/dependencies. Highlight's no-word branch709 still returns false; highlight721–722 calls alignSpanToBand only when allowMotion, otherwise does nothing.
   - Keep alignSpanToBand589–608 scroll geometry; remove only its band-paint call609/dependency. Keep arrival1188 and click/selection via centerResolvedTokenInReadingWindow743.
   - Zone effect applyZoneProperties1309–1325: no span does nothing; changed anchor aligns cursor; otherwise no effect. Remove inset-setting call1312, band painting and cleanup's --flow-zone-top/bottom removals1338–1339, and inset cleanup1341/dependencies. Retain writeZoneLineStepPx/readZoneLineStepPx, ResizeObserver, `scheduleWordPositionIndexRebuild("flow-zone-resize")`1333, and the separate container-resize observer.
   - Root1390 always `className="rm-focus-view"`; no band-off class. No observer/census anchor is removed.
2. `src/reader/modes/focus/mode.css`: replace mask/defaults33–55 and band-off57–61 with `.rm-focus-root .rm-focus-view { -webkit-mask-image:none; mask-image:none; }`. No other CSS surface changes.
3. `src/components/ReaderBottomBar.tsx:368–384`: comment identifies Flow-only band controls; guard changes `(surfaceMode === "focus" || surfaceMode === "flow")` to `surfaceMode === "flow"`. Keep both Flow groups, labels, option values, callbacks and aria behavior unchanged. No ReaderContainer or settings schema edit.
4. Read new/existing tests below and the retained Focus helper math; private Focus foliateLayout/foliateStyles are outside the edit fence.

**Authoritative amended fence:** production only Focus FoliateView.tsx, Focus mode.css, ReaderBottomBar.tsx; add tests/readerModes/focusWordOnly.test.tsx; modify **only Focus entries** in tests/readerModes/bandAlign2R7.test.tsx, bandAlign2R8.test.tsx, bandAlign2.test.tsx, bandAlign2Cover.test.tsx. Exact own docs are the card's BUG_REPORT subcase, Memo.FOCUS-WORD-ONLY-1.GovernanceStaging.2026-10-26.md and Timing.FOCUS-WORD-ONLY-1.jsonl under their registered role paths once explicitly admitted.

Forbidden: Focus helper deletion, boundary-policy.json/census mutation, ReaderContainer.tsx, src/types.ts, FlowScrollEngine.ts, all Flow/Narrate/Page runtime source, src/styles/flow.css, shared settings/schema/producer, user-profile resets and unrelated tests/refactors. The stale card's two-production-file fence is superseded by the amendment above.

## Literal controls and existing-test migration

New tests/readerModes/focusWordOnly.test.tsx uses actual Focus stylesheet/view and real bottom bar/provider, based on the existing Foliate view fixture; no mock of the property under assertion. Keep the amendment's exact fw1–fw7 names/contract:

- **fw1:** paused and playing, computed mask-image and -webkit-mask-image both none. The real base control observes its mask, not an import error or stylesheet regex. If jsdom cannot compute a property, report that assertion unavailable there and supply the required real packaged-renderer check later; do not forge computed values or promote source regex to computed-style proof.
- **fw2:** selected span retains page-word--highlighted, canonical word identity and CFI before/after the visual change.
- **fw3:** actual Focus bottom bar has no role group Band position, no Band group/button. The base has both, proving absence detector sensitivity.
- **fw4:** Flow retains both groups; presses set flowZonePosition0,1/3,0.5 or toggle flowBandEnabled through unchanged callbacks. Flow keeps its mask; Narrate mask and Page remain unchanged.
- **fw5:** every rendered Focus section has leading/trailing inset custom properties0px at all three anchors. First-word arrival scroll is0 and first text is at view top. Base's leading inset equals anchor y and is demonstrably detected.
- **fw6:** mid-section arrival/click aligns cursor line centre within ±0.5px of shared anchor; anchor change re-scrolls without changing reading word. flowBandEnabled toggle causes no scroll, class or --flow-zone-* change. Edge clamping follows closed F-Q2, not a new inset workaround.
- **fw7:** drive outer entries section load, settings reinjection, ResizeObserver callback, highlightWordByIndex with/without motion, anchor change and zero-word section. After each: no --flow-zone-top/bottom, no rm-focus-view--band-off, all section insets0px. This catches forwarding hops missed by direct-helper tests.

Existing migrations are precise, not blanket test weakening:

| File in tests/readerModes/ | Amended Focus-only change | Retained opposing controls |
|---|---|---|
| bandAlign2R7.test.tsx | Remove Focus from MODES159–160; w1–w5/c1/c2 then Flow-only; fw1/fw5–7 replace Focus coverage | All Flow case bodies unchanged; pure LAYOUTS a2/a4/b1 remain for retained Focus helpers |
| bandAlign2R8.test.tsx | Remove Focus from MODES178–179 for w6/z1/w8; u1 loop349 becomes flow-only; fw3 replaces Focus UI row | Flow cases unchanged; LAYOUTS p1–p7 remain |
| bandAlign2.test.tsx | r5 loop274 becomes flow-only; Focus r6 at425 replaced by fw6's no-toggle-effect assertion | m2 at405, p2 at415 and pure helper loop217 unchanged |
| bandAlign2Cover.test.tsx | Remove Focus from MODES79–80 for c6–c8; fw7 zero-word hop replaces Focus coverage | Flow bodies unchanged |

At source entry, freeze actual original/prescribed/wrong-variant input identities and exact-command receipts under rule44. Each absence/removed-inset control must fail for its specific base behavior and discriminate a deliberately wrong mask/inset/control or dropped-hop variant on an admitted verification surface; no changed Flow oracle or collection/import error is the red. Actual missing receipt details are readiness work, not executed evidence in this draft.

Primary variant targeted command from the amendment, expected exit0 on prescribed final bytes:

```text
npx vitest run tests/readerModes/focusWordOnly.test.tsx tests/readerModes/focus.contract.test.ts tests/readerModes/focus.behavior.test.tsx tests/readerModes/focusKeys.test.tsx tests/readerModes/focusPlayFirstText.test.ts tests/readerModes/bandAlign2.test.tsx tests/readerModes/bandAlign2R7.test.tsx tests/readerModes/bandAlign2R8.test.tsx tests/readerModes/bandAlign2Cover.test.tsx tests/readerModes/bandAlign2Forward.test.tsx tests/flowReadingZone.test.ts tests/readerModes/zoneLineStep.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts tests/readerModeBoundaries.test.ts
```

No command was run here. Preserve full stdout/stderr/exit/input hashes. Final source diff must name nothing under Flow/Narrate directories or src/styles/flow.css; inspect complete diff plus protected hashes, not a broad stat-only inference.

## Verification, package and release gates

Fresh final-byte `npm test`, `npm run typecheck`, `npm run build` each exit0 on the named quiet host in a separately sized verification cut. Targeted controls do not replace them. No silent package/native waiver follows from this visual scope.

Preserve the amendment's rule53 temporary placement: final-commit builds `--dir --x64` and `--dir --arm64` on RodneySr, with approved origin/main integrated first. Compare entry parity of dist/, main/, main.js, preload.js, package.json and record raw SHA256 of both app.asar files. Prove the built main.js scratch override, initialized actual scratch profile under LL-165, 25s x64 launch without errors/rejections/crash/dump, unchanged named live library/settings before/after, and ASAR renderer parity with dist. ARM64 launch is required at merge; before it record the exact limited x64-verified/ARM64-at-merge disposition, never full native acceptance.

External package probe remains outside the repository, under the amendment's `C:/Projects/Blurby-artifacts/focus-word-only-1/package-probe/` custody boundary. Its actual bytes/commands/absent-or-existing-output custody must be specified before launch, never guessed here. On exact x64 packaged Blurby.exe with owned public-domain Meditations fixture, record Focus paused/playing computed masks none, section insets0px, first text at top, mid-section alignment for all anchors, no Focus groups and intact Flow groups/mask. Native computed-style/asserted geometry evidence is required even if a source test is green.

Owner-seen selected-word/play/pause check remains on release gate2: underline retained, no horizontal dimming or first-line space, Flow/Narrate under their own contracts. Build-and-hold only. Brain package confirmation then Roadmap merge go are separate; this draft authorizes neither main merge nor release/status/Seq change.

## Ownership, order, failure and persistence

Product Reader Engine; execution surfaceC plus its Focus tests. Shared-core touches empty. Reserve exclusive Focus view/CSS and bottom-bar ownership; serial against overlapping controls work. No parallel code run is authorized by this draft or the existing card. Prepared117→123→119 order remains; integration follows the explicitly accepted band/play-first source train. Notion/live prerequisites and admitted windows must be read back by the owning coordinator.

At source entry, a moved source recipe/new source or test conflict, unexpected observer/helper requirement, altered controls or unknown checkpoint stops to Brain before further edits. Docs conflicts preserve current main status plus branch-only new entries/resolutions as the existing recorded conflict policy requires; do not discard whole branch-only sections. No owner design re-ask for F-Q1–3.

If m2/p2 or any Flow row fails, stop: accepted scroll/Flow behavior changed. A missed forwarding hop may be repaired only within the named fence; otherwise require an amendment. If the integrated base cannot show the actual mask/inset/control red, preserve output and re-anchor rather than weakening the oracle. Two identified scoped repair passes maximum inside the currently admitted cap; no unchanged retry over old evidence. Rollback only this item's commits with git revert under actual custody, stopping on conflicts; no reset/clean/stash/deletion. Failures preserve partial checkpoints and leave package/release acceptance held.

Future checkpoint stages only the enumerated files/hunks and exact admitted own docs after diff/stat/protected-hash checks. Branch/refspec remains `HEAD:refs/heads/eb/focus-word-only-1`; no commit/push occurs except under the separately consumed git/admission instructions. Existing timing helper is not assumed read-only; no automatic timing/backfill mutation.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Exact source variant, custody, dependency inputs and final site contracts are read back | calculable | source-preflight | bounded | medium | 5m | — | — |
| 2 | fw1–fw7 and actual base/wrong controls distinguish removed visuals from retained scroll/Flow | calculable | positive-control | bounded | high | 12m | — | — |
| 3 | Three production files remove only Focus band/insets/controls at every hop | calculable | ui-fix | bounded | medium | 12m | — | — |
| 4 | Existing Focus test entries migrate with retained Flow/helper/m2/p2 controls unchanged | calculable | test-migration | bounded | medium | 8m | — | — |
| 5 | Final full suite/typecheck/build and ordered source reviews are complete | calculable | source-verification | bounded | medium | 20m | — | — |
| 6 | Paired packages, native/probe evidence and own held documentation meet the written gates | calculable | package-verify | bounded | high | 20m | — | — |

**Total:** provisional serial chain77m · sum77m; 0of6 estimates calibrated. New planner estimates are not historical29m task medians, measured durations or a delivery ETA; owner waits and unbounded custody recovery are not priced into them. Source/control, full verification and package work need independently admitted cuts, each≤60m/40aggregate calls and no automatic successor. Exact split/deadlines/call budgets and capacity require Brain's disposition before launch; no clock is active. Protected mechanical U10 is pending.

##### Lessons applied

- LL-090: pinned actual mask, view forwarding and bottom-bar sites read; no inferred common root cause.
- LL-087: preserve ref initialization order when reducing bandLayout/ref/comparison shapes; actual import/type verification remains required.
- LL-088: single-owner amended fence prevents overlapping Focus/bottom-bar exports or simultaneous edits.
- LL-068: full-file preservation, diff/stat and protected hashes; a CSS regex or targeted test is not full build proof.
- LL-120, LL-121, LL-125: Focus-owned view/CSS/anchor scroll remain distinct from Flow/Narrate; no compatibility alias/sibling runtime import.
- LL-139: every real import/consumer remains accounted for; retained helpers and boundary observer census are not deleted by name-based cleanup.
- LL-150: Focus CSS edits are enumerated; no shared stylesheet/asset deletion is inferred.
- LL-165: actual initialized scratch profile proof precedes native input; no live-profile inference from a launcher label.
- LL-174: fw7 exercises both injection calls, effect/cleanup, highlight, align and root-class hops; direct helper math cannot prove forwarding removal.
- LL-142: source/mocked geometry cannot qualify installed computed style or owner-visible behavior.
- LL-143 latest Observation annotation plus standing rule44: exact actual commands, base/prescribed/wrong inputs and exits; no copied or planner-surrogate PASS.
- LL-172: exact own-doc fence/accounting; no helper timing/backfill side effects authorized.
- LL-175: unrelated accepted PDF fixture bytes/configuration remain outside this item; no format-specific whitespace exception generalized to source.
- Standing rules43/44/55: each no-mask/no-space/no-controls verdict has positive/opposing detector evidence. Rules41/42/46/47/48/50/51/52/53/54 preserve exact input/staging/status/host/full verification/test/package/native gates and do not create an admission.
- Considered not applicable to the edit: LL-106 (no IPC/preload contract), LL-157/159 (no quit/persistence writer), LL-168 (no installer), LL-169 (no new async lifetime; retain existing observers), LL-170 (no canonical grouping/stamping change), LL-171 (no register/helper mutation), LL-173 (no audio-output fake). FOCUS-PAUSED-HANDOFF diagnosis and exact word identity runtime work remain separate; this removal changes neither.

This is a bounded semantic lesson application, not an asserted full current-live U9 census or mechanical PASS. Retired/promoted histories remain current; standing rules govern promoted requirements. Parent performs any further protected census/checks before final Ready.

## Five readiness findings / remaining inputs

1. **Specification:** closed design/F-Q decisions and amended sites/fence/tests are carried forward; exact selected-base controls/probe bytes/commands, final pricing/splits, full semantic/mechanical U9/U10 and final ordered independent draft reviews remain uncollected. No Ready finding.
2. **Prerequisites:** actual band/play-first source prerequisites and authorized integration/release windows remain to verify. Prepared execution order117→123→119 is scheduling, not proof that117 must merge or be accepted before123; no new dependency is created here. Historical owner stop is superseded by the subsequent resume/Brain-coordination direction, while fresh item-specific source admission remains required.
3. **Repository:** primary/fallback recipe is explicit, but immutable final integrated commit/tree, conflict inventory and branch/worktree/dirt/checkpoint custody require Brain's fresh receipt. Old bq-main facts are not current custody authority.
4. **External register:** live Seq123/status/prerequisites and matching published pointer must be read/confirmed by parent through the guarded provider; this draft changes none.
5. **Execution environment:** actual quiet-host source/artifact transfer, qualified dependencies, Node/runtime/architecture capability, current resource slot, exact package-probe output custody and actual input consumption remain pending. Native/package/owner gates are not waived.

No helper/provider/source/runtime/test/executor action was performed. Only this new planning draft is authored. Root owns review/folding/publication; Brain alone coordinates execution.
