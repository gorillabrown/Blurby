# Roadmap review 2026-10-26 — Phase brief

The approved smoke-fix order starts with keeping completed reads visible. Five bounded repairs now have full specifications in ROADMAP.md. They are planning-complete; none is being dispatched by this review.

## Provenance and reconciliation

Authority: Notion work register, `notion:database/3f87c96cc31e800580cfe019c89a56ca`; SQL readback imported to the registered snapshot at 2026-10-26T20:03:03Z. Final inventory: 192 unique items, 42 Queued, 64 In Flight, 71 Completed, 9 Dissolved, 6 Superseded. Only the new paused-click child changes the prior inventory of191. Existing statuses, release holds, terminal ledger and close-outs are unchanged.

The smoke segment is Seq116–139. Earlier release-fix and held integration work retains its sequence. The child at117 separates proven click/resume behavior from the residual Narrate visual diagnosis at124. All named provider fields were read back and verified; 27 PhaseD mutation plans are resolved, including the superseded temporary fractional placement. No review-owned recovery is outstanding.

## Initial specifications, in relative delivery order

| Repair | Item | Seq | Specification highlights |
|---|---|---:|---|
| Completed reads remain visible | LIBRARY-COMPLETION-VISIBILITY-1 |116| Remove the completed-position ceiling from the engaged reading partition; preserve archive, filters, ordering and saved data. Actual LibraryView tests cover grid/list and boundary cases. |
| Narrate starts at the word selected while paused | NARRATE-PAUSED-CLICK-1 |117| Route an explicit paused selection through the existing fresh-start path; retain ordinary pause/resume. Synthetic real-runtime red/control evidence tests actual audio requests and clock advancement. |
| Page navigation works on entry | PAGE-ENTRY-KEYS-1 |119| Install Page-owned section key forwarding before asynchronous wrapping; deduplicate and clean both effect exits. Update only the Page copy anchor in the ownership map. |
| Focus shows the word cursor without a horizontal band | FOCUS-WORD-ONLY-1 |123| Remove the Focus mask and its band controls after the held band stack; preserve private follow geometry and the other modes. |
| Position choices use the approved order and labels | POSITION-PROMPT-COPY-1 |134| Keep Previous Position first, Move Position second; preserve handlers, anchors, Enter/Escape and focus behavior. |

Full rubric findings and individual holds: [readiness](2026-10-26-readiness.md). Buffer-gap issue: [execution and investigation holds](../../governance/bug-reports/Issue.SMOKE8-SPEC-GAPS.2026-10-26.md).

## The remainder of the agreed order

Focus handoff118, folder switching120, profile/write isolation121 and residual Narrate visuals124 remain diagnosis-gated. Typography122 follows the approved normalization policy. E-ink125–130 follows: device-local settings, white grayscale/contrast-only presentation, unavailable Focus, screen-at-a-time Flow/Narrate and refresh on view changes. Retry feedback131 and UI text132 precede dropdown dismissal133, prompt134, approximate page counter135, footer removal136, tray icon137, duplicate presentation138 and coverage recheck139.

Approved choices are recorded in [the delivery plan](2026-10-26-plan.md): preserve a visible Narrate selection's viewport; label250-word page estimates; E-ink from Focus enters Page paused at the same place; normalize decoration while preserving semantic emphasis; show loading while switching folders; completion offers Keep in Library or Archive, with dismissal retaining the item. AUTO-ARCHIVE-1 is a Stub until its confirmation-first rewrite is specified; the previous design is archived.

## Readiness and exit criteria

Specification: the five new cards pass the universal checks, including mechanical U9/U10. Prerequisite: held integrations still apply. Repository: source is pinned to d8e44864 and named branches are planned; active library ownership and integration windows remain unresolved. External register: verified. Execution environment: native ARM64 package verification and owner desktop/audio observations remain required. Consequently this review contributes **0 immediately dispatch-ready items of target5**; five complete specifications do not satisfy the remaining findings.

Implementations must demonstrate failing production-path controls, pass targeted and full tests, typecheck/build, independent compliance/quality review, and exact-candidate packaged acceptance before the established merge/release gates. No app test, build, runtime preference or user data was changed by this planning review.

Task-row historical prices total18minutes for each of Library/Narrate/Page and21minutes for each of Focus/prompt, excluding all waits and integration work. These are generic kind calibrations with high historical error, not delivery promises. End-to-end duration is not computable while ownership, integration and owner verification are held.

## Risks, lessons and metrics

Primary risks are overlapping LibraryView ownership and mistaking a synthetic green control for packaged desktop/audio acceptance. Keep mode runtimes independent; use explicit integrated baselines and the prescribed package gates. [Lessons applied](2026-10-26-lessons-applied.md) records applicability and retained promotion decisions.

No deadline is declared, so pace against a date is not computable. Effort-weighted remaining work is not computable because28 existing items lack Effort. Scope-discipline delivery score is not computable (0/0 terminal changes); backlog additions are not delivery. Holding bay:0 absorbed,0 withdrawn,0 open and5 previously closed. Board comments:0 open,0 resolved,0 adopted. Board generation and publication results are recorded in the final validation.

Next action: resolve the existing integration/ownership window for **LIBRARY-COMPLETION-VISIBILITY-1**, then run the dispatch gate against its full specification. This review grants no merge go or release exception.

## Follow-up owner decision — visibility implementation window

The owner subsequently requested clearing integration and ownership for LIBRARY-COMPLETION-VISIBILITY-1. The [admission decision](2026-10-26-library-visibility-admission.md) grants that item the first exclusive LibraryView/new-test implementation/build-and-hold window. APP-TABS-1 remains built/held and integrates the accepted visibility result later. The general visibility entry-hold statements above are superseded only to that extent. No other item, package qualification, code-merge go or Stage8 release gate is cleared. No implementation is launched by this amendment.
