# Lessons Applied - 2026-05-21

## Lessons Reviewed

| Lesson | Applied To | Action |
|---|---|---|
| SRL-046 - Isolation sprints need preflight stabilization gates | Reader Runtime Solidification phase | Add `BASELINE-SYNC-1` before adapter extraction |
| SRL-047 - Mode lifecycle must reset local visual refs | Adapter specs | Require `select()` / `start()` lifecycle reset guarantees |
| LL-125 - Narrate must stay audio-owned even when Flow shares its surface | Reader isolation conveyor | Keep Flow and Narrate adapter phases separate |
| READER-4M-3 word-anchor lessons | Anchor service phase | Preserve word `0`, hard selection precedence, and spoken truth vs visual fallback separation |
| SRL-029 / SRL-030 broad-suite gate lessons | TEST-GREEN-1 and TTS-QUAL-CI-1 sequencing | Insert test triage before CI gate wiring |
| SRL-036 authoritative sprint queue | Roadmap review follow-up | Update workbook Catalog after canonical roadmap approval |
| GOVERNANCE-SWEEP ghost agent finding | Agent/workflow governance | Add rename propagation grep rule |
| GOVERNANCE-SWEEP deferred human-review list | Governance follow-up planning | Add `GOV-HUMAN-REVIEW-1` stub after baseline sync |

## Standing Rule Additions Applied

Applied to `ROADMAP.md` under `### Standing Rules All Skeletons Inherit` on 2026-05-22:

11. **SRL-046:** Cross-mode/shared-surface refactors must start with a preflight stabilization gate that locks exact-anchor, visual-follow, and mode-switch invariants.
12. **SRL-047:** Mode adapter specs must include lifecycle reset requirements for local visual refs, browse-away state, cursor baselines, and recenter affordances.
13. **Broad-suite-before-CI:** Do not dispatch CI gate wiring while default broad-suite failures are being waived as unrelated debt; first classify or fix them.
14. **Agent rename propagation:** Any agent rename must include a grep-and-replace pass across the governing docs and workflow references before the rename sprint closes.

## Existing Specs That Need Updates

| Spec / Sprint | Needed Update |
|---|---|
| `2026-05-21-reader-mode-runtime-isolation-design.md` | Split implementation into roadmap-level dispatch slices `READER-ISO-1A` through `READER-ISO-1E` |
| `TTS-QUAL-CI-1` | Add prerequisite: TEST-GREEN-1 complete or default suite has approved failure classification |
| `UX-POLISH-1` | Add prerequisite: reader runtime surface stable enough that Space/Play/mode controls are not churning |
| `GOVERNANCE-SWEEP` | Add close-out + SpecRetro entry, then include in baseline sync commit plan |

## Lessons Recommendation

Promote SRL-046, SRL-047, and the agent-rename propagation rule into standing rules for the next roadmap update. They are not abstract process notes anymore; they are directly load-bearing for the next five sprints and the governance hygiene lane.
