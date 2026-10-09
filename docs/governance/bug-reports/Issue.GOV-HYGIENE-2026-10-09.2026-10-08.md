# Issue — GOV-HYGIENE-2026-10-09 — duplicate lesson id LL-092

**tl;dr:** STEP 3b stopped. `LESSONS_LEARNED.md` uses LL-092 for two different lessons, so the canonical index cannot be generated without guessing.

**Executive Summary:** The dispatch says to stop and report if two headings share an LL id. Two headings do: line 1125 (REFACTOR-1B, spec "Create" tasks) and line 1153 (PERF-1, Electron/React performance patterns). Both are dated 2026-04-07 and came from separate commits that day. STEPs 0–2 are complete and committed on `eb/roadmap-review-2026-10-08`. STEPs 3–6 have not run, and main is untouched.

**Evidence of issue:**
- `LESSONS_LEARNED.md:1125` — `### [2026-04-07] LL-092: Sprint Specs Must Verify Target File Existence Before "Create" Tasks` (added in 36b8361e REFACTOR-1B)
- `LESSONS_LEARNED.md:1153` — `### [2026-04-07] LL-092: Performance Remediation Patterns for Electron + React` (added in 87295ecc PERF-1)
- `git grep LL-092` outside LESSONS_LEARNED.md finds no hits, so no spec or doc cites either one.
- The highest id in use is LL-127.

**Possible cause(s):** 1. Two sprints on 2026-04-07 (PERF-1 v1.47.0, REFACTOR-1B v1.49.0) each took the next free number from a stale view of the catalog (9/10).

**Likely solution(s):**
1. (Recommended) Keep LL-092 for the older entry (PERF-1, line 1153, commit 87295ecc). In the appended index only, assign **LL-128** to the REFACTOR-1B entry at line 1125. Its Source line records "originally headed LL-092 (duplicate id)". This stays append-only, and nothing cites either id.
2. Edit the heading at line 1125 to LL-128. This is cleaner, but it breaks the append-only rule and needs owner approval.

**Confidence (1–10):** 9. The duplication is shown directly by grep and git history. The only open question is which entry keeps the id, and that is the owner's call.

---

## Decision — 2026-10-08 (mid-dispatch, Cowork)

**Decision:** Type 1b — Advance (Cowork-originated). Owner chose option 1.
**Pause point:** STEP 3b duplicate-id STOP: LL-092 sits on line 1125 (REFACTOR-1B) and line 1153 (PERF-1).
**Ruling:** LL-092 stays with PERF-1 (line 1153, older commit 87295ecc). In the appended index only, the line-1125 entry becomes **LL-128**. Its Source line reads `LESSONS_LEARNED.md line 1125, original heading "<heading>" — originally headed LL-092 (duplicate id; renumbered in index 2026-10-09)`. No existing line is edited.
**Added for the run (Cowork pre-flight found this):** 7 entries label their verdict field with a suffix, `**Guardrail (PR-0xx):**`, `**Guardrail (corrected …):**` or `**Pattern — …:**` (lines 1097, 1111, 1125, 1139, 1153, 1181, 1670). Match labels by prefix: `^\*\*(Guardrail|Rule|Pattern|Decision|Fix)\b[^*\n]*:\*\*`, case-insensitive. LL-082 (line 952) has none of these labels. Fall back to the first bold-labelled field after Context other than Related/Area/Status/Priority (for LL-082 that is "The safe pattern"), else the heading title. LL-063 (line 634) has no Status, so it maps to Observation, as already specified.
**Scope change:** The STEP 4 staged set grows to 8 paths; this issue file is added as the decision record. The checkpoint commit bf928e13 stands, and STEP 4 becomes a second commit.
**Follow-up items:** (1) PR-092 is also duplicated (the Guardrail labels in both entries). Not parsed; leave it for a governance sweep. (2) Pending lesson for close-out: a spec that bulk-transforms hand-written docs must sample label variants and define fallbacks before dispatch. It is not written now, because editing either copy of SpecRetro.Lessons_Learned.md would trip the STEP 5 hash/unchanged checks.

### Execution record — 2026-10-09
- The index was appended with 100 entries: 92 Observation, 5 Retired — resolved, 3 Superseded. Original LL-092 at line 1125 is indexed as **LL-128**; LL-092 stays with PERF-1 (line 1153). `git diff --numstat` shows 904 additions and 0 deletions.
- Labels matched by prefix as ruled: 7 suffixed `Guardrail (…)` entries plus 2 `Rule PR-1xx` entries (LL-110, LL-111).
- **LL-082 discrepancy:** the literal rule "first bold field after Context" picks `The pattern that fails`, but the ruling names `The safe pattern`. The run followed the named field via an explicit per-line override.
- ITEM extraction followed the regex literally. LL-128's ITEM is REFACTOR-1A (taken from its Context), although the commit that added it was REFACTOR-1B.
- `lessons --open`: 92 live / 8 closed. `kpis --json` learning.live-count = 92. `lessons --check` PASS (exit 0) for CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1, CLEANUP-LEGACY-PARSERS-1 and READER-MODE-SEPARATION-2. Non-blocking warning: CLEANUP-LEGACY-PARSERS-1 cites LL-001, which is Superseded -> LL-063. Not edited, because the check passed.
- Pending SRL (from the Decision block) is still unwritten. A spec that bulk-transforms hand-written docs must sample label variants and define fallbacks before dispatch.
