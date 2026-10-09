# Journal — Separate Page, Focus, Flow, and Narrate runtimes

<!-- Append only. Never edit or delete an old entry — corrections get their own entry.
     One entry per session or work burst, newest last. Write as you go. -->

## S0 — 2026-10-09 04:30 — scaffold

- **Did:** epic packet created ([charter](charter.md), [plan](plan.md), [state](state.md), [launch](launch.md)). No project work performed. Owner answers: packets live in `docs/planning/epics`; push the run branch at checkpoints and merge/push `main` only after `done.md`; GOV-HYGIENE block runs before launch; owner gates pause-and-keep-working.
- **Learned:** the run worktree's git link is broken (the repo moved from `C:\Users\estra\Projects\Blurby` to `C:\Projects\Blurby`). An uncommitted evidence file (`baseline-narrate-loopback.wav`) appears to sit in it. The archived baseline build lives in `%TEMP%`. The lessons parser reads 0 lessons until GOV-HYGIENE lands. See charter Assumptions A1–A7 and launch.md preflight.
- **Git:** `eb/reader-mode-separation-2` @ `74883154` (base `1e5485c6`); not on origin; uncommitted: unknown until the worktree is repaired.
- **Next:** P1 per plan.md, starting with charter A1.

## S0b — 2026-10-09 06:00 — pre-launch amendment (adversarial review)

- **Did:** No project work. The packet was amended before launch after an adversarial review raised 8 findings; the owner approved the amendment, recorded in ROADMAP as Mid-Dispatch Amendment 2026-10-09:
  - R1: authoritative packet is in the run worktree; the kickoff prompt bootstraps there.
  - R2: finalization is staged F1–F5 and resumable from git reality; `done.md` exists only after publication.
  - R3: no `src/` change before G0; contract/ports move to Wave B.
  - R4: the implementation-wave action ceiling is dropped (owner). Admission budgets 8/20/35 are kept, with no continuation grant.
  - R5: identities B0/I/S/F are named.
  - R6: D6 scope is `I..F`, with packet paths registered.
  - R7: refs are written in full (already fixed in fae71ebb); the harness guards are updated in P1.
  - R8: integration is verified in a clean worktree, never the primary checkout.
- **Learned:** The old baseline archive in `%TEMP%` lost all 21 files. B0 is rebuilt under the owner's rebuild policy: inputs must match, fresh validation, both manifests kept, and a hash mismatch alone is not an escalation.
- **Git:** run branch unchanged, `eb/reader-mode-separation-2` @ `74883154`; the amendment lands on `main` via `eb/epic-packet-amend-2026-10-09`.
- **Next:** P1 bootstrap per launch.md.
<!-- Entry template — copy for each session:

## S[N] — [YYYY-MM-DD HH:MM]

- **Did:** [what actually happened — name the things, no aggregates]
- **Learned:** [facts, surprises, dead ends worth not repeating]
- **Decisions:** [pointers to new Decision-log rows, if any]
- **Gate/DoD movement:** [status changes + evidence pointer, if any]
- **Git:** eb/reader-mode-separation-2 @ [sha]; uncommitted: [exact paths, or none]
- **Next:** [where the following session should pick up]

-->
