# Package Manifest

Package name: MOSS Nano Productization Third-Party Audit
Creation date: 2026-05-02
Source branch: main
Source commit: 2fe74ba386ebf260dfb524af43d249f40aa6d207
Zip file: blurby-moss-nano-productization-audit-package.zip

## Workspace Note

The source checkout is intentionally not cleaned for local noise. The package excludes unrelated local files and generated runtime outputs, including `.idea/workspace.xml`, `tests/perf-baseline-results.json`, `.tmp/`, `.claude/skills/governance-sweep/`, `.runtime/`, and generated WAV files.

## Package Type

This is a curated audit artifact, not a standalone runnable release. It includes enough source, tests, docs, and evidence summaries to review the MOSS Nano productization posture and the proposed MOSS-NANO-13 evidence gate.

## Exact Exclusions

- `.git/`
- `.idea/`
- `.tmp/`
- `.runtime/`
- `node_modules/`
- `dist/`
- `release/`
- `.claude/skills/governance-sweep/`
- `*.wav`
- broad generated artifact directories outside the explicit evidence list

## Verification Requirements

Before shipping this package, verify:

- Every listed inventory path exists in the zip.
- The zip contains the audit documents.
- The zip excludes `.runtime`, `.git`, `.idea`, `.tmp`, `.claude/skills/governance-sweep`, and WAV files.
- `PACKAGE_MANIFEST.md` names the real source commit and zip filename.
- `AUDIT_ORIENTATION.md` references filenames that exist.
