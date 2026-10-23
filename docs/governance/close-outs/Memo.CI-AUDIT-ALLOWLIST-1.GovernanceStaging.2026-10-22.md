# Dispatch Close-Out Governance Staging — CI-AUDIT-ALLOWLIST-1

Worktree-resident dispatch: `eb/ci-audit-allowlist-1`, cut from `refs/remotes/origin/main` @ `8e834ea3` after ELECTRON-42-UPGRADE-1 (`331fb81b`) and JSONSTORE-TIMEOUT-1. This is the last code and lockfile change before the freeze for gate (1) and the owner smoke.

## Re-read on the post-upgrade base (standing rule 36, LL-142)

- **`ci.yml`:** the audit step moved from `:22` to `:24`, with the same text, because ELECTRON-42-UPGRADE-1 added the `node node_modules/electron/install.js` step. `node-version` is 24.
- **`npm audit --json` (all dependencies):** metadata `0 critical, 10 high, 5 moderate`.
  - The high and critical IDs are exactly the specification's: adm-zip ×5, sharp ×3, braces ×1 and follow-redirects ×2.
  - The specification's "10 high" is npm's metadata count; the named IDs number 11.
  - Moderates fell from 6 to 5. They are out of scope.
- **`npm audit --omit=dev --json`:** the 8 adm-zip and sharp IDs only. The stop condition did not trigger.

## Evidence

- **Done-when 1:** on the unchanged lockfile and `package.json`, `npm audit --audit-level=high; $LASTEXITCODE` printed `1`.
- **Control, live gate before the follow-redirects fix:** `node scripts/ci/audit-gate.mjs` printed `not allowlisted: GHSA-q3jh-wrc6-jgq8 follow-redirects (high) …` and `not allowlisted: GHSA-8r9p-f939-6h3c follow-redirects (high) …`, then `audit-gate: FAIL, 2 …`, exit 1.
- **Done-when 2:** `npm update follow-redirects` printed "changed 1 package". The scratch comparison printed exactly `node_modules/follow-redirects: 1.16.0 -> 1.16.1`, changed no top-level key, and exited 0. `git diff refs/remotes/origin/main -- package.json` was empty.
- **Done-when 3:** `scripts/ci/audit-gate.mjs` imports only `node:child_process` and `node:fs`.
  - Its options are `--input`, `--allowlist` (default `.github/audit-allowlist.json`) and `--today` (default: today's UTC date).
  - Without `--input` it runs `npm.cmd` on Windows or `npm` elsewhere.
  - Exit codes: 0 ok, 1 not allowlisted or review overdue, 2 unparsable allowlist or audit output, including npm output with no `vulnerabilities` map, such as a registry error.
  - `stale:` lines do not change the exit code.
- **Done-when 4:** `.github/audit-allowlist.json` has 9 entries: the 5 adm-zip, 3 sharp and 1 braces IDs. Each is `{ id, package, reachability, reviewBy: "2027-01-22" }`, and each reachability note is condensed from the matching `DEPENDENCY_ADVISORIES.md` row.
- **Done-when 5:** `npx vitest run tests/auditGate.test.js`: `Tests 8 passed (8)`, exit 0. The 8 are cases (a)–(g) plus a control on the committed allowlist's shape.
- **Done-when 6:** `node scripts/ci/audit-gate.mjs` printed `audit-gate: OK, 9 high/critical advisory(ies), all allowlisted and in date (today 2026-10-23)`, exit 0. Today in UTC was 2026-10-23.
- **Done-when 7:** `git grep -n -F "npm audit --audit-level" -- .github` exited 1. `git grep -n -F "node scripts/ci/audit-gate.mjs" -- .github/workflows/ci.yml` printed one line, `ci.yml:24`.
- **Done-when 8:** `DEPENDENCY_ADVISORIES.md` gains a follow-redirects row in the *Fixed* table (1.16.1, CI-AUDIT-ALLOWLIST-1, 2026-10-22, both GHSA IDs) and a *CI audit gate* section. The section names the allowlist file and the 2027-01-22 review-by date, and says that renewing an entry needs a fresh reachability check.
- **Done-when 9:** owner's machine, shared with blurby-6b's RELEASE-RUNBOOK-1 packaging. No failure has been classified here; every result is reported.
  - **Run 1 (`478f4387`):** `npm test` exited 1, `Tests 1 failed | 2426 passed | 1 skipped (2428)`. The failure was `tests/folderWatcher.test.js` "a 1 MB read started 20 ms after startWatcher …", first error line `AssertionError: 1 MB read 72 ms, max event-loop gap 52 ms (read budget 50 ms, gap guard 250 ms): expected 71.5010000000002 to be less than or equal to 50`. The test is outside this item's diff. Typecheck and build both exited 0.
  - **Re-run (same tree, 00:19Z):** `npm test` exited 0, `Tests 2427 passed | 1 skipped (2428)`. During it, seven processes whose command lines matched electron-builder, app-builder or makensis were running.
  - **`tests/folderWatcher.test.js` alone, twice:** 11/11 each time, exit 0.
  - **Final tree `b0c26d17` (after the review fixes):** `npm test` exited 0, `Test Files 177 passed (177)`, `Tests 2430 passed | 1 skipped (2431)`. Typecheck exited 0, and build exited 0.
  - The merge tree `f0d3426d` (with `refs/remotes/origin/main` @ `50f92579` merged in) differs from `b0c26d17` only in governance files, so its code is the tested code.
- **Review (independent, read-only, `478f4387`):** Done-when 2–8 and 10 met, with no blocking findings. The low findings were fixed in `b0c26d17`, a technical decision under Rule 11 tier 1:
  1. A high or critical advisory without a `url` was skipped silently (fail-open). It now exits 2, tested as (h).
  2. A registry failure exited 2 but hid npm's message. The message is now printed, tested as (j).
  3. Allowlist validation was loose. Now `id`, `package` and `reachability` are required, `reviewBy` must be a real calendar date, and duplicate IDs are rejected, tested as (i). `--option` without a value is now an error rather than a silent default.
  4. The sharp reachability notes had dropped "when it is not found". It is restored.

  Done-when 5 is now `Tests 11 passed (11)`: (a)–(j) plus the allowlist control. Done-when 6 is unchanged: `OK, 9 …`, exit 0.
- **Done-when 11:** open until after the merge. `gh run list --workflow CI --branch main --limit 1 --json conclusion` is reported to Blurby.Roadmap.
- **Done-when 10:** `git diff --name-status refs/remotes/origin/main HEAD` on `478f4387`, which has `refs/remotes/origin/main` @ `3b9a31af` merged in (governance-only changes since `8e834ea3`), lists exactly the 6 specified paths.
