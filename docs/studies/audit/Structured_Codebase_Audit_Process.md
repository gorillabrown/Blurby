# Structured Codebase Audit Process (4-Step Review)

A repeatable process for conducting rigorous technical audits of any codebase, roadmap, or system architecture. The auditor alternates with the codebase creation team across 4 steps.

---

## Roles

- **Auditor** (Steps 1 & 3): Principal systems architect, simulation engine reviewer, and technical program auditor. Operates with high skepticism, evidence-based findings, and structured scoring.
- **Codebase Team** (Steps 2 & 4): The team that built the system under review. Responds to findings, provides context, and incorporates feedback.

---

## Step 1 — Auditor: Initial Review

**Persona:** Assume the role of a principal systems architect and technical program auditor. Adopt the tone of a seasoned reviewer performing a thorough audit — fair, direct, evidence-grounded, and skeptical of aspirational claims unless backed by code.

**Primary Question:** "Given the current codebase and supporting documentation, is [the roadmap/plan] the right plan, in the right order, for the right reasons?"

### Review Mandate

- Every finding must cite specific file, line number, or document section as evidence.
- Evaluate what the codebase *does*, not what the documentation *says* it does. Where they diverge, flag it.
- Rank findings from critical to nit-level using severity tiers: CRITICAL, MAJOR, MODERATE, MINOR, NIT.
- Use the provided documentation as context, but validate claims independently by reading code.

### 10 Review Dimensions

1. Roadmap sequencing — are dependencies ordered correctly?
2. Benchmark alignment — does the plan address measured failures?
3. Technical debt triage — what must be fixed before new features?
4. Documentation-code drift — where do specs diverge from implementation?
5. Calibration integrity — will the plan embed known bugs into tuned constants?
6. Architectural fitness — can the current architecture support the planned evolution?
7. Test coverage adequacy — are critical paths tested?
8. Risk surface — what could go wrong, and is it mitigated?
9. Scope estimation — are sprint scopes realistic given measured complexity?
10. First-principles alignment — does the plan serve the project's stated principles?

### Required Output Sections (A–K)

- **(A) Audit Metadata** — date, scope, reviewer role, materials reviewed
- **(B) Executive Summary** — 3–5 sentence verdict
- **(C) Materials Reviewed** — complete inventory of files, databases, documentation
- **(D) Benchmark & Calibration Status** — current measurement state
- **(E) Critical Findings** — severity CRITICAL, must-fix before proceeding
- **(F) Major Findings** — severity MAJOR, should fix in current cycle
- **(G) Moderate Findings** — severity MODERATE, address in next planning cycle
- **(H) Minor Findings & Nits** — low severity, improve when convenient
- **(I) Documentation-Code Drift Register** — specific divergences
- **(J) Recommended Sequencing Changes** — proposed reordering with rationale
- **(K) Scoring Rubric** — 8 dimensions scored 1–10 with justification

**Supplemental sections** may be added (e.g., Section L for deep-dive module-specific audits, cognitive model reviews, subsystem analyses, etc.) when focused analysis of specific subsystems is requested.

### Scoring Rubric Dimensions

1. Roadmap sequencing correctness (1–10)
2. Benchmark alignment (1–10)
3. Technical debt awareness (1–10)
4. Documentation quality (1–10)
5. Architectural fitness (1–10)
6. Test coverage (1–10)
7. Delivery practicality (1–10)
8. Overall confidence (1–10)

---

## Step 2 — Codebase Team: Response to Findings

The codebase creation team responds to each finding from Step 1:

- Accept, reject, or partially accept each finding with rationale.
- Provide additional context the auditor may have lacked.
- Propose remediation plans for accepted findings.
- Flag any findings where the auditor may have misread the code or intent.

---

## Step 3 — Auditor: Response to Team's Responses

The auditor reviews the team's responses:

- Evaluate whether rejections are well-reasoned or defensive.
- Assess whether proposed remediations actually address the root cause.
- Escalate, maintain, or downgrade finding severity based on new information.
- Identify any new risks surfaced by the team's responses.
- Provide a revised scoring rubric if warranted.

---

## Step 4 — Codebase Team: Incorporation and Closure

The team incorporates accepted feedback:

- Document which findings were addressed and how.
- Update roadmap/plan based on accepted sequencing changes.
- Close findings with evidence of resolution (code changes, test results, etc.).
- Flag any findings deferred to future work with justification.

---

## Process Notes

- The audit deliverable is a markdown file.
- All findings use an ID convention (e.g., ACT-01, KD-01, CEM-01) for cross-referencing across steps.
- The process is designed to be adversarial-but-constructive: the auditor's job is to find problems, not to validate the plan.
- Supplemental deep-dive sections can be requested at any point during Step 1 to drill into specific modules, decision models, or subsystems.
- After all 4 steps are complete, the final deliverable should consolidate all findings with their final dispositions (accepted, rejected, deferred).
