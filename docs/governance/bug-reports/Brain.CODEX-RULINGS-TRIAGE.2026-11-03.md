# Brain1 ruling — triage of the Codex-era Brain rulings (2026-11-02/03)

Date: 2026-11-03. Authority: Blurby.Brain1 (CLAUDE.md rule 11, restored 2026-11-03). Source read: `origin/eb/roadmap-review-20261102` @ `0d68ad1b`, the 103 files `docs/governance/bug-reports/Brain.*.2026-11-0{2,3}.md`.

**Ruling.** Codex's product and measurement decisions are kept as inputs. Its process machinery is not binding on any executor, for two reasons:
- The owner's directive is to follow the Virtuoso plugin to the letter, with no local parallel procedure.
- Some of those rulings contradict Brain1's R-2026-11-02-CPU-1.

Execution follows the shipped Virtuoso next-dispatch → Zeus path. Every file below stays as provenance; none is edited or deleted.

File names are written as `<family>.<label>`. The full name is `Brain.<family>.<label>.<date>.md`.

## KEEP — binding technical inputs (25)

**NARRATE-CPU-PROFILE-1**
- ruling-7: the d1–d4 fixtures and the decision arithmetic.
- ruling-8 and ruling-8-amendment: the summary schema, the validation order and the exact failure strings.
- ruling-9: only what the measurements mean (per-process CPU by type; CIM counter ÷ 10,000,000; warm-up thread proof). Its fault and argv-parser machinery is not kept.
- ruling-13: the `ledger.getSamples()` API only.
- A3-T-embedding: the UTF-8 round-trip check.
- A3-T-watcher-exit: the first exit tuple wins.

**DESKTOP-INTEGRATION-CPU** (whole file).

**DESKTOP-LIBRARY-INTEGRATION**
- scope.
- topology, subject to Brain1's merge-train confirmation.
- T3: only the `BLURBY_USE_DIST` updater guard, the `app.quit` route and the target binding.
- source-S: the sequencing.
- source-S-operator: the recipe only.

**BLURBY-BUSINESS-1.** These hold only if the owner confirms that execution was authorized; until then Business stays held.
- setup: the `themes` export only.
- fixture-task and fixture-task-clarification: the six-page report.pdf content.
- HB6-T3-R, HB6-T3-W, HB6-T3-I-architecture, HB6-T3-I-C and HB6-T3-I-D: the API contracts.
- HB6-T3-I-D-controls: items 1–2.
- HB6-T3-I-C-repair1-exact: the test code.
- HB6-T3-I-C-Q3: the bc06 two-line fix.

**FOCUS-WORD-ONLY-1**
- FW2.
- F-C: items 4–5.
- F0, already done at `8810511e`.

**NARRATE-PAUSED-CLICK-1**
- B0-contract: the I1/I2 topology, with parity against trees `7e8a4a9a` and `40f74988`.

**POSITION-PROMPT-COPY-1**
- source-separation.
- PP2-final-candidate: the pin `5a660ff9` only. Verify it with plain `npm ci`, test, typecheck and build.

**NARRATE-ARROW-PAUSE-1**
- source-contract, on base `51202c1c`.

## HISTORY ONLY — expired admissions and clocks, not inputs (10)

- NARRATE-CPU-PROFILE-1: placement, ruling-4, ruling-5, ruling-6, ruling-14, COMPLETE3-reservation-close.
- BLURBY-BUSINESS-1: launch, HB6-T3-I-C-repair1, HB6-T3-I-C-repair1b.
- DESKTOP-LIBRARY-INTEGRATION: T3-clock.

Where they bear on CPU, ruling-8-atomic and ruling-10/11 plus the A3-T-seams/producer detail apply only if a future CPU dispatch keeps the T stage. They are not binding by default.

## DO NOT ADOPT — not binding (41)

**They contradict R-2026-11-02-CPU-1.**
- NARRATE-CPU-PROFILE-1: ruling-3, ruling-12.
- Under CPU-1, what remains of Wave A (A3 plus A4) runs as one wave of 60 minutes or less.

**Qualification and harness machinery.**
- NARRATE-CPU-PROFILE-1: A3-T-producer-final, A3-T-split, A3-T-parallel, A3-T-CLI, A3-T-control-repair1, A3-T-control-repair1-exact, A3-T-qualify2, A3-T-complete3.
- BLURBY-BUSINESS-1: HB6-T3-I-C-AST.
- DESKTOP-LIBRARY-INTEGRATION: T3-H15.
- NARRATE-PAUSED-CLICK-1: B0-controls, B0-manifest-transfer. A plain `git diff` against the historical trees is enough.

**Receipt schemas, recorders and deadline nesting.**
- BLURBY-BUSINESS-1: HB6-T3-I-C-controls, HB6-T3-I-C-recorder, HB6-T3-I-C-Q-qualify2, HB6-T3-I-C-Q-qualify2-deadline, HB6-T3-I-C-cleanup.
- Items 1–3 and 5 of I-C-controls may be reused as plain test guidance.

**Read-accounting procedure that overrides the plugin.**
- FLAT-OPERATIVE-CONTRACT, all 21: the base file, A-git-object-guards, A-observation-clock-correction, A-post-return-binding, A-receipt-B-reviewer-input, B-READ-compact-references, C-exclusive-Root-writer, actor-read-carry, execution-action-unit, five-document-cache, quiet-instructions, remaining-route-selection, reviewer-data-acceptance, reviewer-preparation-admission, reviewer-preparation-clock, reviewer-preparation, same-CPU-seven-receipt, semantic-review-subject, shared-instruction-preparation, three-deliverable-route, two-deliverable-split.
- BLURBY-BUSINESS-1: HB6-T3-I-C-Q3-f956-bindings, HB6-T3-I-C-Q3-finite-derivation, HB6-T3-I-C-Q3-quality-inputs, HB6-T3-I-C-Q3-quality-recovery, HB6-T3-I-C-Q3-quality-representation.
- DESKTOP-LIBRARY-INTEGRATION: source-S-split, source-S-split-clarification, source-S-input-access, source-S-carry-placement.
- SR44-source-qualification.

**Dependency rituals.** Plain `npm ci` works, so these are not needed.
- FOCUS-WORD-ONLY-1: D0-dependencies, D0-qualify2, D0-author3, D0-author3-input-read.
- POSITION-PROMPT-COPY-1: PP2-minimal-activation, PP2-native-loaders, PP2-loader-seams.

**Business setup.** The relocated registry-helper clone it describes is a local parallel plugin copy. Do not use it. The `themes` export in that file is kept.

## Effect

- The FLAT-OPERATIVE-CONTRACT preparation line (A, B-READ v2, C-REVIEW-CLOSE) is retired.
- Any held work these families left resumes only through a next-dispatch admission, under the KEEP inputs above and Brain1's standing rulings.
- Those standing rulings are R-2026-11-02-CPU-1 and -CPU-2, rule 53 with the temporary RodneySr placement, and the N-Q1–Q3, P-Q1 and F-Q1/F-Q3 rulings.
