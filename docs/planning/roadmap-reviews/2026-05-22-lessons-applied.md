# Lessons Applied - 2026-05-22

## Lessons Reviewed

| Lesson | Applied To | Action |
|---|---|---|
| SRL-053 - Manual screen QA is mandatory for Foliate reader-mode runtime changes | Step 3 repair and future reader runtime sprints | Add screen-interaction QA as merge/advancement gate |
| SRL-054 - Specs must distinguish hard-selected anchor from last-read/progress anchor | Step 3 repair and READER-ISO-1A | Require explicit anchor taxonomy and precedence tests |
| SRL-055 - Shared Foliate surfaces need live UI gates | Step 3 repair, Flow adapter, Narrate adapter | Add live UI checks for jump-back, render, follow, exact start, and retarget |
| SRL-046 - Isolation sprints need preflight stabilization gates | Adapter isolation resequence | Keep repair gate before extraction |
| SRL-047 - Mode lifecycle must reset local visual refs | Adapter specs | Preserve lifecycle reset requirements |
| SRL-033 - Branch-complete closeouts must not imply main-landed queue advancement | Step 2 branch posture | Do not mark Step 2 complete or mergeable after manual QA fail |
| SRL-036 - Keep one authoritative sprint queue | Workbook update | Mirror Step 3 repair in Catalog/Dashboard |

## Standing Rule Additions Applied

Applied to `ROADMAP.md` under `### Standing Rules All Skeletons Inherit` on 2026-05-22:

15. **SRL-053:** Foliate reader-mode runtime changes require screen-interaction manual QA before merge or roadmap advancement.
16. **SRL-054:** Reader-anchor specs must distinguish hard-selected anchor, last-read progress, live playback cursor, and temporary browse-away position.
17. **SRL-055:** Shared Foliate surface behavior needs at least one live UI gate for real layout movement, rendering, and follow behavior.

## Existing Specs Updated

| Spec / Sprint | Update |
|---|---|
| `READER-PERSISTENT-ANCHOR-STEP3-REPAIR` | Added as Seq 1 full spec and required repair gate |
| `READER-ISO-1A` | Moved to Seq 2 and given Step 3 manual-QA-pass prerequisite |
| `READER-ISO-1D` | Promoted from stub to full spec to preserve five-sprint eager buffer |
| `TTS-QUAL-CI-1` | Remains deferred behind reader runtime stabilization and existing suite health |
| `UX-POLISH-1` | Remains deferred behind stable reader mode controls |

## Lessons Recommendation

Treat the Step 2 manual QA failure as a process improvement rather than a pure implementation miss: the tests did useful work, but live Foliate behavior is its own verification layer. The roadmap now requires both.
