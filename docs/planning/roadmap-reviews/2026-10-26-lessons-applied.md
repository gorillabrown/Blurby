# Roadmap review 2026-10-26 — Lessons applied

Provenance: registered docs/governance/LESSONS_LEARNED.md, read through lessons --open; 115 live lessons. Candidate computation read85 close-outs. Previous complete cycle: 2026-10-25; interrupted 2026-10-23-5 remains named in that cycle. Provider metrics are from the registered Notion snapshot; see the phase brief and final validation.

## Applicability and checks

All five new cards passed mechanical U9 and U10. Their source-backed constraints, positive controls, rollback and package gates were reviewed separately; mechanical checks alone do not establish dispatch readiness.

| Specification | Explicit lesson applications |
|---|---|
| LIBRARY-COMPLETION-VISIBILITY-1 | LL-090, LL-030, LL-165 |
| NARRATE-PAUSED-CLICK-1 | LL-072, LL-108, LL-073, LL-031, LL-109, LL-160, LL-161, LL-165 |
| PAGE-ENTRY-KEYS-1 | LL-031, LL-080, LL-160, LL-161, LL-165 |
| FOCUS-WORD-ONLY-1 | LL-090, LL-120, LL-165 |
| POSITION-PROMPT-COPY-1 | LL-073, LL-090, LL-165 |

All inherit the registered standing rules, including package verification and failure-detector controls. Library tests use the real component rather than a duplicate predicate. Narrate assertions observe producer requests and the next audio clock tick. Page installs and cleans its own listener, including early wrapping and ownership-census controls. Focus changes preserve sibling masks and private follow geometry. Prompt tests preserve anchor semantics and keyboard behavior.

Existing Queued Full Spec items WORD-INDEX-UNIFY-1, LIBRARY-WRITE-RACE-3, NARRATE-CPU-PROFILE-1, NARRATE-ARROW-PAUSE-1 and PAGE-PAGES-READ-1 were rechecked against the live list and pass U9. In-flight items retain their own integration and close-out gates.

## Promotion and retirement decisions

The computed candidates LL-006, LL-024, LL-088, LL-093, LL-121, LL-137, LL-139, LL-142, LL-150, LL-154 and LL-157 retain review2026-10-23-2 decisions and reasons, as carried by the2026-10-25 lessons-applied record. No new close-out or recurrence changes those decisions. No new promotion, retirement, or lesson-status append is made; none is left undecided. LL-168 is the additional live entry since the prior cycle. The LIBRARY-WRITE-RACE-3 stamp-origin candidate remains assigned to its future close-out.

Governance use of LL-155: every named external field was read back before confirmation; all review-owned recovery records resolved. LL-137: explicit UTF-8 reads/writes and exact verification were used. LL-146: diagnostic scripts stayed in the artifact directory; only portable evidence enters the review.

## Learning figures

| Metric | Previous review | Current |
|---|---:|---:|
| Live lessons |114|115|
| Yield per close-out |1.64|1.65|
| Held rate |0.98|0.98|
| Promotion rate |0.12|0.12|
| Median application days |3|3|
| Repeated trap rate |0.03|0.03|

No new close-outs occurred in this review interval, so none newly lacks a lesson without a reason. Task timing median row error0.90 and total error0.79 make generic kind prices unsuitable as delivery commitments.

## Full live checklist and non-applicability review

The live list was considered before drafting. The following per-item lists are the live lessons not explicitly cited in that card. Process/package lessons apply through the standing rules; main-process persistence, cloud/auth, parser, security and other-mode implementation rules do not authorize expanding these renderer-only fences. No live lesson is rejected as invalid, and historical sharing advice cannot override the current mode-isolation ruling.

### LIBRARY-COMPLETION-VISIBILITY-1

LL-002, LL-003, LL-004, LL-006, LL-007, LL-008, LL-014, LL-015, LL-016, LL-017, LL-018, LL-019, LL-020, LL-021, LL-022, LL-023, LL-024, LL-025, LL-026, LL-027, LL-028, LL-029, LL-031, LL-032, LL-033, LL-034, LL-063, LL-065, LL-066, LL-067, LL-068, LL-069, LL-070, LL-071, LL-072, LL-073, LL-074, LL-075, LL-076, LL-077, LL-078, LL-079, LL-080, LL-081, LL-082, LL-083, LL-084, LL-085, LL-086, LL-087, LL-088, LL-089, LL-091, LL-128, LL-093, LL-092, LL-094, LL-095, LL-096, LL-097, LL-098, LL-099, LL-100, LL-101, LL-102, LL-103, LL-104, LL-105, LL-106, LL-107, LL-108, LL-109, LL-110, LL-111, LL-113, LL-114, LL-115, LL-116, LL-117, LL-118, LL-119, LL-120, LL-121, LL-122, LL-123, LL-124, LL-125, LL-126, LL-127, LL-129, LL-131, LL-132, LL-133, LL-134, LL-137, LL-139, LL-140, LL-142, LL-143, LL-144, LL-145, LL-150, LL-152, LL-154, LL-155, LL-157, LL-159, LL-160, LL-161, LL-162, LL-163, LL-168.

### NARRATE-PAUSED-CLICK-1

LL-002, LL-003, LL-004, LL-006, LL-007, LL-008, LL-014, LL-015, LL-016, LL-017, LL-018, LL-019, LL-020, LL-021, LL-022, LL-023, LL-024, LL-025, LL-026, LL-027, LL-028, LL-029, LL-030, LL-032, LL-033, LL-034, LL-063, LL-065, LL-066, LL-067, LL-068, LL-069, LL-070, LL-071, LL-074, LL-075, LL-076, LL-077, LL-078, LL-079, LL-080, LL-081, LL-082, LL-083, LL-084, LL-085, LL-086, LL-087, LL-088, LL-089, LL-090, LL-091, LL-128, LL-093, LL-092, LL-094, LL-095, LL-096, LL-097, LL-098, LL-099, LL-100, LL-101, LL-102, LL-103, LL-104, LL-105, LL-106, LL-107, LL-110, LL-111, LL-113, LL-114, LL-115, LL-116, LL-117, LL-118, LL-119, LL-120, LL-121, LL-122, LL-123, LL-124, LL-125, LL-126, LL-127, LL-129, LL-131, LL-132, LL-133, LL-134, LL-137, LL-139, LL-140, LL-142, LL-143, LL-144, LL-145, LL-150, LL-152, LL-154, LL-155, LL-157, LL-159, LL-162, LL-163, LL-168.

### PAGE-ENTRY-KEYS-1

LL-002, LL-003, LL-004, LL-006, LL-007, LL-008, LL-014, LL-015, LL-016, LL-017, LL-018, LL-019, LL-020, LL-021, LL-022, LL-023, LL-024, LL-025, LL-026, LL-027, LL-028, LL-029, LL-030, LL-032, LL-033, LL-034, LL-063, LL-065, LL-066, LL-067, LL-068, LL-069, LL-070, LL-071, LL-072, LL-073, LL-074, LL-075, LL-076, LL-077, LL-078, LL-079, LL-081, LL-082, LL-083, LL-084, LL-085, LL-086, LL-087, LL-088, LL-089, LL-090, LL-091, LL-128, LL-093, LL-092, LL-094, LL-095, LL-096, LL-097, LL-098, LL-099, LL-100, LL-101, LL-102, LL-103, LL-104, LL-105, LL-106, LL-107, LL-108, LL-109, LL-110, LL-111, LL-113, LL-114, LL-115, LL-116, LL-117, LL-118, LL-119, LL-120, LL-121, LL-122, LL-123, LL-124, LL-125, LL-126, LL-127, LL-129, LL-131, LL-132, LL-133, LL-134, LL-137, LL-139, LL-140, LL-142, LL-143, LL-144, LL-145, LL-150, LL-152, LL-154, LL-155, LL-157, LL-159, LL-162, LL-163, LL-168.

### FOCUS-WORD-ONLY-1

LL-002, LL-003, LL-004, LL-006, LL-007, LL-008, LL-014, LL-015, LL-016, LL-017, LL-018, LL-019, LL-020, LL-021, LL-022, LL-023, LL-024, LL-025, LL-026, LL-027, LL-028, LL-029, LL-030, LL-031, LL-032, LL-033, LL-034, LL-063, LL-065, LL-066, LL-067, LL-068, LL-069, LL-070, LL-071, LL-072, LL-073, LL-074, LL-075, LL-076, LL-077, LL-078, LL-079, LL-080, LL-081, LL-082, LL-083, LL-084, LL-085, LL-086, LL-087, LL-088, LL-089, LL-091, LL-128, LL-093, LL-092, LL-094, LL-095, LL-096, LL-097, LL-098, LL-099, LL-100, LL-101, LL-102, LL-103, LL-104, LL-105, LL-106, LL-107, LL-108, LL-109, LL-110, LL-111, LL-113, LL-114, LL-115, LL-116, LL-117, LL-118, LL-119, LL-121, LL-122, LL-123, LL-124, LL-125, LL-126, LL-127, LL-129, LL-131, LL-132, LL-133, LL-134, LL-137, LL-139, LL-140, LL-142, LL-143, LL-144, LL-145, LL-150, LL-152, LL-154, LL-155, LL-157, LL-159, LL-160, LL-161, LL-162, LL-163, LL-168.

### POSITION-PROMPT-COPY-1

LL-002, LL-003, LL-004, LL-006, LL-007, LL-008, LL-014, LL-015, LL-016, LL-017, LL-018, LL-019, LL-020, LL-021, LL-022, LL-023, LL-024, LL-025, LL-026, LL-027, LL-028, LL-029, LL-030, LL-031, LL-032, LL-033, LL-034, LL-063, LL-065, LL-066, LL-067, LL-068, LL-069, LL-070, LL-071, LL-072, LL-074, LL-075, LL-076, LL-077, LL-078, LL-079, LL-080, LL-081, LL-082, LL-083, LL-084, LL-085, LL-086, LL-087, LL-088, LL-089, LL-091, LL-128, LL-093, LL-092, LL-094, LL-095, LL-096, LL-097, LL-098, LL-099, LL-100, LL-101, LL-102, LL-103, LL-104, LL-105, LL-106, LL-107, LL-108, LL-109, LL-110, LL-111, LL-113, LL-114, LL-115, LL-116, LL-117, LL-118, LL-119, LL-120, LL-121, LL-122, LL-123, LL-124, LL-125, LL-126, LL-127, LL-129, LL-131, LL-132, LL-133, LL-134, LL-137, LL-139, LL-140, LL-142, LL-143, LL-144, LL-145, LL-150, LL-152, LL-154, LL-155, LL-157, LL-159, LL-160, LL-161, LL-162, LL-163, LL-168.

### Live inventory

- LL-002 — PR #1 Is Massive — 102 Commits, 80 Files; applies to: process, git hygiene
- LL-003 — main.js Is 93KB and Growing; applies to: architecture, maintainability
- LL-004 — GitHub Repo is Private — No CI/CD; applies to: infrastructure, quality
- LL-006 — Atomic JSON Writes Prevent Data Corruption; applies to: data integrity, file I/O
- LL-007 — Content Security Policy in Electron; applies to: security, Electron
- LL-008 — React Context vs Prop Drilling — When to Switch; applies to: React architecture, renderer
- LL-014 — React Effects Cannot Drive Imperative DOM Animation; applies to: rendering, animation, flow cursor
- LL-015 — Forced Reflow for CSS Transition Sequencing; applies to: animation, CSS
- LL-016 — React State Batching Breaks Pause/Resume Flows; applies to: renderer, React state, effects
- LL-017 — Closures in Imperative Controllers Capture Stale React State; applies to: renderer, imperative code, closures
- LL-018 — Flow Mode Must Stay Paginated, Not Infinite-Scroll; applies to: reader, flow mode, performance
- LL-019 — Pagination Estimation — Count the First Line; applies to: renderer, pagination
- LL-020 — Paragraph Margin Is Not Equal to lineHeight; applies to: renderer, pagination, CSS
- LL-021 — TTS Chunk Size Dramatically Affects Speech Quality; applies to: TTS, narration
- LL-022 — TTS and Flow Cursor Are Independent Systems That Conflict; applies to: reader, TTS, flow cursor
- LL-023 — TTS Settings Were Disconnected From Narration Engine; applies to: settings, TTS, narration
- LL-024 — `-webkit-app-region: drag` on Body Inherits Into Grid Gaps; applies to: CSS, Electron, window management
- LL-025 — DOM Elements Created by Imperative Code Get Orphaned by React; applies to: renderer, imperative code, React reconciliation
- LL-026 — Never Put `-webkit-app-region: drag` on `body`; applies to: CSS, Electron, window management
- LL-027 — Foliate EPUB DOM Is Not Your DOM — Use Overlays; applies to: EPUB rendering, foliate-js, React integration
- LL-028 — Word Tokenization Must Be Unified Across All Paths; applies to: Text processing, EPUB word extraction, click handling
- LL-029 — Stale Ranges Are Silent Killers — Guard Every Access; applies to: DOM, EPUB, Range API
- LL-030 — Engagement Gating Prevents Ghost Progress; applies to: State management, progress tracking, EPUB
- LL-031 — Generation ID Pattern for Stale Async Results; applies to: TTS, async IPC, state management
- LL-032 — Foliate Shadow DOM Blocks querySelectorAll; applies to: DOM, foliate-js, Electron, shadow DOM
- LL-033 — adjustRate Before startCursorDriven, Never After; applies to: TTS, Kokoro, async IPC, state management
- LL-034 — TTS Chunks Must Be One Sentence for Natural Pauses; applies to: TTS, Kokoro, audio UX
- LL-063 — Never Develop in a Cloud-Synced Folder; applies to: workflow, infrastructure, git, disaster recovery
- LL-065 — MOBI Files Contain Usable HTML — Don't Strip It; applies to: format conversion, EPUB pipeline
- LL-066 — Silent `.catch(() => {})` Is a Systemic Anti-Pattern; applies to: error handling, data integrity
- LL-067 — Infinite Scroll Is Fundamentally Incompatible with Pagination; applies to: architecture, reader, flow mode
- LL-068 — Agent File Reconstruction Causes Silent Truncation; applies to: process, agent safety, file integrity
- LL-069 — Normalize `load-doc-content` Results at the Renderer Boundary; applies to: renderer, IPC contracts, reader startup
- LL-070 — Single Ownership for Section Navigation During Narration; applies to: renderer, foliate bridge, narration
- LL-071 — EPUB Modes Must Use Global Word Source, Not DOM Viewport; applies to: renderer, foliate bridge, narration, EPUB modes
- LL-072 — All User Selection Paths Must Preserve Exact Word Identity; applies to: renderer, foliate bridge, selection mapping
- LL-073 — Resume Anchor Must Be Persistent, Not Time-Limited; applies to: renderer, reader state, narration, progress tracking
- LL-074 — UI Controls Must Materially Affect the Engine Path They Claim to Control; applies to: TTS settings, Kokoro narration, UI truthfulness
- LL-075 — A Silky Narration Cursor Requires Canonical Audio Progress, Not More Visual Easing; applies to: renderer, narration, audio scheduling, cursor UX
- LL-076 — Rolling Planner Must Own All Chunk-Boundary Decisions; applies to: TTS, narration, generationPipeline, narrationPlanner
- LL-077 — RAF Glide Loop Must Read From a Single Canonical Progress Source; applies to: renderer, narration, audioScheduler, FoliatePageView, cursor UX
- LL-078 — A Visually Calm Narration Cursor Beats a Theoretically Precise One; applies to: renderer, cursor UX, FoliatePageView, narration
- LL-079 — Separate the Canonical Cursor Ref from Reducer State to Break Visual Contamination; applies to: renderer, narration, useNarration, cursor ownership
- LL-080 — Global Keyboard Guard Must Check Input Target, Not Modal State; applies to: renderer, keyboard, useKeyboardShortcuts, accessibility
- LL-081 — Full-Book Words and DOM-Slice Words Are Two Different Data Sources — Never Mix Indices; applies to: renderer, narration, focus mode, FoliatePageView, ReaderContainer, data integrity
- LL-082 — Fallback Values Must Be Capped to Prevent Proportional Blowup; applies to: renderer, narration, CSS, visual safety
- LL-083 — Soft Selection Uses Refs + Direct Shadow DOM Mutation, Not State; applies to: renderer, page mode, word selection, FoliatePageView
- LL-084 — Electron fetch() Is Rejected by WAF-Protected Sites — Always Provide fetchWithBrowser Fallback; applies to: main process, URL extraction, url-extractor.js, misc.js
- LL-085 — Derive Layout Values Per-Tick — Never Store Width in Animation Ref Structs; applies to: renderer, FoliatePageView.tsx, narration overlay, animation loops
- LL-086 — In Foliate, Always Measure Geometry from `foundDoc` — Not `contents[0]`; applies to: renderer, FoliatePageView.tsx, Foliate multi-document architecture
- LL-087 — Module-Scope Constants Must Be Declared Before Use — TDZ Is Silent in Test Environments; applies to: renderer, constants.ts, test setup, TypeScript module scope
- LL-088 — Parallel Doer Agents Can Produce Duplicate Exports — Verify Unique Identifiers Before Dispatch; applies to: renderer, constants.ts, multi-agent sprints, parallel task execution
- LL-089 — patch-package Fork Maintenance Pattern for Node Dependencies; applies to: TTS, dependencies, fork maintenance
- LL-090 — Verify Bug Reports Against Current Codebase Before Filing; applies to: bug triage, investigation gate, sprint planning
- LL-091 — Pre-Split Sprints With 5+ Implementation Tasks Into Waves; applies to: dispatch sizing, agent orchestration, tool budget
- LL-128 — Sprint Specs Must Verify Target File Existence Before "Create" Tasks; applies to: sprint planning, spec quality, investigation gate
- LL-093 — Effect Extraction Reduces useEffect Count but Not Total Line Count; applies to: refactoring, sprint planning, success criteria
- LL-092 — Performance Remediation Patterns for Electron + React; applies to: performance, startup, renderer, data layer, build
- LL-094 — Component Decomposition Removes ~30–40% of Lines, Not 60%; applies to: refactoring, sprint planning, success criteria
- LL-095 — Centralize URL Scheme Validation and Force Refresh on 401; applies to: main process, security, auth, cloud sync, URL handling
- LL-096 — Evaluation Tracing Must Be Explicitly Opt-In and Sink-Driven; applies to: renderer, narration, flow sync, tooling, observability
- LL-097 — Evaluation Artifact Names Must Be Deterministic for Cross-Branch Diffs; applies to: tooling, evaluation harness, release workflow
- LL-098 — Quality Gates Must Fail Fast but Still Persist Review Artifacts; applies to: tooling, release quality, evaluation governance
- LL-099 — Kokoro Readiness Must Come from an Authoritative Status Snapshot; applies to: TTS, Kokoro, renderer truth, worker lifecycle
- LL-100 — Fallback Ownership Cleanup Must Key Off React-Visible Extraction State; applies to: TTS, foliate fallback, React lifecycle, callback ownership
- LL-101 — Exact-Speed UX Can Sit Above Fixed Kokoro Generation Buckets; applies to: TTS, Kokoro, audio scheduling, release verification
- LL-102 — Contiguous Styled Fragments Must Collapse to One Logical Word; applies to: EPUB extraction, renderer, selection mapping, narration
- LL-103 — Startup Cache Warmup Must Share the Live Opening-Ramp Contract; applies to: TTS, cache warmup, startup latency, evaluation
- LL-104 — Flow-Surface Mode Guards Must Treat `narrate` and `flow` as the Same Foliate Load Surface; applies to: reader modes, Foliate load lifecycle, compatibility boundaries
- LL-105 — Universal Mode Shortcuts Must Bypass Surface-Gated Keyboard Blocks; applies to: reader modes, keyboard shortcuts, narrate
- LL-106 — Binary-Framed IPC Protocols Require a Three-Way Contract Between Main, Preload, and Types; applies to: Platform/Main Process, IPC, preload bridge, TypeScript types
- LL-107 — Stdin Command Protocol Must Use Consistent Key Name Across Language Boundary; applies to: Platform/Main Process, Python sidecar, IPC
- LL-108 — Canonical Reader Anchors Must Be Mode-Aware, Preserve Zero, and Keep Spoken Truth Separate From Visual Drift; applies to: reader modes, progress persistence, Foliate shared surface, narration truth
- LL-109 — Streaming Strategy Must Guard async IIFE Against stop() Race; applies to: TTS strategy, streaming, async IPC
- LL-110 — Stream-Finished Flush Wire Is Mandatory for Streaming TTS Strategies; applies to: TTS strategy, streaming, IPC, narration pipeline
- LL-111 — Eval Runner Manifest Must Gate Streaming Scenarios from Non-Streaming Paths; applies to: TTS eval runner, scenario manifest, streaming
- LL-113 — Test Discovery Must Ignore Scratch External Source Trees; applies to: Tests, repository hygiene, external audits
- LL-114 — Spoken Normalization Must Not Become Display Truth; applies to: TTS, segment normalization, cache identity, highlight mapping
- LL-115 — Cache Identity Must Be Data, Not a Path; applies to: TTS, disk cache, timing metadata, storage migration
- LL-116 — Audit Packaging Must Include Complete Canonical Files; applies to: governance, audit process, documentation
- LL-117 — Directory Reorgs Need a Forbidden-Scope Reference Decision Up Front; applies to: governance, repository hygiene, verification
- LL-118 — Audit Packages Must Trace Imports Bottom-Up, Not Just Features Top-Down; applies to: governance, audit process, TTS pipeline
- LL-119 — Non-Memoized Hook Return Objects Create Unstable Function Identities That Cause Render Loops; applies to: React hooks, performance, narration
- LL-120 — Shared Foliate Surfaces Need Explicit Visual Ownership per Mode; applies to: reader modes, shared surface, visual sync
- LL-121 — Compatibility Mode Aliases Are Hazardous in Runtime Hooks; applies to: reader modes, hook contracts, regressions
- LL-122 — "No Mid-Sentence Breaks" Must Be Enforced in Chunk Planner, Not UI Settings; applies to: prosody, chunk planning, narration pipeline
- LL-123 — Prosody Normalization Rules Must Respect Semantic Domains; applies to: TTS normalization, text semantics, cache identity
- LL-124 — Audio/Visual Sync Calibration Must Use End-to-End Output Reality, Not API Partials; applies to: narration timing, scheduler, audio output latency
- LL-125 — Narrate Must Stay Audio-Owned Even When Flow Shares Its Surface; applies to: reader modes, narration ownership, Foliate surface
- LL-126 — Narrate Synthesis Continuity Must Use Produced-Content Truth, Not the Cursor Twin; applies to: narration, audio scheduler, cursor sync
- LL-127 — No Instrumented Cursor Signal Sits On the Heard Word — `heardFloor` Is a Mislabeled Twin of `schedulerActiveWord`; applies to: narration, cursor sync, diagnostics
- LL-129 — Bulk transforms of hand-written docs must census label variants before dispatch; applies to: Any specification that parses or rewrites hand-written markdown governance documents (lessons, roadmap, close-outs).
- LL-131 — A dead-code census must match references, not identifiers; applies to: Any deletion or rename specification whose failure handling stops on a reference census.
- LL-132 — Child-process test fakes must emit exit asynchronously after kill(); applies to: Tests of child-process adapters and engines (MOSS/Pocket sidecars and engines, TTS-ENGINE-SHARED-1, Kokoro worker wrappers).
- LL-133 — Epic completion steps that edit charter.md must be carved out of the kickoff's prohibition; applies to: Every epic packet (charter, launch kickoff and completion protocol).
- LL-134 — Session budgets for unattended epics are overestimated; applies to: Epic sizing, deadlines and session budgets in charters and roadmap reviews.
- LL-137 — Read governance JSON and JSONL as explicit UTF-8 on Windows; applies to: Scripts and checks that read the terminal ledger, manifests, register snapshots or close-outs on Windows.
- LL-139 — Mode-separation specs must be cut from an import-graph census, not a file inventory; applies to: Spec authoring for refactors that split or move runtime code, especially the reader modes.
- LL-140 — Hear the baseline before automating parity for it; applies to: Epics and refactors that preserve user-facing behaviour; owner gates; narration and other perceptual features.
- LL-142 — A timing label is a declaration, not evidence; prove a producer by executing it against the installed artifact; applies to: TTS engines and adapters, dependency patches, provenance labels, NARRATE-REBUILD-1 Phase 0 and its charter, audit package preparation.
- LL-143 — Dry-run every acceptance gate against the prescribed edit and the base; name the shell; pass only on an exact exit code; applies to: Spec authoring, Done-when gates and reconciliation recipes, including the NARRATE-REBUILD-1 charter and its Phase 0 commands.
- LL-144 — Take a resume base from the first commit's trailer; never recompute it against the publication target; applies to: Resume and reconciliation recipes for multi-commit items, and every NARRATE-REBUILD-1 phase that commits and publishes.
- LL-145 — A coordinated audit closes only through a fresh, package-only review of the exact revisions; keep approved rulings verbatim; applies to: 3rd-party-audit cycles (D2–D5), remediation plans, and owner-decision records.
- LL-150 — A Delete-list file can carry rules for retained features: census every deleted stylesheet's selectors; applies to: Deletion and removal specs (NARRATE-REMOVE-1 and its siblings, CLEANUP-MODE-BARREL-1), any CSS consolidation, and spec-compliance review checklists.
- LL-152 — When a live owner gate is blocked by environment slowness, A/B the same actions on the base build before attributing it; applies to: Spec authoring for any item with a live smoke row, and the owner-gate steps in `/next-pointer` dispatch prompts.
- LL-154 — The Notion connector cannot build cross-relation formulas or formula view filters, and its view-mode query misreads formula-filtered views; applies to: Specifications and verification steps that create or check Notion formulas, rollups or views through the connector (work-register views, phase layers, dashboards).
- LL-155 — Verify a Notion text rewrite against the SQL plain text; rows mode is not a faithful echo of the markdown written; applies to: Specifications and runs that write text into the Notion work register through the connector (register repairs, ceremony writes of Spec Reference, Evidence and Notes), and their verification steps.
- LL-157 — Electron does not wait for an async quit listener; applies to: Specifications and fixes that touch `will-quit`, `before-quit` or `window-all-closed`, or claim data is persisted at exit.
- LL-159 — A flush at exit must drain timer-armed writes, not only writes already in flight; applies to: Quit and shutdown paths; sync and merge code that persists through debounced saves; any specification that claims data is on disk at exit (with LL-157); the LARGE-FOLDER-SYNC-1 batched-save work, which adds new deferred library writes that the quit list must cover.
- LL-160 — Word segmentation depends on the runtime's ICU, so tooling that numbers words runs under the app's runtime; applies to: Narrate, Focus and Flow tooling; saved-position tests; any harness that chooses a start word by index; Electron upgrades (re-measure the canonical book's word count, which DEPS-AUDIT-1's 41.10.7 kept at 80,493); WORD-INDEX-UNIFY-1.
- LL-161 — A correctness row about a word is checked by the word's text, not its index; applies to: Narrate and reading-mode acceptance rows; resume and handoff checks; any trace checker keyed by word index.
- LL-162 — Sweep the whole corpus offline before trusting sampled sessions, and validate every unit class the mapper accepts; applies to: Narrate reconciliation and chunking; word extraction and segmentation; import parsers; any gate whose live runs start from a fixed position.
- LL-163 — A registry alias that is renamed upstream becomes a hard refusal; map the canonical key to the populated column; applies to: `Virtuoso/workspace-layout.json` field and status mappings; plugin upgrades; snapshot imports after a mapping change.
- LL-165 — A driver must prove which profile the app opened before its first action; applies to: UI sweeps, bisects and live checks on old or packaged builds; any CDP or computer-use driver; release smoke harnesses.
- LL-168 — An NSIS install replaces an older Blurby's uninstall registration, so an install test exports both keys first; applies to: install, uninstall and upgrade checks of a packaged build (standing rule 53 (d) for packaging items); release smoke runs; the release runbook's verify step.
