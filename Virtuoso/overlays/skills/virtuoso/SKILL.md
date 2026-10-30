<!-- Virtuoso project overlay for skills/virtuoso/SKILL.md -->
<!-- Read on top of the plugin's own skills/virtuoso/SKILL.md. Additive, and it wins on conflict —
     except that it may not loosen a shared-contract safety rule:
     registry-resolution, read-only-preflight, write-permission, git-safety, provenance, issue-contract. -->

# SKILL — this project's additions

## Commands

- Suite commands are the registered `x-commands` in `Virtuoso/workspace-layout.json`: `test`, `typecheck`, `build`, `perf`.
- Packaged-build commands are ROADMAP.md standing rule 53's: `npx electron-builder --win --dir` with an explicit architecture flag (`--arm64` or `--x64`, as rule 53 and its temporary-placement note name them).

## Project gate

- No dispatch merges or closes until ROADMAP.md standing rule 53 passes and Blurby.Brain1 confirms in writing (CLAUDE.md rule 11).
- When nothing under `package.json` `build.files` changed, record "package unchanged" with the diff.
- The Stage 8 source freeze and the release gates stand as CLAUDE.md and ROADMAP.md state them.

## Fences

- The shared-core freeze set: CLAUDE.md *Shared-Core Freeze Set*.
- The Electron main process stays CommonJS; the renderer stays ESM/TypeScript (CLAUDE.md *Standing Rules*).
- Reading-mode isolation: CLAUDE.md *Reading-mode isolation*.

## Lessons

- A lesson cited by number (`LL-NNN`) is read in `docs/governance/LESSONS_LEARNED.md` before the first edit.

## Host

- Placement follows CLAUDE.md rule 6b and ROADMAP.md standing rule 53's temporary-placement note (RodneySr hosts builds and x64 checks).
- Registry helper calls follow CLAUDE.md rule 11a.

## Git

- Branches follow `policy.git.branchNameTemplate` `eb/{item-id}`, each in an isolated worktree.
- Push with an explicit refspec: `git push origin HEAD:refs/heads/eb/<name>`.
