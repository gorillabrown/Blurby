---
sprint: HB-3
date: 2026-10-13
runtime: 6m (estimate 22m)
tokens: not measured
status: all-pass
---

# Pointer Close-Out: HB-3

Origin: held plan — 2026-10-13-notion-link-repair (HB-3), not yet on the roadmap. Branch `eb/hb-3` from `main` @ `f138ec6a`; merged `003c08e4` (`--no-ff`), pushed.

## Sprint Brief

**Goal:** Remove every link Notion generated from file names in Blurby.Roadmap's text properties without changing any value's plain text, and record read and write rules so new ones do not appear.
**Result:** 94 auto-generated `[T](http://T)` links in 91 values on 61 items (Spec Reference 57, Evidence 19, Notes 16, Description 2) were rewritten with every dotted name in backticks and markdown characters backslash-escaped; the Q1 SHA-256 of the 16 mapped columns is unchanged (`9729d554…`, 72 rows) and a rows-mode read finds 0 auto-links; CLAUDE.md carries the "Notion register text" standing rule and the registry carries `x-notion.textRules`.
**Learned:** LL-155 — Verify a Notion text rewrite against the SQL plain text; rows mode is not a faithful echo of the markdown written.
**Recommend:** The next roadmap review absorbs HB-2 and HB-3 together as completed Platform & Maintenance items, and its own register writes follow `x-notion.textRules`.
**Bottom line:** The register's dead links are gone and every byte of plain text is unchanged.

## Time

| Row | Task | Kind | Model | Effort | Predicted | Actual | Waited | Added | Flag |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Q1 baseline hashed, rows-mode before-read saved, and the auto-link detector's count N recorded | — | claude-opus-5-5 | low | 0 min (median of 32 runs) | 1 min | — | — | — |
| 2 | Transform with its asserts passing, and the rewrite and skip lists | — | claude-opus-5-5 | medium | 1 min (median of 21 runs) | 1 min | — | — | — |
| 3 | Affected values rewritten, each checked against its Task 1 SQL text | — | claude-opus-5-5 | medium | 1 min (median of 21 runs) | 3 min | — | — | confirmed |
| 4 | Q1 hash unchanged and zero auto-links in a fresh rows-mode read | verify-gate | claude-opus-5-5 | medium | 1 min (median of 3 runs) | 0 min | — | — | — |
| 5 | CLAUDE.md rule line and `x-notion.textRules`, registry valid, under 35k | — | claude-opus-5-5 | low | 15 min (estimated) | 0 min | — | — | — |
| 6 | Committed, merged to main with --no-ff, pushed; close-out | merge-and-docs | claude-opus-5-5 | low | 4 min (median of 6 runs) | 0 min | — | — | — |
| +7 | Zeus: Load spec, conflict check, in-flight, build plan | — | claude-opus-5-5 | high | 0 min (median of 9 runs) | 0 min | — | yes | — |

Estimate 22m (the first listing, sequential rows) · Actual 6m (measured working time, sequential rows). Row 3 (over 3× its prediction) was confirmed by the owner as real write time, not a hidden wait. Per-row evidence is in `docs/governance/close-outs/Timing.HB-3.jsonl`; `timing --check` clean.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| DW1 | Plain text unchanged (F1, F2, F4) | Q1 rows; SHA-256 of canonical JSON | 72; equal before/after | 72; `9729d5549c3116b0dbc5df0f0c646832b46d775b17db71b470ff7bd651059c8e` before, after batches 2 and 3, and after | Pass | equals HB-2's after-hash | — |
| DW2 | Detector proven (positive control) | rows-mode matches of `\[([^\]]+)\]\(http://\1\)` | N ≥ 1 (F-2 floor 75) | 94 in 91 values / 61 items; 0 links of any other form | Pass | — | — |
| DW3 | No auto-link left (F2, F4) | same read after | 0 | 0; rows-mode diff before/after shows no change outside the 91 target values | Pass | — | — |
| DW4 | Every write checked (F6) | SQL value vs Task 1 SQL | equal | batch 1: 23/23 by SQL equality (`ok=1`; a tampered and a backticked expected value both return 0); batches 2–4 by the full Q1 hash; F-1–F-4 never triggered | Pass | — | — |
| DW5 | Skips listed (F3) | values left untouched | listed | none (no real links; no dotted token containing a backtick) | Pass | — | — |
| DW6 | Transform self-check | asserts | 5 cases | 5 pass; plain-text round-trip asserted on all 91 values before any write | Pass | — | — |
| DW7 | Rules recorded (F5) | grep; chars; textRules; preflight | 1; < 35000; present; valid | 1; 34,671; present; `registry is valid` | Pass | — | — |
| X1 | Per-write check method | — | one SQL read per write | per-batch full-table hash (and SQL equality for batch 1) | Owner-accepted deviation | — | low |
| X2 | Rows mode echoes written `\#` as `#` and real newlines as `<br>` (4 values) | — | — | SQL plain text exact | Info | — | info |

## Interpretation

The must-never-happen row (plain text, statuses, row count) is proven by the Q1 hash, which HB-2 showed changes on a one-value tamper, and the per-value SQL equality check was itself shown able to fail. The one deviation, X1, verifies every written value at once through the hash rather than one read per write; it is stronger coverage at a coarser time grain, and no restore was ever needed. X2 means a verifier that compares a rows-mode read with the markdown it wrote would report false mismatches; plain text must be checked through SQL (LL-155).

## Proposed Dispositions

- DW1–DW7: accept.
- X1: accept.
- X2: accept; LL-155.

Confirmed by the owner, 2026-10-13.

## Mid-Dispatch Decisions

None. No issue file was raised.

## Lessons

- **New:** LL-155 — Verify a Notion text rewrite against the SQL plain text; rows mode is not a faithful echo of the markdown written
- **Applied:** LL-153 — held: the run wrote only text properties of items carrying an auto-link, moved no status, and the Q1 hash is identical before and after.
- **Applied:** LL-137 — held: Q1 reads hashed as UTF-8 canonical JSON; CLAUDE.md counted as UTF-8 characters (34,671).
- **Applied:** LL-154 — held: verification used SQL and rows-mode reads only; no view-mode query, the drift view untouched.
- **Applied:** ROADMAP standing rules 41 and 42 — held: the time log was named in the staging plan; the recipe ran from the committed held plan.

## Files Created

- **Removed (temporary):** none (reads, transform and plan stayed in the session scratchpad, outside the repository).
- **Committed:** `docs/governance/close-outs/Timing.HB-3.jsonl`, this report.
- **Ignored:** none
- **Left for a decision:** none.

## Governance Updates

- Notion Blurby.Roadmap: 91 text values on 61 items rewritten (display only; plain text unchanged).
- `CLAUDE.md`: Standing Rules — "Notion register text" (read from SQL; write with dotted names in backticks and markdown characters escaped).
- `Virtuoso/workspace-layout.json`: `x-notion.textRules` (read, write, dottedNamePattern, escapeCharacters, source).
- `docs/governance/LESSONS_LEARNED.md`: LL-155; status records for LL-153 and LL-154.
- For the absorbing review: register item and terminal record for HB-3 (deferred; held plan).
