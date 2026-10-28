---
sprint: POLISH-1
date: 2026-05-04
runtime: not reported
tokens: not reported
status: all-pass
---

# Phase Close-Out: POLISH-1

## Sprint Brief

POLISH-1 completed the Desktop v2 settings polish pass, locked the release-facing engine posture, and unblocked RELEASE-1.

**Why it matters:** Desktop v2.0 now has a coherent ship posture: Kokoro stays default/available, MOSS-Nano is recommended opt-in, Pocket TTS is available opt-in, and Qwen is retired/disabled.

**Driving the news:**
- TTS settings copy, labels, ARIA/pressed state, and engine status language now match the corrected product posture.
- Reading Goals empty/action states and E-Ink switch keyboard access were polished.
- Verification passed across focused settings tests, full test suite, build, whitespace check, and high-severity audit gate.

**The big picture:** This closes the last polish sprint in the Desktop v2.0 conveyor.
- E-Ink, Reading Goals, MOSS-Nano, Pocket TTS, and POLISH-1 are all closed.
- RELEASE-1 is now the correct next movement.
- No additional TTS/model exploration belongs inside Desktop v2.0.

**By the numbers:**
- Focused settings suite: 9 files / 36 tests passed.
- Full `npm test`: 170 files / 2550 tests passed.
- Build/audit gates: `npm run build`, `git diff --check`, and `npm audit --audit-level=high` passed; audit still has only the existing 3 moderate `uuid` findings.

**Yes, but:** RELEASE-1 is named as next, but the queue currently appears to have only one ship sprint and needs release spec/pointer hardening before dispatch. Also, this work is not staged or committed.

**What we learned:** For late-stage polish, the key risk is not just UX tidiness; it is posture drift. The sprint had to preserve exact engine truth while touching copy and settings affordances.

**What's next (recommended):** Harden RELEASE-1 into a dispatch-ready release-closeout sprint, then execute it without adding new TTS/model work.

**The bottom line:** POLISH-1 turns Desktop v2.0 from feature-complete into release-ready, with RELEASE-1 now unblocked.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | TTS settings posture corrected: Kokoro default/available, MOSS-Nano recommended opt-in, Pocket TTS available opt-in, Qwen disabled | Product posture | Match 13e + Pocket + release scope | Matched | Pass | Removes prior posture ambiguity | Pass |
| 2 | Settings accessibility polish landed for TTS engine selector and E-Ink switches | UX/accessibility | Keyboard/screen-reader state clarity | Improved | Pass | Net-new polish | Pass |
| 3 | Reading Goals empty/action states clarified | UX polish | Clearer local-first empty/action behavior | Improved | Pass | Net-new polish | Pass |
| 4 | Focused settings regression suite passed | Tests | 9 files / expected settings coverage | 9 files / 36 tests | Pass | +2 tests vs Pocket closeout full count context | Pass |
| 5 | Full test suite passed | Tests | Green suite | 170 files / 2550 tests | Pass | +2 tests from POCKET-TTS-1 full suite | Pass |
| 6 | Build passed with known circular chunk warning | Build | Build green; no new blocking warning | Passed; existing `settings -> tts -> settings` warning | Pass | No new blocker | Pass |
| 7 | High-severity audit passed | Security | No high findings | Passed; existing 3 moderate `uuid` findings | Pass | No new high-severity issue | Pass |
| 8 | RELEASE-1 unblocked, but queue depth/spec hardening remains yellow | Governance | Next dispatch ready and queue depth healthy | One ship sprint noted; backfill/spec hardening needed | Pass with caveat | Release gate now exposed | Marginal |

## Interpretation

POLISH-1 closed cleanly. The core interpretation is that the release surface is now coherent rather than merely complete: settings copy, selector state, E-Ink switch affordances, and Reading Goals empty/action states all align with the Desktop v2.0 finish line.

The only non-green signal is governance readiness for the next step. RELEASE-1 is clearly the next sprint, but the queue is yellow because release spec hardening/backfill remains to be done before dispatch. This is not a POLISH-1 implementation miss; it is the exposed handoff into release closeout.

## Proposed Dispositions

| Item | Disposition | Rationale |
|------|-------------|-----------|
| POLISH-1 implementation result | Accept | All scoped polish and verification passed. |
| Existing build circular chunk warning | Log | Known warning, unchanged, non-blocking for this sprint. |
| Existing 3 moderate `uuid` audit findings | Log | No high findings; moderate advisories pre-existing. |
| RELEASE-1 readiness | Investigate / harden before dispatch | Queue says RELEASE-1 is next, but the release pointer/full spec should be made dispatch-ready before CLI execution. |
| Unstaged changes | Log | User explicitly noted no staging/commit; preserve current worktree state. |

## Governance Updates

ROADMAP.md and docs/governance/SPRINT_QUEUE.md already reflect POLISH-1 completion, RELEASE-1 unblocking, and the corrected engine posture. No additional roadmap rewrite is required for this close-out.

Append SRL-023 to `docs/governance/close-outs/SpecRetro.Lessons_Learned.md`: late-stage polish specs must preserve product posture as an explicit invariant.

## Next Work Pointer

```text
## Next Pointer (Revised)
Sprint: RELEASE-1 — Desktop v2.0 Release Closeout
Original spec: ROADMAP.md / docs/governance/SPRINT_QUEUE.md currently name RELEASE-1 as next, but no full release-closeout dispatch block is visible yet.
Revision reason: POLISH-1 unblocked release, while queue health remains YELLOW because the release pointer/spec needs hardening before CLI dispatch.
Updated spec: First harden RELEASE-1 into a dispatch-ready release-closeout sprint, then execute it. Objective: produce the Desktop v2.0 release closeout from the already-green conveyor, verify final gates, package release notes/checklist, and preserve engine posture exactly: Kokoro default/available, MOSS-Nano recommended opt-in, Pocket TTS available opt-in, Qwen retired/disabled. Task count estimate: 5-7. Dominant model tier: Full for release governance, medium effort. Constraints: no new TTS/model exploration, no MOSS-Nano reopen, no Pocket voice-cloning UX, no Kokoro demotion/removal, no Qwen reactivation.
```

## Gates

- Audit gate: no new third-party audit required from POLISH-1; release closeout should preserve existing MOSS-Nano audit evidence and decision provenance.
- Milestone review: Desktop v2.0 is now ready for RELEASE-1 milestone closeout.
- Branch / merge gate: POLISH-1 changes are not staged or committed per user note; release handoff should account for the current dirty worktree and avoid touching unrelated artifacts.
