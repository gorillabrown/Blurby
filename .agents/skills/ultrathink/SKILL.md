---
name: ultrathink
description: >
  Deep-reasoning protocol that overrides default brevity and forces exhaustive, multi-dimensional
  analysis. Use this skill whenever the user says "ULTRATHINK", "ultrathink", "think deeply",
  "think harder", "maximum depth", "don't simplify", or when a problem requires reasoning
  beyond surface-level logic. This skill suspends conciseness preferences and requires the
  agent to reason until the logic is irrefutable — not just plausible. Trigger on: "ULTRATHINK",
  "ultrathink", "deep think", "think step by step", "analyze this thoroughly", "don't be brief",
  or any signal that the user wants exhaustive reasoning over efficient output.
---

# ULTRATHINK Protocol

You have been asked to engage in deep, exhaustive reasoning. This protocol overrides normal
output conventions and requires maximum analytical depth.

**Announce at start:** "ULTRATHINK engaged — suspending brevity, maximizing depth."

---

## Required Settings

ULTRATHINK requires the highest-capability configuration. When this protocol is active:

| Setting | Required Value | Why |
|---------|---------------|-----|
| **Model** | **Opus** | Deep reasoning requires the strongest model. Sonnet and Haiku lack the reasoning depth for irrefutable multi-dimensional analysis. |
| **Effort** | **Max** | Full extended thinking budget. ULTRATHINK exists to use the reasoning capacity that Max unlocks — running it at Medium defeats the purpose. |

**If dispatching to CLI:** Any task tagged ULTRATHINK in a sprint spec must be assigned to
an opus-tier agent with `{max}` effort override. CLI must run `/effort-levels max` before
dispatching the task. Example:
```
□ 3. athena: Analyze architecture tradeoffs for cache redesign [opus] {max}  ← ULTRATHINK

CLI execution:
  /effort-levels max             ← set before ULTRATHINK task
  dispatch task #3               ← runs at max effort on opus
  /effort-levels [default]       ← revert after task completes
```

**If in Cowork conversation:** Switch to Opus 4.6 with Max effort before engaging. If
currently on a lower model or effort, prompt the user: "ULTRATHINK requires Opus + Max
effort. Please switch before I proceed."

---

## Behavioral Overrides

When ULTRATHINK is active, the following rules are in effect:

### 1. Suspend Brevity

Immediately override any "Zero Fluff," "be concise," or brevity-first rules from AGENTS.md,
session bootstrap, or standing instructions. You must not optimize for shortness at the
expense of quality. Length is not a goal — depth is. But when depth requires length, length
is permitted without apology.

This does NOT mean pad with filler. Every sentence must carry analytical weight. The override
is against premature compression — cutting analysis short because "the user probably gets it."
Under ULTRATHINK, do not assume the user gets it. Show the full chain.

### 2. Maximum Reasoning Depth

Engage in exhaustive, step-by-step reasoning. If a conclusion feels obvious or the logic
feels easy, that is the signal to dig deeper — not to stop. Easy logic is usually
incomplete logic.

**Depth test:** For every conclusion you reach, ask:
- What assumption am I making?
- What would make this wrong?
- Is there a second-order effect I'm ignoring?
- Would someone with deep domain expertise challenge this?

If any answer is "yes" or "maybe," continue reasoning. Stop only when the logic is
irrefutable or you've explicitly identified the remaining uncertainty and bounded it.

### 3. Multi-Dimensional Analysis

Analyze the request through every relevant lens. Not all lenses apply to every problem —
select the ones that do, but err on the side of including more rather than fewer.

**Analysis dimensions (select all that apply):**

| Dimension | What to Examine |
|-----------|----------------|
| **Technical** | Implementation complexity, performance costs (rendering, compute, memory), state management, error surfaces, edge cases |
| **Architectural** | Coupling, cohesion, modularity, extensibility, migration paths, dependency chains, blast radius of changes |
| **Psychological** | User cognitive load, decision fatigue, information density, mental model alignment, surprise factor |
| **Scalability** | Long-term maintenance burden, team-size sensitivity, documentation debt, onboarding cost, what happens at 10× current scale |
| **Economic** | Token cost, compute cost, time cost, opportunity cost, cost of being wrong vs. cost of being slow |
| **Temporal** | Short-term vs. long-term tradeoffs, reversibility, lock-in effects, what this decision looks like in 6 months |
| **Risk** | Failure modes, blast radius, recovery cost, probability × impact, what you're implicitly betting on |
| **Systemic** | How this interacts with other parts of the system, second-order effects, feedback loops, emergent behavior |
| **Epistemological** | What do we actually know vs. assume? Where is the evidence thin? What would change our mind? |

For each dimension you analyze, state the dimension explicitly so the user can track your
reasoning structure.

### 4. Tradeoff Mapping

Every non-trivial decision involves tradeoffs. Under ULTRATHINK, make them explicit:

```
Option A: [description]
  Gains: [what you get]
  Costs: [what you lose or risk]
  Assumption: [what must be true for this to work]

Option B: [description]
  Gains: ...
  Costs: ...
  Assumption: ...

Recommendation: [which option and why — grounded in the dimensional analysis above]
Confidence: [high / medium / low — and what would change it]
```

If there are more than two options, map all of them. If the tradeoffs are genuinely balanced,
say so — don't force a recommendation when the evidence doesn't support one.

### 5. Prohibition on Surface-Level Logic

The following patterns are prohibited under ULTRATHINK:

| Prohibited Pattern | Why It Fails | Do This Instead |
|-------------------|-------------|-----------------|
| "Obviously, X" | Nothing is obvious under deep analysis — this is a reasoning shortcut | Prove X from first principles |
| "It's best practice to..." | Best practices are context-dependent generalizations | Explain WHY this practice applies HERE, or whether it doesn't |
| "Simply do X" | "Simply" is a complexity-hiding word | Enumerate the steps, dependencies, and failure modes |
| "This should work" | Confidence without evidence | State what evidence supports the claim and what could falsify it |
| "In most cases..." | Vague probabilistic hedge | Specify which cases, what makes this case different or similar, and what the edge cases are |
| Stopping after the first valid answer | First valid ≠ best. There may be a better answer one level deeper | Generate at least two viable approaches before choosing |

---

## Execution Flow

When ULTRATHINK is triggered:

1. **Acknowledge the protocol.** State that ULTRATHINK is active and brevity is suspended.

2. **Frame the problem.** Restate the question or task in your own words to confirm
   understanding. Identify what type of problem this is (design decision, debugging,
   architecture, strategy, tradeoff evaluation, etc.).

3. **Identify relevant dimensions.** From the table above, select which lenses apply.
   State them explicitly.

4. **Analyze each dimension.** Work through each selected dimension in sequence. Show
   your reasoning chain — don't jump to conclusions.

5. **Map tradeoffs.** If the problem involves a decision, use the tradeoff template above.

6. **Synthesize.** Pull the dimensional analyses together into a coherent recommendation
   or conclusion. State your confidence level and what would change your mind.

7. **Identify remaining uncertainty.** What don't you know? What assumptions are you
   making? What would you investigate further if you had more time?

---

## Combining with Other Skills

ULTRATHINK is a reasoning modifier — it layers on top of whatever skill is already active.

- **ULTRATHINK + phase-closeout:** Deeper interpretation of findings, more thorough
  tradeoff analysis on dispositions, more rigorous spec retrospective.
- **ULTRATHINK + effort-levels:** Deeper analysis of task complexity, more careful
  effort-tier selection with explicit reasoning for borderline cases.
- **ULTRATHINK + 3rd-party-audit:** More thorough remediation plan, deeper disposition
  reasoning, more adversarial review of audit findings.
- **ULTRATHINK + dispatch authoring:** More thorough failure mode analysis, more
  explicit scope fencing, deeper agent-routing justification.

When combined with another skill, ULTRATHINK's behavioral overrides (suspend brevity,
maximum depth, multi-dimensional analysis) apply to every step of the other skill's
execution — not just the final output.

---

## Deactivation

ULTRATHINK remains active until:
- The user says "stop ultrathink," "normal mode," "be brief again," or similar
- The specific question or analysis is complete and the user moves to a new topic
- The user signals satisfaction with the analysis

When deactivating, revert to the normal brevity and conciseness preferences from the
project's standing rules.

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Do This Instead |
|-------------|---------------|-----------------|
| Using ULTRATHINK formatting but shallow reasoning | Length ≠ depth. Padding with headers and bullets while skimming the analysis | Every sentence must carry analytical weight. If you can delete it without losing insight, delete it |
| Analyzing irrelevant dimensions | Not every lens applies to every problem — analyzing "psychological impact" of a config file rename is waste | Select dimensions that genuinely matter for this specific problem |
| Reaching the same conclusion you would have without ULTRATHINK | If deep analysis produces the same answer as surface analysis, either the problem didn't need ULTRATHINK or you didn't actually go deeper | Check: did the analysis surface anything you wouldn't have considered otherwise? If not, push harder |
| Presenting analysis without a clear conclusion | Exhaustive reasoning that doesn't converge is just noise | Always synthesize into a recommendation with stated confidence |
| Using ULTRATHINK on trivial tasks | "Rename this variable" doesn't need multi-dimensional analysis | ULTRATHINK is for problems where being wrong is expensive or the solution space is genuinely complex |
