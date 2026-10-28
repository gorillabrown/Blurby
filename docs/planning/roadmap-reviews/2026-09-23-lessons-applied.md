# Blurby — lessons applied in the roadmap review
Date: 2026-09-23.
Scope: Phase D review of the mode-separation specification and retained downstream scope.

## Sources and authority
Registry roles resolve lessons to docs/governance/LESSONS_LEARNED.md, closeOuts to docs/governance/close-outs, roadmap to ROADMAP.md, outsideAudits to docs/studies/audit, and governance reference material to docs/governance. The prior July 2 lessons report is historical evidence, not a current certificate.

Sources inspected include LL-108/109/112/120/121/124/125/126/127; the close-out retrospective's SRL-046 through 077 and 079/086/087/088/089/090/091/092; ISO-1B/1D/1E close-outs; the A5 live-QA gate report; TTS_ARCHITECTURE_DECISIONS.md; and the current source inventory. The decision register preserves Kokoro as the operational floor and other engines as dormant. No new engine/research decision is needed for this isolation stage.

## Deduplicated checklist
| Theme / source | Application to the new head | Downstream implication |
|---|---|---|
| Baseline before extraction — SRL-046, 086, 087, 088 | G0 pins branch/source/build and captures four mode baselines before production edits | Prior source positions must be re-read after extraction |
| Complete local ownership — LL-120/121/125, SRL-047/061/073/074/075/076/077 | Private state, view/DOM/style, timers and callbacks; remove Narrate→Flow runtime alias; same-mode no-op and 12 transition tests | Existing adapters are groundwork, not proof of independent runtime |
| Anchors and zero — LL-108, SRL-054/056/064/065/091 | Copy-only handoff; preserve separate selection/resume/playback/browse values; exact word-zero and delayed-extraction assertions | Intent priority and A5 position behavior must survive; cleanup cannot replace correct read priority |
| Cancellation races — LL-109 | Capture document/session identity; invalidate before cancellation; reject after await and again at side-effect port | Old work cannot persist, scroll or restart audio after a switch |
| Mirror first — LL-112 and owner direction | Same folder/API shape, independent implementation, no common behavior base | Future consolidation requires a separate owner decision and parity evidence |
| Rendering proof — PR-17 and SRL-053/055/057/058/059/079/085 | Plain controller ownership, real view instances, same/cross-section gates, fresh candidate build and per-mode screen QA | Unit counts do not prove the running app embodies a fix |
| Audio grounding — LL-124/126/127, SRL-060/063/070/072/092 | Preserve measured known defects; require independent audible-output evidence; no added lag tuning | HEARD re-measures the separated runtime; SUBSCRIBER remains verdict-gated |
| Source/field verification — SRL-086/087/090 | 57 current source files and 27 existing test files verified; exact canonical Monday identity/revision/readback | No spreadsheet assumptions, guessed call counts or stale constant claims |
| Dependencies and rollback — SRL-089, standing rule 10 | Five serial waves; explicit staging manifest, per-wave rollback and two-correction ceiling | Six product lanes do not make shared code safe for concurrent writes |
| Broad regression — SRL-049, standing rule 1 | Typecheck, full tests, build and diff gate; no new skips; no fixture rebaseline to hide changes | Known live defects remain separately labelled, not broad-suite waivers |

Counts above describe the source-inventory artifact [2026-09-23-source-evidence.json](2026-09-23-source-evidence.json), not executed test results. Checklist rows consolidate repeated observations without creating new rule IDs.

## Corrections applied
- Disambiguated the active roadmap's compensation rule from the retrospective's SRL-090 structured-file rule. The June compensation decision keeps a descriptive label and source; the existing retrospective is untouched.
- Corrected the live guidance to trusted lag 450 ms versus heuristic lag 350 ms. The registered lessons file retains the historical text and receives an append-only correction. Scheduler compensation is already present; no double delay is authorized.
- Clarified that SRL-074's shared hook was an intermediate ownership location. The approved stage now moves each implementation together with its refs.
- Aligned ROADMAP/CLAUDE Git prose with the effective registry: exact-path local commits permitted, network operations ask, no inferred automatic merge/push/branch deletion.
- Preserved the A5 position PASS and the separately failed 1.4x overlap observation. The cause remains a hypothesis requiring a new probe; no global rate-increase diagnosis is asserted.

## New and existing specification review
The new [inline mode-separation specification](../../../ROADMAP.md#reader-mode-separation-2) incorporates the checklist in G0–G6, test migration, failure handling and scope boundaries.

HEARD, COLLAPSE, SUBSCRIBER and UX remain blocked stubs. Their previous full specifications are preserved in [the pre-isolation archive](2026-09-23-pre-isolation-specs.md); their shared-runtime edit sites must be re-authored after the head closes. The owner explicitly approved this sequencing, so no further decision is being inferred.

KOKORO-EXPORT retains its historical Full Spec label but is blocked/deferred and outside the dispatch buffer. No dispatch certification is conferred on it. Terminal backfill remains a close-out operation under its writer policy.

## Remaining governance work
The registered lessons and the historical close-out retrospective still occupy different files. A dated cross-reference/correction now prevents the identified active guidance conflicts, while physical consolidation is deferred. Unrelated pre-existing edits in SpecRetro.Lessons_Learned.md were not edited by this review.

No application code, tests, runtime measurements, source commits or live QA were produced by this review.

