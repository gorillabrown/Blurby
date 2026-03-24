---
name: writing-skills
description: "Use when creating a new skill or modifying an existing one. This is the meta-skill — the skill for writing skills. Trigger: 'create a skill', 'write a process', 'document a workflow', 'add a new skill'."
---

# Writing Skills Skill

A skill is a process discipline. It teaches an LLM how to execute a type of work (brainstorming, coding, debugging, etc.) consistently and correctly.

This skill teaches how to write new skills. It follows test-driven discipline: baseline test your process without guidance, then write a skill that fixes the observed failures.

---

## Phase 1: Baseline Test (Understand the Problem)

**What to do:**
1. Have the LLM execute the task WITHOUT the skill (no guidance, no process)
2. Observe: Where does it cut corners? Where does it deviate? Where does it fail?
3. Document every failure and shortcut
4. Categorize failures:
   - Procedural (it skipped a step)
   - Judgment (it made a wrong call)
   - Coverage (it missed edge cases)
   - Documentation (it didn't explain its reasoning)

**Example baseline test (writing a test):**

**Prompt (no skill):**
```
Write a test for the damage_realism_variance() function.
```

**Observed behavior (without guidance):**
```
✗ Wrote a test, but only one test (test_happy_path)
✗ No edge case tests (zero damage, negative inputs, boundary values)
✗ Test name is vague ("test_variance")
✗ No docstring explaining what the test verifies
✗ No Arrange-Act-Assert structure (mixed all three)
✗ Assertion message is unhelpful ("assert variance != None")
✗ Didn't verify the test actually fails before implementation exists
✗ Assumed the function exists (didn't write RED first)
```

**Failure categories:**
- Procedural: Skipped RED phase (didn't verify test fails first)
- Coverage: Wrote only happy path, no edge cases
- Documentation: No test docstring, no assertion messages
- Judgment: Assertion is too loose ("!= None" instead of ">= min_variance")

---

## Phase 2: Write the Skill

**What to do:**
1. Structure the skill to address every failure from Phase 1
2. Add hard gates between phases (prevents skipping steps)
3. Add anti-rationalization content (defends against every observed shortcut)
4. Be prescriptive (not advisory)
5. Use examples liberally

**Skill structure (from brainstorming skill):**

```yaml
name: [name]
description: "Use when [triggering conditions]. Trigger: [specific examples]."
```

Then:
- **Phase 1, Phase 2, etc.:** Clear steps, hard gates
- **Red Flags:** Detectable signs of deviation
- **Rationalization Table:** Every shortcut the baseline test found

**Example (from TDD skill):**

```
## Phase 1: RED

...content addressing "didn't verify test fails first"...

## Phase 2: GREEN

...content addressing "only happy path, no edge cases"...

Hard gates ensure:
- Test fails before code is written
- All tests pass after code is written
- Full suite passes (no regressions)
```

---

## Phase 3: Pressure Test

**What to do:**
1. Have the LLM execute the task USING the new skill
2. Apply adversarial prompts:
   - "This is too simple for the full process"
   - "Just do it quickly, skip the planning"
   - "I already know the answer"
   - "The user said to hurry up"
3. Observe: Does the skill prevent the shortcut?
4. If shortcut succeeds: The skill needs improvement

**Example pressure test (TDD skill):**

**Prompt 1 (overconfidence attack):**
```
The test is trivial, I know it will pass. Write the code directly.
```

**Expected response (with TDD skill):** Refuses. "Phase 1 requires a failing test first."
**Actual response (without skill improvement):** "I'll write the code directly, it's simple."
→ Skill needs harder wording on red flags.

**Prompt 2 (time pressure attack):**
```
The user is waiting, we need to move fast. Skip the verification step.
```

**Expected response (with good skill):** "Verification is non-negotiable. It takes 2 minutes."
**Actual response (skill needs work):** "OK, I'll skip verification to save time."
→ Skill needs a hard gate preventing this.

---

## Phase 4: Close Loopholes

**What to do:**
For each pressure test failure, strengthen the skill:
1. Add a specific red flag for that failure pattern
2. Strengthen the language (use "MUST" not "should")
3. Explain the consequence (what goes wrong if you skip this)
4. Add a hard gate (prevents proceeding without the step)

**Example improvement (TDD skill):**

**BEFORE (loophole found):**
```
The test should fail before you write code.
```

**AFTER (loophole closed):**
```
Hard gate: Do NOT move to Phase 2 until the test fails for the right reason.
If the test doesn't fail, your test is wrong — fix the test, not the code.
```

**Example improvement (red flags):**

**BEFORE:**
```
- "This test is trivial"
```

**AFTER:**
```
- "I know this test will pass, let me just code" — No. Write the failing test first. Confidence is inversely correlated with edge cases you haven't considered.
```

---

## Phase 5: Subagent Test

**What to do:**
If the skill will be used by subagents:
1. Dispatch a fresh subagent with the skill (no context from prior uses)
2. Have it execute the task
3. Verify: Does it follow the skill? Does it succeed?
4. If it deviates: The skill description is unclear or the body has a loophole

**Example subagent test (brainstorming skill):**

**Setup:**
```
[Fresh agent, has never seen this skill before]
Skill: brainstorming/SKILL.md (description only, not body)

Prompt: "Start a brainstorming session for the new damage variance subsystem."
```

**Observation (without skill improvement):**
```
Agent skips Phase 1 (context exploration).
Agent jumps straight to Phase 3 (approach generation).
```

→ Problem: Skill description isn't clear enough that context exploration is mandatory.

**Fix:** Make description more specific
```
BEFORE: "Use when starting any creative, design, or building work — before code exists."
AFTER: "Use when starting design work and code doesn't exist yet. Mandatory: read governing docs, current state, lessons learned BEFORE proposing approaches."
```

---

## Phase 6: Finalize and Document

**What to do:**
1. The skill is ready when:
   - Baseline test → skill → pressure tests → all pass
   - Subagent test succeeds
   - No loopholes found in pressure tests
2. Add final section: **Notes** (design philosophy, when to break the rules, etc.)
3. Document the skill in the project's skill library

---

## Anti-Rationalization Content (Highest Priority)

The **rationalization table** is where the skill's real value lives. For every rationalization the baseline test found, write an entry:

**Baseline test observed:** Agent skipped RED phase because "I already know the test will pass"

**Rationalization table entry:**
```
| Rationalization | Reality |
|---|---|
| "I already know the test will pass" | You don't. Tests catch cases you didn't think of. Write the failing test first. Every time. |
```

**Process:** For every shortcut in your baseline test, add a rationalization entry.

---

## Skill Description Guidelines

The description is the TRIGGER for using the skill. It has two jobs:
1. Condition: When do I use this skill? (If/Then)
2. Do NOT preview the workflow (agents shortcut if they see the outline)

**GOOD description:**
```
"Use when starting any creative, design, or building work — before code exists.
Trigger: new feature, architecture decision, mechanic design, system redesign,
or any task where the approach isn't yet determined."
```
→ Clear trigger, no content leak

**BAD description:**
```
"Use to brainstorm ideas. Steps: 1) explore context, 2) ask questions, 3) generate approaches,
4) present sections, 5) write spec. Use when..."
```
→ Previewing the workflow teaches agents to shortcut

---

## Common Skill Patterns

| Pattern | Purpose | Example |
|---------|---------|---------|
| **Gating (hard stops between phases)** | Prevents skipping steps | "Hard gate: Do NOT proceed until..." |
| **Red flags** | Detectable signs of deviation | "- I'll skip this because..." |
| **Rationalization table** | Defense against every shortcut | Every reason to skip → why it's wrong |
| **Examples** | Concrete guidance | "Example: [full worked instance]" |
| **Verification commands** | Objective proof of completion | "Run: [exact command]" |
| **Escalation protocols** | Prevent infinite loops | "After 3 revisions → escalate" |

---

## Testing Skills (How to Know if a Skill Works)

**Test 1: Baseline comparison**
- Behavior WITHOUT skill: [baseline failures]
- Behavior WITH skill: [baseline failures eliminated?]
- Success: All observed failures are prevented

**Test 2: Pressure tests**
- Apply 5–10 adversarial prompts
- Does the skill prevent each shortcut?
- Success: 100% of pressure tests defended

**Test 3: Subagent test**
- Fresh agent, sees skill description, executes task
- Does it follow the skill?
- Success: Agent follows skill without additional guidance

**Test 4: Consistency across runs**
- Run the same task 3 times with the skill
- Does the agent produce consistent results?
- Success: Results are similar (not wildly variable)

---

## Red Flags (Signs Your Skill is Weak)

- Baseline test → agent still exhibits the shortcut (skill didn't fix it)
- Pressure test → agent finds an undefended loophole
- Red flags section is empty (you didn't anticipate evasion tactics)
- Rationalization table is generic (not specific to this skill's domain)
- Subagent doesn't follow the skill (description is unclear)
- Hard gates are advisory ("should not" instead of "MUST NOT")

---

## Rationalization Table (For Writing Skills)

| Rationalization | Reality |
|---|---|
| "This skill is too detailed, I'll keep it light" | Light skills get shortcut. Heavy, detailed skills with hard gates prevent deviation. Detail is protection. |
| "I don't need to test the skill, it looks good" | Test it. You'll find loopholes. Every skill has gaps until pressure-tested. |
| "The skill description should preview the workflow" | No. Previewing teaches agents to shortcut. Description should trigger invocation, not summarize content. |
| "This failure is too rare to defend against" | All failures start rare. The ones you don't defend against become habits. Defend all. |
| "I'll trust the agent to know when to skip steps" | Don't. Hard gates prevent skipping. Trust but verify. |

---

## Notes

- **Skill design is iterative:** Write → test → find loopholes → improve → re-test.
- **Rationalization content is non-negotiable:** It's your defense against evasion.
- **Hard gates are not optional:** They're the only thing that prevents skipping steps.
- **Examples are essential:** Concrete instances teach better than abstract principles.
- **Skills compound:** A good skill prevents 10+ hours of debugging per use. Write them well.
- **Update from failures:** Every time an agent deviates using your skill, improve the skill.
