# Pre-Wave-B scope questions — READER-MODE-SEPARATION-2 (session S1)

Date: 2026-10-09. Branch `eb/reader-mode-separation-2` @ `c5932b88`. G0 is still blocked, but only on the owner half (BLOCKER B1). No `src/` file has changed. These questions must be settled before the first Wave B edit, so that Wave B can dispatch the moment D1 passes.

## 1. tl;dr

Two Wave A deliverables contradict the specification in seven bounded places (Q-A to Q-G): the dependency/ownership census and the recorded G4 baseline fixtures. Each needs a ruling before Wave B writes code.

## 2. Executive Summary

The census (`dependencies.json`, `ownership.json`, `census/`; commit 63b10115) traces the production import graph with the installed TypeScript resolver. It shows:
- several existing-site files the specification says to copy are dead in production;
- one second legacy reader entry point sits outside the edit-site table;
- one "type-only" file carries runtime code;
- the allowed-shared categories omit constants and diagnostics.

The G4 fixtures (`fixtures/*.baseline.json`; commit c61bca67) record today's production behavior, which contains cross-owner audio calls. G4 demands byte-for-byte parity, while G6 demands those calls be zero. The live matrix (`admission/g0-matrix.json`) adds baseline anomalies whose treatment is unspecified. None of these blocks G0. Each one blocks a mechanical G1, G4 or G5/D6 verdict later.

## 3. Evidence of issue

- **Q-A — dead non-EPUB views.**
  - `PageReaderView`, `ScrollReaderView`, `FlowText`, `VirtualScrollText`, `PausedTextView` and `FlowCursorController` are imported by `ReaderContainer` but never rendered, so the build drops them.
  - `ReaderContainer` shows "This document needs to be re-imported…" for any non-EPUB document (non-EPUB fallback comment: "all docs should be EPUB since EPUB-2B").
  - Specification item 2 asks every mode to carry a `TextView.tsx` copied from these views.
  - Live evidence: the converted-text fixture renders through foliate (A3); the legacy inline record shows the re-import notice (A2).
- **Q-B — second legacy Focus entry point.** `src/App.tsx` runs a standalone reader window with its own `useReader`, `ReaderView` and `useReaderKeys`. App.tsx is not in the existing-site table. Wave E must prove the legacy shared hooks and views are absent from the production graph (G1 boundaries test), but it cannot while App.tsx imports them.
- **Q-C — runtime code in a type-only file.** `src/types/narration.ts` exports `narrationReducer` and `findSectionForWord`, which `useFoliateSync` uses at runtime. The specification lists it under "type-only port/snapshot evolution".
- **Q-D — shared-category gaps.**
  - `src/constants.ts` (read by all modes) has no allowed-shared category.
  - `narrateDiagnostics.ts` and `dualSourceDiag.ts` hold process-global mutable state that every mode writes.
  - `useNarrationCaching.ts` holds a module-level extraction cache that feeds all modes.
- **Q-E — `per-mode` owner value.** The census needed an owner value `per-mode` (with `privateCopiesFor`) for resources inside code every mode copies, such as FoliatePageView internals. G1's ownership test needs to know whether that value is legal.
- **Q-F — G4 parity vs G6 zero cross-owner effects.**
  - The G4 fixtures tag today's audio calls made outside Narrate as `crossOwner: true`: `stopAllModes` / `createInstance` → `audio.stop`, `audio.setOnTruthSync(null)`, `audio.setPageEndWord`. Counts: Flow 35, Focus 30, Page 6, Narrate 0.
  - G4 says compare byte-for-byte after stripping only timestamps and session ids.
  - G6 and the specification's isolation goal require cross-owner effects to be zero.
- **Q-G — baseline anomalies.** Each mapped to a parity treatment:
  - OBS-A3-1: Narrate(paused)→Page puts the Page highlight on word 0 while the persisted anchor stays 7.
  - OBS-A3-2: Focus pacing→Page reads back highlight 209 after about 20 words from 7 on the text fixture.
  - OBS-A3-3: same-Page selection emits `audio.stop`.
  - Fixture: Flow resume is a cold restart from the anchor.
  - Fixture: a warming Narrate start makes the next press resume.
  - Fixture: Narrate→Page calls `audio.stop` twice.

## 4. Possible cause(s)

1. The specification was written from the source inventory on 2026-09-23, before an import-graph census existed. It reasonably assumed every listed file was live and every listed type file was type-only.
2. The isolation goal (zero cross-owner effects) and the parity goal (G4 byte-for-byte) were written as independent gates without a rule for the effects isolation is meant to remove.

## 5. Likely solution(s)

These are recommendations; the decision may differ.

- **Q-A:** Do not copy dead views. Each mode's `TextView.tsx` stays out of the destination layout. Wave E removes the dead non-EPUB views from the production graph and records the removal with evidence, as CLEANUP-MODE-BARREL-1 allows for `src/modes/index.ts`. Non-EPUB rows in G0/G6 use converted imports. This is a scope reduction inside the existing-site table.
- **Q-B:** Add `src/App.tsx` to the existing-site table, limited to re-pointing its standalone reader window at the Focus runtime's public `index.ts`, or confirming it is unreachable. No other App.tsx change.
- **Q-C:** Move the runtime parts (`narrationReducer`, `findSectionForWord`) into Narrate's private helpers. Copy `findSectionForWord` into the other modes that need section lookup. `src/types/narration.ts` keeps only types.
- **Q-D:**
  - `src/constants.ts` → allowed-shared, as "read-only theme tokens/passive UI" plus immutable configuration, provided no mode mutates it.
  - Diagnostics modules → copy per mode, or route through an infrastructure diagnostics port. A shared mutable diagnostics store is not allowed.
  - `useNarrationCaching` extraction cache → document port (immutable document/content preparation).
- **Q-E:** Allow `per-mode` with an exact `privateCopiesFor` list, as an ownership-manifest value meaning "each listed mode owns its own private copy". G1 asserts each copy exists in exactly one mode directory.
- **Q-F:**
  - G4 comparison = remove every effect tagged `crossOwner: true` from the baseline.
  - Assert that the candidate emits zero cross-owner effects.
  - Compare the remainder byte-for-byte.
  - Record the rule in `test-migration.json` with the tagged list.
  - No other effect may be dropped.
- **Q-G:** Preserve each anomaly as recorded baseline, unless it is a cross-owner effect that Q-F removes. OBS-A3-3 and the double `audio.stop` are cross-owner or duplicate audio effects from a non-audio owner, so they are removed under Q-F. OBS-A3-1 and OBS-A3-2 stay as labelled baseline behavior (not repaired, not explained away), and G6 compares them equal to baseline. Flow cold restart and warming-resume stay as baseline.

## 6. Confidence in cause and solution identification (1–10)

8. Every cited fact is backed by a reproducible artifact: census `--check`, fixture verify 5/5, and the matrix rows. The remaining judgment is product intent, especially Q-B and Q-G.

## Decision — 2026-10-09

- **Type:** 1b — Advance (Planner-Originated); Q-A is a Type 2 narrowing
- **Decided:** Adopt the recommended rules for Q-A to Q-G. They enforce the spec's isolation and parity intent, loosen no gate, and edit nothing outside the existing-site table. Decided under the owner's standing overnight authorization ("Proceed without my approval overnight. Run /virtuoso:mid-dispatch-decision if required to make unilateral decisions until complete").
- **Instruction:**
  - Wave B starts only after D1.
  - Apply Q-A to Q-G as written in staging fold-in 3:
    - mirrored layout without `TextView.tsx`;
    - App.tsx untouched; originals kept only for it;
    - narration.ts runtime treated as TTS infrastructure, with mode copies of `findSectionForWord`;
    - constants shared and immutable; diagnostics port; extraction cache behind the document port;
    - `per-mode` only with `privateCopiesFor`;
    - the G4 cross-owner rule recomputed, flag-checked and asserted absent;
    - OBS-A3-1 governed by G3; OBS-A3-2 classified in Wave B with the pre-registered table.
- **Amendment:** `docs/governance/close-outs/Memo.READER-MODE-SEPARATION-2.GovernanceStaging.2026-09-23.md`, fold-in 3 (registry row 3)
- **Lessons:** Provisional lesson staged as fold-in 4 (number assigned at fold-in; worktree numbers are placeholders)
