# Dispatch Close-Out Governance Staging — PDF-IMPORT-DIAG-1

Worktree-resident dispatch (`eb/pdf-import-diag-1` from `refs/remotes/origin/main` @ `19802621`). Every governance change other than BUG-190's status line (an edit site of the specification) is staged here for the close-out.

## Evidence recorded for the close-out

- **Done-when 1 (positive control, before any source edit):** commit `a708ae21` adds the real-parser test alone. `npx vitest run tests/epub-converter.test.js -t "real pdf-parse"` exited 1 on the base source: `× converts a real PDF with the installed real pdf-parse (no injected parser)`, `TypeError: parse is not a function`; `Tests 1 failed | 35 skipped (36)`.
- **Done-when 5 control:** with `main/ipc/library.js` reverted to the base, `tests/pdfLoadDocContent.test.js` failed its userError case (`Tests 1 failed | 1 passed (2)`), and passed with the fix.
- **Done-when 2, 4, 5:** `npx vitest run tests/epub-converter.test.js tests/pdfLoadDocContent.test.js`: `Test Files 2 passed (2)`, `Tests 39 passed (39)`. `pdfkit`'s output parsed under Vitest's Node with the fallback globals, so the tracked-PDF fallback was not needed.
- **Done-when 3:** `git grep -n -F 'require("pdf-parse")' -- main` prints one line (`main/pdf-text.js:8`); `git grep -n -F 'globalThis.DOMMatrix' -- main` prints three lines, all in `main/pdf-text.js`.
- **Done-when 6:** under `node_modules/electron/dist/electron.exe` with `ELECTRON_RUN_AS_NODE=1`, the scratch probe printed `OK timeblocking chapters 1 valid true (1884 ms)` and `OK DNC. May-20-2026 chapters 1 valid true (2295 ms)`, exit 0. The canvas binding did not load; the fallback globals were used. Electron's stdout reaches PowerShell only when piped; the run used Git Bash with `| cat`.
- **Done-when 7 (owner's machine, tree `8cfc4682`):** `npm test`: `Test Files 175 passed (175)`, `Tests 2413 passed | 1 skipped (2414)`, exit 0. `npm run typecheck` exit 0. `npm run build` exit 0.
- **Review (independent, read-only):** Done-when 1–5, 8 and 9 met; edit sites match; no blocking findings. Finding 1 taken: `tests/setup.js` pre-sets the PDF globals, so no test reached `ensurePdfGlobals`; `tests/epub-converter.test.js` gains a test that deletes them first (red with the helper made a no-op, green restored). Findings 2–3 left: `extractContent` now also makes a discarded best-effort `getInfo()` call under the same 30 s deadline, and a pre-parse failure now returns its PDF user message instead of the outer catch's. Neither changes a message for a readable PDF.
- **Done-when 10:** deferred to the batched owner smoke (gate 2).
- **Merge order:** if ELECTRON-42-UPGRADE-1 merges first, re-run Done-when 6 on its Electron before this item merges.
- **Environment:** the new worktree had no `node_modules`; `npm ci` (exit 0) installed from the unchanged lockfile. `package.json` and the lockfile are untouched.

## Target: ROADMAP.md

### Fold-in 1 — PDF-IMPORT-DIAG-1 merged, close-out held
Section: §PDF-IMPORT-DIAG-1 (position 9)
Action: Replace
Old: the Full Spec section
New: a merged card in the Stage 8 card format (merge sha, date), with the full specification moved per the close-out; the close-out waits for Done-when 10 in the batched owner smoke.

## Target: CLAUDE.md

### Fold-in 1 — Open bugs
Section: §Current operational state, "Open bugs"
Action: Replace
Old: `BUG-190 (every PDF fails to convert: pdf-parse 2 API mismatch; root cause found 2026-10-22; PDF-IMPORT-DIAG-1)`
New: `BUG-190 (resolved in source by PDF-IMPORT-DIAG-1; closes after the batched owner smoke)`

### Fold-in 2 — Suite count
Section: §Post-Completion Checklist and §Current operational state
Action: Replace
Content: suite on the owner's machine 2,413 passed / 1 skipped / 0 failed in 175 files (PDF-IMPORT-DIAG-1 tree `8cfc4682`, 2026-10-22).

## Lessons

- **Applied:** standing rule 43 (positive control first), LL-142 (prove against the installed package), LL-146 (probe in scratch), LL-148 (no merge sha in the bug status), LL-160 (probe under the app's Electron), standing rules 41, 44, 46, 47, 48.
- **Added:** none proposed. Candidate for review: a parser test that injects a fake for the third-party library proves the caller's contract, not the library's; one test per external parser should drive the installed package.
