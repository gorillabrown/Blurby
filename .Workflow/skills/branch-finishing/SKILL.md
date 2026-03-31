---
name: branch-finishing
description: "Use when a sprint or implementation is complete and work needs to be integrated. Trigger: all tasks done, tests pass, ready to merge or deliver."
---

# Branch Finishing Skill

Branch finishing is the final step before integrating work. It ensures work is truly complete, tests are passing, and the decision to merge or hold is made explicitly.

Use this skill when all execution tasks are done and you're ready to finalize.

---

## Phase 1: Full Test Suite Verification

**What to do:**
1. Run the full test suite (same suite you established as baseline)
2. Verify all tests pass
3. Capture the output

**Commands:**
```
[PROJECT_TEST_FULL_COMMAND]
  Example: pytest --runslow -q

Expected output: [N] passed, 0 failed
```

**Hard gate:** If ANY test fails, you are NOT ready to finish. Return to execution (debugging skill) or escalate.

---

## Phase 2: Calibration Verification (if applicable)

**What to do:**
If your project has calibration targets:
1. Run calibration with your changes
2. Verify all targets are within acceptable range
3. Capture the output

**Commands:**
```
[PROJECT_CALIBRATION_COMMAND]
  Example: pytest --runslow -q (for calibration)

Expected output: [Metrics table]
  - All targets PASS, or
  - Acceptable WARN (if pre-approved by user)
```

**Hard gate:** If calibration targets are not met and not pre-approved, you are NOT ready to finish. Escalate to user or return to execution (tuning/debugging).

---

## Phase 3: Documentation Updates

**What to do:**
1. Update ALL documentation layers:
   - Docstrings (function-level docs)
   - Code comments (inline explanations)
   - Project state docs (CLAUDE.md or equivalent)
   - Roadmap (mark tasks/phases complete)
   - Lessons learned (add entries if you discovered anything)
   - Architecture docs (if architecture changed)
   - README or getting started guide (if applicable)
2. Verify no stale references to old behavior
3. Search for TODOs or FIXMEs in new code — address them or convert to future tasks

**Verification:**
```
grep -r "TODO\|FIXME" [NEW_FILES]
  Expected: No results (or results are intentional, marked for future work)

grep -r "[OLD_BEHAVIOR]" *.md
  Expected: No stale references to behavior you changed
```

**Hard gate:** Documentation must reflect the new state. Out-of-date docs are worse than no docs.

---

## Phase 4: Commit

**What to do:**
1. Stage specific files (not `git add -A` or `git add .`)
2. Write a clear, descriptive commit message
3. Commit to your feature branch

**Commands:**
```
git status
  Review: which files changed?

git add [SPECIFIC_FILES]
  Example: git add engine.py constants.toml test_damage_realism.py

git status
  Verify: only the right files are staged

git commit -m "[DESCRIPTIVE_MESSAGE]"
  Format: [Type]: [Summary]
  Examples:
    "feat: Add damage variance subsystem with configurable bounds"
    "fix: Correct fatigue multiplier application order"
    "docs: Update calibration baseline and phase status"
```

**Message guidelines:**
- Type: feat (feature), fix (bug fix), docs (documentation), refactor (code cleanup), test (tests)
- Summary: 50 characters, imperative mood ("Add", not "Added"), no period
- Body (optional): Explain WHY, not WHAT (the diff shows what)

**Hard gate:** Commit only specific files. Never `git add .` (can accidentally include unwanted changes).

---

## Phase 5: Present Options to User

**What to do:**
Present the user with the completion state and merge options. Let them decide:

```
===== BRANCH FINISHING REPORT =====

Branch: [BRANCH_NAME]
Commits: [N] new commits
Changes:
  - [File1]: [X] lines added/modified
  - [File2]: [Y] lines added/modified
  ...

Status:
  ✓ All tests pass ([N] passed, 0 failed)
  ✓ Calibration targets met (if applicable)
  ✓ Documentation updated
  ✓ Commit ready

Ready for one of the following:

1. MERGE TO MAIN
   Status: All criteria met, tests pass, ready for production
   Action: Merge to main with --no-ff flag (preserves branch history)
   Effect: Code becomes part of the main branch

2. OPEN PULL REQUEST
   Status: Code is ready, but wants additional human review before merge
   Action: Create PR for review and approval
   Effect: Allows peer review before integration

3. KEEP BRANCH OPEN
   Status: Code is ready, but user wants to hold before merging
   Action: Branch remains open, work is saved
   Effect: Can merge later when user is ready

4. DISCARD
   Status: Code is wrong or user has changed plans
   Action: Delete branch (work is lost)
   Effect: Branch is cleaned up, main remains unchanged

Which option?
```

---

## Phase 6: Execute User's Choice

### Option 1: Merge to Main

**What to do:**
1. Switch to main
2. Verify main is up to date
3. Merge feature branch using --no-ff (preserves branch history)
4. Push to remote
5. Delete feature branch (local and remote)

**Commands:**
```
git checkout main
git pull origin main

git merge --no-ff [BRANCH_NAME] -m "Merge: [Description]"
  Example: "Merge: Damage variance subsystem (CAL-029)"

git push origin main
git branch -d [BRANCH_NAME]
git push origin --delete [BRANCH_NAME]
```

**Hard gate:**
- Main must pass all tests after merge
- If merge conflicts occur, STOP and resolve (don't force merge)
- Verify push succeeded (check GitHub/GitLab for updated main)

**Output:**
```
✓ Feature branch merged to main
✓ Remote main updated
✓ Local and remote branch deleted
✓ Main is now [N] commits ahead of initial state
Ready for next work
```

### Option 2: Open Pull Request

**What to do:**
1. Push feature branch to remote (if not already pushed)
2. Create PR with:
   - Title: [TASK_TITLE]
   - Description: (copy from code-review-requesting skill output)
   - Assign reviewer(s)
3. Wait for review

**Commands:**
```
git push origin [BRANCH_NAME]

Blurby uses local merge — no PRs. Merge to main locally:
  git checkout main && git merge --no-ff sprint/<N>-<name>
  git branch -d sprint/<N>-<name>
  Then push to GitHub: git push origin main
```

**Output:**
```
✓ Pull request created: #[PR_NUMBER]
✓ Awaiting reviewer approval
✓ Branch remains open until PR is merged or closed
```

### Option 3: Keep Branch Open

**What to do:**
1. Verify branch is pushed to remote
2. Document the branch status for future reference

**Commands:**
```
git push origin [BRANCH_NAME]
```

**Output:**
```
✓ Branch pushed to remote
✓ Code is saved and accessible
✓ Ready to merge when user gives approval
```

### Option 4: Discard

**What to do:**
1. Delete feature branch (local and remote)
2. Confirm this with user (destructive action)

**Commands:**
```
git checkout main
git branch -d [BRANCH_NAME]
git push origin --delete [BRANCH_NAME]
```

**Output:**
```
✓ Feature branch deleted
✓ Work is lost (cannot be recovered)
✓ Main remains unchanged
```

---

## Phase 7: Post-Action Documentation

**What to do:**
Document the outcome:
- If merged: Update project state docs to reflect integration
- If PR opened: Record PR number and status
- If kept open: Record branch name and expected merge timeline
- If discarded: Record reason (for lessons learned)

**Example:**
```
## Session 79 Completion

Feature: Damage Variance Subsystem
Branch: feature/damage-variance-v5

Outcome: MERGED to main
  - Commit: [HASH]
  - Merged: [TIMESTAMP]
  - Tests: 1,034 passed, 0 failed
  - Calibration: 6/6 PASS

Changes:
  - engine.py: +47 lines, -3 lines
  - constants.toml: +3 lines
  - test_damage_realism.py: +78 lines (NEW)

Next: Phase 5.10 (4-Gate Defensive Response)
```

---

## Failure Mode: Tests Fail

**If tests fail during Phase 1:**

1. Do NOT merge
2. Return to execution (debugging skill)
3. Commit WIP to feature branch with message "WIP: [issue]"
4. Push branch to remote
5. Report status to user:
   ```
   Branch: [BRANCH_NAME]
   Status: Tests failing ([N] failures)
   Issue: [Test failure description]
   Action: Debugging in progress
   Expected: Resume once issue is identified
   ```
6. Resolve the issue and return to Phase 1

**Hard gate:** Never merge with failing tests.

---

## Failure Mode: Calibration Out of Bounds

**If calibration targets are not met:**

1. Evaluate:
   - Was this expected (did user pre-approve)?
   - Is the drift acceptable (within noise)?
   - Is this a blocking issue?
2. If expected and acceptable: Proceed to Phase 3
3. If unexpected or blocking:
   - Do NOT merge
   - Return to execution (calibration tuning)
   - Commit WIP to feature branch
   - Push branch and report status

**Example:**
```
Branch: feature/damage-variance-v5
Calibration Status: 5/6 PASS, 1 WARN
  Sub rate: 19.8% (target 20–25%) — expected, within noise margin

Decision: Acceptable, proceeding to merge
```

---

## Red Flags (Signs You're Not Ready to Finish)

- Tests are failing (for any reason)
- Documentation is stale or incomplete
- Commit message is vague ("fix stuff")
- You're unsure if calibration is acceptable — ask user
- There are unresolved TODOs in new code
- Pre-existing tests that passed now fail

---

## Rationalization Table

| Rationalization | Reality |
|---|---|
| "Tests are failing but it's probably fine" | No. Tests are failing. Fix them or don't merge. |
| "I'll update docs after the code review" | Update them now. Stale docs mislead. |
| "I'll merge and fix the issues later" | No. Merge only when work is complete. |
| "This commit message is descriptive enough" | Be more specific. "Fixed issues" tells reviewers nothing. |
| "Calibration is close, I'll tune it in the next sprint" | No. Tune now or escalate. Don't merge out-of-spec code. |

---

## Notes

- **No exceptions:** If tests fail, calibration is out of bounds, or docs are stale, you are NOT ready to merge.
- **User decision:** You present options and evidence. User decides which option to take.
- **Merge is irreversible:** Once merged to main, reverting requires a new commit. Get it right.
- **Documentation is proof:** When you update docs, future developers have evidence of the state change.
