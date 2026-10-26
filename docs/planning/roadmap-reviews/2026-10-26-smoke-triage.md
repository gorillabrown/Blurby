# Smoke intake and fix priorities — 2026-10-26

Focused owner-authorized intake, not a full roadmap-review ceremony. Existing Seq/status values stay intact; AUTO-ARCHIVE-1 loses Full Spec readiness because the owner changed its design. It stays Queued at Seq 111. New stubs append at Seq 116–138. New findings do not reopen completed work or widen held implementation fences.

## Source and evidence

- Release: 36ac7466749688c9ba5e17de841224fab08d7bae, Blurby-Setup-1.75.1-arm64.exe, SHA256 216219A1A73F32ED094AA51AE9CED9586E5B1D9116A180C14BA1EC614F12BD7C.
- Run evidence: C:/Projects/Blurby-artifacts/smoke-stage8-20261026-145107/, including smoke-state.json, smoke-checkpoint-2026-10-26.md, screenshots, library snapshots and logs.
- Live provider: notion:database/3f87c96cc31e800580cfe019c89a56ca, data source collection://3f87c96c-c31e-80bd-b6f0-000bdc2d7c2c. Complete 168-row pre-write readback is in roadmap-live-before.json. Snapshot is a cache, not authority.
- Owner drives UI. Saved records/logs do not replace visual or heard-audio observation. All 30 source entries retain original evidence and caveats in smoke-state.json.

## Recommended order

| Order | Fix group | Rationale |
|---|---|---|
| 1 | LIBRARY-COMPLETION-VISIBILITY-1 + AUTO-ARCHIVE-1 amendment | A retained read must stay reachable; confirmation prevents an assumed finish becoming unwanted archive. |
| 2 | NARRATE-SELECTION-START-1; FOCUS-PAUSED-HANDOFF-1; PAGE-ENTRY-KEYS-1 | Selected position, playback and navigation must be trustworthy, with isolated mode ownership. |
| 3 | FOLDER-SWITCH-CONTENT-1; PROFILE-QUEUE-ISOLATION-1 independently | Diagnose loading/cancellation and attribute the queue writer before expanding sync. |
| 4 | Held BAND-ALIGN-1/2 and FOLIATE-OBSERVER-LEAK-1; BOOK-TYPE-SCALE-2; FOCUS-WORD-ONLY-1 | Reuse held fixes, verify residuals, reconcile Focus-only band removal. |
| 5 | Device-local E-ink settings, appearance/mode availability, independent Flow/Narrate viewport work, view-change refresh | Set device boundaries before cross-device sync; preserve mode ownership. |
| 6 | Retry feedback/type size; dropdown dismissal; position-prompt wording | Make outcomes and actions clear; independent UI work may be prepared alongside investigations after ownership is assigned. |
| 7 | Page counter, footer removal, tray sizing, content dedup design | Lower-risk polish follows correctness. |
| Final verification | SMOKE8-COVERAGE-RECHECK-1 | Missing exact scenarios on an approved candidate; no freeze exception or gate PASS is granted. |

P1/P2/P3 are proposed relative priorities in this intake, not new release gates. Existing Stage 8 holds and FIFO remain. No estimates are fabricated; no new stub is dispatch-ready.

## All smoke sources mapped

| Source | Recorded issue / request | Work item(s) |
|---|---|---|
| SMOKE-F1-TRAY-ICON | Tray icon is unusually small, also reported as F1 in the 2026-10-23 smoke. | TRAY-ICON-SIZE-1 |
| SMOKE-F2-TEXT-FORMATTING | User reports inconsistent text formatting. Screenshot shows mixed letter sizes/small-cap styling in headings and opening words, with wide justified spacing. | BOOK-TYPE-SCALE-2 |
| SMOKE-R1-PAGE-NUMBERS | Add page numbers in the reader, likely beside the reading time. | READER-PAGE-COUNTER-1 |
| SMOKE-F3-PAGE-KEYBOARD-ENTRY | Initial PageDown did not advance the page. Mouse next-page navigation worked; Left/Right and PageDown then worked. | PAGE-ENTRY-KEYS-1 |
| SMOKE-F4-FOCUS-PAUSED-HANDOFF | Page to Focus selection initially highlights the wrong word while paused; pressing Play aligns to the expected Page word. | FOCUS-PAUSED-HANDOFF-1 |
| SMOKE-R2-EINK-DEFAULT | Ensure E-ink is off by default. | EINK-DEVICE-SETTINGS-1 |
| SMOKE-R3-POSITION-PROMPT | First Keep Previous Position (pg#); second Move Position (pg#); preserve anchor meanings. | POSITION-PROMPT-COPY-1 |
| SMOKE-R4-REMOVE-FOCUS-BAND | We can remove the horizontal highlight in focus. | FOCUS-WORD-ONLY-1 |
| SMOKE-F5-FLOW-BAND-OFFSET | Flow has the same reported mismatch between horizontal reading-band position and current word. | BAND-ALIGN-1, BAND-ALIGN-2 |
| SMOKE-F6-FLASHING | Frequent app flashing observed while testing Dark theme with E-ink Display Mode enabled. | EINK-VIEW-REFRESH-1 |
| SMOKE-R5-EINK-APPEARANCE | An aside, eink theme should be gray scale, with the predominant color being white. Let's not give theme options. Only contrast option in eink theme settings. | EINK-APPEARANCE-2 |
| SMOKE-F7-NARRATE-PAUSED-BAND | Narrate horizontal band and word cursor are offset before playback; they align while playback is running. | NARRATE-SELECTION-START-1 |
| SMOKE-F8-NARRATE-PLAY-VIEWPORT | Pressing Play jumps the underlined word to the top of the page. | NARRATE-SELECTION-START-1 |
| SMOKE-F9-NARRATE-IGNORES-CLICK | With Narrate paused, clicking a different word does not change the subsequent Play start position; narration continues from the prior position. | NARRATE-SELECTION-START-1 |
| SMOKE-R6-EINK-NO-FOCUS | When E-ink mode is enabled, do not offer Focus mode. | EINK-MODE-AVAILABILITY-1 |
| SMOKE-R7-EINK-PAGEWISE-FOLLOW | In E-ink mode, Flow and Narrate retain a stationary page viewport while their reading position progresses. Advance the viewport at the bottom boundary rather than continuously following by scrolling. | EINK-FLOW-VIEWPORT-1, EINK-NARRATE-VIEWPORT-1 |
| SMOKE-R8-EINK-VIEW-CHANGE-REFRESH | Trigger the E-ink refresh on discrete view changes, including page/viewport advances, menu changes and book entry/exit, rather than an elapsed-time auto-refresh policy. | EINK-VIEW-REFRESH-1 |
| SMOKE-R9-DEVICE-LOCAL-SETTINGS | Settings should also be tied to a device, not an account, as I have an eink device, I want to always load blurby in eink mode. Otherwise, on my computer and phone, I always want regular mode to load. | EINK-DEVICE-SETTINGS-1 |
| SMOKE-R10-LIBRARY-FOOTER | Remove these library settings. They're not needed | LIBRARY-FOOTER-REMOVE-1 |
| SMOKE-F10-LARGE-LIBRARY-SLOW | User reports the folder-backed library is very slow while initial scan is adding entries. | FOLDER-SWITCH-CONTENT-1 |
| SMOKE-F11-DUPLICATE-SOURCE-CONTENT | Duplicate-looking cards correspond to different file paths under Readings\Books and Readings\Books\Books. The two sampled title pairs have matching byte sizes and SHA-256 content hashes. No repeated exact file path was found among the 412 captured library records. | LIBRARY-CONTENT-DEDUP-1 |
| SMOKE-F12-FOLDER-DROPDOWN-DISMISS | Folder dropdown remains open after clicking outside the menu. | DROPDOWN-DISMISS-1 |
| SMOKE-R11-DROPDOWN-DISMISSAL | Every dropdown dismisses when clicking outside it; outside dismissal preserves the current selection rather than choosing a different item. | DROPDOWN-DISMISS-1 |
| SMOKE-F13-RECENT-FOLDER-CONTENT | After selecting Readings, the header updates but the previous small-folder cards remain during a long scan-start/loading gap. Readings entries subsequently begin arriving. | FOLDER-SWITCH-CONTENT-1 |
| SMOKE-F14-COMPLETED-UNARCHIVED-INVISIBLE | The short plain-text test book is saved at position 91 of 91 words after opening. Its record and source file remain present, it is not archived, but its card is no longer visible. | LIBRARY-COMPLETION-VISIBILITY-1 |
| SMOKE-F15-TEXT-OPEN-RESIZEOBSERVER | Scratch-profile error.log contains repeated ResizeObserver loop completed with undelivered notifications entries around 2026-10-26T17:21:10Z during the text-book test. | FOLIATE-OBSERVER-LEAK-1 |
| SMOKE-R12-COMPLETION-ARCHIVE-CONFIRMATION | At assumed completion, offer an Archive option and ask the user to confirm they have finished. Completed reads must remain discoverable; the owner expects these reads to be found in the Archive tab. | AUTO-ARCHIVE-1, LIBRARY-COMPLETION-VISIBILITY-1 |
| SMOKE-R13-LIBRARY-UI-FONT-SIZE | Increase library UI font size, especially the source-folder warning banner and Retry control shown in the screenshot. | LIBRARY-UI-TEXT-SIZE-1 |
| SMOKE-F16-RETRY-NO-VISIBLE-FEEDBACK | Clicking Retry while Drive is disconnected gives no clear visible confirmation that the request ran or failed; unchanged banner leaves the owner uncertain. | FOLDER-RETRY-FEEDBACK-1 |
| SMOKE-F17-LIVE-SYNC-QUEUE-CHANGED | Normal profile sync-queue.json hash differs from pre-PartB baseline; library.json and settings.json hashes still match. | PROFILE-QUEUE-ISOLATION-1 |

## Backlog outcomes and acceptance

### LIBRARY-COMPLETION-VISIBILITY-1 — Finished books remain visible until the reader archives them

[Live Notion item](https://app.notion.com/p/4057c96cc31e81a2a666c329943a6ff8?pvs=204)

- Queued / Stub; Seq 116; lane: Library & Content; proposed priority: P1.
- Sources: F14; BUG-230.
- Problem / owner direction: A 91-word text was saved at 91/91, kept on disk and in the register, yet excluded from every library display group. Diagnose first-open completion separately from the proven visibility hole.
- Acceptance to specify: A completed, unarchived read remains findable in All until an explicit archive decision. Confirmed archived reads appear in Archive. Declining or dismissing confirmation never hides the read; no reset, forced completion or silent archive workaround.
- Coordination: AUTO-ARCHIVE-1 shares completion semantics, but is not a hard prerequisite. The immediate visibility repair can be specified and delivered independently.

### NARRATE-SELECTION-START-1 — Narrate starts at the selected word and aligns its paused display

[Live Notion item](https://app.notion.com/p/4057c96cc31e81fda566d92dc9b59161?pvs=204)

- Queued / Stub; Seq 117; lane: TTS / Narration Engine; proposed priority: P1.
- Sources: F7, F8, F9; BUG-227.
- Problem / owner direction: Paused word clicks are ignored on Play; the paused horizontal band is offset, and Play scrolls the underlined word to the top. Diagnose the three paths independently before fixing.
- Acceptance to specify: A paused clicked word determines the next start per explicit-selection rules; paused band/cursor agree; playback viewport policy is deliberate. Preserve exact heard-word timing and distinguish scrolling from changing the logical word.
- Related prerequisites: NARRATE-SENTENCE-RESUME-1.

### FOCUS-PAUSED-HANDOFF-1 — Focus shows the correct word immediately on entry

[Live Notion item](https://app.notion.com/p/4057c96cc31e81c1be4ced7f49d221ef?pvs=204)

- Queued / Stub; Seq 118; lane: Reader Engine; proposed priority: P1.
- Sources: F4; BUG-226.
- Problem / owner direction: Switching from Page to paused Focus initially shows the wrong word; Play corrects it. No evidence yet distinguishes stale display from stale position.
- Acceptance to specify: The handoff word is correct before playback, remains correct after pause, and persists through reopen. Fix within Focus ownership; no sibling-mode imports or shared mutable mode state.
- Related prerequisites: No confirmed item dependency yet; investigate before dispatch..

### PAGE-ENTRY-KEYS-1 — Page navigation keys work when the book first opens

[Live Notion item](https://app.notion.com/p/4057c96cc31e81f28aedeeebd17e1826?pvs=204)

- Queued / Stub; Seq 119; lane: Reader Engine; proposed priority: P1.
- Sources: F3; BUG-225.
- Problem / owner direction: Initial PageDown did nothing until mouse Next was used; Left/Right and PageDown then worked. Readiness/focus cause is unverified and differs from paragraph-key BUG-220.
- Acceptance to specify: Reproduce initial keyboard use without mouse navigation; PageDown and arrows advance when ready, with no dropped or double page turns and correct saved progress.
- Related prerequisites: No confirmed item dependency yet; investigate before dispatch..

### FOLDER-SWITCH-CONTENT-1 — Folder switching shows the correct books promptly

[Live Notion item](https://app.notion.com/p/4057c96cc31e814985e7f67c1d8f69a0?pvs=204)

- Queued / Stub; Seq 120; lane: Library & Content; proposed priority: P1.
- Sources: F10, F13; BUG-228.
- Problem / owner direction: The header follows selection, but old-folder cards remain during a long cancellation/scan gap. Readings records began arriving after about 93 seconds; this is eventual loading, not permanent failure.
- Acceptance to specify: Measure loading and cancellation separately on small and large collections; prevent stale cards being presented as the new folder's books, keep the UI responsive, and preserve existing records/progress. No local import cap or subfolder picker is authorized.
- Related prerequisites: LARGE-FOLDER-SYNC-2.

### PROFILE-QUEUE-ISOLATION-1 — Explain the normal-profile sync-queue change during isolated QA

[Live Notion item](https://app.notion.com/p/4057c96cc31e8128bbb6f504a34e543d?pvs=204)

- Queued / Stub; Seq 121; lane: Platform & Maintenance; proposed priority: P1.
- Sources: F17; BUG-232.
- Problem / owner direction: Normal library.json/settings.json hashes stayed unchanged, but sync-queue.json changed. Which process wrote it and whether isolation was breached are unresolved.
- Acceptance to specify: Attribute the writer using bounded evidence, classify intended versus unintended writes, and fix a proven isolation defect if found. Preserve the queue and user data; do not call this data loss or attribute it to the scratch app without proof.
- Related prerequisites: No confirmed item dependency yet; investigate before dispatch..

### BOOK-TYPE-SCALE-2 — Diagnose residual uneven book typography on the release build

[Live Notion item](https://app.notion.com/p/4057c96cc31e81009e67f007522507f7?pvs=204)

- Queued / Stub; Seq 122; lane: Reader Engine; proposed priority: P2.
- Sources: F2; BUG-224.
- Problem / owner direction: Mixed small caps/letter sizes and wide justified spacing remain on the exact release that includes BOOK-TYPE-SCALE-1. Publisher typography versus app overrides is unresolved.
- Acceptance to specify: Compare the source EPUB and app styles, identify the responsible rule, then specify the smallest correction to the intended heading/body scale. Retain semantic emphasis and check all modes independently.
- Related prerequisites: BOOK-TYPE-SCALE-1.

### FOCUS-WORD-ONLY-1 — Focus uses a word cursor without the horizontal band

[Live Notion item](https://app.notion.com/p/4057c96cc31e812394acc7149e97d9af?pvs=204)

- Queued / Stub; Seq 123; lane: Reader Engine; proposed priority: P2.
- Sources: R4; BUG-188.
- Problem / owner direction: The owner requests removal of Focus's horizontal highlight, retaining the word cursor. BAND-ALIGN-2's held Focus design still preserves a band.
- Acceptance to specify: Remove only Focus's band and band-only controls, if any; keep its word cursor and unrelated Focus settings. Flow and Narrate retain their own band requirements. Reconcile the held alignment stack before specification.
- Related prerequisites: BAND-ALIGN-2.

### EINK-DEVICE-SETTINGS-1 — Remember E-ink preferences separately on each device

[Live Notion item](https://app.notion.com/p/4057c96cc31e815197aef3090001e3e4?pvs=204)

- Queued / Stub; Seq 124; lane: Platform & Maintenance; proposed priority: P2.
- Sources: R2, R9.
- Problem / owner direction: An unconfigured device should start in regular mode; an explicitly configured E-ink device remembers E-ink. The tested upgrade inherited einkMode=true; source defaults are already false.
- Acceptance to specify: Classify device-local settings and exclude them from cross-device upload/apply. Clean-profile default is off; explicit on survives local restarts; computer/phone settings do not override the E-ink device. Preserve migration and existing choices.
- Related prerequisites: EINK-CONTROLS-1.

### EINK-APPEARANCE-2 — E-ink uses white-dominant grayscale and contrast-only appearance controls

[Live Notion item](https://app.notion.com/p/4057c96cc31e81c7b655f15f8563c66a?pvs=204)

- Queued / Stub; Seq 125; lane: UX polish; proposed priority: P2.
- Sources: R5.
- Problem / owner direction: Extend the held EINK-CONTROLS-1 direction with the owner's new grayscale/white appearance and contrast-only controls.
- Acceptance to specify: E-ink surfaces are grayscale with white dominant; no E-ink theme chooser; contrast is the sole E-ink appearance option. Ordinary display themes remain available outside E-ink.
- Related prerequisites: EINK-CONTROLS-1.

### EINK-MODE-AVAILABILITY-1 — Focus is unavailable while E-ink is enabled

[Live Notion item](https://app.notion.com/p/4057c96cc31e8153b060edb66ede2b57?pvs=204)

- Queued / Stub; Seq 126; lane: UX polish; proposed priority: P2.
- Sources: R6.
- Problem / owner direction: Hide Focus in E-ink, including entry via shortcuts and remembered-mode restore. Enabling E-ink while Focus is active needs a specified fallback.
- Acceptance to specify: No route enters Focus while E-ink is enabled; decide and document the active-Focus transition before implementation. Regular displays retain Focus.
- Related prerequisites: EINK-CONTROLS-1.

### EINK-FLOW-VIEWPORT-1 — Flow advances a screen at a time on E-ink

[Live Notion item](https://app.notion.com/p/4057c96cc31e818f826ced498ff8659b?pvs=204)

- Queued / Stub; Seq 127; lane: Reader Engine; proposed priority: P2.
- Sources: R7.
- Problem / owner direction: In E-ink, keep Flow's viewport stationary until its reading position reaches the bottom, then advance. Compare the held BAND-ALIGN-2 Flow stepping before prescribing residual work.
- Acceptance to specify: Flow-owned implementation: correct word tracking throughout a stationary viewport, one advance at the bottom boundary, defined browse/clamp/chapter behavior, and regular-mode behavior unchanged. No Narrate-runtime dependency.
- Related prerequisites: BAND-ALIGN-2; EINK-CONTROLS-1.

### EINK-NARRATE-VIEWPORT-1 — Narrate advances a screen at a time on E-ink

[Live Notion item](https://app.notion.com/p/4057c96cc31e815289dfca4f54f40102?pvs=204)

- Queued / Stub; Seq 128; lane: TTS / Narration Engine; proposed priority: P2.
- Sources: R7.
- Problem / owner direction: In E-ink, keep Narrate's viewport stationary while the heard word advances, then move at the bottom boundary.
- Acceptance to specify: Narrate-owned implementation retains exact audio-word timing, advances once per screen boundary, defines manual browsing and chapters, and leaves regular-mode behavior unchanged. Mirror the contract, not Flow's mutable runtime.
- Related prerequisites: NARRATE-SELECTION-START-1; EINK-CONTROLS-1.

### EINK-VIEW-REFRESH-1 — Refresh E-ink on view changes instead of elapsed time

[Live Notion item](https://app.notion.com/p/4057c96cc31e818b9dd1d78abc1d06a5?pvs=204)

- Queued / Stub; Seq 129; lane: UX polish; proposed priority: P2.
- Sources: F6, R8.
- Problem / owner direction: Flashing is the existing E-ink ghosting overlay, confirmed absent when E-ink is off. No periodic timer defect was established. Owner wants view-change-driven refreshes.
- Acceptance to specify: Page/screen advances, menu changes and book entry/exit trigger the declared refresh policy; idle time and per-word updates do not. Preserve finite flash cleanup/duration and avoid duplicate flashes for one transition.
- Related prerequisites: EINK-CONTROLS-1; EINK-FLOW-VIEWPORT-1; EINK-NARRATE-VIEWPORT-1.

### FOLDER-RETRY-FEEDBACK-1 — Retry visibly reports checking and an unavailable folder

[Live Notion item](https://app.notion.com/p/4057c96cc31e814891edfe7717babb01?pvs=204)

- Queued / Stub; Seq 130; lane: UX polish; proposed priority: P2.
- Sources: F16; BUG-231.
- Problem / owner direction: The single Retry works and logs one null root result, but its unchanged UI leaves the reader unsure anything happened. FOLDER-NOTICE-2 is dissolved and is not reopened.
- Acceptance to specify: Show an accessible checking state and a clear unavailable result after failure; successful retry clears the banner. Preserve single-click/single-request behavior and no repeated toast loop.
- Related prerequisites: FOLDER-NOTICE-1.

### LIBRARY-UI-TEXT-SIZE-1 — Make library interface text comfortably readable

[Live Notion item](https://app.notion.com/p/4057c96cc31e81098309ea5f5c2beb44?pvs=204)

- Queued / Stub; Seq 131; lane: UX polish; proposed priority: P2.
- Sources: R13.
- Problem / owner direction: The owner requests larger library UI text; the warning banner and Retry screenshot make the problem especially clear. This is distinct from in-book typography.
- Acceptance to specify: Specify a larger library UI type scale covering metadata, tabs, controls and notices; warning/Retry text is readable without clipping at tested display scaling. Do not silently restrict this to the banner.
- Related prerequisites: No confirmed item dependency yet; investigate before dispatch..

### DROPDOWN-DISMISS-1 — Dropdowns close on outside click and preserve the selection

[Live Notion item](https://app.notion.com/p/4057c96cc31e81c68affd918343a362c?pvs=204)

- Queued / Stub; Seq 132; lane: UX polish; proposed priority: P2.
- Sources: F12, R11; BUG-229.
- Problem / owner direction: The Folder dropdown remains open after outside clicks. The owner requests consistent dismissal across all dropdowns; only Folder is observed failing.
- Acceptance to specify: Inventory dropdowns, dismiss on outside click without selecting/changing a value, and preserve normal inside clicks and selection. Verify each supported menu rather than assume all are currently broken.
- Related prerequisites: No confirmed item dependency yet; investigate before dispatch..

### POSITION-PROMPT-COPY-1 — Put Keep Previous Position before Move Position

[Live Notion item](https://app.notion.com/p/4057c96cc31e81e7b4b6f475807e73cb?pvs=204)

- Queued / Stub; Seq 133; lane: UX polish; proposed priority: P2.
- Sources: R3.
- Problem / owner direction: Owner wording/order: first Keep Previous Position (pg#), second Move Position (pg#). Keep retains the previous protected position and Move saves the displayed page.
- Acceptance to specify: Use those labels in that order with actual page numbers. Preserve the current anchor/furthest calculations; coordinate with FURTHEST-PERSIST-1 without redefining what a saved position means.
- Related prerequisites: KEEP-FURTHEST-FIX-1.

### READER-PAGE-COUNTER-1 — Display the reading page near the remaining time

[Live Notion item](https://app.notion.com/p/4057c96cc31e81b19b53f0baa8dd5434?pvs=204)

- Queued / Stub; Seq 134; lane: UX polish; proposed priority: P3.
- Sources: R1.
- Problem / owner direction: Add a page display near reading time. This is distinct from PAGE-PAGES-READ-1's goal counter.
- Acceptance to specify: Specify pagination semantics for reflowable books, PDFs and each mode; display the current page and an honest total where computable, with coherent resize/font-change behavior.
- Related prerequisites: No confirmed item dependency yet; investigate before dispatch..

### LIBRARY-FOOTER-REMOVE-1 — Remove the unused settings controls from the library footer

[Live Notion item](https://app.notion.com/p/4057c96cc31e814a8e7dc08fc6617280?pvs=204)

- Queued / Stub; Seq 135; lane: UX polish; proposed priority: P3.
- Sources: R10.
- Problem / owner direction: Remove the footer speed/WPM slider, Start at login checkbox, Backup and Restore buttons shown by the owner.
- Acceptance to specify: Remove those UI controls only. Preserve backup/restore capability, user data and login support elsewhere; decide placement only if needed. Do not conflate with completed LIBRARY-SETTINGS-FIX-1.
- Related prerequisites: No confirmed item dependency yet; investigate before dispatch..

### TRAY-ICON-SIZE-1 — Make the Windows tray icon legible at normal scaling

[Live Notion item](https://app.notion.com/p/4057c96cc31e8122841ff5b7a9c0ddcb?pvs=204)

- Queued / Stub; Seq 136; lane: Platform & Maintenance; proposed priority: P3.
- Sources: F1; BUG-203.
- Problem / owner direction: Existing BUG-203: tiny Windows tray icon recurs in this smoke. PACKAGING-FIX-1 shipped assets but did not fix the visual sizing.
- Acceptance to specify: Inspect actual icon padding and Windows raster size/DPI handling, then verify legible tray rendering at normal and scaled displays with menu behavior intact.
- Related prerequisites: PACKAGING-FIX-1.

### LIBRARY-CONTENT-DEDUP-1 — Make identical books at different source paths understandable

[Live Notion item](https://app.notion.com/p/4057c96cc31e811a9862d4bb26e0b51b?pvs=204)

- Queued / Stub; Seq 137; lane: Library & Content; proposed priority: P3.
- Sources: F11.
- Problem / owner direction: Duplicate-looking cards came from different Books and Books\\Books paths; two sampled pairs had identical SHA256. No repeated exact filepath was found.
- Acceptance to specify: Specify non-destructive content-identity detection/presentation, distinguish editions, and preserve progress/favorites. No source deletion, auto-merge or automatic hiding is authorized by this report.
- Related prerequisites: No confirmed item dependency yet; investigate before dispatch..

### SMOKE8-COVERAGE-RECHECK-1 — Close the remaining smoke coverage gaps on one candidate build

[Live Notion item](https://app.notion.com/p/4057c96cc31e81d9a265ec3c679ce50d?pvs=204)

- Queued / Stub; Seq 138; lane: Platform & Maintenance; proposed priority: P1.
- Sources: Residual smoke coverage gaps.
- Problem / owner direction: The smoke is RED. Check31 visual deadlines/immediate quit, check32 active-scan overlap, check33 exact scenario, check35 disconnected quit, and earlier input/handoff gaps remain unverified.
- Acceptance to specify: After candidate fixes and an approved release integration window, run the missing exact scenarios with owner-observed UI/audio where required; keep one build identity, per-check timing and before/after evidence. No partial is promoted to PASS and no release hold is lifted by backlog registration.
- Related prerequisites: No confirmed item dependency yet; investigate before dispatch..

## Important dispositions

- AUTO-ARCHIVE-1: confirmation-first supersedes silent exit-at-end auto-archive. Compatible Mark complete/Undo choices remain history to reconcile. Prompt timing/decline/restore/history effects need amended tests; Spec State becomes Stub, Status/Seq remain Queued/111.
- F5/F15 attach recurrence evidence to existing open bugs/held implementations. Acceptance needs the future integrated candidate; this release does not include all held work.
- Similar mode symptoms do not prove a shared cause. Focus removal does not remove Flow/Narrate bands. E-ink implementations mirror the contract while remaining mode-owned.
- F11 is a content-identity design question, with identical hashes at distinct paths. No automatic deletion/hiding/file merge/progress merge is authorized.
- F17: normal library/settings hashes remain identical; queue changed. Writer/cause/effect unresolved. Do not reset it or label this data loss.
- All records stay findable if completion is unconfirmed. Confirmed archived reads belong in Archive. First-open completion and the missing display section are separate diagnoses.
- Smoke remains RED with coverage gaps. This intake is not implementation, release promotion or a full ceremony.
- Preflight is usable with the existing old policy.roadmap.lanes key warning; no unrelated registry repair is included.

## Final provider verification

- Final live readback: 2026-10-26T19:09:19Z; 191 unique work items (168 original plus 23 new), no duplicate Sprint Codes.
- All original Status and Seq values unchanged. The six existing updates change only the intended Description fields and AUTO-ARCHIVE-1 title/Spec State. AUTO-ARCHIVE-1 is Queued / Stub at Seq111.
- All 29 initial mutations plus two review refinements were read back and confirmed through the provider recovery handshake. No intake recovery record remains unresolved.
- Review refinements: visibility repair coordinates with AUTO-ARCHIVE-1 without a hard prerequisite; Focus removal affects band-only controls, if any, and preserves unrelated settings.
- ROADMAP.md stays below the 2,000-line ceiling. No application source, runtime configuration, user library, release status, existing sequence or terminal ledger was changed by this planning update.

## Approved review amendment

PhaseC approved the product choices in 2026-10-26-plan.md. PhaseD adds NARRATE-PAUSED-CLICK-1 at117 for source F9 (paused mouse selection ignored on Play). The former parent NARRATE-SELECTION-START-1 retains F7/F8 visual diagnosis at124. The final segment occupies116–139 and the live count is192. The original30 smoke sources remain covered; this decomposition is not an additional smoke finding or a completed fix. See 2026-10-26-phase-brief.md and 2026-10-26-readiness.md.
