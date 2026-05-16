# TTS-INTEGRATE-1 Close-Out

**Goal:** Land the already-complete `TTS-SYNC-1` and `TTS-DIAG-1` branches onto canonical `main` in the correct order.

**Result:** `TTS-SYNC-1` landed via `82aa76d`, `TTS-DIAG-1` landed via `04c033a`, governance landed via `d199b9d`, and `main` was merged and pushed at `f1d5b4f`.

**Learned:** The earlier integration blocker was real but temporary; once Nano probes were gated by `ENGINE-DORMANCY-1`, the stacked integration passed cleanly.

**Recommend:** Treat `TTS-CACHE-HARDEN-1` as unblocked because `TimingMetadataStore`, `HighlightSyncController`, and diagnostics are now on `main`.

**Bottom line:** The sync/diagnostics architecture is now canonical, verified, and ready for cache/timing hardening work.

## Findings

| Finding | Disposition |
|---|---|
| Branch order was preserved: sync first, diagnostics second. | Accept. This protected the stacked diagnostics dependency on the sync layer. |
| Full verification passed after dormancy removed the Nano probe blocker. | Accept. The prior blocked integration attempt is superseded by the 2026-05-16 landed run. |
| Governance already reflects landed state in `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, and `CLAUDE.md`. | Accept. No extra roadmap edit was required during this closeout pass. |
| The old `CloseOut.TTS-INTEGRATE-1.2026-05-15.md` records the blocked attempt. | Preserve. It remains historical evidence for the pre-dormancy blocker. |
| Local dirt remains: `.idea/workspace.xml`, `tests/perf-baseline-results.json`, and untracked roadmap check-in. | Exclude. Those files are unrelated local residue. |

## Verification

- Focused sync tests: passed, 4 files / 37 tests.
- Focused diagnostics tests: passed, 4 files / 18 tests.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm test`: passed, 183 files passed, 1 skipped; 2463 passed, 132 skipped.
- `git diff --check`: passed.
- Push: `origin/main` and `origin/sprint/tts-integrate-1-sync-diag-main` updated.

## Commits

- `82aa76d` — Merge `origin/sprint/tts-sync-1-highlight-controller`.
- `04c033a` — Merge `origin/sprint/tts-diag-1-diagnostics-bundle`.
- `d199b9d` — Close `TTS-INTEGRATE-1` and advance queue state.
- `f1d5b4f` — Merge `TTS-INTEGRATE-1` sync + diagnostics integration into `main`.

## Governance Updates

- `ROADMAP.md` marks `TTS-INTEGRATE-1` complete and sets `TTS-CACHE-HARDEN-1` as next.
- `docs/governance/SPRINT_QUEUE.md` marks the active head as `TTS-CACHE-HARDEN-1`.
- `CLAUDE.md` records the landed integration and queue pointer.
- `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` gained `SRL-032` for stacked integration merge-order discipline.

## Next Work

`TTS-CACHE-HARDEN-1` is now dispatch-ready. It should address cache-hit timing parity, timing type harmonization, IPC validation, and cache key safety on top of the now-canonical sync and diagnostics stack.
