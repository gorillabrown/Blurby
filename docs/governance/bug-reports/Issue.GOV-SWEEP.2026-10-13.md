# Issue — GOV-SWEEP-2026-10-13 deferred findings (handed to /roadmap-review)

**Raised by:** governance-sweep, 2026-10-13 (branch `eb/gov-sweep-2026-10-13`)
**Routed to:** the next `/roadmap-review`, which owns the lessons, ROADMAP status, board and snapshot

## 1. tl;dr

The 2026-10-13 governance sweep repaired stale text and archived and quarantined obsolete files. It left nine findings that belong to `/roadmap-review` or need owner judgement.

## 2. Executive Summary

The sweep could write only the roles the registry amendment granted it. Lessons hygiene, the ROADMAP status table, the generated board and the snapshot belong to other ceremonies. Some bug statuses and agent-template bodies need judgement or verification the sweep cannot supply. None of these block current dispatch; together they are documentation drift.

## 3. Evidence of issue

1. **Lessons hygiene** (`lessons --hygiene`, 125 lessons, 68 close-outs read): merge LL-026 into LL-024 and LL-094 into LL-093; 53 retirement proposals (LL-002 to LL-094 range, 189–206 days old, never applied in a close-out); tidy LL-145 (missing recommendation); record LL-104 (its prose says it was promoted, but no status record exists).
2. **NARRATE-REBUILD-1 progress is missing from the ROADMAP status table.** P0–P4 are merged (P3 `ef245815`, P4 `331f8313`, 2026-10-13); ROADMAP's header still says "Last updated 2026-10-12". P4 also removed the three `normalizeReaderModes` runtime calls, so CLAUDE.md's "settings schema 13 turns a saved `narrate` mode into `flow`" and TECHNICAL_REFERENCE's schema-13 section need re-checking against the merged code. P4 also added a Narrate bar button and KeyN, so the "Kokoro is dormant / no UI or launch path" wording in CLAUDE.md (engine posture, Tech Stack), TECHNICAL_REFERENCE §7 and the TTS_ARCHITECTURE_DECISIONS banner should be rewritten by the epic's close-out. Live state: `docs/planning/epics/2026-10-12-narrate-rebuild/state.md`.
3. **The board and snapshot are stale.** `Virtuoso/work-register.snapshot.json` predates the 2026-10-13T16:41Z NARRATE-REBUILD-1 set-status, and `roadmap-board.html` predates the latest ROADMAP change. Both are generated mirrors.
4. **Test count not recomputable by the sweep.** CLAUDE.md, ROADMAP and TECHNICAL_REFERENCE still say 1,955 passed in 134 files; P3 added `tests/narrate/`. The figure is *not computable* without a suite run.
5. **Unverified old OPEN bugs:** BUG-031 ("Partially fixed"), BUG-040, BUG-054, BUG-063, BUG-064, BUG-065 and BUG-066 still show Open in `docs/governance/BUG_REPORT.md` with no resolution. BUG-169's Flow half is open and untested (see its 2026-10-13 note).
6. **Agent templates largely uncustomized.** `.claude/agents/{aristotle,hippocrates,marcusaurelius,plato,solon,simonides}.md` keep dozens of `[CUSTOMIZE: …]` blocks (test commands, architecture rules, known traps). The sweep fixed only the header fields, `**Model:**` lines and MarcusAurelius's reference block.
7. **Simonides' memory files** (`.claude/agents/memory.yaml` and the files simonides.md names) do not exist; it is unclear whether Simonides is in use.
8. **ROADMAP.md is 755 lines** against the 500-line target.
9. **About 90 registered git worktrees**, 6 of them prunable (`git worktree list`). Pruning is maintenance, not a sweep action.

## 4. Possible cause(s)

1. Ceremony ownership: these roles are written only by `/roadmap-review`, `/pointer-closeout` or `/next-pointer`, and none has run since P3 merged.
2. The agent files were copied from plugin templates and never customized.

## 5. Likely solution(s)

1. `/roadmap-review`: apply or decline each lesson-hygiene proposal, update the ROADMAP status table and header, refresh the snapshot and regenerate the board, and trim ROADMAP toward 500 lines.
2. Run `npm test` on `main` and update the three test-count citations from that run.
3. Owner: verify or close BUG-031/040/054/063–066; re-test BUG-169 in Flow.
4. Owner: decide whether to customize or retire the template agents, Simonides included.
5. Maintenance: prune the merged worktrees and the 6 prunable ones.

## 6. Confidence in cause and solution identification (1–10)

8 — every item is a direct observation with a named source. Only the bug statuses and the agent-template decision need owner judgement.
