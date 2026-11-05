#### FOLDER-RETRY-FEEDBACK-1 — Retry visibly reports "Checking…" and a timed "still can't reach it" result *(Seq 131; Full Spec 2026-11-03, cited against RC tip `70d64237`; UX polish; proposed P3)*

- **What:** the folder banner (`FolderNoticeBanner`) gains one status line in the same strip.
  - While a Retry check runs, the line reads "Checking…". The Retry button stays disabled and gains `aria-busy="true"`.
  - After a check that still fails, the line reads "Still can't reach it — checked 3:42 PM", using the local clock time of that check. A thrown `retrySourceFolder` shows the same line.
  - The line stays until the next press (which replaces it with "Checking…") or a pushed folder state (the banner either unmounts on `null` or shows a fresh problem with no line).
  - One press still makes one call, nothing is scheduled, and the banner's main sentence is unchanged.
- **Out of scope:**
  - The banner's main sentence and the toast in `main.js`. They must stay identical (test (fn-n)).
  - Any new visual design. The owner's 2026-10-15 decision to reuse the update-banner strip stands (`FolderNoticeBanner.tsx:33`).
  - Main-process retry behaviour (`main/folder-notice.js`), including the folder-changed-during-check path at `:32`.
  - FOLDER-NOTICE-2's other dissolved findings ((3), (6), (7), (9), (10), (11)).
  - BLURBY-SERVER-1 Phase 2 retires this banner later, so the change stays XS.
- **Why (investigation at `70d64237`):**
  - `retry()` (`src/components/FolderNoticeBanner.tsx:21-31`) sets `busy`, awaits `retrySourceFolder()` and calls `setProblem(code)`. After a failed check `code` is the same problem code, so React renders nothing new.
  - Main returns the same code on `false` or a `null` root (`main/folder-notice.js:27-37`). It pushes only on a change (`:14`), so a failed Retry produces no push either.
  - The only visible sign of the attempt is the button's disabled look for the length of the root check: a flicker for a fast `false`. The strip then looks exactly as it did before. `role="alert"` announces only on mount, so a screen reader hears nothing.
  - That is BUG-231 / SMOKE-F16: "was anything done?".
- **Design (owner ruling 2026-11-03, design batch #1; settled):**
  - The wording is "Checking…" while the folder is rechecked, then "Still can't reach it — checked 3:42 PM" after a failed retry. The time makes repeated failures look different.
  - **Engineering application:** "Checking…" is shown in the status line, not on the button. The button keeps its label "Retry". Existing tests find the button by its text "Retry" while the check is running (`tests/folderNoticeBanner.test.tsx:102`, `:121`), and those rows may not change (failure handling). The button carries the busy state through `disabled` and `aria-busy`.
  - The status line is a `role="status"` `aria-live="polite"` span that is always rendered while the banner shows. Keeping it rendered means its text changes are announced. It inherits `.update-banner`'s font, size and colour (`base.css:388-399`), so it needs no CSS and no inline style.
  - The time is `new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })`, read once when the check resolves. No timer is used: test (fn-p) forbids `setTimeout|setInterval|requestAnimationFrame` in the banner's source (`:139-140`).
  - A success needs no new state. The banner disappears through the existing `set(null)` push, as it already does (fn-r).
- **Prerequisites:** RC integration window merged to `main` (cut from that merge). FOLDER-NOTICE-1 is merged (the banner and its tests exist at `70d64237`).
- **Done when** (PowerShell 7, from the worktree root):
  1. **Red first (standing rule 43).** Commit the new describe block in `tests/folderNoticeBanner.test.tsx` alone. On the base, `npx vitest run tests/folderNoticeBanner.test.tsx` exits 1: (rf1)–(rf5) fail and (fn-n)–(fn-w) pass. Record the output.
  2. `npx vitest run tests/folderNoticeBanner.test.tsx` exits 0 after the change, with (fn-n)–(fn-w) unchanged.
  3. `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
  4. **Rule 53 package check.** Use the packaged x64 exe on a proven scratch profile (LL-165) whose `sourceFolder` points at an owned, missing path (`C:\blurby-scratch\missing-folder`; never the owner's Drive).
     - A real CDP click on Retry shows the status text "Checking…" or, for a fast root answer, goes straight to the line matching `Still can't reach it — checked \d{1,2}:\d{2}`. Within 10 s it shows that line, and the Retry button is enabled again.
     - A second click repeats the cycle.
     - The main log has exactly one `[folder-notice] Retry: one root check:` line per click (`main/folder-notice.js:31`): two in total.
     - **Detector control (standing rule 55):** the same two clicks on the base package leave the banner's `[role="status"]` query empty and the strip's text equal to the main sentence alone.
  5. **Owner-visible check, batched to gate (2)** (memory: owner smoke batched at end). On the arm64 package at merge, press Retry twice with the folder unplugged. The line shows the check time each time, and the second press visibly passes through "Checking…". This is evidence for the owner, not a mechanical gate.
- **Effort:** XS.
- **Owners:** planner; implementation agent (bounded, renderer-scope); spec-compliance then quality reviewer; repository operator; package verifier on RodneySr; owner at gate (2) for row 5.
- **Source:** BUG-231 (`docs/governance/BUG_REPORT.md:80-86` on the planning branch at `9932b8ed`; `:71` at `70d64237`); SMOKE-F16 (`docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:59`, `:204-212`); owner design batch (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md`, #1); code at `70d64237`.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites (re-grep at the cut):** `src/components/FolderNoticeBanner.tsx` only.
  - Below `TEXT` (`:6`), add a module-level helper: `const checkedAt = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });`.
  - `:11`, after `busy`, and above the early return at `:19` (hook order): `const [lastFailedAt, setLastFailedAt] = useState<string | null>(null);`.
  - `:14`, the push handler, becomes `(code) => { pushed = true; setProblem(code); setLastFailedAt(null); }`. Main pushes only on a change (`folder-notice.js:14`), so every push is a new state and clears the line.
  - `retry()` (`:21-31`):
    - After `setBusy(true)`, call `setLastFailedAt(null)`.
    - In the `try`, after `if (code !== undefined) setProblem(code);`, add `if (typeof code === "string") setLastFailedAt(checkedAt());`.
    - The `catch` body becomes `setLastFailedAt(checkedAt());`, keeping its comment.
    - `finally` is unchanged.
  - Render (`:34-39`):
    - The button gains `aria-busy={busy}`. Its label stays `Retry`.
    - After the button, add `<span role="status" aria-live="polite">{busy ? "Checking…" : lastFailedAt ? \`Still can't reach it — checked ${lastFailedAt}\` : ""}</span>`.
    - Use the characters `…` (U+2026) and `—` (U+2014) exactly as the owner wrote them.
  - No change to `TEXT` (`:6`), the component comments at `:1-2` and `:33`, `main/`, `main.js`, `preload.js` or any CSS.
- **Tests:** in `tests/folderNoticeBanner.test.tsx`, add `describe("FOLDER-RETRY-FEEDBACK-1", …)` inside the existing describe so it reuses `renderLibrary`, `banner`, `retryBtn`, `press` and `settle` (`:86-104`).
  - Add `const status = () => banner()?.querySelector('[role="status"]')?.textContent ?? null;` and `const FAIL = /Still can't reach it — checked \d{1,2}:\d{2}/;`.
  - Cases:
    - **(rf1)** Press: `status()` is "Checking…", `retryBtn()` is still found (label "Retry"), and it is `disabled` with `aria-busy="true"`. *Fails on the base: there is no status element.*
    - **(rf2)** Press, then `mock.gate.resolve("root-unlistable")` and `settle()`: `status()` matches `FAIL`, and `retryBtn()` is enabled with `aria-busy="false"`. *Fails on the base.*
    - **(rf3)** After (rf2)'s steps, set up `const second = deferred<string | null>(); mock.api.retrySourceFolder.mockImplementationOnce(() => second.promise);`.
      - Press: `status()` is "Checking…".
      - `second.resolve("root-unlistable")` then settle: `status()` matches `FAIL`, and `retrySourceFolder` has been called exactly twice.
      - *Fails on the base.*
    - **(rf4)** After (rf2)'s steps:
      - `mock.s.push?.(null)`: `banner()` is null.
      - `mock.s.push?.("watch-failed")`: the banner shows, and `status()` is `""` (no stale line).
      - *Fails on the base at the (rf2) precondition.*
    - **(rf5)** Before the press, `mock.api.retrySourceFolder.mockImplementationOnce(() => Promise.reject(new Error("x")))`. Press and settle: `status()` matches `FAIL`, and Retry is enabled. *Fails on the base.*
  - **Controls:** (fn-n)–(fn-w) pass unchanged on both, including (fn-p)'s no-timer scan, which keeps `checkedAt` honest.
- **Constants:** none. The two strings are owner copy and sit beside `TEXT`, as the existing owner string does.
- **Branch:** `eb/folder-retry-feedback-1` from `main` after the RC merge; push `git push origin HEAD:refs/heads/eb/folder-retry-feedback-1`.
- **Staging plan (explicit paths):**
  - Code: `src/components/FolderNoticeBanner.tsx`, `tests/folderNoticeBanner.test.tsx`.
  - At close-out: `docs/governance/BUG_REPORT.md` (BUG-231 → `RESOLVED in source (FOLDER-RETRY-FEEDBACK-1)`, standing rule 49) and `docs/governance/close-outs/CloseOut.FOLDER-RETRY-FEEDBACK-1.<date>.md`.
- **Failure handling:**
  - If an existing (fn-*) row fails, STOP. Never change its expectation.
  - If the packaged check shows more than one root check per click, STOP and return to Brain1. That is FOLDER-NOTICE-2's dissolved finding (6) and is not fixed silently here.
  - At most two repair passes.
  - Rollback: `git revert -m 1 <merge>`.
- **Execution host:** RodneySr, clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\folder-retry-feedback-1` (build, suite and the x64 package). The arm64 native launch is on Rodney at merge (standing rule 53).
- **Package verification:** standing rule 53 with the RodneySr placement.
  - Build `--dir --x64` and `--dir --arm64` from the final commit with `origin/main` merged.
  - Run the 25 s x64 scratch launch with LL-165 profile proof and the live-profile hash check.
  - The renderer bundle in `npx asar list` must have changed; `main/` must not.
  - Re-run Done-when 4 on the package. Row 5's arm64 check is at merge on Rodney.
  - Brain1 confirms before the merge go.
- **Lane ownership:** UX polish; execution surface C (UI surfaces).
- **Forbidden during parallel run:** `main/`, `main.js`, `preload.js`, `src/types.ts`, `src/styles/`.
- **Shared-core touches:** none.
- **Merge order:** lands before LIBRARY-UI-TEXT-SIZE-1 (Seq 132), so that item's scale covers the new line. The line inherits `.update-banner`, so it scales with no further edit. Independent of everything else.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red rows show no checking or failure line on the base, with existing banner rows green | repeat | positive-control | bounded | low | 4m (median of 20 runs) | — | — |
| 2 | Retry shows "Checking…" and a persistent timed failure line, with no timers and one call per press | repeat | ui-fix | bounded | low | 5m (median of 3 runs) | — | — |
| 3 | Local gates, both reviews, rule 53 package and the live Retry probe with its base detector run | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 21m · sum 21m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- **Standing rule 43 (was LL-138):** (rf1)–(rf5) are red first; (fn-n)–(fn-w) are the controls.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 3.
- **Standing rule 49 (LL-148):** BUG-231 is resolved by item name, not by merge sha.
- **Standing rule 50 (LL-156):** FOLDER-NOTICE-2's dissolved findings were re-read against these edit sites. Only (8), the status line, is in scope, by owner request. The button keeps its "Retry" label so (fn-o)'s and (fn-p)'s button lookups stay valid.
- **Standing rule 53 (was LL-167) and LL-165:** package check on a proven scratch profile with an owned missing folder; the arm64 launch at merge.
- **Standing rule 55 (LL-151/LL-166):** a base-package detector run shows the status line absent.
- **LL-181:** worktree placement and the push refspec.
- **Not applicable:** the remaining live lessons (Narrate/word-index LL-142, 160–162, 170, 173; registry/Notion LL-154, 155, 163, 171, 172; quit/flush LL-157, 159; evidence encoding LL-175–180) were read and do not apply.
