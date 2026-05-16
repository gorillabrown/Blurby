# CloseOut.SK-HYG-2.2026-05-16

## Outcome

PASS. SK-HYG-2 completed the Directory Reorganization (Option B) governance hotfix on branch `sprint/sk-hyg-2-directory-reorg` without displacing `ENGINE-DORMANCY-1` as the FIFO queue head.

## Scope Completed

- Collapsed `docs/` into the approved 7-folder shape: `brand/`, `evidence/`, `extension/`, `governance/`, `planning/`, `studies/`, `testing/`.
- Moved planning, audit, investigation, review, research, closeout, and bug-report material to the approved target folders.
- Standardized roadmap archive filenames under `.Archive/`.
- Applied curated Option B: bulk `artifacts/` and `tmp/` ignored/untracked; 40 canonical evidence files preserved in `docs/evidence/` with `INDEX.md` provenance notes.
- Collapsed `tmp_brandcheck*` to one surviving local folder.
- Moved the demo book corpus to `docs/evidence/example-book/`.
- Updated old path references across tracked text docs.

## Mid-Dispatch Amendment

The original Lane E fence was too strict for correctness because the documented moves left stale path constants in tests, scripts, and runtime template lookup code. The user approved a Type 3 Pivot Advance amendment allowing only exact old-path-to-new-path repairs in:

- `tests/artifactHygienePolicy.test.ts`
- `scripts/tts_engine_scan_index.mjs`
- `scripts/qwen_streaming_sidecar.py`
- `main/ipc/stats.js`

No unrelated runtime logic, package/build config, binary audit package, or IDE metadata edits were made for this amendment.

## Verification

- `npm test`: PASS, 186 test files / 2642 tests.
- `npm run build`: PASS with the existing circular chunk warning (`settings -> tts -> settings`).
- `git diff --check`: PASS.
- Stale old-path text scan: clean outside intentionally deferred `.idea/`, `tmp/`, `artifacts/`, and binary audit package contents.
- Forbidden-path guard: no dirty 13d implementation files staged by this sprint.

## Deferred

- IDE metadata old-path strings under `.idea/`.
- Old-path strings embedded in binary audit ZIP contents.
