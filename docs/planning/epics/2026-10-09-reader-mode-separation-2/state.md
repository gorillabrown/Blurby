---
epic: reader-mode-separation-2
last_updated: 2026-10-09 01:30 (host clock)
updated_by: session 1
---

# State — single source of current truth

<!-- Rewrite freely; keep under ~80 lines. History belongs in journal.md; the route in
     plan.md; the contract in charter.md. Never end a work burst with this file stale. -->

## RESUME PROTOCOL — no memory of this epic? Do this first, in order

0. **Authoritative copy.** The packet you must read and write lives at
   `C:\Projects\Blurby\.worktrees\reader-mode-separation-2\docs\planning\epics\2026-10-09-reader-mode-separation-2`.
   If you are reading any other copy (the primary checkout's is a frozen launch snapshot),
   and that path exists with a journal entry S1 or later, switch to it now. If it does not
   exist yet, run the bootstrap in your kickoff prompt first, then switch.
1. Read charter.md (the contract), then plan.md (the route), then all of this file, then
   the **last** entry of journal.md.
2. Distrust, then verify: these files are MEMORY; the repo/system is REALITY. Run the
   cheapest check that confirms "Where we are" below (usually the current phase's
   exit-gate command). On conflict: believe reality, fix this file, journal the correction.
3. **Stop signals and finalization:**
   - `done.md` exists here → the epic is finished. Do no work; re-verify its claims and report.
   - `verified.md` exists but `done.md` does not → **resume finalization** (launch.md →
     *Completion and finalization*) at the first stage not marked done in the Finalization
     block below. Check reality first: `git fetch origin`, then if
     `git show refs/remotes/origin/main:docs/planning/epics/2026-10-09-reader-mode-separation-2/done.md`
     succeeds, F3 already published; go to F4. Between F1 and F4, progress and blockers live in the
     untracked `finalization-log.md` here (read it first if present), never in this file.
4. If `last_updated` above is older than the newest journal entry, trust the journal and
   repair this file before working.
5. Append a session-start entry to journal.md, then continue from "Next actions".

## Where we are

```
phase:        P4 — Wave C (Flow). Wave B gate PASS 5a34f6e1
next_action:  Wave C (Flow): C1 Flow tree → C2 isolation pairs (page/focus/flow) → C3 throwing audio → C4 gate (worker) → review → implement contracts/ports + G1/G2/G3 scaffolding → Page → Focus
blockers:     OS-1 (combined owner session: B0 listening + G6 + speed-dialog check) — gates D1, D7 and finalization only
session:      1 of ~14 budgeted
dod:          D1 unmet (automated half PASS; owner half → OS-1) | D2–D9 unmet
```

## Next actions — max 5, near horizon only

1. [x] Bootstrap: I = `92dda255`, pushed (S1)
2. [x] Packet files + `verified.md`/`done.md` registered in `E/paths.json` → `epicPacketPaths`
3. [x] B0 rebuilt and validated → `admission/baseline-build-rebuild.json` (byte-identical to the original 21 files)
4. [x] Harness guards (A7) → W path + exact-set B0 check; dry check with negative controls; lessons re-read
5. [x] A1-R PASS 7/8 (`admission/isolation.json`, 5f0608b6); A2 PASS 10/20 (`admission/flow-reproduction.json`, 2529a921)
6. [x] Census integrated (63b10115); G4 fixtures recorded and independently re-verified 5/5 (c61bca67)
7. [x] A3 automated matrix 28/35 (`admission/g0-matrix.json`, 277967b3)
8. [x] Q-A..Q-G settled (Decision log #10)
9. [ ] After B1 is answered: set `baseline.json` → `admission: PASS` (with B0 fresh-run figures and owner observer), then Monday Queued → In Flight (handshake), then Wave B

## Finalization — stages (launch.md); mark each with date + evidence

```
F1 verified.md committed + pushed:   no
F2 integration merge tested:          no   (attempt #: 0)
F3 published to origin/main:          no
F4 run branch fast-forwarded:         no
F5 done.md present here:              no
```

## Working set — verified facts this epic relies on

| Fact | Value | Verified how / when |
|------|-------|---------------------|
| Repository | `C:\Projects\Blurby` (moved from `C:\Users\estra\Projects\Blurby`; CLAUDE.md's "Local-first" line still names the old path) | `git worktree list`, 2026-10-09 |
| Run worktree | `C:\Projects\Blurby\.worktrees\reader-mode-separation-2`; relinked by `git worktree repair` | S1 |
| Run branch | `eb/reader-mode-separation-2` on origin (lowercase). Locally the loose ref lives under `.git/refs/heads/EB/` (Windows case), so push with `git push origin HEAD:refs/heads/eb/reader-mode-separation-2` | S1 |
| **I** | `92dda255bfad4395600a4371f0406f0f55c92899` (merge of origin/main `aafbb1c9`) | S1, pushed |
| **B0** | `C:\Projects\Blurby-artifacts\rms2-baseline-build\` (21 files, byte-identical to the original manifest); source checkout retained at `C:\Projects\Blurby-artifacts\rms2-b0-checkout` (detached worktree @ `1e5485c6`) | `admission/baseline-build-rebuild.json`, S1 |
| S, F | not yet | — |
| Production inputs in W | Equal to `1e5485c6` (src tree `0c790075` at I); Electron main runs from W during G0 | S1 |
| KF-1 (known flake) | `tests/qwenStreaming.test.js`: load-dependent unhandled rejection (`stream-timeout`, `main/qwen-streaming-engine.js`) after the test ends → `npm test` exit 1 with 0 failed tests. 1 of 3 full B0 runs; 0 of 3 isolated. Watch at D6 | S1 |
| B0 skipped count (D6 bound) | 133 tests / 1 file | `baseline-build-rebuild.json` |
| `policy.git` | `push`, networkOperations `allow`, template `eb/{item-id}`; on `main` since 56c97e44 | registry, 2026-10-09 |
| Git gotcha | The repo root has a directory `main/` (Electron main process), so a bare `main` in git is ambiguous. Always write `refs/heads/main` / `refs/remotes/origin/main` | `git ls-files`, 2026-10-09 |
| Test noise | `npm test` rewrites tracked `tests/perf-baseline-results.json`; never stage it, and never run the suite in the primary checkout | `tests/perf-baseline.test.ts:385`, 2026-10-09 |
| Toolchain | node v24.14.0, npm 11.9.0; `gh` logged in (account gorillabrown) | commands, 2026-10-09 |
| G0 automated baseline (historical) | 2026-09-23 on `1e5485c6`: 210 files / 3,058 passed / 133 skipped. To be re-run on B0 | `baseline.json` |
| Old baseline archive | `%TEMP%\blurby-separation2-baseline-build-20260923T212830157Z`: 0 of 21 files left. `admission/baseline-build.json` preserved, unchanged | 2026-10-09 |
| Harness guards | Updated to `C:/Projects/Blurby/.worktrees/reader-mode-separation-2`; the launcher checks the served build against `baseline-build-rebuild.json` as an exact set; pinned-source checks kept | dry check + negative controls, S1 |
| Failed A1 profile (preserve) | `C:\Users\estra\AppData\Local\Temp\blurby-reader-mode-separation-2-a1-20260923214002764` | `isolation.json` |
| Live profile (never write) | `C:\Users\estra\AppData\Roaming\blurby\blurby-data\{library,settings,sync-queue}.json` | `isolation.json` |
| Test document | Meditations EPUB SHA-256 `8be2ab1e…6c2beb` = `resources/sample-meditations.epub` | Issue `-2`, 2026-09-23 |
| Renderer start order | Unpackaged Electron needs Vite running first, or the window is blank | Issue `-2` |
| A1 failure facts | `executeJavaScript` returned `window` (not cloneable; fixed in test-only `30b72291`); EPIPE at `main/tts-engine.js:17` `console.error` when the stdout/stderr pipe closed (hypothesis) | Issue `-2` |
| Monday item | 13119306772, **In Flight**, Seq 1, Started 2026-10-09 | connector readback 2026-10-09T06:52Z; recovery 20261009T060910Z-external-set-status-READER-MODE-SEPARATION-2 confirmed |

## Blockers

- **B1 → OS-1 (re-sequenced, Decision #13).** The owner's B0 listening checklist is taken in the combined owner session OS-1 before F1. It no longer blocks Waves B–E or the speed dialog. Still gates: D1, D7, F1–F5.
  - **Exact ask:** run `docs/planning/roadmap-reviews/reader-mode-separation-2/g0-owner-checklist.md` (about 20 minutes, headphones). Fill `g0-owner-observations.json` (11 items: H1–H8 heard audio on the EPUB and the converted non-EPUB, V1–V3 visual).
  - **Why owner:** heard-audio claims require a human observation (SRL-070, LL-124/126/127). The harness cannot hear, and the synthetic wheel / Next-chapter cases did not reproduce user input.
  - **Answer:** _(write "done" here after filling the observations file)_
  - **Blocks every open front.** Open fronts, all blocked on B1:
    - F2 owner half of G0;
    - F3 `admission: PASS` / D1;
    - F9 Monday In Flight;
    - F10 G1/G2/G3 test files;
    - F11 contract/port types and broker;
    - F12 Waves B–E (and S);
    - F13 G6 evidence validator;
    - F14 speed dialog (F);
    - F15 D2–D9 verification and finalization F1–F5;
    - F17 supporting loopback audio capture (charter A6). It is supporting evidence only and cannot substitute for the owner observation (SRL-070), and it is best taken during the owner session.
  - Fronts F1, F4–F8 and F16 are complete or staged, not open.
  - No other unblocked work exists: pre-G0 writes are limited to census, evidence, fixtures and harness under `E/`, and all of those are done.

## Front disposition — every front, with its status and the clause that gates it (S1)

| # | Front | Status | Gate / authority |
|---|---|---|---|
| F1 | G0 automated half (A1-R, A2, A3 matrix) | DONE | `isolation.json`, `flow-reproduction.json`, `g0-matrix.json` |
| F2 | G0 owner half (heard audio + residual live checks) | BLOCKED — B1 | Owner gate (charter Escalation: owner gates; SRL-070) |
| F3 | `baseline.json` → `admission: PASS` (D1) | BLOCKED — B1 | D1 requires the owner observation and the observer named |
| F4 | Wave A census, ownership, dependencies | DONE | 63b10115 |
| F5 | G4 behavior fixtures | DONE | c61bca67 (re-verified 5/5) |
| F6 | `verification.json` (B0, I recorded; S, F pending) and `test-migration.json` (planned substitutions + Q-F rule) | DONE (S1d) | evidence under `E/` (pre-G0 allowed) |
| F7 | Pre-Wave-B scope rules Q-A..Q-G; KF-1 decision table | DONE | Decision log #10, #11; staging fold-ins 3, 5 |
| F8 | OBS-A3-2 classification (read-only) | DONE — cross-owner (b), Decision #12 | read-only diagnosis, S1 |
| F9 | Monday Queued → In Flight | DONE — In Flight 2026-10-09 (handshake: plan → connector → confirm; readback status "In Flight", Seq 1, Started 2026-10-09; label "In Flight" created to match registry statusMappings) | Charter grant: transition "once D1 passes" |
| F10 | G1/G2/G3 test files (`tests/readerModeBoundaries.test.ts`, `readerModeOwnership`, `readerModeIsolation`, `readerModes/*.contract`) | OPEN (Decision #13) | Pre-G0 write scope is limited to census, evidence, fixtures and harness under `E/` (charter Constraints; amendment 2026-10-09 item 4). G2/G3 also need the contract/port types, which item 4 moves to the start of Wave B |
| F11 | Contract/port types and broker (`ReaderModeAdapter.ts` extension, `ReaderDocumentSnapshot.ts`, `ReaderPorts.ts`, `createReaderPorts.ts`) | OPEN (Decision #13) | Amendment item 4: start of Wave B; no `src/` before D1 |
| F12 | Waves B (Page, Focus), C (Flow), D (Narrate), E (removal, S) | OPEN (Decision #13) | Waves serial after G0 (charter Constraints; SRL-089) |
| F13 | `scripts/check_reader_mode_evidence.mjs` (G6 validator) | OPEN (Decision #13) | Wave E deliverable. `scripts/` is a pinned production input of the G0 harness: a new file there makes the launcher refuse ("Untracked production inputs present") while G0 is open |
| F14 | Speed dialog (→ F) | OPEN (Decision #13) | Only after S (amendment 2026-09-23 speed dialog) |
| F15 | D2–D9 verification, F1–F5 finalization | BLOCKED — B1 | Need F; finalization follows verified.md |
| F16 | Lessons and governance fold-ins | STAGED | Staging memo fold-ins 3–5; applied by `/pointer-closeout` (worktree prohibition) |
| F17 | Supporting loopback audio capture (charter A6) | BLOCKED — B1 | Supporting only; heard audio is an owner gate (SRL-070); take it during the owner session |

## Scope questions Q-A..Q-G — RESOLVED 2026-10-09 (Decision log #10; staging fold-in 3; issue `Issue.READER-MODE-SEPARATION-2-S1.2026-10-09.md`). Wave B instruction:

```
Wave B (after D1): apply Q-A..Q-G per staging fold-in 3 — mirrored layout without TextView.tsx; App.tsx untouched
(useReader/ReaderView originals kept only for it; no mode imports them); narration.ts runtime = TTS infra, copy
findSectionForWord per mode; constants.ts shared-immutable; diagnostics via write-only broker port; extraction cache
behind document port; per-mode owner needs privateCopiesFor; G4 compares baseline minus the recomputed cross-owner
set (audio.* with neither mode before nor after = narrate), stored flags must equal recomputed, candidate emits zero;
OBS-A3-1 governed by G3 (expect 7); classify OBS-A3-2 read-only against Focus's own snapshot (2 attempts, then issue).
```

Original questions (for reference):

- Q-A. Non-EPUB views (`PageReaderView`, `ScrollReaderView`, `FlowText`, `VirtualScrollText`, `PausedTextView`, `FlowCursorController`) are dead in production (not rendered; tree-shaken). Copying them into each mode's `TextView.tsx` copies dead code. Options: retire them in Wave E, or copy them as the spec says.
- Q-B. `src/App.tsx` runs a standalone reader window with its own `useReader` / `ReaderView` / `useReaderKeys`. App.tsx is not an edit site, so Wave E cannot prove the legacy Focus entry points are absent without amending scope.
- Q-C. `src/types/narration.ts` exports runtime code (`narrationReducer`, `findSectionForWord`), not only types.
- Q-D. The allowed-shared categories have no slot for `src/constants.ts` or the diagnostics modules (`narrateDiagnostics.ts` holds process-global mutable state). `useNarrationCaching.ts` holds a module-level extraction cache that feeds all modes; the census places it in the document port.
- Q-E. The census added owner value `per-mode` (with `privateCopiesFor`) for resources in code that every mode copies.
- Q-F. G4 byte-for-byte vs G6 "cross-owner effects must be zero": the G4 fixtures tag today's cross-owner audio calls (`crossOwner: true`; Flow 35, Focus 30, Page 6, Narrate 0). G4 needs an approved rule: drop the tagged effects, assert that none remain, compare the rest.
- Q-G. Baseline observations that later gates must treat explicitly: OBS-A3-1 (Narrate→Page highlight on word 0 while the persisted anchor is 7), OBS-A3-2 (Focus→Page readback 209), OBS-A3-3 (same-Page emits `audio.stop`), Flow resume = cold restart (fixture), warming start → next press resumes (fixture), Narrate→Page stops audio twice (fixture). Preserve them as baseline, or class them as cross-owner effects to remove?
- Source: `dependencies.json`, `ownership.json` (`census/`, 63b10115). Key couplings: shared `highlightedWordIndex` / anchors; one `FoliatePageView` for all modes; `createInstance` clears Narrate's truth subscription; Narrate starts through `startFlow`.

## Decision log — append; never silently re-litigate

| # | Date | Decision | Why | Charter authority |
|---|------|----------|-----|-------------------|
| 1 | 2026-10-09 | Run on the existing branch `eb/reader-mode-separation-2`; bring the spec in by merging `origin/main` (`--no-ff`), not by rebasing | Preserves the 2026-09-23 evidence commits | Owner, at scaffold |
| 2 | 2026-10-09 | Pre-launch amendment: authoritative packet in the run worktree; staged finalization; pre-G0 no `src/`; no implementation-wave action ceiling; B0 rebuild policy; identities B0/I/S/F | Adversarial review of the packet (8 findings) | Owner, ROADMAP amendment 2026-10-09 |
| 3 | S1 | Push the run branch with the explicit refspec `HEAD:refs/heads/eb/reader-mode-separation-2` | Local loose ref enumerates as `EB/…` (case-insensitive FS); the named push fails | Grant: pushing the run branch |
| 4 | S1 | Launch Q2/A5 answered yes | Owner set `/goal` and said "proceed without my approval overnight" | Owner message, S1 |
| 5 | S1 | B0 validation PASS despite run-1 `npm test` exit 1 | Exit 1 came from KF-1 (0 failed tests); runs 2–3 exit 0 with identical counts; artifacts byte-identical; no identity, input or behavior difference, so the rebuild-policy trigger ("failed validation") is explained, not met | Charter grants (rebuild B0); escalation trigger evaluated |
| 6 | S1 | A1-R runs as one driver script `admission/a1r-run.ps1` (test-only, registered) | Keeps preview restart, Hidden launch with redirects, capture, graceful close, preview stop and hash checks inside the 8-call budget | Grant: test-only harness under `E/` |
| 7 | S1 | A1-R PASS with OBS-A1R-1 (Kokoro warm-up load error 13) classified as neither isolation nor write-path | Path inside the profile; downloaded model byte-identical to the installed one (SHA-256 `04cf570c…`); live profile unchanged | Amendment 2026-10-08 A1 criteria, evaluated mechanically |
| 8 | S1 | A2 PASS on the EPUB; the legacy inline text fixture is a fixture gap, not a Flow defect | B0 renders every readable doc through foliate ("all docs should be EPUB since EPUB-2B"); inline record → re-import notice | Amendment 2026-09-23 A2 criteria |
| 9 | S1 | A3's non-EPUB rows use a non-EPUB source converted through the app's import path; the launcher seeds the installed Kokoro model into the fresh profile | The only readable non-EPUB route on B0; avoids the fresh-profile concurrent-download race (OBS-A1R-1 recurred in A2) | Grant: test-only harness under `E/` |
| 10 | S1 | Q-A..Q-G resolved: Type 1b (Q-A Type 2 narrowing) — see the block above | Census and G4 fixtures contradicted the spec; rules enforce isolation/parity intent, loosen no gate, touch nothing outside the existing-site table | Owner standing authorization + /virtuoso:mid-dispatch-decision; staging fold-in 3 |
| 11 | S1 | KF-1 pre-registered decision table: G5/D6 stay exit-0; recurrence → one scoped hygiene fix to `tests/qwenStreaming.test.js` only (after D1); a `main/` need → BLOCKER(USER) | A flake must not pass by retry nor block silently | Owner standing authorization; staging fold-in 5 |
| 12 | S1 | OBS-A3-2 = cross-owner overwrite. After Focus→Page re-pagination, `ReaderContainer` `onRelocate` writes `floor(fraction × activeDoc.wordCount)` (209 = ⌊0.125×1676⌋) into the Page highlight, unguarded because Focus's `onWordAdvance` consumed `resumeAnchorRef`. Focus itself stopped at ~27. Per the Q-G table, G3 governs: the post-separation Page highlight = Focus snapshot; G6 lists it as a removed cross-owner effect. OBS-A3-1 is very likely the same mechanism | Read-only trace, confidence 8/10. Discriminating experiment for Wave B/G6: log `detail.fraction`, `approxWordIdx`, `resumeAnchorRef` in `onRelocate`; negative control = Focus paused at 7 keeps 7 | Pre-registered Q-G table (fold-in 3) |
| 13 | S1 | Owner gate re-sequenced: Waves B–E and the speed dialog start on the G0 automated evidence; the B0 listening checklist joins G6 and the speed-dialog check in one owner session (OS-1) before F1; D1/D7 stay owner-required; Monday → In Flight at Wave B start | B0 is frozen and re-launchable, so the observation is time-independent; owner directed "You make decisions… iterate until the entire epic is complete" | Owner direction 2026-10-09; /mid-dispatch-decision; staging fold-in 6 |
| 14 | S1 | Waves B–E design accepted (DD-1..DD-7: build beside, cut over at E1; plain-class runtimes; shell TTS infra; legacy unreachable, not deleted). OC-1..OC-9 ruled (fold-in 7): stale-flag observation rule; v1 sibling contract; display-jump alias; dead-path tests on legacy hook; source-text re-point table; additive focusWpm/flowWpm; Kokoro UI 0.80–2.00/0.05 (buckets unchanged); Page ↑/↓ kept; no dead copies | Keeps every DoD row verifiable; removes only cross-owner artifacts | Owner delegation; mid-dispatch protocol; staging fold-in 7 |
| 15 | S1 | `dependencies.json` / `ownership.json` stay frozen as the Wave A census of B0 (src tree `0c790075`). Their `--check` is meaningful only at that tree and reports stale once `src/` changes, which is expected. G1 calls the census library (`buildImportGraph`, `extractResources`) live on the current tree. Not regenerated | Regenerating would overwrite baseline evidence | Grant: evidence and harness under `E/` |
| 16 | S1 | Wave B policy rulings:
  - G1 allowance coverage is enforced once all four mode trees exist (unreachable until then; D2 runs on F);
  - `blurby-icon.png` allowed as a passive asset;
  - never-mutated constants allowed (`BLOCK_TAGS` ×2, `KNOWN_ABBREVIATIONS`);
  - the ownership owner map is keyed with the verbatim anchor (two distinct same-named ResizeObservers);
  - the handoff carries `engaged` (legacy `hasEngagedRef` persists per document) | Each keeps the check honest without loosening the final gate | Grant: harness/evidence; design §D.2 |

## Evidence

- A3: `admission/g0-matrix.json` (24 transitions + 4 same-mode cases per fixture; 0 stale effects; Narrate exact start; gaps → owner checklist). G4 fixtures: `fixtures/*.baseline.json` (verified 5/5, S1)
- B0: `admission/baseline-build-rebuild.json` (21/21 identical; typecheck/build 0; tests 0 on 2 of 3 runs, KF-1 on run 1)
- A1-R: `admission/isolation.json` (PASS, 7/8). A2: `admission/flow-reproduction.json` (PASS, 10/20)
- Text-file SHA-256 values in those records are over the as-written (CRLF) bytes; git stores LF. Use `git hash-object` / blob ids for canonical comparison
