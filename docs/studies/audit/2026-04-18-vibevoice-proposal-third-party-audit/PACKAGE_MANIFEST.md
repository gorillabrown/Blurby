# Package Manifest

## Package Identity

- **Package name:** `2026-04-18-vibevoice-proposal-third-party-audit`
- **Creation date:** `2026-04-18`
- **Repo root:** `C:\Users\estra\Projects\Blurby`
- **Source branch:** `main`
- **Source commit:** `5c74a9eb23fd24496070aa3e7293db18bc0ccb10`

## Purpose

This package is a third-party technical audit bundle for reviewing the proposed VibeVoice investigation lane in Blurby. It is a **feasibility and proposal audit artifact**, not a standalone runnable release.

## Produced Archives

- `blurby-vibevoice-curated-audit-package.zip`
- `blurby-vibevoice-full-source-supplement.zip`

## Workspace Notes

- The source workspace was expected to be clean except for a local-only untracked path:
  - `C:\Users\estra\Projects\Blurby\.claude\skills\adversarial-review`
- That path must be excluded from both archives.

## Curated Package Scope

The curated package includes:

- the new audit package documents in this folder
- focused TTS and audit docs
- the core Kokoro and narration code paths
- relevant tests
- roadmap and governance context

The curated package intentionally excludes large generated artifacts, model weights, local caches, and unrelated repo noise.

## Full-Source Supplement Scope

The full-source supplement includes a broad snapshot of the repo under:

- `C:\Users\estra\Projects\Blurby`

Exclusions:

- `node_modules`
- `dist`
- `artifacts`
- `.git`
- `.idea`
- `.claude\skills\adversarial-review`
- this audit package folder itself

## Reviewer Guidance

Use the curated package first. Only open the full-source supplement if the curated package is insufficient for answering the review questions.
