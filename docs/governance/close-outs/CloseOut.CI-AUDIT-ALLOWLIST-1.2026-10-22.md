# Close-out — CI-AUDIT-ALLOWLIST-1: CI fails on a new high advisory, not on the reviewed ones (2026-10-22)

runtime: not measured (no time log kept for this S item; every step recorded in the staging memo)

**Goal:** replace CI's bare `npm audit --audit-level=high`, which failed on `main` on every run, with a gate that fails only on a new or out-of-date high or critical advisory.
**Result:**
- `scripts/ci/audit-gate.mjs` (built-ins only; exits 0, 1 or 2) checks `npm audit --json` against `.github/audit-allowlist.json`. The allowlist has 9 reviewed entries (5 adm-zip, 3 sharp, 1 braces), each with its reachability note and a 2027-01-22 review-by date.
- `ci.yml:24` now runs the gate.
- follow-redirects moved from 1.16.0 to 1.16.1 (one lockfile key), which fixes the two unreviewed advisories GHSA-q3jh-wrc6-jgq8 and GHSA-8r9p-f939-6h3c.
- `DEPENDENCY_ADVISORIES.md` records both.
- Merged as `47ae6e1f`. `main`'s CI run 39878011747 is green on windows-latest and ubuntu-latest; the run before it, on `aa60fd59`, failed both legs at the old audit step.

**Learned:** No new lesson — the item followed standing rule 36 and LL-142. It re-read the advisory set on the post-upgrade base and stopped-or-proceeded on the spec's named condition. It found the ID set unchanged, and npm's "10 high" summary undercounts the 11 IDs.
**Recommend:** review the allowlist by 2027-01-22, and earlier when DEPS-AUDIT-1's adm-zip or sharp notes change.
**Bottom line:** `main`'s CI is green again, and a new high advisory will now fail it.

## Evidence (Done-when, verified 2026-10-22)

| # | Criterion | Evidence | Result |
|---|---|---|---|
| 1 | The old step fails on the base | `npm audit --audit-level=high` exits 1 on the base; main CI run 39877782622 on `aa60fd59` failed both legs at that step | pass |
| 2 | follow-redirects fixed, lockfile only | One lockfile key, 1.16.0 → 1.16.1. `package.json` unchanged (planner-verified diff). | pass |
| 3–4 | Gate script and allowlist | Built-ins only; 9 entries with id, package, reachability, reviewBy. Duplicates and bad dates rejected. | pass |
| 5 | Gate tests | `tests/auditGate.test.js` 11/11, including an allowlist control | pass |
| 6 | Live gate | "audit-gate: OK, 9 high/critical advisory(ies), all allowlisted and in date", exit 0. The control before the fix failed on exactly the two follow-redirects IDs. | pass |
| 7 | CI wiring | The old grep exits 1; the gate appears once, at `ci.yml:24` | pass |
| 8 | Advisories doc | follow-redirects row under Fixed; "CI audit gate" section | pass |
| 9 | Suite, typecheck and build | Final tree `b0c26d17`: 177 files, 2,430 passed, 1 skipped, 0 failed; typecheck 0; build 0. The merge-ready tree `f0d3426d` changes governance files only. | pass |
| 10 | Fence | `git diff --name-status 47ae6e1f^1 47ae6e1f`: the 6 spec paths plus the memo (planner-verified) | pass |
| 11 | First main CI run | Run 39878011747, headSha `47ae6e1f`: success, both jobs (planner-verified with `gh run view`) | pass |

**Populations:**
- Run 1, on superseded tree `478f4387`, had one failure: `tests/folderWatcher.test.js`'s 50 ms read budget (72 ms), with seven electron-builder processes packaging alongside. The test is outside the item's diff and passed alone twice (11/11), so it meets Stage 8's closed-list conditions. It is recorded as such.
- That run is not the accepted evidence. The accepted evidence is the final tree, which had no failure.
- 1 skipped test is pre-existing.

## Findings and dispositions

| Finding | Disposition |
|---|---|
| Review low findings: a gated advisory with no url was skipped; npm's error was not shown on exit 2; the allowlist schema was loose; `--opt` with no value was accepted | Fixed in scope (`b0c26d17`; tier 1). The gate now fails closed. |
| Moderates are 5, not the spec's 6 | Accepted: out of scope (the gate covers high and critical) |

## Mid-Dispatch Decisions

None.

## Lessons

No new lesson — applied standing rules 36 (re-grep `ci.yml` after ELECTRON-42-UPGRADE-1 moved the step to `:24`), 41, 43 (control: the live gate red on the two unreviewed IDs), 44, 46, 47 and 48, and LL-142 (the advisory set re-read by running `npm audit` on the base, not taken from the spec). All held. LL-164 was checked: no lesson-status line was appended.

## Files Created

- `.github/audit-allowlist.json`, `scripts/ci/audit-gate.mjs`, `tests/auditGate.test.js` and the staging memo: committed with the merge.
- The worktrees `ci-audit-allowlist-1` and `ci-audit-allowlist-1-merge` are kept (maintenance).
