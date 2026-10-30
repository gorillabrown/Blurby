# Roadmap review 2026-10-26 — Phase B assessment

**Provenance:** live Notion provider, notion:database/3f87c96cc31e800580cfe019c89a56ca; 191-row readback/snapshot 2026-10-26T19:17:09Z; provider kpis saved in the smoke run as review-20261026-kpis.json. Repository main d8e44864708d40e2a472f3e6436d936e9ee96bfa. PhaseA was approved by the owner in this conversation.

## Work and pace

- 41 Queued and 64 In Flight; 71 Completed, 9 Dissolved, 6 Superseded, 0 Blocked in the live register. In Flight includes built/merged work held for evidence; it does not mean 64 simultaneous implementations.
- Policy dispatch-buffer target is5. Provider reports5 filled and0 ready under its current U9 calculation. Full Spec labels are not a readiness verdict.
- Total effort, completed effort and effort-based completion are **not computable**: the provider reports missing effort for28 items. No substitute estimate is supplied.
- **No dated deadline is declared.** Pace against a date is not computable. Finish line remains the Stage8 release; failed/partial smoke blocks that release.
- No new terminal delivery is proposed. Added backlog is scope input, not shipped work and not counted as forward delivery. A forward/(forward+sideways+backward) score for this no-delivery interval is not computable.
- No open held entries and no open board comments. Prior review's lesson decisions carry forward; no new close-out exists to justify speculative promotion.

## Risk and planning order

The owner approved: completion visibility/confirmation → reading-position correctness → folder responsiveness/profile isolation → reader visuals/held fixes → E-ink/device behavior → interaction clarity/polish → exact-build recheck.

1. **Completion visibility:** the source-confirmed display partition excludes completed records, including from Archive. LIBRARY-COMPLETION-VISIBILITY-1 should be specified first as an independent visibility correction. Do not bundle first-open completion detection or silent auto-archiving into that correction.
2. **Narrate selection:** an artifact-only probe of the real runtime reproduces hardSelect20 while paused followed by togglePlay requesting the old word8, then advancing to9. Calling the existing start path in the control requests20 and advances21. This proves the recorder can distinguish the defect. It does not diagnose the separate band/viewport symptoms.
3. **Focus handoff:** the current select path synchronizes its anchors, while later canonical re-stamping can replace highlighted spans without a paused repaint. This is a concrete hypothesis requiring a real-view red control, not a proved fix.
4. **Page entry:** section key forwarding is installed after asynchronous wrapping; mouse navigation already reaches the parent handler. The missing-forwarder interval is source-proven. The specification must require an exact early-wrap control before claiming the owner's initial-key symptom resolved.
5. **Visual work:** preserve the held Flow/observer fixes and follow their integration order. Focus band removal is an explicit owner change; remove only its visual mask and band-only controls, not its private follow geometry.
6. **E-ink/UI:** retain all approved requests. Device-local settings and independently owned Flow/Narrate movement are contracts. Page-counter semantics remain an owner choice; a 250-word approximation must not be presented as physical pagination.

## Assessment verdict

Proceed with the agreed priority order, but separate verified causes from investigative gaps. Narrow the first repair so it does not depend on the larger confirmation feature. For Narrate, recommend a focused paused-click fix and separate outstanding visual diagnosis. Do not call all smoke fixes dispatch-ready or waive the release hold.

No source edits, branches, dispatches, status moves or sequence changes have been made by this review. Existing summaries that predate rebuilt Narrate and current queue will be reconciled only in the approved planning update.

## Checkpoint

Confirm this assessment before PhaseC decomposes and places the work. Approval authorizes planning only, not implementation or a release integration window.
