# MANIFEST — AuditPackage.10.2026-10-11

Built from `8ee49de3` with `git archive`, which includes tracked files only.
No `.git`, `node_modules`, audio, video, images, EPUB fixtures or model binaries are included.

Open `00_orientation_manifest.zip` first. It holds the orientation document and this manifest.

| # | Entry | Contents | Files | Tier |
|---|---|---|---|---|
| 00 | 00_orientation_manifest.zip | AuditOrientation.10.2026-10-11.docx, MANIFEST.md | 2 | — |
| 01 | 01_plan_and_specs.zip | ROADMAP.md (NARRATE-REMOVE-1 and NARRATE-REBUILD-1 specs, standing rules), CLAUDE.md, the absorbed storyboard and plan, the 2026-10-11 review records, TTS architecture decisions | 9 | Tier 1 |
| 02 | 02_renderer_src.zip | All of src/ (renderer: reader modes, router, ports, narration stack, components) | 279 | Tier 1 |
| 03 | 03_main_process_build.zip | main/, main.js, preload.js, package.json, vite.config.js, tsconfig*.json, .github/ (CI) | 50 | Tier 1 |
| 04 | 04_tests.zip | All of tests/ | 277 | Tier 1 |
| 05 | 05_scripts.zip | All of scripts/ (including the TTS eval tools the removal deletes) | 20 | Tier 2 |
| 06 | 06_mode_separation_evidence.zip | READER-MODE-SEPARATION-2 close-out, epic packet and evidence (census, ownership, observations, live-QA records) | 80 | Tier 2 |
| 07 | 07_narration_research.zip | TTS engine scan and shortlist; narration investigations (cursor tracking, window sync, Kokoro rate buckets) | 31 | Tier 2 |
| 08 | 08_governance.zip | LESSONS_LEARNED.md, BUG_REPORT.md, TECHNICAL_REFERENCE.md, close-outs from 2026-10 | 8 | Tier 3 |

Entry 09 is unused.
