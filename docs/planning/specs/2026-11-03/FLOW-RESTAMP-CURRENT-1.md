#### FLOW-RESTAMP-CURRENT-1 — Flow's word renumbering never runs over a section that is still being numbered *(Seq 111; Full Spec 2026-11-03, cited against `origin/main` `c5bb507f`; Reader Engine; reproduce first, then fix or close as not reachable; not a release gate)*

- **What:** in Flow mode, find out with a deterministic test whether the re-stamp effect can renumber a section document while another wrap of the same document is still running. The re-stamp effect renumbers a section's word spans when the book's word list arrives (`bookWordSections`). Then do one of two things:
  - **(A) Red found on a reachable trigger:** add Page's three guards to Flow's own `FoliateView.tsx`, with the red test committed first.
  - **(B) No reachable red:** close the item as "not reachable". Commit the harness as green guard tests, plus a guard comment at the effect. Make no behaviour change (standing rule 43).
  - **Out of scope:**
    - Page and the other modes (one item per mode runtime, for mode isolation);
    - BLOCK-TEXT-ORDER-1's certification and its OQ4 hold;
    - the re-stamp's word source and numbering.
  - **Outcome:** a second word-list arrival, or one that arrives while the section's load wrap is still yielding, never unwraps a section in the middle of a wrap. It never leaves spans numbered from a stale section start.
- **Why:**
  - Blurby.Brain1's BLOCK-TEXT-ORDER-1 ruling TQ-B3 (2026-11-03, `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.held-items-TQ.2026-11-03.md`) found that Flow's re-stamp does not check that its document is still current, while Page's does (LL-029, LL-169). It is a defect that predates BLOCK-TEXT-ORDER-1, ruled to be its own Reader Engine item per mode runtime.
  - **Page's re-stamp** (`src/reader/modes/page/FoliateView.tsx:1104-1138` at `c5bb507f`) has three guards. PAGE-SAVE-RESTAMP-3 and RESTAMP-RERUN-RACE-1 added them:
    1. It waits for the section's registered wrap (`sectionWrapsRef`, `:319`; set by the load at `:673`) before unwrapping.
    2. It checks `cancelled` after that wait and again after its own wrap.
    3. It registers its own wrap in `sectionWrapsRef` (`:1123`). It reads `sectionStart` after the wait, from the words loaded at that moment.
  - **Flow's re-stamp** (`src/reader/modes/flow/FoliateView.tsx:1351-1384` at `c5bb507f`) has none of the three:
    - there is no `sectionWrapsRef` in the file;
    - the load's wraps (`:905, :933`) are not registered anywhere;
    - `sectionStart` is read before the re-stamp's own `await wrapWordsInSpans` (`:1368`);
    - `cancelled` is checked only after the loop.
  - `wrapWordsInSpans` yields, so a word-list arrival during a load wrap can `unwrapWordSpans` the section halfway through that wrap.
  - the book-stamped mark (`bookStampedDocsRef`) is deleted at `:1364` and re-added after the wrap, so a cancelled run can leave it set on a section another run is renumbering.
  - **Users would see:** words that don't respond to a click, or a click or save that lands on the wrong word in a section that had just loaded when the book's word list arrived. Nobody has reported this yet; it comes from reading the source, which is why the item reproduces it first.
- **Design decision:** technical, with no new design. It mirrors Page's three guards, kept mode-local: a `flow`-owned `sectionWrapsRef`, no import from Page, and no shared helper.
- **Prerequisites:** none. It is independent of BLOCK-TEXT-ORDER-1. If both are in flight, BLOCK-TEXT-ORDER-1 merges first, because it edits the same file's wrap call sites; this item then re-greps.
- **Execution host:** RodneySr (x64) for the implementation, the tests and the rule 53 pair. Rodney (arm64) only for the rule 53 arm64 launch.
- **Branch:** `eb/flow-restamp-current-1` at `C:\Users\estra\Projects\Blurby\.worktrees\flow-restamp-current-1` on RodneySr, cut from `origin/main` at or after `c5bb507f`.
- **Done when:**
  1. **Reproduce first (standing rule 43; LL-143).** Commit alone `tests/readerModes/flowRestampCurrent.test.tsx`. It renders the real Flow `FoliateView` with a stubbed foliate view and a deterministic yield in `wrapWordsInSpans`:
     - **(rs1)** a `bookWordSections` identity arrives while the section's load wrap is yielding. Today the section is unwrapped mid-wrap. Assert that every span's `data-word-index` equals the canonical index for its text, and that no text node lost its span.
     - **(rs2)** two `bookWordSections` identities arrive one after the other. The first re-stamp's wrap is yielding when the second arrives. Assert the same as (rs1), with the section start read from the second word list.
     - **(rs3), control:** a single arrival after the load wrap has finished. Spans are renumbered once, which is GREEN on base.

     Record in the memo whether (rs1) and (rs2) are RED on `c5bb507f` by assertion. If neither is reachable, take path (B) and stop.
  2. **Path (A), the change** in `src/reader/modes/flow/FoliateView.tsx` only:
     - a mode-local `sectionWrapsRef = useRef(new WeakMap<Document, Promise<number>>())`;
     - the load registers each wrap it starts (`:905, :933`);
     - the re-stamp awaits `sectionWrapsRef.current.get(doc)?.catch(() => {})`, returns if `cancelled`, reads `sectionStart` and `sectionWords` after the wait, registers its own wrap, and returns if `cancelled` after it.
     - the book-stamped mark (`bookStampedDocsRef`) is re-added only when the run was not cancelled.
     - `applyZoneRef.current?.()` (R7) still runs once after the loop, unchanged.
     - Re-grep every cited line at the cut (standing rule 36).
  3. `npx vitest run tests/readerModes tests/readerModeIsolation.test.ts tests/readerModeBoundaries.test.ts` exits 0. Then `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rules 47 and 48). Record the counts.
  4. **Rule 53 pair:**
     - the tip's package plus `origin/main`'s;
     - a 25 s scratch-profile launch with no error, with the profile proved before the first input (LL-165);
     - asar contents checked;
     - a "Package verification" section in the close-out;
     - Blurby.Brain1's confirmation before the merge go.

     There is no packaged behaviour probe, because the race is not drivable by hand. The verdict comes from the test rows (standing rule 55).
  5. **Fence (standing rule 41).** `git diff --name-status <base>` lists exactly the following, plus the memo:
     - `M src/reader/modes/flow/FoliateView.tsx` (path A only)
     - `A tests/readerModes/flowRestampCurrent.test.tsx`
- **Effort:** S. Technical effort: medium.
- **Owners:**
  - Blurby.Brain1 coordinates and confirms the rule 53 pair;
  - RodneySr implements;
  - spec-compliance, then quality review;
  - Blurby.Roadmap gives the merge go and closes it out.
- **Merge order:** after BLOCK-TEXT-ORDER-1 if both are open; otherwise free. It does not touch the shared core.
- **Path:** dispatch.

##### Lessons applied
- **LL-029:** a stale range or offset is guarded at every access. Here, no stamping happens from offsets read before a wait.
- **LL-169:** the operation's currentness (`cancelled`, the registered wrap) is guarded separately from the document's lifetime.
- **LL-143:** every acceptance row is dry-run against the base before the change, with a control row.
- **LL-165:** the scratch profile is proved before the first input.
- **Standing rule 55 (promoted from LL-166):** verdicts come from state (span indices), not screenshots.
- **Standing rule 53 (promoted from LL-167):** package verification.
