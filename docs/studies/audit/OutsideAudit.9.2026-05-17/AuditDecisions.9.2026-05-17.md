# Audit Decisions — OutsideAudit.9 (2026-05-17)

**Audit loop closed.** All 11 findings dispositioned. Two wording corrections applied to the remediation plan per auditor feedback (items 6 and 7).

---

## Roadmap Changes

### Added
- **TTS-PARITY-1** — new hardening sprint at conveyor sequence 3. Fixes cache-hit silence parity, trusted `getAudioProgress()` lag, and resume backpressure bypass. S-M effort (~2 days). Three new focused tests required as closure conditions.

### Resequenced
| Seq | Sprint | Change |
|-----|--------|--------|
| 1 | NARR-MEDIA-1 | No change |
| 2 | NARR-PAUSE-1 | No change |
| 3 | TTS-PARITY-1 | **NEW** — hardening gate |
| 4 | NARR-SPOKEN-1 | Moved earlier (was 5) — spoken/display separation benefits downstream eval baselines |
| 5 | NARR-CURSOR-2 | Moved later (was 3) — now depends on parity fixes landing first |
| 6 | TTS-EVAL-3 | Moved later (was 4) — baselines now include spoken separation |
| 7 | UX-POLISH-1 | No change (stub) |
| 8 | TTS-QUAL-CI-1 | No change (stub) |

### No changes
- No sprints removed or dissolved
- No phase boundaries changed
- No finish line changed

---

## Deferred Items

| # | Finding | Placement | Reopen Trigger |
|---|---------|-----------|----------------|
| 5 | Registry-driven dispatch | Post-v2, reopens if second active local/cacheable engine reintroduced | Nano/Pocket/new engine activation |
| 10 | useNarration reducer/stateRef duplication | Tech debt backlog; NARR-PAUSE-1 partially addresses | Narration state complexity increase |
| 11 | Dormant strategy construction | Post-v2; IPC/selection gates sufficient | Startup cost, telemetry ambiguity, or reachable side effects from dormant construction |

---

## Rejected Items

None. All findings were accepted, accepted with narrowing, or deferred.

---

## Re-Audit Package Fixes (for OutsideAudit.10)

1. Include `src/utils/wordPositionIndex.ts` (finding 3)
2. Include `main/constants.js` (finding 9)
3. Updated ROADMAP.md with TTS-PARITY-1 and resequenced conveyor

---

## Lessons Learned

**LL entry: Audit package completeness**
When packaging audit materials, cross-reference every `import` statement in included source files against the package manifest. Files like `wordPositionIndex.ts` were omitted because the inventory was built top-down from feature areas rather than bottom-up from import graphs. For OutsideAudit.10, run an import-trace pass before finalizing the package.

---

## Wording Corrections Applied

Per auditor feedback on items 6 and 7:
- Item 6: Changed "position 4 (now repositioned to 5)" → "sequence 6" in remediation plan §3
- Item 7: Changed "move to Stage 1a position 3" → "move to Stage 1a after TTS-PARITY-1 and before NARR-CURSOR-2/TTS-EVAL-3" in response matrix

---

## Next Steps

1. Update ROADMAP.md with TTS-PARITY-1 sprint spec and resequenced conveyor
2. Update `docs/governance/sprint-queue.xlsx` with new sprint and resequencing
3. Dispatch TTS-PARITY-1 to CLI
4. After TTS-PARITY-1 lands and tests pass, package OutsideAudit.10 with fixes
5. Target: 9/10 on re-audit
