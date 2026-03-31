# Roadmap Audit of the Blurby v1.4.7 Codebase Snapshot

## Audit metadata and scope

**(A) Audit Metadata**

**Date:** 2026-03-30 (America/Chicago)  
**Reviewer role:** Principal systems architect and technical program auditor (third-party posture)  
**Primary question:** Given the codebase and supporting documentation in the provided audit package, is the roadmap the right plan, in the right order, for the right reasons?  
**Audit stance:** Code is treated as the source of truth. Documentation is treated as intent and is validated against implementation. Where implementation cannot be validated because required modules are missing from the snapshot, that is treated as an audit-relevant defect in the materials.

**Scope boundaries materially affecting conclusions (evidence-grounded):**
- The snapshot is not self-contained from a runtime perspective. Multiple main-process modules require local dependencies that are absent (for example, `./main/ipc-handlers`, `./main/file-parsers`, and pervasive `./constants` and `../constants` imports). This prevents end-to-end validation of major subsystems and undermines roadmap claims tied to testability and measured behavior. (Evidence: `main.js` requires `./main/ipc-handlers` at L12 and `./main/file-parsers` at L16–L20; the referenced modules are not present in the package file inventory.)  
- The renderer side likewise references modules not present in the snapshot (e.g., several component imports inside `ReaderContainer.tsx`), constraining verification of UI-layer roadmap items involving those modules. (Evidence: the snapshot contains the import sites in the included TSX files, but the corresponding target modules are absent from the file inventory under `src/components/` and `src/hooks/`.)

## Materials reviewed

**(C) Materials Reviewed**

**Documentation**
- `docs/project/ROADMAP_V2.md` (roadmap under audit; includes phase sequencing and exit criteria). (Evidence: baseline claim and governing principle at `docs/project/ROADMAP_V2.md` L4–L5; phase definitions at L46–L237.)
- `ROADMAP.md` (current/legacy roadmap; referenced for historical posture and stated system state). (Evidence: `ROADMAP.md` L3–L6.)
- `CLAUDE.md` (standing rules and architectural constraints). (Evidence: main-process async I/O rule at `CLAUDE.md` L103–L110.)
- `docs/governance/TECHNICAL_REFERENCE.md` (architecture and feature inventory narrative).  
- `docs/governance/BUG_REPORT.md` (bug register; partially references code paths absent from snapshot). (Evidence: references to `src/hooks/narration/kokoroStrategy.ts` at `docs/governance/BUG_REPORT.md` L14–L17 while that path is absent from the snapshot inventory.)
- `docs/governance/LESSONS_LEARNED.md` (engineering discoveries and constraints).
- `docs/audit/audit-step1-initial-review.md` (prior audit report included in the package; treated as a secondary claim source and checked against code).
- `docs/audit/AUDIT_ORIENTATION.md` (orientation to the package).

**Code and configuration**
- Main process entrypoints and subsystems: `main.js`, `preload.js`, `main/*` (including `auth.js`, `sync-engine.js`, `tts-engine.js`, `tts-cache.js`, `ws-server.js`, `epub-converter.js`, `legacy-parsers.js`, IPC modules under `main/ipc/`).
- Renderer core: `src/App.tsx`, `src/components/*`, `src/hooks/*`, `src/utils/*`, `src/modes/*`, `src/contexts/*`, `src/constants.ts`, `src/types*`.
- CI/CD and build config: `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `package.json`, `vite.config.js`, `tsconfig.json`.
- Test scaffolding present in snapshot: `tests/setup.js`, and `src/test-harness/*` (note: the snapshot does not include the full test suite referenced by roadmap text).

**Inventory note**
- The package contains 72 files across the directories listed above. Several required local modules referenced by `require()`/imports are absent, which is itself a primary audit finding because it blocks verification.

## Measured benchmark and calibration status

**(D) Benchmark & Calibration Status**

**Benchmark evidence available in the snapshot is insufficient to validate roadmap “baseline” claims.**
- The roadmap asserts “860 tests” and a stable baseline as part of the v1.4.7 foundation. (Evidence: `docs/project/ROADMAP_V2.md` L4.)  
- The snapshot does not include the referenced corpus of test files; only `tests/setup.js` is present under `tests/`. This prevents independent confirmation of pass rates, flakiness, and coverage concentration claims in the roadmap and included audit report. (Evidence: `tests/setup.js` is the only file under `tests/` in the package inventory; CI expects `npm test` per `.github/workflows/ci.yml` L33–L40, but the test suite itself is not in this snapshot.)  
- Calibration constants are partially visible in `src/constants.ts` (renderer-side) and referenced widely (e.g., TTS chunk sizing and pause timings). However, the main-process calibration surface is effectively opaque because `main/*` modules repeatedly import a missing `./constants` module. (Evidence: `main/tts-engine.js` imports `{ KOKORO_SAMPLE_RATE, TTS_IDLE_TIMEOUT_MS, TTS_MODEL_LOAD_TIMEOUT_MS }` from `./constants` at L7; `main/migrations.js` imports defaults from `./constants` at L4; `main/epub-converter.js` imports conversion constants from `./constants` at L7–L11.)

**Implication for roadmap validation**
- Roadmap phases that depend on “measured” readiness, “verified foundation,” or “passing test gates” are not auditable from the provided materials. This is not a minor packaging nit; it directly undermines the roadmap’s central governance claim (“verified foundation”) because verification artifacts are missing.

## Findings by severity

**(E) Critical Findings (CRITICAL)**  
Must fix before Phase 2 work begins; otherwise Phase 2+ will be built atop an un-verifiable and mechanically broken baseline.

1) **CRITICAL — Snapshot is not buildable or end-to-end auditable due to missing required modules (system integrity failure).**  
**Why this matters to the roadmap:** Phase 1’s “re-audit until clean” process and its exit criteria presuppose a coherent, executable codebase with test gates. Here, major subsystems cannot even be instantiated from the snapshot because local dependencies referenced by the runtime are absent. This invalidates any roadmap sequencing that assumes Phase 1 can be bounded to “9 bugs” or validated largely through tests and click-through.  
**Evidence (direct code references):**
- `main.js` imports a non-existent IPC registration module: `require("./main/ipc-handlers")` at L12, then calls `registerIpcHandlers(ipcContext)` at L459, implying startup depends on that missing module.  
- `main.js` imports a non-existent parser aggregator: `require("./main/file-parsers")` at L16–L20.  
- Core subsystems depend on missing `./constants` and other absent modules: e.g., `main/tts-engine.js` L7 (`require("./constants")`), `main/migrations.js` L4 (`require("./constants")`), `main/tts-cache.js` L98 and L132 call `saveManifest()` while the module depends on missing `./tts-opus` (file import at `main/tts-cache.js` top-level is implied by the missing module list and is directly referenced in the included audit report; additionally, the encode/decode calls are visible at `main/tts-cache.js` L72–L74 and L123–L127 but cannot be validated end-to-end without the missing codec module).  
**Assessment:** The roadmap is aligned to an aspirational “complete repository” state, not to the actual snapshot’s mechanically incomplete state. As provided, the plan cannot be executed in its stated verification posture.

2) **CRITICAL — Broken IPC handler for EPUB word extraction due to incorrect context shape (`ctx.library` vs `ctx.getLibrary`).**  
**Why this matters to the roadmap:** Phase 2 and Phase 3 assume canonical EPUB rendering and reliable word extraction for narration and cursoring. A broken IPC extraction path embeds a correctness failure into narration across EPUB sections and makes “narration extracts words correctly” (Phase 2 exit criteria) unattainable without first repairing this handler.  
**Evidence:** `main/ipc/tts.js` L95–L107 sets `const doc = ctx.library?.find((d) => d.id === bookId);` at L97, but the IPC context object defines `getLibrary` and does not define `library`. (Evidence: `main.js` L384–L414 defines `ipcContext` with `getLibrary` at L388 and no `library` property.)  
**Impact:** `extract-epub-words` will frequently return “Document not found” regardless of library contents, breaking full-book extraction logic called from the renderer. (Evidence: `main/ipc/tts.js` L97–L101.)

3) **CRITICAL — Folder sync cancellation can drop partially imported state (data loss on restart).**  
**Why this matters to the roadmap:** Phase 1 stabilization explicitly scopes cloud sync and library operations. A cancellation path that abandons partial state without persisting is a “stability” failure and a data integrity hazard that must be resolved before expanding intake pipelines (Phase 2/4/5).  
**Evidence:** In `syncLibraryWithFolder`, cancellation returns before persisting updated library state: `if (syncCancelled) return;` at `main.js` L260, after having potentially built a partially updated `synced` set in the extraction loop (`main.js` L245–L258). Persistence (`setLibrary`, `saveLibrary`, broadcast) occurs only after the cancellation return point (`main.js` L273–L276).  
**Impact:** Users can trigger a cancel during extraction and lose the “already extracted in this run” docs upon restart because state never flushes at the cancellation return.

4) **CRITICAL — TTS worker “model-ready” listener leak on timeout path (unbounded handler accumulation across failed loads).**  
**Why this matters to the roadmap:** Phase 1 includes TTS stability; Phase 4/6 expansions increase background work and load behavior. A listener leak in worker lifecycle will degrade performance and reliability precisely under failure conditions (slow disk, missing model, offline), contaminating future-phase behavioral tuning.  
**Evidence:** `main/tts-engine.js` uses `Promise.race` for model readiness. The handler is removed only on success (`w.off("message", handler)`), with no cleanup on timeout rejection. (`main/tts-engine.js` L141–L155, especially L144–L151 vs. L152–L154.)  
**Impact:** Each timeout leaves a dead handler attached to the worker, causing increasing redundant invocations and memory retention across retries.

5) **CRITICAL — Silent error swallowing on TTS cache manifest persistence (corruption and invisibility of failure modes).**  
**Why this matters to the roadmap:** Phase 4 and Phase 6 rely on cache-related metadata being reliable and synchronizable. If manifest persistence errors are swallowed, the system can drift into inconsistent cache states that future phases will treat as “ground truth.”  
**Evidence:** `main/tts-cache.js` explicitly swallows manifest write errors in multiple paths: `saveManifest().catch(() => {});` at L98 and at L132. The L132 occurrence is in the corruption-recovery path after decoding failure (`main/tts-cache.js` L128–L134).  
**Impact:** Disk full, permission errors, or partial writes can silently desynchronize manifest state from disk contents.

6) **CRITICAL — EPUB full-book word extraction in the renderer uses stale captured indices (race condition across async boundary).**  
**Why this matters to the roadmap:** Phase 2 exit criteria includes “narration extracts words correctly.” The current approach can compute a wrong global word index if the user advances or narration advances during the IPC request, creating persistent cursor/audio mismatch.  
**Evidence:** In `src/components/ReaderContainer.tsx`, the effect captures `highlightedWordIndex` into `localIdxBeforeExtraction` at L351–L352, then after an async `api.extractEpubWords(activeDoc.id)` resolves, computes `globalIdx = currentSection.startWordIdx + localIdxBeforeExtraction` at L383–L386. The effect dependencies explicitly omit `highlightedWordIndex` and disable exhaustive deps (`ReaderContainer.tsx` L394–L395).  
**Impact:** Narration can resync to an incorrect index, producing desynchronized highlight and speech position under normal interaction.

7) **CRITICAL — Background TTS cacher can generate cache audio for the wrong voice due to missing dependency wiring.**  
**Why this matters to the roadmap:** Phase 4 introduces per-document cache controls and Phase 6 introduces syncing of cache opt-in flags. Generating cache content under a stale voice selection makes cache semantics incorrect and undermines “cache correctness” as a stable foundation.  
**Evidence:** The background cacher effect reads `settings.kokoroVoice` via `getVoiceId: () => settings.kokoroVoice || "af_bella"` at `src/components/ReaderContainer.tsx` L269–L270, but the effect dependency array is `[settings.ttsEngine, settings.ttsCacheEnabled]` at L280.  
**Impact:** Voice changes will not restart the cacher; cache keys may be mismatched to user expectations and can cause incorrect voice playback on cache hits.

**(F) Major Findings (MAJOR)**  
Should be addressed within Phase 1 if Phase 1 is truly “stabilize first,” because these are either security correctness, systemic reliability, or scaling hazards.

1) **MAJOR — OAuth redirect capture does not validate `state` (CSRF/session-mixup risk).**  
**Roadmap linkage:** Phase 6 expands sync scope and depends on robust authentication flows. Missing state validation is a known class of OAuth client vulnerability and is out of alignment with best current practice.  
**Evidence (code):** `main/auth.js` captures `code` from the redirect URL and resolves it without validating a stored/request-correlated state value (`main/auth.js` L308–L340; extraction at L313–L321 and L328–L338). No `state` param is read or checked in this handler.  
**External standard basis:** OAuth guidance describes `state` as a CSRF protection and request/response correlation mechanism (entity["organization","IETF","internet standards body"], 2012, `https://datatracker.ietf.org/doc/html/rfc6749`; also updated best current practice in RFC 9700 (IETF, 2025, `https://datatracker.ietf.org/doc/rfc9700/`). citeturn0search0turn0search1  
**Assessment:** The roadmap’s sequencing (sync hardening later) is reasonable, but Phase 1 should include this hardening because auth is a prerequisite to reliable cross-device state work.

2) **MAJOR — WebSocket extension pairing token is persisted in plaintext settings state.**  
**Roadmap linkage:** Phase 5 expands extension capabilities (“Read Later”) and increases threat surface. If pairing tokens are stored in plaintext, local compromise allows unauthorized pairing and content injection.  
**Evidence:** `main/ws-server.js` restores or creates a pairing token and stores it directly in settings: `settings._wsPairingToken = _pairingToken; ctx.saveSettings();` at L301–L309.  
**Assessment:** This is aligned with “security hardening” work and should be pulled into Phase 1 if the extension is in active use.

3) **MAJOR — Systematic “fire-and-forget” with error swallowing in sync operation queue enqueues.**  
**Roadmap linkage:** Phase 6’s core promise is “no data loss on concurrent edits.” Silent loss of queued operations is precisely the class of failure Phase 6 claims to mitigate, but the current code can already lose operations invisibly.  
**Evidence (representative):**
- Add-doc enqueue swallow: `syncQueue.enqueue("add-doc", ...).catch(() => {});` at `main/ipc/library.js` L39–L41.  
- Delete-doc enqueue swallow: `main/ipc/library.js` L92–L94.  
- Update-progress enqueue swallow: `main/ipc/documents.js` L24 (and reset-progress at L41–L42).  
- Update-settings enqueue swallow: `main/ipc/state.js` L31.  
**Assessment:** Phase 6 cannot credibly harden sync until Phase 1 removes silent failure patterns and establishes auditable failure reporting.

4) **MAJOR — Synchronous filesystem call violates stated engineering constraints and risks UI stalls.**  
**Roadmap linkage:** Phase 1 stabilization should reconcile code with standing rules to prevent recurring regressions.  
**Evidence:** `fs.mkdirSync(_dataPath, { recursive: true });` at `main.js` L42, despite the documented rule “All file I/O in main process modules must be async.” (Evidence: `CLAUDE.md` L103–L104.)  
**Assessment:** This is a small localized fix, but it is a governance-alignment defect and should be corrected early to maintain consistency.

5) **MAJOR — Audio scheduler retains `onended` closures per AudioBufferSourceNode; stop path does not clear handler.**  
**Roadmap linkage:** Phase 1 includes TTS and narration stability; Phase 4 increases background caching and long-lived sessions. Even if the leak risk is modest, a long-session degradation becomes user-visible in precisely the “narration-first” product identity.  
**Evidence:** `src/utils/audioScheduler.ts` assigns `source.onended = () => { ... }` at L229–L239 and `stop()` clears `activeSources` but does not null out `source.onended` prior to disconnect/stop (`audioScheduler.ts` L270–L281).  
**Assessment:** This is a resource lifecycle hygiene issue. It becomes more important as the roadmap increases concurrent audio/caching workloads.

**(G) Moderate Findings (MODERATE)**  
Address in the next planning cycle or opportunistically during Phase 1, especially when touching adjacent modules.

1) **MODERATE — Foliate progress uses both state and ref as “authoritative,” enabling transient divergence across batched state updates.**  
**Roadmap linkage:** Phase 6 aims to sync progress and settings with field-level timestamps. A progress representation that is not single-source-of-truth increases the risk of persisting contradictory values and makes conflict resolution harder.  
**Evidence:** `foliateFractionRef` and `foliateFraction` are set together in `ReaderContainer.tsx` (`foliateFractionRef.current = fraction; setFoliateFraction(fraction);` at L807–L810). `useProgressTracker.ts` uses `foliateFractionRef.current` for `savePos` in `finishReading` at L129–L134, while UI generally renders from state.  
**Assessment:** Consolidating authoritative progress representation reduces downstream sync complexity.

2) **MODERATE — Unbounded growth of scheduled word-boundary timeline in audio scheduler.**  
**Roadmap linkage:** Flow mode redesign and richer “Readings” features can increase long-session usage. An O(n) scanning timeline per tick is a latent performance slope.  
**Evidence:** `currentWordBoundaries.push(...boundaries);` at `src/utils/audioScheduler.ts` L218–L221 with no pruning until `stop()` resets (`audioScheduler.ts` L275–L277).  
**Assessment:** Not necessarily blocking, but should be addressed before Phase 4+ increases caching and continuous narration.

**(H) Minor Findings & Nits (MINOR, NIT)**  
Low severity; include mainly where they cause documentation drift or complicate auditing.

- **MINOR — The roadmap and governance documents make test-suite and completeness claims that are not verifiable from this snapshot.**  
Evidence is structural: the snapshot lacks the files implied by its own import graph and lacks the test corpus required by its CI configuration. (Evidence: `.github/workflows/ci.yml` L33–L40 vs. package inventory under `tests/`; additionally, `docs/project/ROADMAP_V2.md` L4 makes test count assertions.)  
- **NIT — The roadmap text is truncated with ellipses in several key acceptance-criteria lines, making it harder to treat as an executable spec from a third-party perspective.**  
Evidence: Phase exit criteria lines contain literal ellipses, e.g., `docs/project/ROADMAP_V2.md` L76–L77 and L82–L85.

## Documentation-code drift register

**(I) Documentation–Code Drift Register (specific divergences)**

1) **Roadmap baseline claims vs snapshot verifiability**  
- **Claim:** “Baseline: v1.4.7 — 860 tests, 43 files…” (Evidence: `docs/project/ROADMAP_V2.md` L4.)  
- **Code/package reality:** The snapshot does not include the test corpus, and the code import graph is incomplete (missing required modules), blocking independent validation of “passing baseline.” (Evidence: `.github/workflows/ci.yml` L33–L40 requires `npm test`; `tests/` in snapshot contains only `tests/setup.js`; `main.js` L12 and L16–L20 reference missing modules.)

2) **Phase 5 roadmap references vs included code**  
- **Claim:** Phase 5 describes “Existing URL extractor (`main/url-extractor.js`) already handles Readability + PDF export.” (Evidence: `docs/project/ROADMAP_V2.md` L165–L170.)  
- **Code/package reality:** IPC code requires `../url-extractor`, but the referenced module is absent, so Phase 5’s premise cannot be verified and may not be true in this snapshot. (Evidence: `main/ipc/misc.js` imports from `../url-extractor` at L12; the file `main/url-extractor.js` is not present in the snapshot inventory.)

3) **Bug report references vs included code layout**  
- **Claim:** Bug report references `src/hooks/narration/kokoroStrategy.ts`. (Evidence: `docs/governance/BUG_REPORT.md` L14–L17.)  
- **Code/package reality:** The `src/hooks/narration/` directory structure is not present in the snapshot; narration logic is centralized in `src/hooks/useNarration.ts`. This suggests documentation drift or snapshot truncation. (Evidence: snapshot inventory includes `src/hooks/useNarration.ts` and does not include `src/hooks/narration/*`.)

4) **Included audit report claims vs current code in this snapshot**  
- **Claim (audit report):** A major narration crash due to missing null checks on `onWordAdvanceRef.current(...)`.  
- **Code snapshot reality:** `useNarration.ts` guards these calls with `if (onWordAdvanceRef.current) ...` at multiple sites. (Evidence: `src/hooks/useNarration.ts` L229–L235.)  
- **Interpretation:** Either the audit report references a different commit state than the snapshot, or it contains at least one incorrect attribution. This matters because Phase 1 exit criteria depends on audit correctness.

## Roadmap sequencing assessment and recommended changes

**(J) Recommended Sequencing Changes (reordering with rationale)**

**Verdict on phase ordering (high level):** The phase order “Stabilization → Canonical EPUB pipeline → Flow redesign → Readings/queue → News ingestion → Sync expansion → Mobile wrapper” is directionally coherent, because it reduces format multiplicity before major UI rework and delays sync scope expansion until after new state types exist (Evidence: `docs/project/ROADMAP_V2.md` L80–L217). However, it is not executable as written against this snapshot because Phase 1 omits a prerequisite “repository integrity and verification gate,” and several Phase 2+ dependencies currently cannot even be exercised.

**Proposed sequencing adjustments (concrete):**

1) **Insert Phase 0 (or Phase 1A): Repository integrity and auditability gate (blocking).**  
**Rationale:** A stabilization phase that cannot run, test, or load key modules is not a stabilization phase; it is a reconstruction phase. Without restoring missing local modules and test artifacts (or providing a complete snapshot), Phase 1 exit criteria are not meaningful.  
**Evidence driving the reorder:** `main.js` loads missing modules at L12 and L16–L20; major subsystems require missing `./constants` (e.g., `main/tts-engine.js` L7; `main/migrations.js` L4; `main/epub-converter.js` L7–L11). Phase 5 depends on a URL extractor module that is missing (`main/ipc/misc.js` L12).  

2) **Expand Phase 1 scope beyond the “known open bugs” list and bind exit criteria to audited CRITICAL/MAJOR defect closure.**  
**Rationale:** The current Phase 1 known-bug list is UI-centric and does not cover infrastructure failures (broken IPC handler, data-loss cancellation, silent error swallow patterns, OAuth hardening). These failures are precursors to downstream phases and will be amplified if left unresolved.  
**Evidence:** Phase 1 known bugs list in `docs/project/ROADMAP_V2.md` L66–L74 does not mention the broken EPUB extraction handler (`main/ipc/tts.js` L95–L103) nor the cancellation persistence bug (`main.js` L245–L276). The Phase 1 exit criteria is truncated and does not explicitly include code-audit closure mechanics beyond “re-audit passes” (`docs/project/ROADMAP_V2.md` L76).

3) **Within Phase 1, reorder work by dependency risk: correctness/data integrity → observability of failures → resource lifecycle → security hardening → UI polishing.**  
**Rationale:** Phase 2 relies on word extraction, ingestion, and content fidelity. Any silent error patterns or data-loss hazards will pollute Phase 2’s foundational artifacts (converted EPUBs, cached audio, synced metadata).  
**Concrete ordering tied to evidence:**
- Fix correctness/data integrity first: broken EPUB IPC extraction (`main/ipc/tts.js` L95–L103; `main.js` L384–L414), cancellation persistence (`main.js` L245–L276).  
- Remove silent failure patterns next: manifest save swallow (`main/tts-cache.js` L97–L99, L129–L133); sync queue enqueue swallows (`main/ipc/library.js` L39–L41; `main/ipc/documents.js` L24, L41; `main/ipc/state.js` L31).  
- Then address resource lifecycle and races: TTS handler cleanup (`main/tts-engine.js` L141–L155); renderer stale closure and dependency issues (`ReaderContainer.tsx` L351–L386, L269–L280).  
- Then security hardening: OAuth state handling (`main/auth.js` L308–L340) and pairing token storage (`main/ws-server.js` L301–L309). External basis for prioritizing OAuth state: RFC guidance (IETF, 2012, `https://datatracker.ietf.org/doc/html/rfc6749`; IETF, 2025, `https://datatracker.ietf.org/doc/rfc9700/`). citeturn0search0turn0search1  

4) **Defer Phase 7 (APK) from the mainline sequence until a credible “shared core” boundary exists.**  
**Rationale:** The roadmap claims substantial sharing (reading modes logic, Kokoro ONNX TTS, foliate-based rendering) (Evidence: `docs/project/ROADMAP_V2.md` L224–L233), but the current implementation is deeply coupled to Electron main-process facilities (worker threads, Node module resolution hacks, Electron IPC). This is likely aspirational without an explicit modularization phase.  
**Evidence:** The Kokoro worker contains Electron/Node-specific workarounds including module path overrides and worker thread assumptions (`main/tts-worker.js` L5–L37). Auth and sync rely on Electron BrowserWindow and Node libraries (`main/auth.js` L294–L304; sync engine initialization is main-process driven at `main.js` L453–L459).  
**Conclusion:** Phase 7 as currently defined is not “the next step after sync hardening,” it is “a separate productization program” that requires earlier architectural extraction work not stated in the roadmap.

## Scoring rubric and references

**(K) Scoring Rubric (1–10; justification grounded in evidence above)**

1) **Roadmap sequencing correctness:** **6/10**  
The macro-ordering is conceptually coherent (format unification before UI redesign; new state before sync expansion) (Evidence: `docs/project/ROADMAP_V2.md` L80–L217). Deduction because the roadmap omits a prerequisite integrity/auditability gate despite the snapshot being mechanically incomplete (Evidence: `main.js` L12, L16–L20; pervasive `./constants` imports like `main/tts-engine.js` L7).

2) **Benchmark alignment:** **3/10**  
The roadmap leans on a “verified foundation” baseline (Evidence: `docs/project/ROADMAP_V2.md` L4–L5), but the benchmark artifacts and test corpus are not available in the provided snapshot, preventing alignment checks and turning benchmark claims into unauditable assertions.

3) **Technical debt awareness:** **5/10**  
The roadmap correctly prioritizes stabilization first (Evidence: `docs/project/ROADMAP_V2.md` L48–L60), but it substantially under-scopes stability debt by focusing primarily on a short bug list (Evidence: L66–L74) while the code shows systemic silent-failure patterns and core correctness issues (Evidence: `main/tts-cache.js` L97–L99; `main/ipc/library.js` L39–L41; `main/ipc/tts.js` L95–L103).

4) **Documentation quality:** **6/10**  
Structure is strong (phases, dependencies, exit criteria) (Evidence: `docs/project/ROADMAP_V2.md` L9–L237). Deduction due to (a) truncated acceptance criteria lines with literal ellipses (Evidence: L76–L85) and (b) drift between docs and included code structure (Evidence: `docs/governance/BUG_REPORT.md` L14–L17 vs snapshot inventory).

5) **Architectural fitness for planned evolution:** **6/10**  
The current architecture separates main/preload/renderer and uses IPC boundaries (Evidence: `preload.js` L3–L27 and event subscription patterns at L130–L196), which is compatible with the planned pipeline-first approach. Deduction because the “shared core” premise for Phase 7 is not substantiated by present coupling patterns (Evidence: `main/tts-worker.js` L5–L37; `main/auth.js` L294–L304).

6) **Test coverage adequacy (for critical paths):** **2/10**  
Not because tests necessarily do not exist in the real repository, but because they are not present in the snapshot needed for an evidence-based audit. The absence blocks verification of critical paths like sync, auth, conversion, and UI behaviors against the roadmap’s exit criteria.

7) **Delivery practicality:** **4/10**  
Phase estimates (2–3 sprints, etc.) may be plausible in a complete repo, but are not credible against a snapshot that cannot be executed end-to-end and contains blocking correctness defects in Phase 1–2 prerequisites (Evidence: missing module imports at `main.js` L12 and L16–L20; broken EPUB IPC extraction at `main/ipc/tts.js` L95–L103; cancellation persistence at `main.js` L245–L276).

8) **Overall confidence:** **4/10**  
The roadmap’s conceptual direction is reasonable, but the provided code snapshot does not support confident execution without first restoring repository integrity and removing foundational correctness and observability failures.

**References (APA style; URLs included in parentheses as code)**  
- entity["organization","IETF","internet standards body"]. (2012). *RFC 6749: The OAuth 2.0 Authorization Framework*. (`https://datatracker.ietf.org/doc/html/rfc6749`). citeturn0search0  
- entity["organization","IETF","internet standards body"]. (2025). *RFC 9700: Best Current Practice for OAuth 2.0 Security*. (`https://datatracker.ietf.org/doc/rfc9700/`). citeturn0search1  
- Electron. (n.d.). *Security*. (`https://electronjs.org/docs/latest/tutorial/security`). citeturn0search14  
- Electron. (n.d.). *Context Isolation*. (`https://electronjs.org/docs/latest/tutorial/context-isolation`). citeturn0search2  
- entity["organization","OWASP","security nonprofit"]. (n.d.). *OAuth 2.0 Cheat Sheet*. (`https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html`). citeturn0search21