# Stage 8 smoke issues — 2026-10-26

Owner-requested intake and prioritization. Running build unchanged; release smoke remains RED. The running BUG_REPORT is the bug index.

[Full source map, evidence limits, acceptance outcomes and priorities](../../planning/roadmap-reviews/2026-10-26-smoke-triage.md).

| Bug | Issue | Work item |
|---|---|---|
| BUG-224 | Uneven book typography remains after the release type-scale fix | BOOK-TYPE-SCALE-2 |
| BUG-225 | Initial PageDown does not work until mouse navigation | PAGE-ENTRY-KEYS-1 |
| BUG-226 | Paused Page-to-Focus entry initially highlights the wrong word | FOCUS-PAUSED-HANDOFF-1 |
| BUG-227 | Narrate ignores a paused clicked word and its paused display is offset | NARRATE-SELECTION-START-1 |
| BUG-228 | Folder content lags behind its header and large libraries stall | FOLDER-SWITCH-CONTENT-1 |
| BUG-229 | Folder dropdown stays open after an outside click | DROPDOWN-DISMISS-1 |
| BUG-230 | Completed unarchived reads vanish from visible library groups | LIBRARY-COMPLETION-VISIBILITY-1 |
| BUG-231 | Failed Retry has no clear visible acknowledgement or result | FOLDER-RETRY-FEEDBACK-1 |
| BUG-232 | Normal-profile sync queue changed during isolated smoke; writer unresolved | PROFILE-QUEUE-ISOLATION-1 |

Existing bugs reused: BUG-203 (tiny tray), BUG-188 (Flow band; Focus removal is a new design request), BUG-187 (observer flood). No duplicate bug numbers for these.
F6 flashing is the explained E-ink overlay and maps to refresh-policy work. F11 identical contents at distinct paths is a non-destructive design investigation. R1–R13 all map in the report, including the AUTO-ARCHIVE-1 owner amendment.
This document adds no release gate and waives none. No completion, migration, user-data deletion or implementation is authorized by intake.
