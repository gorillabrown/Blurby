# TEST-HARNESS-1 Close-Out - Stabilize Resource-Sensitive TTS Performance Probes

**Date:** 2026-05-15
**Branch:** `sprint/test-harness-1-tts-perf-probes`
**Worktree:** `C:\tmp\Blurby-tts-integrate-1`
**Decision:** PASS as test-harness evidence; governance fold-in held because the roadmap is actively being updated under the Kokoro-only pivot.

## Sprint Brief

**Goal:** Stabilize the MOSS Nano probe lane that blocked TTS-INTEGRATE-1's full-suite gate.
**Result:** Direct Python MOSS Nano performance probes now require `BLURBY_RUN_MOSS_NANO_PERF_TESTS=1`, default/mocked probe coverage remains in the normal suite, and serialized Vitest setup resolution is hardened.
**Learned:** Host-sensitive performance probes belong behind explicit opt-in gates while deterministic contract coverage stays in default verification.
**Recommend:** Treat this as documented evidence and hold roadmap/queue disposition until the active Kokoro-only roadmap update finishes.
**Bottom line:** The harness fix passed verification in the integration worktree, but no canonical roadmap status change is applied here.

## Summary

TEST-HARNESS-1 was implemented on `sprint/test-harness-1-tts-perf-probes` in `C:\tmp\Blurby-tts-integrate-1`. The sprint-owned diff is limited to:

- `tests/mossNanoProbe.test.js`
- `vite.config.js`

The existing dirty governance files in that worktree were left untouched.

## Implementation Notes

- `tests/mossNanoProbe.test.js` now keeps direct Python subprocess probe checks behind `BLURBY_RUN_MOSS_NANO_PERF_TESTS=1`.
- Mocked/default MOSS Nano readiness and performance-contract coverage remains in the normal suite.
- A harness assertion was added to prove opt-in behavior for the host-sensitive probe lane.
- `vite.config.js` now resolves `tests/setup.js` via an absolute `path.resolve(process.cwd(), "tests/setup.js")`, fixing serialized `--maxWorkers=1` setup resolution through the wrong sandbox path.

## Verification

- `npm test -- --run tests/mossNanoProbe.test.js`: passed, 130 passed / 3 skipped.
- `BLURBY_RUN_MOSS_NANO_PERF_TESTS=1 npm test -- --run tests/mossNanoProbe.test.js`: passed, 133 passed.
- `npm test`: passed on rerun, 184 files passed, 2604 tests passed / 3 skipped.
- `npm test -- --maxWorkers=1`: passed, 184 files passed, 2604 tests passed / 3 skipped.
- `npm run typecheck`: passed.
- `npm run build`: passed with the existing circular chunk warning `settings -> tts -> settings`.
- `git diff --check`: passed.

## Governance Hold

Canonical roadmap/queue files were not edited by this closeout because the roadmap is actively being updated and currently reflects a Kokoro-only pivot where TEST-HARNESS-1 may be dissolved or superseded. This closeout records the technical evidence without deciding that roadmap conflict.

