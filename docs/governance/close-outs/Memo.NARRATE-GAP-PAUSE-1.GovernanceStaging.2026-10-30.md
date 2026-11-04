# NARRATE-GAP-PAUSE-1 — Governance staging memo (2026-10-30)

**State:** built and held on `eb/narrate-gap-pause-1`. No merge without Blurby.Roadmap's go. Evidence: `docs/studies/investigations/NARRATE-GAP-PAUSE-1.2026-10-30.md`.

**Package verification under rule 53 (temporary placement):** x64, RodneySr. The arm64 launch is at merge time (R-2026-10-30-2), on Rodney.

## What changed

- Renderer only, `src/reader/modes/narrate/engine/narrateEngine.ts`:
  - `pause()` passes the heard `now` to `nextScheduledPause(now)`, so a gap pause anchors on the first chunk not yet heard, at its trim. The position and the scheduled-chunk test now use one clock.
  - `onResult()` never times a chunk from one the pause stopped (`source === null`), so the first chunk after a resume starts at now + lead.
- New test `tests/narrate/narrate.gapPause.test.ts`: (g1)–(g3) on `LatentOutput`, whose heard position lags its head by 0.1 s (LL-173), and the controls (c1)–(c4).

## Base

- **Base `e1d0da2b` (Brain ruling (a)):** `e1d0da2b` ships the bytes verified for `cf093ab7`/`c4b79abb` (F961A79C…B975A). `82eb47a7`, `a4679bd4` and `e1d0da2b` change nothing under build.files: `git diff --name-only c4b79abb e1d0da2b -- <build.files> src tests` is empty, and so is the same diff over `scripts/` and the harness.
- **Base D6 (ruling Q4):** NARRATE-PAUSE-CANCEL-1's after D6 was measured on these bytes, so it was reused as the base (`d6-base-latency-e2e.json`, `d6-base\traces`). No fresh base D6 was run.
- **The defect on the base evidence:** `check-skip` on `narrate-pause-cancel-1\d6-base\traces` (the `5de476ce` traces set) exits 1. warm-2-00-3: expected word 8730, requested 8748, 18 words skipped, gap true.

## Results

- **Red (`473c8716`):** exit 1. (g1), (g2) and (g3) fail by assertion; (c1)–(c4) pass; typecheck 0.
  - **Test-only repair, accepted by Brain:** (g2) first failed by a TypeError. Chunk B is the fixture's last chunk, and on the base the resume requests past the end, skips B and completes, so no source is scheduled. (g1) and (g2) now assert that the source is defined first. No expectation changed.
- **Fix (`5d51d111`):** `tests/narrate` passes, 24 files and 144 tests; the ownership and isolation suites pass.
- **After D6 (`5d51d111`, `NARRATE_PRODUCER_LOG=1`):** exit 0, report verdict PASS.
  - `check-skip` exits 0: 47 resumes, 0 flagged, 1 gap pause. The gap pause recurred naturally: warm-2.00, expected 5568, requested 5568, 0 skipped. It resumed in 86 ms. No re-run was needed.
  - **`check-d6-gap` has a literal exit 1, passed by Brain ruling (a).** Its only failing row is `{"run":"warm-2.00-3","trials":[],"targetOk":false}`. "warm-2.00-3" is a harness top-up label, and no after run carried it. The live gap pause at warm-2.00, word 5568 (86 ms, ≤ 150 ms) is the target.
  - **No regression:** every type and rate is within base + 150 ms, with 0 trials over budget. Every resume took 82–92 ms.
- **Gates (merged tip `5f09224a`):**
  - `npm test`: 184 files, 2,473 passed, 1 skipped, 0 failed.
  - `npm run typecheck`: 0.
  - `npm run build`: 0.
  - Collected set: one `=>` line, `tests/narrate/narrate.gapPause.test.ts` (183 → 184 files).
- **Merge of `origin/main` `8d2db00b` (`5f09224a`):** docs only, clean. It landed before this record because main moved while the gates were due. The spec's commit order puts it last.

## Package verification

- **(a)** `npx electron-builder --win --dir --x64` and `--arm64`, from code identical to this branch's tip, both exit 0 (`pkg-x64.log`, `pkg-arm64.log`).
  - `release\win-unpacked\resources\app.asar` and `release\win-arm64-unpacked\resources\app.asar` are both `655AD64772BB458C6BAE3A71A2EFFD15AE3E7856DE79A233FB7674E7BF66EF81`, so they are equal.
- **(b)** The asar contains `BLURBY_USER_DATA_DIR`: True. The 25 s x64 launch (`run.mjs`, receipt `rule53-x64-25s\receipt.json`) passes:
  - proof: a scratch profile, x64, packaged, pid matched;
  - error.log none written; 0 flagged stdio lines; no crash dump;
  - script exit 0;
  - live `library.json` `5917eefc…` and `settings.json` `ec99be2b…` unchanged.
  - Known noise, recorded and not failed: BUG-217's first-launch "Backup failed … ENOENT".
- **(c) and (d), dist parity with the D6 build (ruling Q3):**
  - The asar's extracted `dist\` equals the worktree's built `dist\` file for file: 21 files, 0 differences. Both trees hash to `A77DEAB652FF2C4C86D8293004EBEC9B9315CD39F565973EDA0F2380E100FED6`, the SHA-256 of the sorted path and hash list.
  - The D6 ran on the `dist` from `build-after.log` (`5d51d111`). The final build (`build-final.log`, after the docs-only merge) emits the same 20 content-hashed asset names.
  - No `main/`, `preload.js` or `main.js` file changed: `git diff --name-only e1d0da2b HEAD -- main preload.js main.js` is empty.

## Owner check for release gate (2) (standing rule 45)

- **(o1)** In Narrate at 2.00x, pause and resume about 15 times in quick succession, including right as a new sentence is about to start. By ear, no phrase is lost and no resume waits more than a moment.

## Docs

- BUG-237: RESOLVED in source (NARRATE-GAP-PAUSE-1), with the base and after `check-skip` results and the gap-pause resume latency.
- No register writes (standing rule 46).
