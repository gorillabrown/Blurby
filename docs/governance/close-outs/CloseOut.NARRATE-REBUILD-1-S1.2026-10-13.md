# Close-out — NARRATE-REBUILD-1-S1 (epic session 1: P1 merged, P2 at gate G1)

**Sprint identifier:** NARRATE-REBUILD-1-S1 · **Epic packet:** `docs/planning/epics/2026-10-12-narrate-rebuild/` · **Dates:** 2026-10-12 20:25 → 2026-10-13 01:45 (owner pause 21:27–00:00) · **Actor:** virtuoso (claude-fable-5-1), one Hercules worker (corpus recovery) · **Registry policy:** push, network allowed; worktrees only, never the primary checkout.

## Outcome

| Phase | State | Evidence |
|---|---|---|
| P1 — Producer and harness | **Gate passed and merged** to `main` as `7bbf6b20` ("Merge eb/narrate-rebuild-1-p1: Producer and harness"), one `--no-ff` merge, base trailer `NARRATE-REBUILD-1-P1-Base: 25ba145d…` on `b03dfec4` = its parent, ancestor check exit 0 | `p0-summary.mjs` exit 0 (P0-1, P0-2, P0-4 PASS both voices; 514/514 checks; 500 chunks; factor 600); `--break` exit 1; `p1-gate.ps1` 11/11 with `-SelfTest` recording a FAIL; typecheck 0; `npm test` 1,955 passed / 1 skipped / 0 failed |
| P2 — Acoustic check, latency, verdict | **Open, waiting at G1.** Branch `eb/narrate-rebuild-1-p2` (base `7bbf6b20`), pushed; not merged — plan.md's P2 exit gate needs the owner's G1 answers adopted first | `VERDICT.md` in three parts + P0-5; `p0-acoustic.mjs` exit 1 (5 FAIL / 11 INCONCLUSIVE, control caught); `p0-latency.mjs --threads 4` exit 0 (worst warm 1,940 ms, worst cold 3,032 ms) |
| G1 | **BLOCKER(USER) raised** 2026-10-13 01:35 in state.md → Blockers, four questions with `Answer:` slots (route; merged-word display; mode id; measured offset) | state.md; VERDICT.md § Decisions |

**Phase 0 verdict in one line.** The exposed-duration table is exact and lawful on every chunk (P0-1/P0-2/P0-4 PASS), but the model's rendered audio starts each word about 50 ms ÷ rate before the table's onset at every conclusive interior anchor, and the first word of every chunk is off by −147 to +139 ms because the leading silence (≈ 360–500 ms) does not follow the BOS token's scaled duration; passage B and 2.00x are inconclusive after the two reference repairs the charter allows; latency passes at 4 intra-op threads and fails at onnxruntime's default. Classification: engine property under a verified contract, model precision not tried (only the q4 export exists offline); no bake-off from this verdict — the route is the owner's.

## Deliverables (all on `main` via `7bbf6b20` unless marked P2)

- `scripts/narrate-rebuild/lib/{offline-kokoro,chunker,wordmap,wav}.mjs`, `p0-identity.mjs`, `p0-generate.mjs`, `p0-summary.mjs`; P2: `p0-acoustic.mjs`, `p0-latency.mjs`
- `tests/fixtures/narrate-rebuild/` (passages A and B, 16 legacy fixtures byte-identical to `612d03f5`, manifest, README)
- `docs/studies/narrate-rebuild-1/phase0/`: `identity.json`, `MAPPING_POLICY.md`, `tables/<passage>.<voice>.json` ×4, `summary.json`; P2: `acoustic/*.json` ×5, `latency.json`, `latency.sweep.threads-*.json` ×6, `VERDICT.md`
- Artifacts outside the repository and the profile: `C:\Projects\Blurby-artifacts\narrate-rebuild-1\models\` (original copy sha `04cf570c…` unchanged; exposed copy sha `2eccfc53…` = OutsideAudit.10 record) and `audio\` (500 WAVs, 189 MB). `%APPDATA%\Blurby` untouched.
- Governance (P2 branch): `Memo.NARRATE-REBUILD-1-S1.GovernanceStaging.2026-10-13.md` (six tooling observations, five lesson candidates — for the planner to fold in; this run wrote no register, lessons, roadmap or issue file), this close-out, `Timing.NARRATE-REBUILD-1-S1.jsonl` (`timing --check` clean).

## Deviations and repairs (R2 classes)

1. **Harness repair (P0-2 evidence).** The first matrix failed one unit at all 25 rates (Emma "for a"): the identification evidence lost a syllable at a vowel junction and did not know British espeak's linking r. Fixed in `lib/wordmap.mjs`; the whole matrix was regenerated and proved byte-identical to run 1 in audio and tables (500/500), so no table changed. Journal S1 00:15, 01:10.
2. **Reference repairs (P0-3), two — the charter's limit.** (1) T4's literal pause-k ↔ mark-k pairing replaced by a monotone alignment on text-only priors with every neighbour of a count mismatch unresolved; (2) word offsets before pauses tried as anchors and found invalid (the pause's frames belong to the preceding phoneme), kept as a side report. Decision log #6.
3. **Thread setting for the measurement.** T7 ran at 4 intra-op threads after a six-setting sweep (Decision log #7); every sweep file is committed, nothing waived.
4. **Time log back-fill.** Rows 9–14 were first ended without `--evidence`; the evidence was filled by script from state.md (journal S1 01:35). A relative `--root .` once wrote to another worktree's copy; absolute roots since.
5. **No code outside the harness and docs was touched.** `tests/perf-baseline-results.json` was rewritten by the suite in the P1 worktree and never staged; the P1 worktree keeps that and a timestamp-only rerun of `summary.json` uncommitted on purpose.

## Effort calibration (Virtuoso Phase 6)

Sequential estimate 7 h 32 m; measured working time 2 h 24 m plus a 2 h 34 m owner wait on row 9. Mismatches worth recording for the planner: rows 6 and 13 ({max}, 120 min timeboxed each) took 16 min and 0 min — the P0-3 reference was built inside the P1 window while the matrix ran; row 9 ({low}, 1 min) took 102 min of work because the matrix ran twice (evidence defect) — a full generation matrix deserves {medium} and ≈ 45–60 min on a quiet machine; row 16 (40 min) took 1 min because the verdict was composed during the P0-5 wait. Rows 1, 3, 5, 7, 8, 14 and 18 show 0 min because their work fell inside another running row's window: the sequential log attributes time to the row that is running, so parallel bursts under-report — a planner note, not a defect.

## What the next session does (resume protocol → state.md → Next actions)

1. Read the owner's `Answer:` lines under state.md → Blockers; adopt each into the Decision log with its date.
2. Run the P2 gate commands in the P2 worktree (`p0-acoustic.mjs` exit 1 with the classification recorded; `p0-latency.mjs --threads 4` exit 0; VERDICT.md's three parts) and merge P2 per GIT WORK; record the merge sha in plan.md's Gate log and state.md's Evidence (on the P3 branch, never in a file the merge lands).
3. Follow answer 1: open P3 after SETTINGS-WRITE-DURABLE-1 is on `main`; or the precision trial (owner-authorized download; same hash-checked edit; P0-3 on passage A at 1.00x; verdict addendum); or the bake-off against these same gates.

## Provenance

Branch heads at close-out: `eb/narrate-rebuild-1-p1` @ `bd831b66` (merged); `eb/narrate-rebuild-1-p2` @ the commit carrying this file (see journal S1 01:35 Git line and `git log`). Register item NARRATE-REBUILD-1 stays In Flight; `/pointer-closeout` runs only at the epic's completion (launch.md → Completion protocol).
