# Live-QA Discovery Sweep — Blurby Reader Runtime

**Date:** 2026-05-27
**Operator:** Cowork (Claude) driving via computer-use MCP
**Skill:** `anthropic-skills:live-qa`
**Fixtures:** Meditations (EPUB, 12% saved progress) and Why Nations Fail (EPUB, 3% → 9% during pass)
**Build version observed:** v1.1.2 (per Settings panel)
**Source-tree version per CLAUDE.md:** v1.75.1
**Gate verdict:** **YELLOW** — two production-impacting bugs (one P0), gated until fixes land.

---

## Executive summary

The roadmap queue was empty going into this session. Cowork ran an open exploratory sweep across Blurby's three reading modes (Focus / Flow / Narrate) plus the library, settings, and document-open paths. Four findings emerged; two are production-impacting and warrant immediate sprints, one is a low-LOE platform hygiene fix, one is operational/cosmetic. The reader works correctly for Why Nations Fail, including click-to-narrate cursor sync and all three reading modes — so the codebase is not broken globally, but Meditations is currently unreadable due to a render crash, and the Flow/Narrate column layout is misconfigured for any reasonable window width.

Audio-dependent verdicts (S4, S5, S6, S8) were intentionally deferred — operator drove visual checks alone per Evan's "advance without me" instruction. Those items need a brief user-ear pass in a follow-up to convert PARTIAL → PASS or surface audio-only issues.

---

## Methodology

Operator (Cowork) drove the user's keyboard and mouse via the computer-use MCP. Evan was present to launch Blurby (after Cowork's repeated `open_application` calls revealed F1) and to provide ground truth where screenshots could not. Each checklist item had a defined methodology, success criterion, and evidence source recorded in advance.

Evidence sources used:
- **Screenshot** — for any visible UI state (window contents, button states, text rendering, mode switches).
- **DOM inspection via DevTools** — for confirming render state (`#root.innerHTML.length`) and reading console errors.
- **Persisted state inference** — repro across fresh launches and Ctrl+R reloads to distinguish "transient state" from "deterministic crash."
- **Deferred** — for properties only user-ear or user-eye could verdict (audible sync, audio clean-stop, audio-start-on-clicked-word).

Operator does not assert PASS on properties that require user perception unless the user explicitly verdicts. Memory note `feedback_live_qa_self_verify` codifies this: rely on screenshots for visible state; reserve user asks for audio, motion smoothness, and similar.

---

## Checklist disposition

| ID | Scenario | Verdict | Evidence |
|---|---|---|---|
| S1 | Library loads | **PASS** | Screenshot: 132 readings, all tabs present, no error overlay. |
| S2 | Open document into reader | **FAIL** (Meditations) / **PASS** (Why Nations Fail) | Meditations → blank window, JS error in console (see F2). Why Nations Fail → reader renders cleanly with bottom bar, mode buttons, position. |
| S3 | Identify active mode | **PASS** | Three modes visible and labelled: Focus / Flow / Narrate. Bottom bar identifies current mode by button highlight. |
| S4 | Start narration | **PARTIAL** | Visual PASS: play→pause icon swap, cursor word "not" underlined, position advanced. Audio: DEFERRED. |
| S5 | Pause/resume mid-sentence | **PARTIAL** | Visual PASS: pause registered, cursor word preserved at "not", play button restored with "Play (Space)" tooltip. Audio clean-stop / resume-from-same-word: DEFERRED. |
| S6 | Click-to-narrate | **PARTIAL** | Visual PASS: clicked "Smith" while paused; cursor highlight didn't update immediately, but pressing play started narration with "Smith" underlined. End-to-end click-then-play lands on clicked word. Audio start-point: DEFERRED. Minor UX nit: click-while-paused doesn't visually update the cursor until next action. |
| S7 | Switch reading mode mid-document | **PASS** | Focus (RSVP single big word, character-level highlight on "s" in "as"), Flow (column of words with current word underlined), Narrate (audiobook layout with 1.0x speed control instead of WPM) all render. Each auto-starts narration on click — interesting UX choice, not a bug. |
| S8 | Narration in each non-default mode | **PARTIAL** | Visual PASS: each of three modes entered and visibly progressed. Audio in each mode: DEFERRED. |
| S9 | Return to library | **PARTIAL** | Escape opens an in-reader "Reading Queue" overlay (Continue Reading + Unread sections) which is the closest navigation affordance. No discovered path to fully exit back to the original maximized library view from inside a document. |
| S10 | Settings panel peek | **PASS** | Opens cleanly via the gear icon in the Reading Queue overlay. Sections: Reading Layout, Speed Reading, Narration (TTS), Theme, Library Layout, Connectors, Cloud Sync, Hotkey Map. Adding Content section documents Folder / URL / Drop import paths. |

**In-scope exclusions** (not tested this pass): non-EPUB formats (PDF, MOBI, web articles), the 28 Kokoro voices, keyboard a11y, folder watch, cloud sync, export flows, the Hotkey Map subsection. Findings in those areas would require a separate widening pass.

---

## Findings

### F1 — Multi-instance window spawning

**Severity:** MEDIUM
**Reproducer outside computer-use:** Double-click the Blurby Start-menu entry twice in quick succession.
**Symptom:** Blurby's Electron main process does not implement a single-instance lock. Each launcher invocation spawns a new BrowserWindow. During this session, three concurrent Blurby windows accumulated from three `open_application` calls Cowork made before Evan flagged it ("stop opening new apps"). The third spawn rendered as a blank window because it had no associated state.
**Diagnosis:** Missing `app.requestSingleInstanceLock()` + `second-instance` event handler in Electron's main process entry point.
**Fix path:** Add the standard Electron single-instance pattern to the main process bootstrap. On `second-instance` event, focus the existing window rather than creating a new one. Approximately 5 lines of code.
**Severity rationale:** Not user-blocking — a normal launch produces one window. But silent dup-spawn during fast clicking is confusing and the blank-window outcome is alarming. Cheap to fix.

### F2 — Meditations crashes the reader (P0)

**Severity:** CRITICAL / P0
**Reproducer:** Fresh Blurby launch → click Meditations cover in the library Reading Now section → reader window navigates (library disappears) but content area is fully blank and stays blank. Persists across DevTools open, Ctrl+R, and full app reload.
**Symptom:** React fails to mount any reader content. `document.querySelector('#root').innerHTML.length === 0` confirmed via DevTools console. Window chrome is alive (min/maximize/close buttons respond) but the rendered DOM is empty.
**Root-cause stack trace** (captured from DevTools Console after clearing the URL filter):

```
Uncaught TypeError: r.split is not a function
    at Mn (App-m6JliGkQ.js:2:3439)
    at App-m6JliGkQ.js:20:8864
    at Object.useMemo (index-CHRplyiO.js:48:60380)
    at I1.C.useMemo (index-CHRplyiO.js:17:7226)
    at bo (App-m6JliGkQ.js:20:8633)
    at Zf (index-CHRplyiO.js:48:47871)
    at cc (index-CHRplyiO.js:48:70618)
    at By (index-CHRplyiO.js:48:80945)
    at sv (index-CHRplyiO.js:48:116622)
    at l1 (index-CHRplyiO.js:48:115685)
```

**Diagnosis:** A `useMemo` hook inside an App component calls `.split()` on a value `r` that is not a string. The error propagates uncaught, React unmounts the entire tree, and the renderer is left empty. Why Nations Fail opens fine through the same code path, so the problem is data-shape-specific to Meditations' persisted reading state — most likely a `wordIndex`, `position`, or `cursor` field that's the wrong type (number or object instead of string).

**Suspected upstream changes** (from memory and CLAUDE.md current-state notes):
- **NARRATE-CURSOR-SYNC-3** (2026-05-23, "Step 3.4 / Approach B content-align") changed word-index semantics for click-vs-TTS sync. If Meditations was last saved under the old schema, the new code path may fail to deserialize.
- **READER-ISO-1E** (2026-05-27, today) — NarrateModeAdapter + audio truth-sync ownership. Newest sprint, highest risk of recent regression.

**Fix path:**
1. **Aristotle (read-only diagnosis)** — Open the unminified `Mn` function and trace the `.split(` call. Identify which persisted field flows into it. Confirm whether the field shape changed across NARRATE-CURSOR-SYNC-3 or READER-ISO-1E.
2. **Targeted fix** — Add a type guard at the `.split` call site (`typeof r === 'string' ? r.split(…) : <fallback>`).
3. **Migration** — If the persisted shape genuinely changed and Meditations' saved state is in an old format, write a one-shot migration in the storage layer.
4. **Regression test** — Add a test fixture with Meditations' last-known-good persisted state to prevent silent re-breakage.

**Severity rationale:** Active reader (Meditations is in Reading Now, 12% progress) completely blocked. Probably affects any other document with similarly-shaped persisted state. Workaround for the user is "open a different book," which is unacceptable for a P0 reading product.

### F3 — Reader column does not scale with window size

**Severity:** HIGH
**Reproducer:** Open any document, enter Flow or Narrate mode, observe text layout. Resize window or maximize — column does not widen proportionally.
**Symptom:** In Flow and Narrate modes the text column has a fixed-ish narrow max-width that does not respond to window resize. At maximized 1344px window width, the column is only ~100–120px wide and is positioned right-of-center, leaving roughly 60% of horizontal space empty on the left and significant empty space on the right.
**Downstream effect:** Long words (>~10 characters at the default 120% font) cannot fit in the column. CSS `overflow-wrap` breaks them mid-character ("institut" / "ions", "prospe" / "rity", "Wahun" / "sunaco" / "ck", "preside" / "nt"). At maximized window the same long words ("Disappearance", "Argentina", "Commission") render whole because each fits on its own line in the narrow column. So the mid-word breaking is a symptom of the column being too narrow, not a separate hyphenation bug.
**Diagnosis:** Almost certainly a fixed max-width in pixels (or some absolute unit) on the reader's content container, combined with non-centered positioning. The Focus mode (RSVP) is not affected because it's a single word centered, not a wrapping column.
**Fix path:**
- Replace fixed max-width with character-based unit (`ch`), targeting ~55–75ch for reading comfort.
- Center the column horizontally in the available reader area.
- Audit the bottom bar's positioning — it's left-aligned currently, may need adjustment to follow column.
- Confirm Focus and Narrate modes inherit the corrected width.
**Severity rationale:** Affects two of three reading modes (Flow, Narrate). Degrades primary reading UX. The 120% default font setting amplifies the problem.

### F4 — Version label stale (or build is stale)

**Severity:** LOW
**Reproducer:** Settings panel → bottom of panel under "UPDATES" → "Version 1.1.2".
**Symptom:** Settings displays `Version 1.1.2`. CLAUDE.md asserts the source tree is at v1.75.1. Two possibilities, one significant:
- (a) The displayed version string in Settings hasn't been incremented since v1.1.2 — purely cosmetic, 1-line fix in `package.json` or wherever the Settings panel pulls the version.
- (b) Evan is running a build that is many sprints behind current source. If true, **every finding in this report needs to be re-verified against current source** before sprints are dispatched.
**Fix path:** Compare `package.json` "version" field against (i) the Settings display source, (ii) the actual installed Blurby executable. If installed version really is v1.1.2 of the source tree, rebuild and re-test before committing to F1–F3 as current bugs.
**Severity rationale:** By itself, low. But it could invalidate this entire pass, which makes verification urgent before sprint dispatch.

---

## Sprint candidates

### SPRINT-A — MEDITATIONS-FIX-1 (P0)

- **Goal:** Eliminate the `r.split is not a function` crash so Meditations opens normally from the library.
- **LOE:** S
- **Lane Ownership:** Lane A (Runtime Core) likely — depending on where the `.split` call lives, may also touch persisted-state schema (Lane D).
- **Branch:** `sprint/meditations-fix-1` from clean main.
- **Investigation gate (Aristotle, read-only):** Locate the unminified `Mn` function. Trace the value flowing into `.split`. Identify the schema mismatch.
- **Task table (post-investigation):**
  1. (Aristotle) — Trace `App-m6JliGkQ.js:2:3439` → identify call site, file:line, owning component.
  2. (Hercules, renderer-scope) — Add type guard at the `.split` call site. If schema mismatch, also add deserialization defensive logic.
  3. (Hercules or Hermes, electron-scope) — If persisted shape changed, add migration in storage layer.
  4. (Hippocrates) — Run `npm test`. Add a unit test asserting the type guard.
  5. (Live-QA followup) — Re-open Meditations from the library, verify reader renders.
- **Success criteria:** Click Meditations from library → reader renders with text and bottom bar within 2s. Cursor position restored to saved 12% progress. No console errors. `npm test` green. No regression on Why Nations Fail.

### SPRINT-B — READER-COLUMN-WIDTH-1 (HIGH)

- **Goal:** Reading column in Flow and Narrate modes scales with window width, centers horizontally, and stops breaking long words mid-character.
- **LOE:** M
- **Lane Ownership:** Lane C (UI surfaces) — `src/components/ReaderContainer.tsx`, `src/components/ScrollReaderView.tsx`, related CSS in `src/styles/global.css`.
- **Branch:** `sprint/reader-column-width-1` from clean main.
- **Task table:**
  1. (Hercules, renderer-scope) — Convert column max-width from fixed unit to `ch`-based. Target default ~65ch.
  2. (Hercules, renderer-scope) — Add horizontal-center via flex/margin auto.
  3. (Hercules, renderer-scope) — Audit bottom bar positioning; align to column if necessary.
  4. (Hippocrates) — Build verification, visual smoke test across Focus / Flow / Narrate.
  5. (Live-QA followup) — Re-verify F3 fixture words ("institut/ions", "Wahunsunacock") render whole at default and maximized window.
- **Success criteria:** At any window width >= 800px, Flow mode column displays at least ~50 characters per line at default font; long words ≤25 characters render whole. Column is horizontally centered.
- **Parallel safety:** No shared-core freeze-set touches. Safe to run alongside SPRINT-A.

### SPRINT-C — SINGLE-INSTANCE-LOCK-1 (LOW)

- **Goal:** Prevent duplicate Blurby windows from repeated launcher invocations.
- **LOE:** XS
- **Lane Ownership:** Lane D (Platform / Main process) — `main/main.js` or equivalent entry point.
- **Branch:** `sprint/single-instance-lock-1` from clean main.
- **Task table:**
  1. (Hermes, electron-scope) — Add `app.requestSingleInstanceLock()` + `app.on('second-instance', …)` handler. Standard Electron pattern.
  2. (Hippocrates) — `npm test` + `npm run build`.
  3. (Manual smoke test) — Launch Blurby, then launch again from Start menu, verify only one window with the existing one focused.
- **Success criteria:** Second launch focuses the existing window instead of creating a new one. No regression on first-launch flow.
- **Parallel safety:** No renderer touches. Safe to run alongside both SPRINT-A and SPRINT-B.

### Bundled-in: F4 verification

Not its own sprint. The first sprint to touch `package.json` should also confirm the displayed version matches the actual source-tree version. If a mismatch is found (i.e. the installed Blurby is genuinely an old build), pause sprint dispatch and run a re-verification pass against current source before committing further.

---

## Recommended dispatch order

**Recommendation: dispatch SPRINT-A and SPRINT-C in parallel; SPRINT-B next.**

Rationale:
- **A first** because it is P0 and actively blocks Evan's current read (Meditations is in Reading Now).
- **C in parallel** because it touches `main/` only (Lane D), zero overlap with A's renderer surface, and is XS — landing it costs nothing.
- **B after A** because F3 is high-impact but not strictly blocking (workaround: maximize window, accept narrow column). Running B after A also lets A confirm the renderer baseline before we change column layout broadly.

Queue depth after this dispatch: 3 sprints specced, meeting the ≥3 mandatory queue depth from CLAUDE.md's planning contract.

---

## Deferred items requiring user-ear

Convert these from PARTIAL to PASS in a brief follow-up where Evan listens to playback:

1. **S4 audio start** — When Play is pressed, does audio begin on the underlined word ("not" in the captured fixture state)?
2. **S5 audio clean-stop** — When Pause is pressed, does audio cut off cleanly at the underlined word, or talk over it?
3. **S5 audio resume** — When Play is pressed again, does audio resume from the same word, skip ahead, or repeat the last word?
4. **S6 audio click-to-narrate** — After clicking "Smith" and pressing Play, does audio start on "Smith"?
5. **S8 audio in each mode** — Are audio properties (sync, smoothness, clarity) consistent across Focus, Flow, Narrate?

These are properties the operator cannot verdict from screenshots. They should be the centerpiece of any audio-quality follow-up.

---

## Caveats

1. **Version mismatch (F4)** could invalidate findings if the installed build is genuinely stale. **Verify before dispatching sprints.**
2. **F1 was partially Cowork-induced** (repeated `open_application` calls during access negotiation). The underlying missing-single-instance-lock is real but its observed severity in this session is amplified by operator behavior.
3. **F3 root cause** is inferred from before/after maximize screenshots — not from reading the source. The fix path is hypothesis-driven; Hercules should confirm against the actual CSS before implementing.
4. **F2 stack trace** is from minified production bundles. Aristotle will need source maps or the unminified source to identify the exact `.split` call site.
5. **Audio paths were not verdicted** — five S-items remain PARTIAL pending user-ear.

---

## Appendix — observed keyboard shortcuts

From bottom-bar hints and tooltips during the session:
- **Space** — Play / Pause (confirmed via tooltip "Play (Space)" / "Pause (Space)").
- **Shift+Space** — Toggle Focus mode (confirmed via tooltip "Next time try Shift+Space to enter Focus mode faster").
- **Escape** — Open Reading Queue overlay (in-reader navigation).
- **← →** — Page navigation (in non-narrating mode) / Seek (in Flow narration) / Rewind (in Focus narration). Behavior varies by mode.
- **↑ ↓** — Adjust speed.
- **Ctrl+Shift+I** — Open DevTools (confirmed by operator).
- **Ctrl+R** — Reload renderer (confirmed by operator).
- **Tab** — Listed in some keyboard hint strips as "menu" but observed behavior in Narrate mode was a speed/skip advance, not a menu. Worth a small clarification pass.

---

*End of report. Filed by Cowork live-QA pass, 2026-05-27. Awaiting decision on whether to formalize F1–F4 into `docs/governance/BUG_REPORT.md`, spec SPRINT-A/B/C into `ROADMAP.md`, and update `docs/governance/sprint-queue.xlsx`.*
