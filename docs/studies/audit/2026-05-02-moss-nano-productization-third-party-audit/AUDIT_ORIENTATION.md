# Audit Orientation

This package is a feasibility and productization audit bundle for Blurby's MOSS Nano TTS work.

It is not a request to review a finished production engine. Nano is currently experimental-only. The relevant question is whether the next proposed sprint, MOSS-NANO-13, is the right evidence gate for deciding if Nano can become recommended opt-in.

## Recommended Reading Order

1. `AUDIT_MEMO.md`
2. `EVIDENCE_MATRIX.md`
3. `REVIEW_QUESTIONS.md`
4. `REVIEW_PROMPT.md`
5. `SOURCE_INVENTORY.md`
6. `PACKAGE_MANIFEST.md`
7. Curated source files in the zip

## How To Read The Source Bundle

The zip preserves repo-relative paths. It includes audit docs, governing docs, key Nano source files, tests, eval scripts, and selected evidence summaries. It intentionally excludes runtime weights, `.runtime`, `.git`, `.idea`, `.tmp`, generated WAVs, and broad local artifact noise.

Use the included evidence artifacts as context, not as proof of current live app behavior. MOSS-NANO-12 explicitly did not include live selected-Nano observations. That is the gap MOSS-NANO-13 is meant to close.

## Scope Boundary

In scope:

- MOSS Nano productization posture.
- The sidecar, strategy, settings, eval, and gate architecture.
- Whether MOSS-NANO-13 is the right next sprint.
- Whether segment-following truth is product-acceptable.

Out of scope:

- Making Nano default immediately.
- Retiring Kokoro.
- Reopening flagship MOSS as the near-term path.
- Reviewing local runtime weights or private `.runtime` assets.
- Treating simulated matrix output as live evidence.
