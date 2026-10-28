# Spec Retrospective — Lessons Learned (MOVED)

> **This ledger was merged into the canonical Lessons Learned document on 2026-07-02.**
>
> The entire SRL (Spec Retrospective Lessons) series — SRL-001 through SRL-091 — now lives in:
>
> **[`docs/governance/LESSONS_LEARNED.md`](../LESSONS_LEARNED.md) → section "Spec Retrospective Lessons (SRL Series)"**
>
> That file is governing document #4 ("Lessons Learned") in `CLAUDE.md`, so the SRL series is
> now reachable from the standard session-start reading path. The LL-series (engineering
> lessons) and the SRL-series (workflow/dispatch-spec lessons) coexist in that one file and
> cross-reference each other.

## Why this moved

The SRL series was cited by ~25 `ROADMAP.md` "Standing Rules All Skeletons Inherit" entries
(SRL-012, 046, 047, 053–070, 073, 074, 079, 086, 087, 089) but lived only here, in a file no
governing-docs table pointed to. A reader following `CLAUDE.md` to `LESSONS_LEARNED.md` could
not find them. The 2026-07-02 governance sweep consolidated the two ledgers into a single
source of truth and, in the process, de-duplicated SRL-086 through SRL-090 (each had been
defined twice) by keeping a best-of-both entry per number.

## Where to add new SRL entries

**Add new SRL entries to `docs/governance/LESSONS_LEARNED.md` under the
"Spec Retrospective Lessons (SRL Series)" section**, in SRL-number order. Do **not** append
new entries to this stub — anything added here is orphaned from the canonical ledger and will
be flagged by the next governance sweep.

The `/phase-closeout` and `/mid-dispatch-decision` skills have been updated to target the
canonical location.

_Full pre-merge content is preserved in git history and in the governance-sweep backup under
`.governance-sweep-backup/`._
