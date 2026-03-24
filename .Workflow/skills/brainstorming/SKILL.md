---
name: brainstorming
description: "Use when starting any creative, design, or building work — before code exists. Trigger: new feature, architecture decision, mechanic design, system redesign, or any task where the approach isn't yet determined."
---

# Brainstorming Skill

The brainstorming skill is the FIRST step of planning work. It happens BEFORE any code is written, BEFORE any execution plan is drafted. Its output is a design specification that the planning skill will consume.

## Phase 1: Context Exploration

**What to do:**
1. Read all governing documents relevant to the new work:
   - Project constitution (if it exists)
   - Current CLAUDE.md or project state doc
   - LESSONS_LEARNED or similar accumulated wisdom
   - Roadmap and completed work (understand what already exists)
   - Any technical authority or architecture docs
2. Understand what currently exists in the codebase:
   - What subsystems are relevant to the new work?
   - What constants or patterns already govern similar behavior?
   - What has been tried before and why?
3. Identify constraints:
   - Performance requirements
   - Data structures already locked in place
   - Agreed-upon architectural principles
   - Dependencies on other systems

**Hard gate:** Do NOT proceed to Phase 2 until you can answer: "What does the current system do, and what gap or problem does this new work address?"

---

## Phase 2: Clarifying Questions

**What to do:**
1. Ask ONE question at a time
2. Prefer multiple-choice when possible (narrows the design space)
3. Wait for an explicit answer before asking the next question
4. Build context incrementally

**Anti-pattern:** Dumping 5 questions at once. The user will answer only the first one, and you've wasted the user's time on the rest.

**Example of GOOD:**
- "Are you trying to fix a bug in the existing system, add a new feature, or redesign a subsystem?"

**Example of BAD:**
- "What is the problem? What's the solution space? How does it interact with X, Y, and Z? What are the performance targets? When do you need this?"

**Hard gate:** Each question must get a clear answer before the next question is asked.

---

## Phase 3: Approach Generation

**What to do:**
1. Propose 2–3 concrete approaches
2. For each approach, explain:
   - How it works
   - What it buys you (what problem it solves)
   - What it costs (complexity, performance, maintainability)
   - What assumptions it makes
   - What risks it carries
3. Include a recommendation (which approach you believe is best and why)
4. Be explicit about trade-offs — do NOT hide downsides

**Anti-pattern:** Presenting a single approach as obvious truth. This prevents the user from discovering blind spots.

**Hard gate:** Do NOT move to Phase 4 until the user has selected an approach or explicitly asked for more options.

---

## Phase 4: Sectioned Presentation

**What to do:**
1. Break the design into digestible sections (4–8 sections typical)
2. Present ONE section at a time
3. Explain what that section does, how it fits into the whole, and what decisions it makes
4. Ask for approval per section before proceeding
5. If the user disagrees with a section, explore alternatives for that section only — do NOT re-propose the entire design

**Why this matters:** A 50-page spec presented all at once leads to misalignment. Sectioned review catches problems early, when they're cheap to fix.

**Example structure for a new engine subsystem:**
- Section 1: Data model (what entities, what fields, what relationships)
- Section 2: Core algorithm (step-by-step logic)
- Section 3: Integration points (where does this hook into existing systems)
- Section 4: Constants and tuning (what parameters control behavior)
- Section 5: Edge cases and error handling
- Section 6: Testing strategy (how will we verify correctness)

**Hard gate:** Do NOT write the formal spec until every section has been reviewed and approved.

---

## Phase 5: Spec Writing

**What to do:**
1. Write the formal specification document
2. Structure:
   - Executive summary (1 paragraph, what and why)
   - Problem statement (what is broken or missing)
   - Design overview (the approved approach from Phase 3)
   - Detailed design (per-section specifications that were approved in Phase 4)
   - Constants and tuning (all parameters that control behavior)
   - Integration points (exactly where this hooks into existing code)
   - Acceptance criteria (how we will verify this is correct)
   - Test plan (what tests must pass, what edge cases must be covered)
3. Reference governing docs, do NOT duplicate them
   - Use phrases like "per [GOVERNING_DOC] §3.2" instead of copying text
4. Include `[CUSTOMIZE]` markers for any project-specific content placeholders

**Hard gate:** The spec must be self-contained enough that someone else can implement it without asking for clarification.

---

## Phase 6: Spec Review Loop

**What to do:**
1. Submit the spec to the user for review
2. Wait for feedback
3. Incorporate feedback and revise
4. Re-submit
5. Repeat until the user approves

**Limit:** Max 3 revision cycles. If you're past 3 revisions and still getting major feedback, STOP and ask: "Are we trying to solve the right problem, or should we go back and revisit the fundamental approach?"

**Hard gate:** Do NOT move to planning phase until the spec is explicitly approved.

---

## Red Flags (Signs You're About to Deviate)

- "This is straightforward, no design needed" — Every 'straightforward' change that skipped design has caused regressions
- "I'll design as I go" — Designing during implementation means discovering problems after building the wrong thing
- "The user wants speed, not process" — Users want correct outcomes. Process prevents rework.
- "I already know the best approach" — Present it as option A with a recommendation. Alternatives reveal blind spots.
- "This is too similar to existing work to need a design" — Similarity is exactly where subtle misunderstandings happen
- "I don't have time to read the governing docs" — Reading is faster than implementing the wrong thing
- "The user said what they want, I can start coding" — "What they want" is not the same as "how to build it"

---

## Rationalization Table

| Rationalization | Reality |
|---|---|
| "This is straightforward, no design needed" | Every 'straightforward' change that skipped design has caused regressions. Your confidence is inversely correlated with hidden complexity. |
| "I'll design as I go" | Designing during implementation means you discover problems after you've already built the wrong thing. Rework costs 5–10x more than getting it right. |
| "The user wants speed, not process" | Users want correct outcomes fast. Process prevents rework, which is slower. You can't be fast if you have to rewrite. |
| "I already know the best approach" | Present it as option A with a recommendation. The alternatives often reveal blind spots. You've missed something. |
| "The governing docs don't apply to this" | They apply. You haven't read them carefully enough. Read again. |
| "I'll skip the sectioned review and present the full spec at the end" | Late-stage discovery means rework on the whole design. Sectioned review catches problems when they're small. |
| "Updating the spec based on feedback is slow" | Not updating based on feedback is slower — you'll implement the wrong thing and have to throw it away. |

---

## Notes

- **Govern yourself:** The brainstorming skill is YOUR discipline. You follow it even when the user is impatient. It's called brainstorming because the OUTPUT is design clarity, not because the PROCESS is quick.
- **Escalate when stuck:** If you reach Phase 6 and can't get clarity after 3 revisions, escalate to the user with a summary of what you can't resolve.
- **Document as you go:** Take notes during Phases 1–3. Capture the key decisions and assumptions. This becomes the spec's raw material.
