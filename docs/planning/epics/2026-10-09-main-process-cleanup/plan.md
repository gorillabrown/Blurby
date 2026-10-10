---
epic: main-process-cleanup
charter: charter.md
---

# Phase Plan — Main-process cleanup

<!-- The route, not the contract. Replan phases if reality demands it (log it in state.md
     → Decision log and journal.md). Gates only tighten. Re-read charter.md at every gate. -->

Serial order and why: the register sequence 6 → 7 → 9. The items are file-disjoint (`combine`'s only edge, `tests/perf-baseline-results.json`, is a never-stage file), so the order is for one clean merge stream, not for dependency. Keep it when replanning; a blocked item may let the next item's *work* proceed, but merges stay in order.

## Phases

### P1 — Bootstrap and baseline
- **Intent:** Create the packet worktree and branch per launch.md and switch to the authoritative packet. In it, `npm ci`, then baseline `npm test` and `npm run build` on `refs/remotes/origin/main` (record the counts and any KF-1 occurrence). Re-read `lessons --open` and the three specs.
- **Exit gate:** the packet branch is pushed; the baseline is recorded in state.md → Evidence (exit codes, pass/skip counts); assumptions A1, A4 and A5 checked.
- **Rough size:** under 1 hour.

### P2 — Cloud retry sharing (CLOUD-RETRY-SHARED-1)
- **Intent:** Monday → In Flight. Branch and worktree per the spec. Implement `main/cloud-retry.js`, the two provider wrappers and `tests/cloudRetry.test.js` exactly as the spec prescribes. Verify C1, then integrate, merge (`--no-ff`) and push (launch.md), giving C2.
- **Exit gate:** C1 and C2 pass.
- **Rough size:** 1–2 hours.

### P3 — Sidecar adapter sharing (TTS-SIDECAR-SHARED-1)
- **Intent:** Monday → In Flight. Task 1: the characterization suite on unmodified code, committed. Task 2: extract `main/python-sidecar-adapter.js` with thin provider configs, committed. Verify S1, then integrate, merge and push, giving S2.
- **Exit gate:** S1 and S2 pass.
- **Rough size:** 2–3 hours.

### P4 — Legacy parser removal (CLEANUP-LEGACY-PARSERS-1)
- **Intent:** Monday → In Flight. Re-census (stop on any non-doc reference). `git rm` the file, fix the two doc lines, verify L1, then integrate, merge and push, giving L2.
- **Exit gate:** L1 and L2 pass.
- **Rough size:** under 1 hour.

### P5 — Integrated verification and completion
- **Intent:** Run DINT fresh on `refs/remotes/origin/main` in a clean worktree, then launch.md → Completion protocol (`done.md` on the packet branch, merged and pushed).
- **Exit gate:** DINT passes; `done.md` is on `origin/main`.
- **Rough size:** under 1 hour.

## Gate log

| Date | Gate | Evidence |
|------|------|----------|

## Current-phase worklist

- [ ] P1 — per state.md → Next actions
