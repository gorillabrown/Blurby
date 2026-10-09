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

## S1 — 2026-10-08 23:40 (host clock; packet dates run a day ahead) — bootstrap

- **Did:** Bootstrap per launch.md. `git fetch origin --prune`. Charter A1 hit: `Mid-Dispatch Amendment — 2026-10-09` at ROADMAP.md:278 on both `refs/heads/main` and `refs/remotes/origin/main` (`aafbb1c9`). `git worktree repair` relinked W (gitdir → `C:/Projects/Blurby/.git/worktrees/reader-mode-separation-2`); the repair also reported 15 unrelated broken `C:/tmp/*` worktrees, left untouched. Branch `eb/reader-mode-separation-2`, HEAD `74883154` as expected. Uncommitted (A4): ` M tests/perf-baseline-results.json` (test noise, never staged) and `?? E/baseline-narrate-loopback.wav` (referenced by Issue `-2`, `baseline.json` and `paths.json` → register and commit). Merged `refs/remotes/origin/main` `--no-ff` cleanly (no overlapping paths) → **I = `92dda255bfad4395600a4371f0406f0f55c92899`**. Pushed; origin `refs/heads/eb/reader-mode-separation-2` = I, divergence 0/0. Switched to this authoritative packet.
- **Learned:** On this Windows checkout the loose-ref directory is `.git/refs/heads/EB/` (uppercase), so git enumerates the run branch as `EB/reader-mode-separation-2` and `git push origin eb/reader-mode-separation-2` fails with "cannot be resolved to branch". Push with the explicit refspec `HEAD:refs/heads/eb/reader-mode-separation-2` (origin uses lowercase `eb/`). Upstream tracking is set. The owner set `/goal` and said "proceed without my approval overnight" → launch Q2/A5 answered yes.
- **Decisions:** state.md Decision log #3 (explicit push refspec), #4 (A5 answered).
- **Git:** eb/reader-mode-separation-2 @ 92dda255; uncommitted: tests/perf-baseline-results.json (noise), E/baseline-narrate-loopback.wav (to commit at checkpoint).
- **Next:** register packet paths in `E/paths.json`; rebuild B0; update harness guards; lessons; A1-R.
<!-- Entry template — copy for each session:

## S[N] — [YYYY-MM-DD HH:MM]

- **Did:** [what actually happened — name the things, no aggregates]
- **Learned:** [facts, surprises, dead ends worth not repeating]
- **Decisions:** [pointers to new Decision-log rows, if any]
- **Gate/DoD movement:** [status changes + evidence pointer, if any]
- **Git:** eb/reader-mode-separation-2 @ [sha]; uncommitted: [exact paths, or none]
- **Next:** [where the following session should pick up]

-->
