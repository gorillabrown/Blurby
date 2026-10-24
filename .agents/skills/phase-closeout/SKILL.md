---
name: phase-closeout
description: >
  Process CLI phase or sprint summaries into two durable outputs: a Phase Close-Out Report
  for project decisions and a Spec Retrospective for workflow improvement. Use when a
  completed CLI run, sprint summary, merge summary, or "phase complete" update needs to be
  interpreted, dispositioned, saved to files, and folded back into roadmap/governance work.
---

# Phase Close-Out

Using the phase-closeout skill to process this summary.

Treat this skill as a structured close-out workflow for completed CLI work. Produce two
deliverables in order:

1. **Phase Close-Out Report**
2. **Spec Retrospective**

Persist both outputs to files after user confirmation.

The skill runs in **two waves**:

- **Wave 1 — Draft & Confirm** (before save): a tight Sprint Brief, then findings,
  interpretation, proposed dispositions, governance updates, draft retrospective
  entries, and proposed roadmap updates. Ask the user to confirm.
- **Wave 2 — Persist** (after confirmation): apply the confirmed roadmap edits, save
  the close-out report, append the retrospective entries, and report what was saved.
  **Do not print a next-sprint dispatch pointer in either wave** — the next pointer is
  the responsibility of the separate `/next-pointer` skill, not this one.

## Core Workflow

**Wave 1 — Draft & Confirm:**

1. **Lead with the 5-line Sprint Brief** — *Goal*, *Result*, *Learned*, *Recommend*,
   *Bottom line*, one sentence each. See the Sprint Brief section below.
2. Findings table.
3. Interpret non-pass results and propose dispositions.
4. Draft only the net-new governance updates still needed.
5. Spec Retrospective entries.
6. Proposed roadmap updates.
7. Ask the user to confirm dispositions, retrospective entries, and roadmap updates.

**Wave 2 — Persist (after confirmation):**

7b. **Process governance staging file (if present).** Check for
    `Memo.<sprint-id>.GovernanceStaging.<date>.md` in the close-out folder.
    If it exists (worktree-resident sprint using virtuoso's staging pattern):
    - Parse all fold-in instructions
    - Apply them to canonical main as Edit calls against named target documents
    - Process Mid-Dispatch Amendment migrations BEFORE inline spec collapses
    - After applying all fold-ins, delete the staging file
    - If a fold-in conflicts with current state (target section moved/changed),
      surface as a reconciliation prompt to the user before proceeding
    For grandfathered sprints (pre-staging pattern): check for inline Mid-Dispatch
    Amendment blocks with Close-Out Preservation fields and process those instead.
8. Apply the confirmed roadmap edits (any that weren't already applied via staging file).
9. Save the close-out report and append retrospective entries.
10. Brief persistence summary — files saved and their paths. Stop there. No next-sprint
    pointer; that is `/next-pointer`'s job.

## Sprint Brief — Lead of Wave 1

A 5-line scannable lead. One sentence per label. The findings table and detail
sections come after — the brief is the answer, not the report.

```
# [Sprint ID] Close-Out

**Goal:** [What the dispatch set out to do — one sentence.]
**Result:** [What actually happened — one sentence, name the things, no aggregates.]
**Learned:** [Durable lesson — promoted rule, retired tool, or shifted assumption.]
**Recommend:** [Recommended next direction — single sentence, no pointer code box.]
**Bottom line:** [One-sentence takeaway.]
```

Optional add-ons (use only when they materially sharpen the story, one line each):
**By the numbers**, **Between the lines**, **Yes, but**, **What's at risk**. If
the brief grows past ~10 lines, cut.

**Substance rule:** name the actual things, not aggregates. "Shipped three fixes"
and "surfaced a tooling failure" hide the conclusion — write *which* three and
*what* failed in one clause. No undefined sprint codes or acronyms in the brief
unless they're already part of the user's working vocabulary.

## Deliverables

### 1. Phase Close-Out Report

Purpose:
- interpret the results
- classify findings
- confirm dispositions
- identify governance updates
- point to next work

Write one per completed sprint:

- `CloseOut.[sprint-id].[date].md`

Use the template in:
- [assets/CloseOut.template.md](C:\Users\estra\Projects\Tools and Templates\Codex.Skills\phase-closeout\assets\CloseOut.template.md)

For the detailed report structure and finding/disposition model, read:
- [references/closeout-report-format.md](C:\Users\estra\Projects\Tools and Templates\Codex.Skills\phase-closeout\references\closeout-report-format.md)

### 2. Spec Retrospective

Purpose:
- evaluate the dispatch spec
- calibrate effort and sizing
- review routing and precision
- capture reusable workflow lessons

Append approved lessons to:

- `SpecRetro.Lessons_Learned.md`

Use the template in:
- [assets/SpecRetro.entry.template.md](C:\Users\estra\Projects\Tools and Templates\Codex.Skills\phase-closeout\assets\SpecRetro.entry.template.md)

For the retrospective categories, promotion rules, and persistence model, read:
- [references/spec-retro-format.md](C:\Users\estra\Projects\Tools and Templates\Codex.Skills\phase-closeout\references\spec-retro-format.md)
- [references/promotion-rules.md](C:\Users\estra\Projects\Tools and Templates\Codex.Skills\phase-closeout\references\promotion-rules.md)

## Persistence Rules

- Never leave the output only in conversation.
- Save the close-out report as a per-sprint file.
- Append retrospective lessons to the running `SpecRetro.Lessons_Learned.md` document.
- Present drafts first. Save only after the user confirms dispositions and lessons.

To prepare output files and compute the next `SRL-NNN`, use:

```powershell
python "C:\Users\estra\Projects\Tools and Templates\Codex.Skills\phase-closeout\scripts\prepare_closeout_files.py" --project-root "<project-root>" --sprint-id "<SPRINT-ID>" --date "<YYYY-MM-DD>"
```

## Save Location

Use this fallback order:

1. Existing close-out folder beside prior `CloseOut.*` or `SpecRetro.Lessons_Learned.md`
2. `<project-root>\\docs\\Close-Outs\\`
3. Create `<project-root>\\docs\\Close-Outs\\`

## Governance / Gate Checks

After the close-out report is drafted, check:

- whether roadmap or sprint queue updates are already current
- whether any lessons belong in governance docs
- whether an audit, milestone review, or merge/release gate should be surfaced

Read:
- [references/governance-gates.md](C:\Users\estra\Projects\Tools and Templates\Codex.Skills\phase-closeout\references\governance-gates.md)

## Roadmap Update Considerations (Wave 1 — Draft for Confirmation)

After the close-out report and spec retrospective are drafted, propose roadmap updates
in the Wave 1 draft so the user can confirm them alongside dispositions and lessons.
The sprint just produced new information — the roadmap should reflect it, and the
user needs to sign off before edits land.

**Propose in Wave 1 (as confirmation items, not commits):**
- Mark completed work as done (milestones hit, features shipped, investigations closed)
- Reprioritize based on discoveries (a sprint finding that reorders what matters next)
- Add new work surfaced by the sprint (gaps found, follow-up investigations needed)
- Remove or defer work invalidated by results (if the sprint disproved a hypothesis,
  the work planned on that hypothesis should be removed or deferred)
- Adjust timelines if the sprint revealed scope was larger or smaller than expected

**Where updates land (Wave 2, after confirmation):**
- The project's roadmap file (sprint-queue.md, roadmap.md, or equivalent)
- Show the user the diff summary: what changed and why

**When to skip:**
- If the sprint produced no findings that affect priorities (rare — flag it if so)
- If the roadmap was already updated as part of governance checks in step 3

## Next Dispatch Pointer — Out of Scope

This skill **does not** print a next-sprint dispatch pointer. The next pointer (single
or parallel) is the responsibility of the `/next-pointer` skill, run separately after
phase-closeout finishes.

Wave 1's *Recommend* line names a direction in prose only (no code box). Wave 2 ends
at persistence — no pointer.

## Important Guardrails

- Propose dispositions; do not decide them unilaterally.
- Prefer net-new governance updates over ceremonial rewrites.
- Promote a retrospective lesson to a standing rule only after the same pattern appears twice.
- Keep the report project-facing and the retrospective workflow-facing.
- Lead Wave 1 with the 5-line Sprint Brief; everything else is support detail.
- **No next-sprint dispatch pointer in either wave.** That belongs to `/next-pointer`.

## Anti-Patterns

- Leaving the outputs unsaved
- Writing files before user confirmation
- Opening Wave 1 with the Findings table instead of the Sprint Brief
- Letting the Sprint Brief grow past ~10 lines — it should be scannable in seconds
- Leading with aggregate labels ("the three fixes", "a tooling failure") that hide
  the actual referents — name the things or explain the failure in one clause
- Printing a next-sprint dispatch pointer (Wave 1 or Wave 2) — that is `/next-pointer`'s job
- Writing vague retrospective lessons
- Promoting one-off observations into standing rules
- Skipping the Wave 1 roadmap-update proposals
