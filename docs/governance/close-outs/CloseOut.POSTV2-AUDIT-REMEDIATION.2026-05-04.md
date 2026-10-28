# POSTV2-AUDIT-REMEDIATION Close-Out

**Date:** 2026-05-04
**Branch:** `postv2-audit-remediation`
**Worktree:** `C:\tmp\Blurby-worktrees\postv2-audit-remediation`
**Result:** PASS - implementation complete, uncommitted, ready for review/commit/merge.

## Sprint Brief

The post-v2 audit remediation converted the full codebase audit into a coherent stabilization branch spanning package truth, engine posture/type contracts, Narrate behavior, URL safety, artifact hygiene, and structural debt documentation.

**Why it matters:** Desktop v2 now has an implementation candidate where the release posture is enforced by code and gates rather than only by docs.

**Driving the news:**
- `POSTV2-REL-1` landed package/release truth, version alignment to `1.75.1`, packaged sidecar path resolution, update install gating, and release docs that distinguish release notes from a missing release workflow.
- `POSTV2-ENGINE-1` made `npm run typecheck` green, returned disabled-compatible Qwen IPC/stream responses, migrated stale Qwen profiles to Kokoro, accepted `pocket-tts`, separated Pocket errors from Nano errors, and tightened settings/type contracts.
- `POSTV2-NARR-1` added EPUB Narrate highlighting through the flow cursor class without motion/scroll side effects, validated `open-doc-source` URL schemes, tightened artifact ignore policy, cleaned active Kokoro/Qwen copy, and added a post-v2 debt map.

**By the numbers:**
- Full test suite: 170 files / 2521 tests passed.
- Focused MOSS rerun: `tests/mossNanoProbe.test.js` passed 132 tests.
- Build: passed with existing `settings -> tts -> settings` circular chunk warning.
- Diff hygiene: `git diff --check` passed.

**Between the lines:** The remediation succeeded because it was sequenced by dependency order. Package/release truth landed first, engine/type contracts landed second, and Narrate/security/artifact cleanup landed third.

**Yes, but:** No commit was made. The branch still needs review, staging, commit, and merge from the isolated worktree.

## Scope Disposition

| Area | Disposition |
|------|-------------|
| POSTV2-REL-1 | Accepted as implemented candidate. Package truth, version `1.75.1`, sidecar paths, update install gating, and release-doc honesty are covered. |
| POSTV2-ENGINE-1 | Accepted as implemented candidate. Typecheck is green; Qwen disabled compatibility, Pocket portability, Pocket/Nano error separation, and settings contracts are covered. |
| POSTV2-NARR-1 | Accepted as implemented candidate. Narrate highlight behavior, `open-doc-source` scheme validation, artifact policy, and debt map are covered. |
| MOSS full-suite flake | Non-blocking unless it reproduces. Focused rerun passed 132 tests. |
| Commit/merge | Pending. Include all new source/doc/test files deliberately. |

## Verification

Reported final verification:

```powershell
npm run typecheck
npm test
npm run build
git diff --check
npm test -- tests/mossNanoProbe.test.js
```

Results:
- `npm run typecheck`: passed.
- `npm test`: passed, 170 files / 2521 tests.
- `npm run build`: passed with existing `settings -> tts -> settings` circular chunk warning.
- `git diff --check`: passed.
- Focused MOSS rerun: passed, 132 tests.
- Generated `tests/perf-baseline-results.json` was restored after test runs dirtied it.

## Product Posture Preserved

- Kokoro remains default and available.
- MOSS-Nano remains recommended opt-in.
- Pocket TTS remains available opt-in.
- Qwen remains retired/disabled for Desktop v2.
- No live capture rerun, comparative engine gate, Kokoro demotion, or Qwen reactivation occurred.

## Files And Artifacts

New artifacts called out by the sprint:
- `docs/planning/desktop-v2.0-release-checklist.md`
- `docs/planning/desktop-v2.0-release-notes.md`
- `docs/planning/postv2-narr-1-debt-map.md`
- `main/ipc/url-validation.js`
- `main/sidecar-paths.js`
- `src/utils/foliateWordHighlight.ts`
- Focused test files for artifact hygiene, document source validation, Foliate highlighting, package/release truth, Qwen streaming type contracts, and update install gating.

## Next Pointer

```text
Sprint: POSTV2-REVIEW-1 - Review, Commit, And Merge Post-v2 Audit Remediation
Spec: Review the `postv2-audit-remediation` branch in `C:\tmp\Blurby-worktrees\postv2-audit-remediation`, confirm final diffs and green gates, then commit and merge the coherent remediation bundle back to the primary Blurby workspace. Preserve Desktop v2 engine posture exactly: Kokoro default/available, MOSS-Nano recommended opt-in, Pocket TTS available opt-in, Qwen retired/disabled.
Status: Ready to dispatch after POSTV2 audit remediation closeout is persisted.
Task count estimate: 5-7
Dominant model tier: Full / high effort
Key constraints: do not reopen runtime/model exploration; do not delete local evidence files; include all new source/doc/test files deliberately; rerun at least `npm run typecheck`, `npm test`, `npm run build`, `git diff --check`, and `npm audit --audit-level=high` before commit/merge.
```

## Close-Out Decision

`POSTV2-AUDIT-REMEDIATION` is closed as an implemented, verified, uncommitted remediation candidate. The next action is not more implementation; it is review, commit, and merge.
