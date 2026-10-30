# Issue — AGENT-PROTOCOL-CONSOLIDATION-1 — 2026-10-30

Filed by the dispatch session (local_53b36178) under the virtuoso skill, Phase 5. Saved here, not in the registered
`issues` role (`docs/governance/bug-reports`): that role's allowedWriters do not include `virtuoso`, and D9 limits the
branch to the 11 moves plus the memo.

## 1. tl;dr
Done-when C5a and C6 contradict: C5a forbids any `zeus\.(md|toml)` match in CLAUDE.md/AGENTS.md, while C6 (and the
prescribed E3/E9 text) requires `skills/virtuoso/references/zeus.md` in both files.

## 2. Executive Summary
D3(c) applies the memo in memory and runs C5–C8 and C10. Everything passes except C5a, whose term `zeus\.(md|toml)` hits
the plugin path `skills/virtuoso/references/zeus.md` that C6 demands and that the spec's own E3 and E9 New text contains.
No memo text can satisfy both rows, so D3 cannot pass as written. Per the failure-handling table ("D3 fails: fix the
memo, never the targets"), the memo is not the defect; the gate is. A ruling is needed before row 3 closes.

## 3. Evidence of issue
- Memo: `docs/governance/close-outs/Memo.AGENT-PROTOCOL-CONSOLIDATION-1.GovernanceStaging.2026-10-30.md` in
  `C:\Projects\Blurby\.worktrees\agent-protocol-consolidation-1` (uncommitted).
- `check_memo.py <memo> origin/main` → exit 1, single failure `(c) C5a hits`: CLAUDE.md and AGENTS.md lines carrying
  E3 (`skills/virtuoso/references/zeus.md`), E5 (`references/zeus.md`), E9 (`skills/virtuoso/references/zeus.md`) and
  E11 (`skills/virtuoso/references/zeus.md`). E3 and E9 New text is prescribed verbatim by the spec.
- C6 (spec): `git grep -l -F "skills/virtuoso/references/zeus.md" HEAD -- CLAUDE.md AGENTS.md` must list both files.
- Spec's dry-run note says each row was dry-run against the base; C5a was evidently not dry-run against the prescribed
  edit (LL-143 asks for both).
- Tried and failed: none retried. `guards --tried` → not computable (no dispatch binding yet).
- Positive control: the checker fails on a deliberately broken memo (`(a) E1 Old occurs 0 times`, C5b hits), so its
  pass/fail is meaningful.

## 4. Possible cause(s)
1. (Most likely) C5a's `zeus\.(md|toml)` alternative was written to catch the old local files (`.claude/agents/zeus.md`,
   `zeus.toml`) and did not anticipate the plugin path that C6 introduces.

## 5. Likely solution(s)
1. **Recommended:** amend C5a's term to `(^|[^/])zeus\.(md|toml)` (ERE, git grep -E). The old local paths stay caught by
   `\.claude/agents` / `\.codex/agents`; bare `zeus.md` / `zeus.toml` stay caught by `(^|[^/])`; only
   `…/references/zeus.md` is exempt. Measured: on origin/main the amended C5a still finds all 15 base lines
   (CLAUDE.md 7, AGENTS.md 8; original 15); with it, `check_memo.py` passes all of (a)–(e) with 0 failures
   (26 text fold-ins, 2 moves, 4 overlays; CLAUDE.md 30,353 B, AGENTS.md 30,460 B).
2. Alternative: keep C5a and drop C6's `references/zeus.md` requirement and the E3/E9/E11 path mentions — loses the
   plugin pointer the directive asks for; not recommended.

## 6. Confidence (1–10)
9 — the contradiction is mechanical and reproduced; the amended term was run against both the base and the memo.

## Also for the merge gate (no action asked now)
- Drift: `abdfe98e` already added the `| Blurby Business |` Work lanes row to ROADMAP.md, so the memo stages no row
  (it would duplicate). C8's ROADMAP check already exits 0 on base.
- Helper side effects in the worktree (uncommitted, outside the fence): CH-001 `plugin-version` (actor `virtuoso`,
  `to: 1.16.1`) appended to `docs/governance/Change.Ledger.jsonl` — `changeLedger` allowedWriters do not name
  `virtuoso`; and one cost-backfill line in each of ten earlier `Timing.*.jsonl` logs.
- One transient launcher failure (`overlays --scaffold` resolved the `python3` WindowsApps alias); the retry passed.

## 7. Exported issue documentation path
`C:\Users\estra\AppData\Local\Claude-Data\claude_pzs8sxrjxfjjc\side-session-notes\local_cd4b981b-72da-43be-bc57-b18dfe3fe3a9\Issue.AGENT-PROTOCOL-CONSOLIDATION-1.2026-10-30.md`

## Decision (Blurby.Brain1, 2026-10-30)

**C5a amended, not as recommended (ruling R-C5a).**
- C5a's `zeus` term becomes a lookbehind that exempts only the plugin path: `git grep -n -P '(?<!skills/virtuoso/references/)zeus\.(md|toml)' -- CLAUDE.md AGENTS.md`, expected 0 lines after Step 0 (base: 7 lines, CLAUDE.md 3 and AGENTS.md 4). C5a's other terms stand.
- Reason: the recommended `(^|[^/])zeus\.(md|toml)` misses slash-prefixed local paths such as `.claude/agents/zeus.md` and `.codex/agents/zeus.toml`.
- Positive control: the D3 checker fails on a memo whose New text names `.claude/agents/zeus.md` (run by the dispatch; exit 1).
- Consequence: E5 New names the full plugin path `skills/virtuoso/references/zeus.md`; accepted by Blurby.Brain1 with the package-unchanged confirmation for `ec429e9f`.
- The Work lanes row is Blurby.Roadmap's to reconcile at close-out (no fold-in: already on main at `abdfe98e`); the helper's CH-001 stays uncommitted in the dispatch worktree and is decided at close-out (Findings F-011).
- Filed into the registered `issues` role by `/dispatch-closeout` on 2026-10-30; the original is in the session notes folder. Lesson: LL-143 status (2026-10-30).
