---
name: 3rd-party-audit
description: >
  Full lifecycle management of external 3rd-party codebase audits. Use this skill whenever
  the user says "3rd party audit", "external audit", "outside audit", or when an audit is
  required at phase close. This skill governs package creation, auditor prompts, remediation
  planning, and final decision integration. It produces 5 deliverables across 6 steps with
  structured handoffs between Cowork, the user, and the external auditor. Trigger on:
  "3rd party audit", "audit the codebase", "prepare audit package", "audit remediation",
  "process audit findings", or any phase-close audit gate. This is a Cowork skill — all
  audit steps are coordinated from the planning surface.
---

# 3rd Party Audit Process

This skill manages the full lifecycle of external codebase audits. Audits are conducted
by **legitimate independent 3rd-party auditors** — separate AI instances with no access
to the project's conversation history, prior decisions, or internal context. They receive
only the audit package and orientation brief and evaluate the project on its own merits.

**Announce at start:** "Using the 3rd-party-audit skill to manage this audit cycle."

**Authoritative reference:** `WORKFLOW_REFERENCE.md` §16

---

## When to Trigger

- User says "3rd party audit" or "external audit"
- A major phase closes and audit is part of the governance process
- User returns with an audit report (D2) or auditor review response (D4) — resume at the appropriate step
- User asks to prepare an audit package

---

## Audit Pipeline Overview

The audit is a 6-step pipeline producing 5 deliverables with structured handoffs:

```
Step 1: Package Creation (Cowork)         → D1a + D1b
Step 2: Handoff to Auditor (User)         → [user action]
Step 3: Audit Report (3rd Party)          → D2
Step 4: Remediation Plan (Cowork + User)  → D3
Step 5: Auditor Review of Response (3P)   → D4
Step 6: Final Decisions (Cowork + User)   → D5
```

**Ownership:** Cowork owns Steps 1, 4, 6. User owns Step 2. 3rd party owns Steps 3, 5.

---

## Step 1 — Package Creation

**Deliverables:** D1a (AuditOrientation) + D1b (AuditPackage)

### Actions

1. **Confirm scope** with user:
   - Which phases or areas are in scope?
   - Full-scope audit or targeted?
   - Any specific concerns to flag to the auditor?

2. **Determine audit number:**
   - Check existing `OutsideAudit.N.*` folders in the project's audit directory
   - Next audit = max(N) + 1

3. **Create audit folder:**
   ```
   [Audit Directory]/OutsideAudit.N+1.YYYY-MM-DD/
   ```

4. **Generate AuditOrientation document (D1a):**
   - Format: `.docx` (use the docx skill)
   - Required sections:
     - Executive summary of the project
     - Current build status (phase completion, calibration metrics, test counts)
     - Architecture overview
     - Description of every file included in the zip
     - Forward plan summary
     - File manifest organized by tier (Tier 1 critical / Tier 2 supporting / Tier 3 reference)
     - If multiple batches: which files are in which batch

5. **Assemble audit package zip(s) (D1b):**
   - **Max 35 MB per zip**
   - Apply tiered scoping (see Package Scoping below)
   - Naming: `AuditPackage.N.YYYY-MM-DD.Batch1.zip` (add Batch2, Batch3 if splitting)
   - AuditOrientation always goes in Batch 1

6. **Place all files** in the audit subfolder

7. **Provide user with the Step 1 Prompt** (see Auditor Prompts below)

### Package Scoping

Organize materials into tiers:

| Tier | Contents | When to Include |
|------|----------|-----------------|
| **Tier 1 — Core** | Main codebase, test suites, databases, roadmap, algorithm/design specs, AGENTS.md | Always |
| **Tier 2 — Supporting** | Design specs, lessons learned, agent findings, frameworks, calibration data | When relevant to audit scope |
| **Tier 3 — Reference** | Workbooks, data files, onboarding docs, prior audit history | Full-scope audits only |

**Batching rules:**
1. Try single batch first — if all materials fit under 35 MB, use one zip
2. Split by tier if total exceeds 35 MB (Batch 1 = Tier 1, Batch 2 = Tier 2, Batch 3 = Tier 3)
3. Sub-split if a single tier exceeds 35 MB (Batch1a, Batch1b, etc.)
4. AuditOrientation always in Batch 1
5. Label all batches in the AuditOrientation file manifest

**Exclusion rules — never include:**
- `.git/`, `__pycache__/`, `.pytest_cache/`, `node_modules/`
- API keys, credentials, secrets
- Meta-archives (e.g., project-level .zip backups)
- `desktop.ini`, `.DS_Store`, OS metadata

---

## Step 2 — Handoff to Auditor

**No deliverable — user action only.**

Provide the user with:
1. All batch zip(s) + orientation document
2. The **Step 1 Prompt** (see below) for the auditor
3. Instructions: "Give all of these to the auditor in a fresh session. If multiple batches, deliver all together — they're logically separated for size, not sequencing."

Then **WAIT** for the user to return with D2 (the audit report).

---

## Step 3 — Audit Report (3rd Party)

**Deliverable:** D2 (AuditReport)

The auditor produces their report externally. When the user returns with it:

1. Save as `AuditReport.N.YYYY-MM-DD.md` in the audit subfolder
2. Read the full report
3. Summarize key findings for the user before proceeding to Step 4

The report should cover:
- Executive verdict (sound / partially flawed / structurally unsound)
- Codebase reality check
- Roadmap item-by-item audit with classification
- Major contradictions and false assumptions
- Sequencing and dependency analysis
- Structural/modeling review
- Testing and validation review
- Top risks ranked by severity
- Missing work identification
- Proposed revised roadmap (if needed)
- Scored assessment (1–10) across 8 review dimensions

### Review Dimensions

1. Grounding in current codebase
2. Architectural coherence
3. Correct sequencing
4. Modeling soundness
5. Extensibility
6. Testability
7. Delivery practicality
8. Overall confidence

---

## Step 4 — Remediation Plan

**Deliverable:** D3 (AuditRemediationPlan)

### Actions

1. **Read the full audit report** (D2)

2. **For every major finding, assign a disposition:**

   | Disposition | Meaning | When to Use |
   |------------|---------|-------------|
   | **Accept** | Implement as recommended | Finding is correct, actionable, and timely |
   | **Accept with narrowing** | Implement with reduced scope | Finding is valid but scope is too broad for current phase |
   | **Defer** | Valid but not now | Correct finding, wrong timing — place in roadmap at right position |
   | **Reject** | Disagree | Evidence or reasoning doesn't hold — explain why with counter-evidence |

3. **Produce `AuditRemediationPlan.N.YYYY-MM-DD.md` containing:**
   - Management summary
   - Audit feedback response matrix (finding → disposition → next step)
   - Exact roadmap rewrite actions
   - Grouped implementation packages
   - Blocking decisions requiring user input
   - Testing/validation plan
   - Corrected execution order
   - Final decision-ready conclusion

4. **For each accepted finding, identify:**
   - Calibration drift risk
   - Documentation updates required (AGENTS.md, Roadmap, Algorithm Spec, etc.)
   - Prerequisites and dependencies

5. **Present to user for review** before proceeding

6. **Provide user with the Step 3 Prompt** for the auditor

Then **WAIT** for the user to return with D4.

---

## Step 5 — Auditor Review of Response (3rd Party)

**Deliverable:** D4 (AuditReviewResponse)

When the user returns with the auditor's response:

1. Save as `AuditReviewResponse.N.YYYY-MM-DD.md` in the audit subfolder
2. Read the full response
3. Summarize any surprises or disagreements for the user before proceeding to Step 6

The auditor provides line-by-line responses with disposition:
- Accept
- Accept with narrowing
- Defer
- Reject
- Convert into documentation-only correction
- Convert into later-phase calibration task

---

## Step 6 — Final Decisions & Implementation

**Deliverable:** D5 (AuditDecisions)

### Actions

1. **Treat the audit loop as closed** — these responses are definitive

2. **Update the project roadmap** with all accepted changes

3. **Update all affected governance documents:**
   - AGENTS.md — system state, phase status, references
   - Roadmap — resequenced phases, new tasks, updated specs
   - Algorithm/design specs — any architecture changes
   - LESSONS_LEARNED — new entry for this audit cycle
   - Variable/constants references — if constants affected

4. **Produce `AuditDecisions.N.YYYY-MM-DD.md` summarizing:**
   - All changes made to the roadmap
   - Deferred items with placement
   - Rejected items with rationale
   - New lessons-learned entries created

5. **Print a summary** of all roadmap changes

6. **Update AGENTS.md** §External Audit Outcomes (or equivalent section)

---

## Auditor Prompts

These are project-agnostic templates. Customize the bracketed sections for each project.

### Step 1 Prompt — Initial Audit (Given to 3rd Party)

> You are a principal systems architect, technical program auditor, and domain expert reviewer. You are being given:
>
> 1. The current [PROJECT NAME] codebase
> 2. The project roadmap
> 3. Supporting documentation that describes architecture, runtime flow, data model, logic, current state, open gaps, design intent, and context
>
> Your task is to perform a full, evidence-based vetting of the roadmap against the actual system as it exists today.
>
> Do not treat the roadmap as presumptively correct. Treat the code as the primary source of truth, then use the supporting documents to understand intended architecture, domain terminology, and planned direction. Where code and documentation differ, explicitly identify the divergence.
>
> Your review must be extensive, rigorous, and critical. The goal is to determine whether the roadmap is logically sound, technically coherent, properly sequenced, grounded in the existing implementation, and likely to produce a stable, extensible, and realistic way forward.
>
> Core instructions:
> - Read the roadmap in full
> - Inspect the codebase deeply before judging the roadmap
> - Cross-reference every major roadmap claim against actual code structures and data models
> - Be skeptical, specific, and concrete — no generic advice
> - Ground every major conclusion in direct evidence from the repository
> - Cite relevant files, modules, classes, functions, schemas, and constants by name/path
> - If a claim cannot be verified, state that clearly
> - Distinguish between: (a) what already exists, (b) what the roadmap assumes exists, (c) what is actually missing, (d) what must happen before later items can succeed
>
> Primary review question: "Given the current codebase and documentation, is this the right plan, in the right order, for the right reasons?"
>
> Review dimensions (score 1–10 each):
> 1. Grounding in current codebase
> 2. Architectural coherence
> 3. Correct sequencing
> 4. Modeling soundness
> 5. Extensibility
> 6. Testability
> 7. Delivery practicality
> 8. Overall confidence
>
> Required output format: (A) Executive verdict, (B) Current-state architecture summary, (C) Roadmap item-by-item audit, (D) Major contradictions, (E) Sequencing analysis, (F) Structural/modeling review, (G) Testing review, (H) Top risks, (I) Missing work, (J) Proposed revised roadmap, (K) Final recommendation with scores

### Step 2 Prompt — Remediation Plan (Cowork)

> You are managing remediation of an audit against the [PROJECT NAME] roadmap.
>
> Input: current codebase, roadmap and supporting docs, completed audit feedback
>
> Task: Convert the audit into a concrete management plan. Do not re-audit. Do not code yet.
>
> For every major audit finding, provide: disposition (accept / accept with narrowing / defer / reject), why, immediate next step, prerequisites, code/data/docs/tests touched, acceptance criteria, risk of calibration drift, correct placement in revised roadmap, consequence if mishandled
>
> Then produce: (1) management summary, (2) audit feedback response matrix, (3) exact roadmap rewrite actions, (4) grouped implementation packages, (5) blocking decisions, (6) testing/validation plan, (7) corrected execution order, (8) final decision-ready conclusion
>
> Constraints: preserve current calibration unless a change explicitly requires recalibration; identify where feature flags, migration shims, and invariant tests are required; specify required updates to all affected governance documents
>
> Do not be generic. Convert critique into action.

### Step 3 Prompt — Auditor Review of Response (3rd Party)

> Responses to your feedback below. Provide line-by-line responses in the following format with the intent to close the iterative feedback loop:
>
> 1. Feedback item — Utilize the item number
> 2. Disposition — Accept / Accept with narrowing / Defer / Reject / Convert into documentation-only correction / Convert into later-phase calibration task

### Step 4 Prompt — Final Decisions (Cowork)

> Here are responses to your Audit Remediation Plan. Consider this audit loop now closed with these responses as the definitive way forward.
>
> Tasks:
> 1. Adjust and implement all decisions into the roadmap and other relevant documentation
> 2. Print a summary of all changes to the roadmap based on this audit

---

## Cowork Execution Checklist

Use this checklist to track progress through the audit lifecycle:

- [ ] Confirm scope with user (phases covered, full vs. targeted)
- [ ] Determine audit number (check last `OutsideAudit.N.*` folder)
- [ ] Create `OutsideAudit.N+1.YYYY-MM-DD/` folder
- [ ] Generate AuditOrientation document (D1a) — use the docx skill
- [ ] Assemble and zip audit package ≤ 35 MB per batch (D1b)
- [ ] Place all files in audit subfolder
- [ ] Provide user with Step 1 Prompt for the auditor
- [ ] **WAIT** — User delivers to auditor and returns with D2
- [ ] Save audit report as `AuditReport.N.YYYY-MM-DD.md` (D2)
- [ ] Summarize key findings for user
- [ ] Execute Step 4: produce remediation plan (D3)
- [ ] Present remediation plan to user for review
- [ ] Provide user with Step 3 Prompt for the auditor
- [ ] **WAIT** — User delivers D3 to auditor and returns with D4
- [ ] Save auditor review as `AuditReviewResponse.N.YYYY-MM-DD.md` (D4)
- [ ] Execute Step 6: finalize all decisions, update docs (D5)
- [ ] Update AGENTS.md §External Audit Outcomes
- [ ] Add lessons-learned entry for this audit cycle
- [ ] Print roadmap change summary

---

## Audit History Tracking

Maintain an audit history table in the project's audit procedure document or AGENTS.md:

```markdown
| # | Date | Scope | Auditor | Verdict | Key Outcome |
|---|------|-------|---------|---------|-------------|
| 1 | YYYY-MM-DD | [Full/Targeted: area] | [Auditor ID] | [Verdict] | [1-line summary] |
```

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Do This Instead |
|-------------|---------------|-----------------|
| Skipping the orientation document | Auditor lacks context, produces surface-level review | Always generate D1a with full project context |
| Including `.git/` or caches in the package | Bloats zip, confuses auditor | Apply exclusion rules strictly |
| Rejecting findings without counter-evidence | Turns the audit into a rubber stamp | Provide specific code/data evidence for every rejection |
| Implementing fixes before Step 6 closes | Changes may conflict with auditor's final response | Wait for the full loop to close before writing code |
| Accepting everything without narrowing | Scope explosion — audit creates more work than the phase it audited | Apply "accept with narrowing" aggressively on broad findings |
| Skipping the lessons-learned entry | Audit insights get lost | Always log at least one LL entry per audit cycle |
| Sending batches sequentially to auditor | Auditor reviews are meant to be holistic | Deliver all batches together — they're split for size, not sequencing |
