# Roadmap review 2026-11-03 — Phase D brief

*Provenance.*
- **Register:** connector+snapshot, `notion:database/3f87c96cc31e800580cfe019c89a56ca`, taken 2026-11-03T16:48:09Z, re-imported after 12 confirmed mutations (2 spec links, 10 Seq). Recovery is empty.
- **Helper:** qualified, guard PASS at `fcfa9295`.
- **Policy:** buffer target 5 (`dispatchBuffer` unset, default); eager specification on; specifications stored inline in ROADMAP.md with dated amendments under `docs/planning/specs/2026-11-03/`.

## Goal

The owner's first finish line (2026-11-03): a fully functional Windows app, the finalized browser extension, and the Android APK with desktop sync. The next step to it is the release candidate (RC integration window), then the post-RC desktop repairs below.

## Dispatch buffer (5 of 5 specified; none dispatchable until the RC merges)

The head of the belt is the In Flight release-held set. The first five queued, non-epic items with full specifications, in sequence:

| Seq | Item | Effort | Specification | Prerequisite | Repository | External register | Environment |
|---|---|---|---|---|---|---|---|
| 89 | A library edit stamps only what the reader changed; a missing book fails the save; a save answers only its own form (LIBRARY-WRITE-RACE-3) | M | PASS (U9 PASS) | **GAP:** waits on the RC merge (LWR-2 and APP-TABS-1 ride it) | PASS: base is the RC merge SHA, named at kickoff | PASS: fresh snapshot, Seq writes supported | PASS: RodneySr online, clone `C:\Users\estra\Projects\Blurby` |
| 99 | In Narrate, an arrow with a modifier key pauses and the cursor holds its word (NARRATE-ARROW-PAUSE-1) | S | PASS | **GAP:** RC merge (READER-ARROW-GUARD-1 rides it) | PASS | PASS | PASS |
| 117 | Narrate resumes from the word explicitly selected while paused (NARRATE-PAUSED-CLICK-1) | S | PASS: N-Q1 confirmed by Brain1; ns10 asserts behaviour only | **GAP:** RC merge, then NARRATE-ARROW-PAUSE-1 (run in sequence) | PASS | PASS | PASS |
| 119 | Page receives section navigation keys before word wrapping completes (PAGE-ENTRY-KEYS-1) | S | PASS | **GAP:** RC merge (whole Page stack) | PASS | PASS | PASS |
| 123 | Focus retains its word cursor without a horizontal dimming band (FOCUS-WORD-ONLY-1) | S | PASS | **GAP:** RC merge (PLAY-FIRST-TEXT-1 and BAND-ALIGN-2 ride it) | PASS: new branch `eb/focus-word-only-1-rc`; old ref preserved | PASS | PASS |

NARRATE-CPU-PROFILE-1 (Seq 95, In Flight, U9 PASS) resumes its remaining Wave A (A3 + A4, one wave of 60 minutes or less) under Brain1's CPU-1 ruling. It carries F-009.

**Implementation highlights:** each item builds and holds on RodneySr in the clone's `.worktrees\<name>`, then gets its own rule 53 pair, Brain1's package confirmation and Blurby.Roadmap's merge go. Owner smoke checks are batched into gate (2).

**Serialization (Brain1 ruling, 2026-11-03; supersedes the parallelism notes this brief carried before):**
- After the RC merge, the five items run **one at a time** on RodneySr, in Seq order: LWR-3, NAP-1, PAUSED-CLICK, PAGE-ENTRY, FOCUS-RC.
- They have no file conflicts with one another. The reason is the gates: every item gates on timing-sensitive suites and on a rule 53 launch on a 4-core host, and parallel runs would skew both.

## Prerequisites into and out of the buffer

- **In:** the RC integration window merge (its 21 tips), Brain1's package confirmation on its final tip, and the merge go.
- **Out:** the five items' merges feed gate (1) on the next candidate and the owner's gate (2).

## Exit criteria and duration

**Exit criteria:** all five are built, package-confirmed and merged. Their Done-when rows re-run on the packaged build.

**Duration:** the calibrated task lists price PAUSED-CLICK at 18 minutes of chain. Estimates carry row error 0.90 and effort calibration 0.62, so treat them as rough. Expected: about one to two RodneySr sessions after the RC merges.

## Top risks

1. **The RC window slips.** Every buffered item waits on it. The branch has advanced to `bed4e180`; no wave evidence has come back yet.
2. **Edit sites move under the RC tree.** Each amendment requires a re-grep at the base, and a moved contract returns to the planner. PAGE-ENTRY's `FoliateView.tsx` changes in four RC stacks.

## Buffer gaps and next specifications

- **Not counted in the buffer:**
  - BLOCK-TEXT-ORDER-1 (87.5) is still a stub; WORD-INDEX-UNIFY-1 (88) is specified.
  - Both sit under the word-index contract (the WORD/GROUP proof is NOT READY).
- **First finish line stubs that need owner design input before specification:**
  - **BROWSER-EXT-FINALIZE-1 (142):** the owner's list of what "finalized" covers (features, store publishing, accounts).
  - **BLURBY-SERVER-1 (143):** epic charter; owner gates on the Cloudflare account, payment provider and Kokoro speed-and-cost. Since Android must sync, the first finish line needs at least sign-in and sync. Whether plan limits and payment are also in it is an owner call at the charter.
  - **ANDROID-APP-1 (144):** epic; the architecture decision comes first (native, React Native, a Capacitor or WebView shell, or another).
- **Later expansion (Seq 150–156):** stubs or held charters. No specification work this cycle.

## Lessons applied

See [2026-11-03-lessons-applied.md](2026-11-03-lessons-applied.md). In short, LL-181 is in every amendment, LL-169 and LL-174 per item, and LL-176 and LL-178 apply to evidence review.
