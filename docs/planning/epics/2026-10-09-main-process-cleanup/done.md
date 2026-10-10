# Done — EPIC-MAIN-PROCESS-CLEANUP

- **Date:** 2026-10-10 (session S1, one session of ~3 budgeted)
- **DINT SHA:** `b95dbb552423768201e8d969c2a6e8c85251d8a9` (`origin/main`, fresh worktree `.worktrees/mpc-dint-1`)

## Items

| Item | Item commits | Merge SHA on `main` | DoD |
|------|--------------|---------------------|-----|
| CLOUD-RETRY-SHARED-1 | `f3abb524` | `dd3db29c` | C1, C2 |
| TTS-SIDECAR-SHARED-1 | `65cb5774` (Task 1), `18f453fa` (Task 2) | `7a462bf7` | S1, S2 |
| CLEANUP-LEGACY-PARSERS-1 | `91e48416` | `b95dbb55` | L1, L2 |

## DINT evidence (fresh, on `b95dbb55`)

- `npm ci` 0 · `npm run typecheck` 0 · `npm test` 0 (212 files pass / 1 skip; 3088 pass / 133 skip; failing set ∅; KF-1 not seen) · `npm run build` 0
- Combined targeted command (13 files) exit 0, 162 tests
- `git merge-base --is-ancestor` f3abb524 / 18f453fa / 91e48416 vs `refs/remotes/origin/main`: 0 / 0 / 0
- Per-row evidence: [state.md → Evidence](state.md). Logs: `C:\Projects\Blurby-artifacts\epic-main-process-cleanup\`

Test count movement: baseline 3058 → 3068 (cloud, +10) → 3088 (sidecar, +20) → 3088 (legacy). Skips stayed at 133 throughout.

## Caveats for the owner

1. **Census judgment (Decision #7).** The legacy re-census matched `Virtuoso/work-register.snapshot.json` (3 hits) and `Virtuoso/reports/planning-cockpit.html` (1 hit). Both are governance register/report data written after the 2026-10-08 census. They match the item's own ID (`cleanup-legacy-parsers-1`) and its description prose. No require, import, path or build reference exists outside docs. I classed them as doc references and proceeded. To overrule: `git revert -m 1 b95dbb55`. The spec's census grep should exclude `Virtuoso/` (or match `legacy-parsers.js` / `require(` forms) next time.
2. **Fake-child finding (Decision #6).** In `tests/pocketTtsEngine.test.js`, the fake child's `kill()` emits `exit` synchronously. With that fake, a start timeout resolves `sidecar-exited` instead of `sidecar-start-timeout`, because the exit handler overwrites `lastStatus` before `deferred.resolve`. A real `ChildProcess` exits asynchronously, so production behavior is correct. The new suite's fake emits `exit` on a microtask. TTS-ENGINE-SHARED-1 test authors should do the same.
3. **charter.md was not edited.** launch.md's completion step 2 says to set `status: complete`. The kickoff prompt says never touch charter.md, and the kickoff wins. The owner may flip it.
4. The CLAUDE.md row the legacy spec cited at line 158 was at line 166 by run time. It was found by grep, as the spec directed.

## Follow-ups

- Specify TTS-ENGINE-SHARED-1, which is unblocked now that the sidecar item has merged (LL-112: characterization first).
- `extractContent` coverage gap in `main/file-parsers.js` (pre-existing; out of scope here).
- Owner: run `/pointer-closeout EPIC-MAIN-PROCESS-CLEANUP`. All three Monday items are In Flight.
- Housekeeping (maintenance, never automatic): worktrees `cloud-retry-shared-1`, `tts-sidecar-shared-1`, `cleanup-legacy-parsers-1`, `mpc-integ-*-1`, `mpc-dint-1`, `mpc-publish-1`, and the `eb/mpc-integ-*` branches. Untracked `Virtuoso/.recovery/` records sit in the packet worktree.
