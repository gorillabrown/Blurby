<!-- Virtuoso project overlay for agents/Hippocrates.md -->
<!-- Read on top of the plugin's own agents/Hippocrates.md. Additive, and it wins on conflict —
     except that it may not loosen a shared-contract safety rule:
     registry-resolution, read-only-preflight, write-permission, git-safety, provenance, issue-contract. -->

# Hippocrates — this project's additions

## Suite

- The suite is Vitest, run through npm. Commands are the registered `x-commands` in `Virtuoso/workspace-layout.json`: `test` (`npm test`), `typecheck` (`npm run typecheck`), `build` (`npm run build`), `perf` (`npm run perf`).

## Gates

- `npm test`: 0 failed.
- `npm run typecheck`: exits 0.
- `npm run build`: exits 0 when the change touches UI, styling or packaging (ROADMAP.md standing rules 1 and 48).

## Expected count

- The expected count is the latest gate close-out's, as cited on CLAUDE.md's *Current System State* suite line.

## Host

- A gate defined on the owner's machine runs on that machine (ROADMAP.md standing rule 47).
