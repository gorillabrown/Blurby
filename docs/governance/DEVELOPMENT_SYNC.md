# Development Sync — Git + Multi-Machine Workflow

**Purpose:** Standard operating procedure for syncing the Blurby codebase across machines using git. Replaces the OneDrive-first development model that caused data loss (LL-061, LL-062, LL-063).

**Audience:** Any Claude Cowork or Claude Code CLI session on either machine.

---

## Architecture

```
C1 (Planning)                    C2 (Execution)
C:\Projects\Blurby                    C:\Projects\Blurby
     │                                │
     └──── git push ──→ GitHub ←── git push ────┘
     └──── git pull ←── GitHub ──→ git pull ────┘
```

- **C1**: Evan's planning machine. Runs Cowork sessions for architecture, review, and documentation.
- **C2**: Evan's execution machine. Runs Claude Code CLI for sprint dispatches, builds, and tests.
- **GitHub**: Single source of truth. All commits must be pushed here. No unpushed commits survive a session.
- **OneDrive / Google Drive**: Backup only. Never the active working directory.

---

## The Two Rules

### Rule 1: Push after every sprint

After every sprint merge (or any commit to main), push immediately:

```
git push origin main
```

This is a **mandatory step in the doc-keeper pass**. The sprint is not complete until the push succeeds. If the push fails (network, auth), it must be retried before starting the next sprint.

**Why:** 53 commits were lost because they were never pushed. If GitHub has the latest, any machine can recover with a fresh clone in under 60 seconds.

### Rule 2: Pull before every session

Before starting any work on either machine, pull first:

```
git pull origin main
```

If there are local changes that conflict, stash first:

```
git stash
git pull origin main
git stash pop
```

This is a **mandatory step in session bootstrap** (Step 0, before reading CLAUDE.md).

**Why:** Without pulling, two machines can diverge. The first to push wins; the second has to merge or rebase. Pulling first prevents this entirely.

---

## Machine Setup

### Initial Setup (one time per machine)

```powershell
# Create local dev directory (NOT in any cloud-synced folder)
mkdir C:\Projects
cd C:\Projects

# Clone from GitHub
git clone https://github.com/<owner>/blurby.git Blurby
cd Blurby

# Verify
git log --oneline -5
npm install
npm test
```

### Moving from OneDrive to Local

If the working directory is currently in OneDrive:

```powershell
# 1. Ensure everything is committed and pushed
cd "C:\Users\estra\OneDrive\Projects\Blurby"
git status          # Should be clean
git push origin main

# 2. Clone fresh to local directory
mkdir C:\Projects
cd C:\Projects
git clone https://github.com/<owner>/blurby.git Blurby

# 3. Copy non-git files that aren't in the repo
# (node_modules will be reinstalled, dist will be rebuilt)
cd C:\Projects\Blurby
npm install
npm test
npm run build

# 4. Verify the local copy works
# Then stop using the OneDrive copy for development
```

### What stays in OneDrive

- Brand assets (`Blurby Brand/`)
- Backup copies of releases
- Any non-code project files

### What does NOT go in OneDrive

- The `.git` directory (ever)
- The active working directory
- `node_modules`
- `dist` / build output

---

## Session Protocol

### Starting a session (either machine)

```
Step 0: git pull origin main
Step 1: Read CLAUDE.md
Step 2: Read session-bootstrap.md (if applicable)
Step 3: Read LESSONS_LEARNED.md (if changing code)
Step 4: Read ROADMAP.md (if doing planned work)
Step 5: Proceed with task
```

### Ending a session

```
Step 1: Ensure all changes are committed
Step 2: git push origin main
Step 3: Verify push succeeded (check GitHub or git log --oneline origin/main)
```

### Switching machines mid-session

```
On Machine A:
  git add -A && git commit -m "wip: switching machines"
  git push origin main

On Machine B:
  git pull origin main
  # Continue work
```

---

## Sprint Completion Checklist

The doc-keeper pass already handles most of this. The addition is the **mandatory push**:

```
1. ✅ Tests pass (npm test)
2. ✅ Branch merged to main (--no-ff)
3. ✅ Branch deleted
4. ✅ ROADMAP.md updated
5. ✅ SPRINT_QUEUE.md updated
6. ✅ CLAUDE.md updated
7. ✅ LESSONS_LEARNED.md updated (if applicable)
8. ✅ git push origin main        ← NEW: MANDATORY
9. ✅ Verify push: git log --oneline origin/main
```

**The sprint is not complete until step 9 succeeds.**

---

## Troubleshooting

### "Your branch is ahead of origin/main by N commits"

This means commits haven't been pushed. Fix immediately:

```
git push origin main
```

### "Your branch is behind origin/main"

The other machine pushed changes you don't have:

```
git pull origin main
```

### Merge conflict on pull

```
git stash
git pull origin main
git stash pop
# Resolve conflicts manually
git add -A && git commit -m "merge: resolve conflict after pull"
git push origin main
```

### Git repository is corrupted

If `.git` is missing or corrupted, don't try to fix it — clone fresh:

```powershell
cd C:\dev
# Rename the broken copy
ren Blurby Blurby-broken

# Clone fresh from GitHub
git clone https://github.com/<owner>/blurby.git Blurby
cd Blurby
npm install

# If there were local files in Blurby-broken that aren't in git,
# copy them over manually, then commit and push
```

### OneDrive conflict errors (.git)

If you see OneDrive sync errors mentioning `.git`:

1. **Do NOT resolve the conflict through OneDrive**
2. The `.git` directory should not be in any synced folder
3. Move the repository to `C:\Projects\Blurby` (see "Moving from OneDrive to Local" above)
4. If `.git` is already corrupted, clone fresh from GitHub

### Lost commits (not on GitHub)

If commits exist locally but were never pushed, check:

```
git log --oneline origin/main..HEAD
```

This shows unpushed commits. Push them immediately:

```
git push origin main
```

If the local `.git` is destroyed and commits were never pushed, **they are unrecoverable**. This is why Rule 1 (push after every sprint) is non-negotiable.

---

## Anti-Patterns

| Anti-Pattern | Why It's Dangerous | Do This Instead |
|---|---|---|
| Developing in OneDrive/Google Drive/Dropbox | Cloud sync fights with git branch operations, causes phantom deletions and file corruption | Develop in `C:\Projects\Blurby`, push to GitHub |
| 50+ unpushed commits | If local `.git` is lost, all work is unrecoverable | Push after every sprint (Rule 1) |
| Excluding `.git` from cloud sync settings | Removes `.git` from local disk, destroying the repository | Don't put `.git` in a synced folder at all |
| `git reset --hard` without checking push status | Destroys local commits that may not exist on GitHub | Always `git log --oneline origin/main..HEAD` first |
| Two machines editing the same branch simultaneously | Guaranteed merge conflicts and potential data loss | One machine works at a time; push/pull to switch |

---

## History

This document was created after a critical incident on 2026-03-30 where 53 commits (NAR-2 through AUDIT-FIX-1E) were lost due to:

1. OneDrive syncing the `.git` directory between two machines
2. A CLI agent running `git reset --hard origin/main` on C2, reverting files to v1.2.0
3. OneDrive syncing C2's reverted files to C1, overwriting v1.4.12 files
4. `.git` being excluded from OneDrive sync (intended as fix), which deleted git objects from local disk
5. OneDrive conflict resolution during re-sync destroying the remaining `.git` objects

The root cause was developing directly in a cloud-synced folder. The fix is this document's workflow: develop locally, sync via git push/pull, use cloud storage for backups only.

See also: LL-061, LL-062, LL-063 in `docs/governance/LESSONS_LEARNED.md`.
