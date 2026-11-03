# RC integration window — one integrated desktop release candidate (DRAFT, pending Brain1 rulings)

**Status: draft, NOT READY.** Open rulings (merge-train packet `docs/planning/roadmap-reviews/2026-11-03-rc-merge-train.md`, questions 1–5) are marked ⟨R1⟩–⟨R5⟩. This is the integration window CLAUDE.md requires for shared-core edits by several items; it is not a new register item. The register items it carries stay In Flight until their own close-outs.

## Goal

Merge the held desktop fixes into one candidate branch, prove that candidate with the full local gates and one package pair, and land it on `main` in one `--no-ff` merge. Owner authority: freeze lift for one integrated release candidate (2026-11-02), resumed by the 2026-11-03 goal.

## Scope

- **In:** merging the 21 tips below, with their 43 held items, into `eb/rc-integration-20261103`; the ruled conflict resolutions; per-wave local gates; the final package pair; one `--no-ff` merge to `main` after the merge go.
- **Out:** any new fix or feature; CHAPTER-STEP-CFI-1, BLURBY-BUSINESS-1, NARRATE-CPU-PROFILE-1, NARRATE-HARNESS-COLDCLICK-1 and every unbuilt item; register status or Seq changes (close-outs happen later, item by item, after gates (1) and (2)); release publication; the owner's gate (2) smoke run itself.
- **Outcome:** `origin/main` contains all 21 tips through one reviewed integration merge whose final tip passed suite, typecheck, build and rule 53.

## Prerequisites

Every carried item is In Flight by design: this window is how they integrate (owner freeze lift 2026-11-02). No register prerequisite gates the window. Its encoded waits are Brain1's rulings R1, R2, R4 and R5; RodneySr reachable and idle; and `origin/main` still at the base below, or the read-only trial re-run on the new main.

## Baseline

- Base: `origin/main` @ `b58b0117f1328fe76136c51adc092732667eeb70`. If main moves before launch, re-run the packet's read-only trial and return any new conflict to the planner.
- Tips (from `origin`, verify each SHA at launch; any moved tip returns to the planner):

| Wave | Order | Tip branch | Carries |
|---|---|---|---|
| A — main process and library | 1 | `eb/library-write-race-2` | LIBRARY-WRITE-RACE-1/2, WS-PAIR-LOG-1, WS-TOKEN-REGEN-1 |
| | 2 | `eb/large-folder-sync-3` | LARGE-FOLDER-SYNC-3 |
| | 3 | `eb/rename-tmp-race-1` | RENAME-TMP-RACE-1 |
| | 4 | `eb/error-log-cap-1` | ERROR-LOG-CAP-1 — conflict ⟨R2⟩ |
| | 5 | `eb/zip-async-read-1` | ZIP-ASYNC-READ-1, ZIP-READ-FOLLOWUPS-1 |
| | 6 | `eb/win-target-nsis-1` | WIN-TARGET-NSIS-1 — docs conflict ⟨R5⟩ |
| B — Narrate and overlays | 7 | `eb/narrate-years-1` | NARRATE-YEARS-1 |
| | 8 | `eb/narrate-trace-labels-1` | NARRATE-TRACE-LABELS-1 |
| | 9 | `eb/narrate-key-repeat-1` | NARRATE-KEY-REPEAT-1 |
| | 10 | `eb/narrate-reconcile-residual-1` | NARRATE-RECONCILE-RESIDUAL-1 |
| | 11 | `eb/overlay-theme-sweep-1` | OVERLAY-THEME-SWEEP-1 — docs ⟨R5⟩ |
| | 12 | `eb/narrate-sentence-initials-1` | SENTENCE-INITIALS-1, SENTENCE-RESUME-1, TOKEN-CAP-1 — conflict ⟨R3⟩ |
| | 13 | `eb/narrate-gap-pause-1` | GAP-PAUSE-1, PAUSE-CANCEL-1, QUIT-LINGER-1 — conflicts with 12 in `ModeRuntime.ts` and `engine/narrateEngine.ts` ⟨R3⟩; prior resolved tree `40f74988` |
| C — reader runtimes and library view | 14 | `eb/band-align-2` | BAND-ALIGN-1/2, FLOW-PARA-KEYS-1, FLOW-KEYS-FIX-1, FOCUS-KEYS-FIX-1 — docs ⟨R5⟩ |
| | 15 | `eb/eink-controls-1` | EINK-CONTROLS-1 — migration conflict ⟨R4⟩ |
| | 16 | `eb/foliate-display-lifetime-1` | FOLIATE-DISPLAY-LIFETIME-1, FOLIATE-OBSERVER-LEAK-1, LIBRARY-COMPLETION-VISIBILITY-1 |
| | 17 | `eb/play-first-text-1` | PLAY-FIRST-TEXT-1 — docs ⟨R5⟩ |
| | 18 | `eb/reader-arrow-guard-1` | READER-ARROW-GUARD-1 — docs ⟨R5⟩ |
| | 19 | `eb/flow-para-pause-index-1` | FLOW-PARA-PAUSE-INDEX-1, BLOCK-TAG-CASE-1 |
| | 20 | `eb/restamp-rerun-race-1` | RESTAMP-RERUN-RACE-1, JUMP-LANDING-SAVE-1, PAGE-SAVE-RESTAMP-3, PAGE-HELD-TURN-FAIL-1, TOC-JUMP-SAVE-1 |
| D — shared-core feature | 21 | `eb/app-tabs-1` | APP-TABS-1 |

Excluded: CHAPTER-STEP-CFI-1, BLURBY-BUSINESS-1, NARRATE-CPU-PROFILE-1, NARRATE-HARNESS-COLDCLICK-1, and unbuilt items.

## Execution host and custody

- Host: RodneySr (rule 6b), reconnected and idle, having first reported each branch's state and pushed its local-only commits. Arm64 launch at merge: Rodney.
- Worktree: `C:\Projects\Blurby\.worktrees\rc-integration-20261103` (standing rule "Worktree placement"); branch `eb/rc-integration-20261103` from the base above.
- `npm ci` once at the base; re-run only if a wave changes `package.json` or `package-lock.json`.

## Conflict resolutions

- **⟨R2⟩ ERROR-LOG-CAP-1 into LIBRARY-WRITE-RACE-2 (proposed, awaiting Brain1).** In both `main/ipc/library.js` and `main/ipc/misc.js`, the conflict is only the import block. Keep LIBRARY-WRITE-RACE-2's `require("../library-write")` line exactly as it is (`{ writeConversionResult, setEditedField }` in library.js, `{ writeConversionResult }` in misc.js). Add ERROR-LOG-CAP-1's `const { logToFile } = require("../error-log");`. Delete the local `async function logToFile(message, errorLogPath)`. `main/error-log.js` exports `logToFile(message, errorLogPath, maxBytes = ERROR_LOG_MAX_BYTES)`, so every existing two-argument call keeps working, now with the cap. Check: `git grep -n "async function logToFile" -- main/ipc` returns nothing.
- **⟨R3⟩ Narrate stack (RULED by Brain1, 2026-11-03).** Resolve SENTENCE-INITIALS-1 (12) and GAP-PAUSE-1 (13) by reusing the 2026-10-31 resolved integration, tree `40f74988`. Never use an automatic `-X ours` or `-X theirs`. After wave B, `git rev-parse HEAD:src/reader/modes/narrate/ModeRuntime.ts` must equal `261c725ef3af41683b4dd994247835fd2dd80373` and `git rev-parse HEAD:src/reader/modes/narrate/engine/narrateEngine.ts` must equal `1848b7768c5f6723855c5ad1a7b8cdc486059706`. Any difference is a STOP returned to Brain1. PLAY-FIRST-TEXT-1 (17) then merges cleanly apart from `BUG_REPORT.md`.
- **⟨R4⟩ EINK-CONTROLS-1 after BAND-ALIGN-2 (proposed, awaiting Brain1).** In `main/migrations.js`, keep BAND-ALIGN-2's v13 → v14 entry unchanged. Append EINK-CONTROLS-1's migration as the next entry, commented `// v14 → v15: EINK-CONTROLS-1 — …`, with `data.schemaVersion = 15`, and set `CURRENT_SETTINGS_SCHEMA = 15`. In `tests/settingsMigrationV13.test.js` and `tests/settingsNarrateNormalization.test.js`, keep BAND-ALIGN-2's v13 → v14 comment and add a line saying EINK-CONTROLS-1 added v14 → v15. Literal `schemaVersion: 14` expectations that pin the final schema become 15; expectations that pin the v13 runner stay as they are. Check: `settingsMigrations.length === 15`, and `npx vitest run tests/einkControls.test.tsx tests/settingsMigrationV13.test.js tests/settingsNarrateNormalization.test.js tests/einkFoundation.test.ts` exits 0.
- **⟨R5⟩ Docs (proposed, awaiting Brain1).** `BUG_REPORT.md` follows N-Q3: keep main's status lines plus any branch-only new entries or resolution lines. For `CLAUDE.md` (NSIS), keep main's text and add only the NSIS branch's intended line.

## Tasks

1. For each wave, merge its tips in order with `git merge --no-ff origin/<tip> -m "Integrate <ITEM-ID>s (RC window)"`. Resolve only the conflicts named, exactly as ruled; any other conflict is a STOP returned to Brain1.
2. After each wave: `npm test`, `npm run typecheck`, `npm run build`, all exit 0. Record test counts. A failure is a STOP: no fix lands without a Brain1 ruling, and fixes come in their own commit on this branch.
3. Push after each green wave: `git push origin HEAD:refs/heads/eb/rc-integration-20261103`.
4. Final tip: the rule 53 package pair (x64 and arm64 `--dir` builds), a 25-second scratch-profile launch with the LL-165 profile proof, an asar contents check, and each carried item's automatable Done-when re-run on the packaged exe where its spec lists one.
5. Hand the evidence to Brain1 for package confirmation. Roadmap gives the merge go; the merge to main is `--no-ff`, followed by the arm64 launch on Rodney.

## SUCCESS CRITERIA

1. `eb/rc-integration-20261103` contains every tip in the table (`git merge-base --is-ancestor <tip> HEAD` exits 0 for all 21).
2. The only non-merge commits on the branch are the ruled conflict resolutions and any Brain1-ruled fixes, each named in its message.
3. The final tip passes `npm test` (no fewer tests than the base's suite plus each carried branch's added tests, 0 failed), `npm run typecheck` and `npm run build`.
4. Rule 53 evidence for the final tip is recorded in a close-out section "Package verification", with Brain1's confirmation.
5. No file outside the union of the carried branches' changes and the ruled resolutions differs from the base (`git diff --stat` reviewed).

## Failure handling and rollback

Two repair passes per wave at most; a third failure stops the window. A bad wave is reverted with `git revert -m 1 <merge>`; never reset or force-push. The integration branch is never deleted by the dispatch.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Wave A merged, resolved per R2/R5 and green on suite, typecheck and build | calculable | integration-wave | bounded | medium | 20m | — | — |
| 2 | Wave B merged, Narrate files match tree 40f74988's blobs, gates green | calculable | integration-wave | bounded | high | 25m | — | — |
| 3 | Wave C merged, migration v15 per R4, BAND-ALIGN R8 test green, gates green | calculable | integration-wave | bounded | high | 25m | — | — |
| 4 | Wave D (APP-TABS-1) merged, gates green | calculable | integration-wave | bounded | medium | 15m | — | — |
| 5 | Rule 53 package pair and packaged Done-when checks recorded on the final tip | calculable | packaging-verify | bounded | medium | 30m | — | — |

**Total:** chain 1h55m · sum 1h55m; 0 of 5 estimated tasks calibrated. Calculable basis per wave: one `npm test` run (~3m; 181 files, gate (1) run 4) plus typecheck and build (~2m), times two attempts (repair ceiling), plus merge and resolution time; packaging: two `--dir` builds plus the scratch-profile launch and asar check.

## Lessons applied

LL-165 (prove the profile before the first action), LL-167 (packaged-build verification), LL-169 (FOLIATE-DISPLAY-LIFETIME stack keeps its separate currentness and lifetime guards across the merge), LL-174 (widened callbacks: re-run the BAND-ALIGN R8 test after waves C and D), LL-181 (worktree placement; packed EB/ refs).
