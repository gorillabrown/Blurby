# Brain1 rulings — RC-INTEGRATION-WINDOW (2026-11-03)

Authority: Blurby.Brain1 (CLAUDE.md rule 11). Basis:
- the packet `docs/planning/roadmap-reviews/2026-11-03-rc-merge-train.md` (6e2a7855);
- the draft `docs/planning/specs/2026-11-03/RC-INTEGRATION-WINDOW.md` (3eabfc49);
- Brain1's own read-only merge-tree runs against `origin/main` `b58b0117`.

## R1 — Topology: one integration branch (approved)

- Cut `eb/rc-integration-20261103` from `origin/main`. Merge each tip with its own `--no-ff` merge, so every resolution sits in that tip's merge commit.
- The waves are the draft's A–D:
  - A: main process and library;
  - B: Narrate and overlays;
  - C: reader runtimes;
  - D: APP-TABS-1, last.
- Each wave runs on RodneySr and takes 60 minutes or less. After it: `npm test`, `npm run typecheck` and `npm run build`, then push the branch.
- This is the declared integration window for the shared-core set (`ReaderContainer.tsx` through RESTAMP; `types.ts` through APP-TABS). No other sprint edits those files while the window is open.
- The final tip gets one rule 53 pair:
  - x64 and arm64 builds from the same commit;
  - the 25 s x64 scratch-profile launch with the LL-165 inspector proof;
  - the asar check;
  - the automatable Done-when checks of every item that exercises the package.
- The rule 53 pair is followed by: Brain1's package confirmation, Roadmap's merge go, the arm64 launch on Rodney, and one `--no-ff` merge to main.
- No per-tip package pairs. Each branch's earlier package verification stays as that item's evidence.

## R2 — ERROR-LOG-CAP-1 against LIBRARY-WRITE-RACE-2: combine both

The conflict is in the import block only, in both `main/ipc/library.js` and `main/ipc/misc.js`.

- Keep LWR-2's `require("../library-write")`:
  - in `library.js`: `{ writeConversionResult, setEditedField }`;
  - in `misc.js`: `{ writeConversionResult }`.
- Add ERROR-LOG-CAP's `const { logToFile } = require("../error-log");`.
- Delete the local `async function logToFile` in both files.
- `main/error-log.js` has the signature `logToFile(message, errorLogPath, maxBytes = ERROR_LOG_MAX_BYTES)`, so the existing two-argument calls work unchanged.
- Gate: `git grep -n "function logToFile" -- main/` shows only `main/error-log.js`.

## R3 — Narrate (issued earlier; restated)

- Merge NARRATE-SENTENCE-INITIALS-1, keeping both imports in `ModeRuntime.ts`: `logNarrateStartError` and `sentenceStartAt`.
- Merge NARRATE-GAP-PAUSE-1. Set both Narrate source files from tree `40f74988`:

  ```
  git restore --source=40f74988 --staged --worktree -- src/reader/modes/narrate/ModeRuntime.ts src/reader/modes/narrate/engine/narrateEngine.ts
  ```
- Gate: `git diff 40f74988 HEAD -- src/reader/modes/narrate/` must be empty. If it isn't, stop.
- Then merge PLAY-FIRST-TEXT-1. Its source auto-merges; only `BUG_REPORT.md` conflicts, and that follows R5.
- Run `tests/narrate` in full.
- Never use `-X ours` or `-X theirs` on source: it drops `wordAt()` or the logging import.

## R4 — EINK-CONTROLS-1: renumber to v15

- BAND-ALIGN-2 keeps v13→v14: `flowZoneLines` becomes `flowBandEnabled`, with stored 0 meaning off.
- EINK-CONTROLS-1 becomes v14→v15: theme `"eink"` becomes `light` plus `einkMode: true`, and the migration sets `schemaVersion = 15`.
- In `main/migrations.js`, both steps stay in order, and the EINK comment reads "v14 → v15".
- In `tests/settingsMigrationV13.test.js` and `tests/settingsNarrateNormalization.test.js`, the expected current `schemaVersion` becomes 15. Keep each file's existing test names.
- Add a new test file, `tests/settingsMigrationV15.test.js`:
  - (m1) A v13 file with `flowZoneLines: 0` and `theme: "eink"` ends at v15 with `flowBandEnabled: false`, `theme: "light"`, `einkMode: true` and no `flowZoneLines`.
  - (m2) A v14 file with `theme: "eink"` runs only the eink step.
  - (m3) A v15 file is unchanged.
- No released build ever wrote v14, so there is no field compatibility to keep.

## R5 — Docs conflicts

- `BUG_REPORT.md`: N-Q3. Keep main's status lines, plus any entries or resolution lines that only the branch has.
- `CLAUDE.md`: keep main's text, plus the line the NSIS branch added.
