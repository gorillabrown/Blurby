# NARRATE-PAUSE-CANCEL-1 — Governance staging memo (2026-10-30)

**State:** built and held on `eb/narrate-pause-cancel-1`. No merge without Blurby.Roadmap's go. Evidence: `docs/studies/investigations/NARRATE-PAUSE-CANCEL-1.2026-10-30.md`.

**Confirmed under rule 53 by Blurby.Brain (2026-10-30):** x64, RodneySr; arm64 launch at merge.

## What changed

- Main: `producer.cancelQueued(groupPrefix)` rejects the not-yet-started jobs of one engine group with `NARRATE_CANCELLED_ERROR` and leaves running jobs alone. The new `narrate-cancel-queued` channel accepts only a non-empty string prefix, and a cancelled generation is not logged as an error.
- Preload: `narrateCancelQueued`, string-only.
- Renderer: `NarrateEngine.pause()` cancels its own group's queued jobs, and a cancelled prefetch rewinds so the resume regenerates it from its first word.
- Census: `NARRATE_CANCELLED_ERROR` is declared for the Narrate root. **Fence amended by Brain ruling: census declaration.**

## Results

- **(S) staged pause:** base 3 of 3 runs post a generation after the press; after, 0 of 3. Press-to-cancel takes 13–24 ms, and the linger falls from 1.73–3.06 s to 0.90–1.17 s.
- **D6:** base PASS. After exits 0, worst resume 96 ms. The compare has a literal exit 1 (`check-d6.cjs`): the excepted warm-2.00-3 run was not reached on the after side. Ruling (a) passes it: "warm-2.00-3 not reached after: 21 counting resumes in two runs; after worst 96 ms (warm-2.00-2, word 8732)". The base's excepted trial (word 8748, 2354 ms) is BUG-237, fixed by NARRATE-GAP-PAUSE-1. F-009 speed overs are recorded only.
- **T2-2:** 0 gaps on both sides; the planted control is flagged.
- **One-fix change:** (e3) runs 3 s, not 0.5 s (accepted by Brain).
- **Gates:** `npm test` 183 files, 2,466 passed, 1 skipped, 0 failed; typecheck 0; build 0.
- **Package:** x64 and arm64 asar identical, `F961A79C…B975A`; pair check 0; clean 25 s x64 launch.

## Docs

- BUG-207: the generation posted after a pause is RESOLVED in source (NARRATE-PAUSE-CANCEL-1); the slow quit stays OPEN.
- Nothing is written to `ROADMAP.md` or the register (standing rule 46).

## Owner check (batched, release gate (2))

**(o1)** "In Narrate, pause for about 5 s mid-paragraph, then resume. By ear, speech continues from the paused word with no repeat, skip or new silence."
