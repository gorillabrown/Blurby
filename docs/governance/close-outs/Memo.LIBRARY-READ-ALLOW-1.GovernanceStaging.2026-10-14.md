# Sprint Close-Out Governance Staging — LIBRARY-READ-ALLOW-1

Worktree-resident run (`eb/library-read-allow-1`, from `refs/remotes/origin/main` @ `d9469a81`), dispatched by Blurby.Roadmap 2026-10-14. Heavy gates run under load per Blurby Brain's ruling (Rule 11 tier 1, 2026-10-14; closed environmental list, in-scope exclusion, two isolated re-runs). Blurby.Roadmap runs the close-out.

## Gate evidence

### Setup
- Reconciliation: every STOP passed; `npm ci` exit 0; at `d9469a81`.
- Re-grep (standing rule 36), with moves from PACKAGING-FIX-1 only and no content change:
  - `register` `:22` → `:38`;
  - the `read-file-buffer` handler `:160-182` → `:177-201`;
  - `allowedRoots` `:164-168` → `:181-185`;
  - `if (!allowed)` `:169` → `:187`;
  - the BLOCKED log → `:189`;
  - the second `settings.sourceFolder` `:213` → `:231`;
  - the requires at `:11-13` are unchanged.

### Owner smoke
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away).

### Done-when 1 — positive control at C1 (re-run by the orchestrator)
`npx vitest run tests/readFileBufferLibrary.test.js`: **exit 1**, `Tests 2 failed | 3 passed (5)`.
- (a) and (b) fail with `expected null to be an instance of ArrayBuffer`: the roots check blocks the library path; (b) is the drive letter's case flipped (win32).
- Controls (c), (d) and (e) pass.
- `documentsOpenSource` and `packagingFix` pass (implementation agent).
- Typecheck exit 0.
- Deviation: `../file-parsers` is stubbed with a Proxy returning a `vi.fn()` for any export, and `ctx` is a Proxy, because `library.js` destructures many names.
