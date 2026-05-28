# Close-Out: TTS-QUAL-CI-1 — CI Regression Gate Wiring

**Date:** 2026-05-28
**Branch:** `sprint/tts-qual-ci-1`
**Baseline:** `10d96fc` (clean main)
**Result:** Complete

## Summary

Wired the TTS quality gate into CI so PRs that regress TTS quality fail automatically. Added governance tooling (`scripts/recalc.py`) and extended the LOE dropdown with `XS`.

## Deliverables

1. **`.github/workflows/ci.yml`** — Added `quality-gate` job (ubuntu-only). Uses `dorny/paths-filter@v3` to scope execution: always runs on push to main, only runs on PRs when TTS-relevant paths change. Steps: checkout → paths-filter → setup-node 20 → npm ci → npm run test:quality (all gated by `if` condition).

2. **Exit-code verification** — Confirmed `tts_eval_runner.mjs --mode=gate` returns exit code 2 on gate failure. No code change needed; existing `process.exitCode = 2` was already correct.

3. **`scripts/recalc.py`** — New Python script (~37 LOC) using openpyxl. Opens xlsx, sets `calcMode = auto`, finds formula cells, saves. Has `--dry-run` flag. Usage: `python scripts/recalc.py [--dry-run] <path>`.

4. **LOE dropdown** — Extended Catalog tab data validation from `S,M,L,XL` to `XS,S,M,L,XL`. Updated SINGLE-INSTANCE-LOCK-1 row from `LOE = S` to `LOE = XS`.

## Validation

- `npm run test:quality` PASS at v2 baseline (0 hard failures, 0 warnings)
- Regression simulation: temporarily set `warm-first-audio-p50-max` threshold to 1ms → gate correctly reported FAIL with exit code 2 → reverted
- `scripts/recalc.py --dry-run docs/governance/sprint-queue.xlsx` runs clean
- Existing `test` + `build` CI job unchanged

## Notes

- Dashboard KPIs in sprint-queue.xlsx are static values (not formulas) — previous openpyxl operations converted them. The recalc script still provides value: sets `calcMode = auto` for any future formula additions and provides the scripted save that clears stale cached values.
- The `quality-gate` job does NOT depend on the `test` job — they run in parallel in CI.

## Files Changed

- `.github/workflows/ci.yml` — added quality-gate job
- `scripts/recalc.py` — new file
- `docs/governance/sprint-queue.xlsx` — LOE dropdown + SINGLE-INSTANCE-LOCK-1 row + Catalog/Dashboard updates
- `CLAUDE.md` — CI/CD line, tooling notes, queue state, most recent sprint
- `ROADMAP.md` — header, completed table, spec archived
- `docs/planning/.Archive/ROADMAP_legacy.md` — archived TTS-QUAL-CI-1 spec
