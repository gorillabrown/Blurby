# Roadmap Review — Lessons Applied — 2026-10-08

## Provenance

Lessons role `docs/governance/LESSONS_LEARNED.md` (LL-001…LL-127; 1,714 lines), read directly on 2026-10-08. The registry's `lessons --open` reports **0** lessons, because headings use `### [YYYY-MM-DD] LL-NNN: title` and the parser requires an id-first heading with prefix `SRL`. All figures from `kpis --json` → `learning`, as of 2026-10-08.

## Live lessons applied, by specification

| Specification | Lessons applied | Change made to the spec |
|---|---|---|
| CLOUD-RETRY-SHARED-1 | LL-095 | Force-refresh-on-401 now lives in one place. *Done when* 4 asserts each provider passes `forceRefresh: true` and its own provider name; new test 4 asserts exactly one refresh per 401 |
| TTS-SIDECAR-SHARED-1 | LL-112, LL-088, SRL-089 (standing rule 37) | LL-112 created a separate Task 1: a characterization suite (11 tests) committed against unmodified code before extraction. LL-088 and standing rule 37 serialize Task 1 → Task 2 and sidecar → engine |
| CLEANUP-LEGACY-PARSERS-1 | none applicable; standing rule 36 (SRL-086/087) | Mandatory re-census before deletion; the `CLAUDE.md` row is located by grep, not by line number |
| READER-MODE-SEPARATION-2 (existing, D.4.5) | LL-108, 109, 112, 120, 121, 124, 125, 126, 127 (applied 2026-09-23) | A Lessons applied section was added (none existed; the spec predates U9). The new manual-G0 fallback applies an unrecorded candidate lesson (below) |

Lessons read and judged not to apply to the new specifications: LL-031 (no generation-ID change), LL-028 (tokenization), LL-093 (refactor line counts), LL-113 (scratch trees in test discovery).

## U9 mechanical check

`lessons --check ROADMAP.md --item <ID>` fails on all four specifications. The cause is systemic: the parser reads 0 lessons, so even correct LL citations resolve as unknown. The owner approved a **recorded waiver** at this review; it is written into each spec's Lessons applied section. It expires when the lessons-format governance task lands. That task must not rewrite history, because the role is append-only. Its likely shape: set `policy.lessons.idPrefix` to `LL`, then append id-first canonical entries (`### LL-NNN — title (ITEM, date)` with Verdict / Evidence / Recommendation / Applies to / Status) for the live lessons.

## Promotions and retirements

`lessons --candidates`: 0 candidates (the parser sees no lessons). Nothing was promoted or retired in this review. No standing-rule ids are declared in `policy.standingRules.ids`; the roadmap's 38 numbered rules keep their historical labels.

## Candidate left for close-out

- **GUI-automation admission of an Electron app is brittle; when the owner is already the required observer, prefer an owner-observed checklist.** Evidence: Wave A 40-action stop; A1 EPIPE and non-serializable capture after more than 20 actions; zero production progress in 15 days. It is applied here as READER-MODE-SEPARATION-2's 2026-10-08 amendment. If the manual route works, that item's close-out should record it.

## Learning figures

| Metric | 2026-09-23 | 2026-10-08 |
|---|---|---|
| live-count | not recorded | 0 (parser cannot read the file) |
| lesson-yield | not recorded | 0.0 (0 of 58 close-outs said "no new lesson") |
| held-rate, promotion-rate, time-to-apply, repeated-trap-rate, effort-calibration | — | not computable: no parseable lesson; no close-out records whether an applied lesson held; 0 terminal records with estimate and actual |

## Close-outs since the last review that recorded no lesson

None. No close-outs were written after 2026-09-23.

**2026-10-09:** waiver expired — policy.lessons.idPrefix=LL and the canonical index appended; lessons --check passes for all four specs. learning.live-count = 92 (kpis --json).
