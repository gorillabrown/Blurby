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

### Done-when 2–4 — at C2 `b9c2a7e8` (orchestrator)
- DW2: 3 files, 14 tests, **exit 0**.
- DW3: `main/ipc/library.js:2`, exit 0.
- DW4: `:192 settings.sourceFolder,` (allowed-roots line, untouched) and `:239`, exit 0. The specification's `:166` and `:213` moved by +26 (PACKAGING-FIX-1 plus this item's function).
- Typecheck (implementation agent): exit 0.

### Done-when 5 — heavy gates under load, at C2 `b9c2a7e8` (orchestrator)
- `npm test`: **exit 0**, 155 files, 2,092 passed / 1 skipped / 0 failed. No failing set, so no environmental classification and no isolated re-runs were needed.
- `npm run typecheck`: exit 0. `npm run build`: exit 0.

### Done-when 6 — scratch-profile launch control (orchestrator)
- Builds: C1 `--dir` build in a detached worktree at `d0dbc610`, and C2 `--dir` build at `b9c2a7e8`; both exit 0.
- Driver: a scratch script launches the unpacked app on a fresh `BLURBY_USER_DATA_DIR` profile under `%TEMP%` with `--remote-debugging-port=9333`, clicks "Skip tour", then opens the seeded "LRA1" card. The owner's profile and Drive were not touched.
- **Instrument deviation:** the specification's seed `library.json` row has no `"ext"`. Without it the app lazily converts the book on open and never calls `read-file-buffer` on the seeded path, so C1 and C2 look the same and the control proves nothing. With `"ext": ".epub"` added to the seed row:
  - C1 (control): 1 `BLOCKED` log line, and the reader shows "Could not read EPUB file".
  - C2: 0 `BLOCKED` lines; `foliate-view` is present and the Meditations cover renders (screenshot checked).
  - Profiles: `%TEMP%\blurby-lra1-c1control_ext-dec1c39c…` and `%TEMP%\blurby-lra1-c2_ext-f5ccbbcf…`.
- **Staging fold-in for Blurby.Roadmap:** add `"ext": ".epub"` to the DW6 seed row in the LIBRARY-READ-ALLOW-1 specification, so the control can fail.

### Reviews
- Spec compliance (Solon): **APPROVED.** 7 of 7 PASS: code character-identical to the specification, the BUG-196 Status line verbatim, tests (a)–(e) not weaker, fence exact.
- Code quality (Plato): **READY**, with no required fixes.
  - Optional: a `convertedEpubPath` match test.
  - **Follow-up for Blurby Brain (Rule 11 tier 2, trust boundary):** `save-library` (`main/ipc/library.js:47`) takes the renderer's library wholesale. A compromised renderer could set any `filepath` and then read it through `read-file-buffer`. That capability already existed through the id-based handlers (`load-doc-content`, `get-doc-chapters`), which read `doc.filepath` with no roots check, so this item opens no new class of access. Proposed follow-up: `save-library` keeps `filepath` and `convertedEpubPath` from the existing library, or the id-based handlers get a path check.
