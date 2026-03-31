---
name: workspace-isolation
description: "Use when starting any implementation work — before touching code. Trigger: plan approved, about to write code, starting a sprint, beginning any modification."
---

# Workspace Isolation Skill

Workspace isolation prevents you from accidentally breaking the main branch or polluting your working environment with temporary changes. It ensures a clean, isolated space for work.

Use this skill BEFORE any execution begins.

---

## Phase 1: Verify Main is Clean

**What to do:**
1. Ensure main/trunk branch exists and is up to date
2. Confirm no uncommitted changes in main
3. Confirm no merges are in progress
4. Verify latest main passes all tests

**Commands:**
```
git status
  Expected: "On branch main" and "nothing to commit, working tree clean"

git log --oneline -1
  Expected: Recent commit, no "merge in progress" markers

git pull origin main
  Expected: "Already up to date" or quick fast-forward merge
```

**Hard gate:** If main has uncommitted changes, resolve them first. Do NOT create your workspace on a dirty main.

---

## Phase 2: Create Isolated Workspace

**What to do:**
Create a separate workspace (feature branch, worktree, or isolated directory) where you'll do your work. This keeps main clean.

**Option A: Feature Branch (Recommended)**
```
git checkout main
git pull origin main
git checkout -b [BRANCH_NAME]
  Example: git checkout -b feature/damage-variance-v5
  Example: git checkout -b stab1-wave-a
  Naming convention: sprint/<N>-<name> (e.g., sprint/25-rss-library, hotfix/7-stale-onended)
```

**Option B: Git Worktree (Advanced)**
```
git worktree add [PATH] -b [BRANCH_NAME]
  Example: git worktree add ./feature-branch -b feature/damage-variance-v5
```

**Option C: Separate Directory (Fallback)**
```
mkdir -p ./isolated_work
cd ./isolated_work
git clone [REPO_URL] .
git checkout -b [BRANCH_NAME]
```

**Hard gate:** You now have an isolated workspace. Main remains untouched. Do NOT make changes in main.

---

## Phase 3: Verify Safety

**What to do:**
1. Confirm your `.gitignore` covers secrets:
   - API keys
   - Credentials
   - Local config files
   - Temporary files
2. Confirm large files are excluded:
   - Model weights
   - Datasets
   - Binary caches
3. Confirm no untracked junk files:
   - `.DS_Store` (macOS)
   - `__pycache__` (Python)
   - `.vscode` (IDE config)
   - temp files

**Verification:**
```
git status
  Expected: Only project files listed, no secrets or large binaries

git check-ignore -v [SENSITIVE_FILE]
  Example: git check-ignore -v .env
  Expected: `.env` should be ignored

ls -la
  Expected: No large files, no obviously temporary files
```

**Hard gate:** If you see secrets or large files in git, fix `.gitignore` BEFORE proceeding.

---

## Phase 4: Install Dependencies

**What to do:**
1. Ensure the isolated workspace has all dependencies installed
2. Do NOT modify main's environment
3. Use a project-level environment if possible (venv, conda, pipenv)

**Example (Python):**
```
cd [ISOLATED_WORKSPACE]
python -m venv venv
source venv/bin/activate  (or `venv\Scripts\activate` on Windows)
pip install -e .  (or `pip install -r requirements.txt`)
```

**Example (Node.js):**
```
cd [ISOLATED_WORKSPACE]
npm install
```

**Example (Other):**
```
cd [ISOLATED_WORKSPACE]
npm install
```

**Verification:**
```
[PROJECT_DEPENDENCY_CHECK]
  Example (Python): python -c "import [key_module]; print('OK')"
  Expected: No import errors
```

**Hard gate:** All dependencies must be available in your workspace before you start coding.

---

## Phase 5: Establish Baseline

**What to do:**
1. Run the full test suite to establish a clean baseline
2. Record the baseline:
   - Test count
   - Pass count
   - Any skipped tests
   - Calibration state (if applicable)
3. This baseline is your safety net — you'll compare against it after changes

**Commands:**
```
[PROJECT_TEST_FULL_COMMAND]
  Example: pytest --runslow -q

Record output:
  Tests: [N] passed, [M] skipped, [K] failed
  Expected: 0 failed
  Calibration (if applicable): [metrics and targets]
```

**Hard gate:** The baseline must show everything passing. If tests fail at baseline, you have pre-existing issues to investigate.

---

## Phase 6: Document Your Workspace

**What to do:**
Create a file in your workspace that documents the baseline and setup:

```
# Workspace: [BRANCH_NAME]

## Setup
- Created: [DATE]
- Branch: [BRANCH_NAME]
- Based on main commit: [HASH of main when created]

## Baseline
- Tests: [N] passed, [M] skipped, 0 failed
- Calibration: [baseline targets, if applicable]

## Changes to Track
- [Task 1: ...]
- [Task 2: ...]

## Verification Checklist
Before merge:
- [ ] All new tests pass
- [ ] All pre-existing tests pass
- [ ] Calibration targets met (if applicable)
- [ ] No unexpected regressions
- [ ] Documentation updated
- [ ] Branch ready for merge
```

This file is for reference only (don't commit it unless you want to).

---

## Common Isolation Mistakes

**Mistake 1: Working directly on main**

```
You: "I'll just make changes directly on main"
Result: You accidentally commit to main, breaking for others
Prevention: Always create a feature branch first
```

**Mistake 2: Not recording the baseline**

```
You: "I'll just start coding and test later"
Result: Tests fail later, you don't know if YOUR changes caused it or if it was pre-existing
Prevention: Record baseline before starting
```

**Mistake 3: Forgetting to install dependencies**

```
You: "The code should work, I'll test it later"
Result: Tests fail with import errors because deps aren't installed
Prevention: Install deps immediately after creating workspace
```

**Mistake 4: Modifying .gitignore to hide work**

```
You: "I'll add .env to .gitignore so I can test locally"
Result: You accidentally commit secrets, or .gitignore changes pollute main
Prevention: Never modify .gitignore to hide work. Use local overrides instead.
```

---

## Workspace Cleanup

After work is complete (merged or abandoned):

```
git checkout main
git pull origin main
git branch -d [BRANCH_NAME]  (delete local)
git push origin --delete [BRANCH_NAME]  (delete remote)

If using worktree:
git worktree remove [PATH]

If using separate directory:
rm -rf [ISOLATED_WORKSPACE]
```

---

## Red Flags (Signs Your Isolation Is Broken)

- You're working on main branch directly — STOP. Create a feature branch.
- Tests pass on your machine but fail in CI — You probably didn't establish a clean baseline.
- `.gitignore` changes are in your commits — Revert. Don't modify .gitignore to hide work.
- You can't remember what your baseline was — Document it. Every workspace needs baseline documentation.
- Multiple branches are pointing to the same code — Only one branch per task. Don't reuse branches.

---

## Rationalization Table

| Rationalization | Reality |
|---|---|
| "I'll just make a small change on main" | Small changes on main break others. Use a feature branch. |
| "I don't need a baseline, I know the tests pass" | You don't. Record it. Baseline is your safety net. |
| "I'll install dependencies later, when I need them" | Install now. Missing deps hide test failures until later. |
| "My workspace is safe, I'll skip the safety checks" | Safety checks take 2 minutes. They prevent hours of debugging. |
| "I'll remember which version of main I started from" | You won't. Use git. Let git track it. |

---

## Notes

- **Isolation is mandatory:** Every task gets its own clean workspace. No exceptions.
- **Baseline is proof:** When you compare final state to baseline, you have evidence of your changes. No guessing.
- **Main is sacred:** Main is the shared workspace. Protect it. Never commit incomplete work to main.
- **Documentation:** Write down your workspace setup. Future you will thank you.
