# Journal — Blurby Business: a walled-off PDF viewer and editor

<!-- Append only. Never edit or delete an old entry — corrections get their own entry.
     One entry per session or work burst, newest last. Write as you go: after each
     finished item or surprising result, not just at session end. -->

## S0 — 2026-10-30 21:30 — scaffold

- **Did:** created the epic packet ([charter](charter.md), [plan](plan.md),
  [state](state.md), [launch](launch.md)) on Rodney from the roadmap item
  BLURBY-BUSINESS-1, its held storyboard, `phase1-specs.md` and the four-app matrix. No
  project work was performed.
- **Learned:** the charter accepts seven assumptions, each with a guard (RodneySr
  readiness, pdf-lib annotation fidelity, @signpdf and the certificate store, qpdf on arm64,
  partial text editing, `main` moving mid-run, Phase 1 spec drift). The preflight is in
  launch.md. RodneySr was not reachable from the scaffold machine, so its checks fall to
  the first session.
- **Git:** main @ `5d07b515` (scaffold base); the run branch `eb/blurby-business-1` is not
  created yet.
- **Next:** P1 per plan.md.

<!-- Entry template — copy for each session:

## S[N] — [YYYY-MM-DD HH:MM]

- **Did:** [what actually happened — name the things, no aggregates]
- **Learned:** [facts, surprises, dead ends worth not repeating]
- **Decisions:** [pointers to new Decision-log rows, if any]
- **Gate/DoD movement:** [status changes + evidence pointer, if any]
- **Git:** eb/blurby-business-1 @ [sha]; uncommitted: [exact paths, or none]
- **Next:** [where the following session should pick up]

-->


## S1 — 2026-11-02 22:52 UTC — isolated worktree setup

- **Did:** verified main and remote equality at `ac19ea60b6cd8b4fff3e5413b111925b7ef78485`, scaffold ancestry, frozen packet input equality, branch/destination absence; created `C:/Projects/bb-business` on `eb/blurby-business-1` through the real common repository. Initial checkout was clean.
- **Learned:** the packet's old bq-main anchor was an assumption corrected by BB-1; no old detached checkout, stash or evidence was changed. Qualified helper's 220 raw hashes, canonical blobs, inventory and import origins passed again; read-only policy permits explicit branch pushes. No registry/helper command or fresh SQL was invoked; parent-confirmed readback is labelled as such.
- **Decisions:** consumed Brain BB-1/BB-2 at governance `5378f87a50471f485d2ecfcf6d2db6f81663c462` without merging governance into source. Source window closure and separate Business/CPU ownership accepted. Theme export is future scope only.
- **Gate/DoD movement:** setup only; D1–D21 unmet. No npm installation, baseline suite, build, native or product source/test edits.
- **Tried and failed:** unsupported model failure remains preserved in the chat. Python CP1252 stdout failed printing charter U+2192 before worktree creation; partial receipt preserved, same-wave UTF-8 correction explicitly authorized by coordinator.
- **Git:** docs-only setup checkpoint on `eb/blurby-business-1`; exact resulting commit/remote equality recorded in the external final receipt. Only state.md and journal.md staged.
- **Evidence:** `C:/Projects/Blurby-artifacts/business-worktree-prep-20261102/`; helper acceptance `C:/Projects/Blurby-artifacts/business-helper-prep-20261102/acceptance.json`.
- **Next:** STOP for Brain setup acceptance; require a separately bounded dependency/baseline admission and resource reservation. No automatic HB-6 implementation.
