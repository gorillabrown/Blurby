# Roadmap Review — Phase B Assessment — 2026-10-08

## Provenance

| Figure | Source | As of |
|---|---|---|
| Item counts, buffer figures | `virtuoso_registry kpis --json` → provider `connector+snapshot`, monday:board/18432450217 | snapshot 2026-09-24T04:51:59Z (stale 358.5 h); verified unchanged against the live connector read on 2026-10-08 |
| Learning figures | `kpis` → `learning`; lessons `docs/governance/LESSONS_LEARNED.md`, 58 close-outs read | 2026-10-08 |
| Execution evidence | branch `eb/reader-mode-separation-2` @ `74883154`; Issue `-2` | 2026-09-23 |

## B.1 Work remaining

| Metric | Value |
|---|---|
| Registered items | 62 |
| Terminal (completed / dissolved / superseded) | 44 / 6 / 1 |
| Percent complete by count | 82.3 % |
| Queued / In Flight / Blocked | 1 / 0 / 10 |
| Dispatch buffer | target 5 (policy default); filled 1; U9-ready 0 (see note) |
| Percent complete by effort | **not computable**: effort missing for 9 items (the five Stage 4 stubs and others), and the effort scale has no entries for numeric values 1, 2, 3, 8 |

Percent complete by count overstates progress toward the finish line. The 44 completions are mostly the finished TTS-architecture phase. The current finish line, *TTS Quality Confidence + Reading Experience v2*, has had **zero** completions since the 2026-09-23 restart. Its entry gate (mode separation) has not started production work.

"U9-ready 0" is an artifact of finding D4. The lessons parser recognizes none of the 127 `LL-NNN` entries, so no specification can pass the mechanical U9 check. It does not mean the head specification ignored the lessons; the 2026-09-23 lessons-applied report shows it applied them by reading the file directly.

## B.2 Pace

**No deadline is declared** (`policy.roadmap.deadlines` absent), so pace against a date is not computable. The trailing delivery rate is zero completions in the 15 days since the last review, and none since NARRATE-A5-RATE-RESEED-1 (merged 2026-05-31, reconciled 2026-07-02).

Blocked share of remaining work: 10 of 11 non-terminal items (91 %) are blocked. Nine wait directly or transitively on READER-MODE-SEPARATION-2, and KOKORO-EXPORT-1 is deferred by choice.

## B.3 Scope discipline (since 2026-09-23)

| Direction | Deltas |
|---|---|
| Forward (finish-line work completed) | 0 |
| Sideways (scope added or reshaped) | 2: the speed-dialog scope addition to READER-MODE-SEPARATION-2 (owner, 2026-09-23); the Stage 4 cleanup addendum, 5 new stubs (owner, 2026-09-24) |
| Backward (rework or lost ground) | 2: Wave A stopped at its 40-action ceiling; A1 failed (EPIPE / non-serializable capture) and exceeded its 20-action cap |

**Score = 0 / (0 + 2 + 2) = 0.00.** No held entries were absorbed or withdrawn (no holding bay).

Both sideways additions were deliberate owner decisions, not drift. The speed amendment is correctly fenced behind structural parity. The score is low because nothing moved forward.

No `findings` role is registered, so there are no open findings to carry.

## Opinion

**1. The plan is sound; the execution route is not.** The mode-separation specification is thorough, and its gates are the right ones. Every action spent so far went to admission tooling: about 61+ tool actions over two stopped attempts, all of it automating a live GUI capture of an Electron app (window geometry drift, concurrent input, renderer-start order, EPIPE). Today's manual-fallback decision is the correct correction. The owner is already the mandatory heard-audio observer, so manual capture moves the work to the person who must be there anyway.

**2. The item is epic-scale and should be run as one.** It has five serial gated waves, a 40-action ceiling per wave, three admission sub-slices, and a deferred speed-slider task. That is multi-session by construction. Each stop so far has needed a fresh planner decision to resume, which is exactly the overhead an epic charter (one completion condition, persistent run state, resumable phases) removes. Recommend marking it `Path: epic` in C.3.

**3. Three blocked cleanups are blocked by policy, not by code.** TTS-SIDECAR-SHARED-1 (`main/moss-nano-sidecar.js`, `main/pocket-tts-sidecar.js`), CLOUD-RETRY-SHARED-1 (`main/cloud-google.js`, `main/cloud-onedrive.js`) and CLEANUP-LEGACY-PARSERS-1 (`main/legacy-parsers.js`) edit only main-process files. None is in mode separation's edit-site table or the shared-core freeze set (main/ vs src/; execution surface D vs A/C). The owner priority in CLAUDE.md covers "narration fixes or mode-dependent UX work", and these are neither. The cleanup addendum blocked them with "mode separation remains step 1", which is ordering, not dependency.

Releasing them would:
- restore legitimate queue depth to 4, ending CLAUDE.md Rule 5a's standing stop signal without the bounded exception;
- give the implementation agent productive, isolated work while mode separation waits on manual G0 capture (CLAUDE.md Rule 6).

TTS-ENGINE-SHARED-1 would follow the sidecar item. CLEANUP-MODE-BARREL-1 genuinely overlaps mode separation's edit sites (`src/modes/index.ts`) and stays blocked. This is an owner decision.

**4. Governance is one bad checkout away from loss.** The 2026-09-23 registry, the snapshot, about 60 review artifacts and the specs live uncommitted on `main`, plus a committed but different copy on the execution branch. Recommend landing governance on its own documentation branch from `main` before any more execution.

**5. Learning signal is blind.** With the lessons parser seeing nothing and the terminal ledger empty, every `learning` KPI is zero or not computable. Neither failure blocks delivery, but together they make Virtuoso's lesson tracking silently inert. It is a bounded governance-sweep task.

## B.2 addendum: deadline recorded at checkpoint

The owner set `policy.roadmap.deadlines.mode-separation` = 2026-11-30, scoped to `id in {READER-MODE-SEPARATION-2}`. The backup is `Virtuoso/.backups/20261009T032917Z-policy-set`, and it was read back from disk. `kpis` pace for it:

- Days remaining: 67 (9.57 weeks). Remaining: 1 item / 20 points. Blocked share: 0 %.
- Required rate: 0.1 items/week, 2.09 points/week.
- Trailing rate: **not computable**. No recorded completion exists because `docs/governance/terminal-ledger.jsonl` holds no terminal records.
- Verdict: **not computable**. Pace is reported as of the snapshot date (2026-09-24) until the snapshot is refreshed.
