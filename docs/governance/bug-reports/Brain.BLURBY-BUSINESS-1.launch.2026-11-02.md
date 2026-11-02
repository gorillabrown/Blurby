# Business parallel launch technical rulings

Actual final responses read from owner-delegated Codex Blurby.Brain, chat `01a179e8-7a40-75c0-93f4-d3045ad99027`, turn `01a19e60-da7c-7052-971a-841c45ff4ceb`. Both final messages preserved verbatim; no terminal acceptance or release authority.

**Ruling BB-2026-11-02-1: close visibility’s exclusive source/test window and permit Business to proceed on RodneySR, alongside A2, after the parent records and reads back that disposition.** Visibility remains **In Flight**; integration, ARM64 launch and release acceptance remain outstanding.

**Evidence for window closure**

This is based on completed custody handoffs, not the status label:

- The [original admission](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/docs/planning/roadmap-reviews/2026-10-26-library-visibility-admission.md:17) assigned exclusivity **until verification/handoff**.
- Published source delivery `a8e31b7363da5c8dd1d8d059915081195d3cc3b6` retains implementation `0dd4d94026f2574f735031b2b1569aee09d17120`, completed regression checks and a built-and-held handoff.
- The [actual RodneySr executor message](C:/Users/estra/.claude/projects/C--Projects-Blurby/ff404761-a31b-410e-9e13-218a031baa7c.jsonl:3128), dated October30, reports visibility job3 complete on combined candidate `2d5772d3aa8a032118b973a4cf94af03ac759864`, branch held at `4ac4ff76c89bbde25f87319cc9b0c6ff314d89c7`, then explicitly starts job4.
- I read that held commit’s `docs/studies/investigations/LIBRARY-COMPLETION-VISIBILITY-1.package.2026-10-30.md`: it records the candidate/base controls, 67/67 targeted tests, unchanged live hashes and remaining ARM64 launch at merge.
- Fresh Notion SQL confirms visibility **In Flight/116**, Business **Queued/100.5**, and no existing explicit window-closed note.

**I therefore close the old source/test reservation now, on November2.** This does not backdate a registry action or declare terminal completion. Any further visibility source correction requires a newly assigned window; an old executor must not automatically reopen it.

The parent may append this disposition through its guarded provider transaction:

> Brain ruling BB-2026-11-02-1, 2026-11-02: LIBRARY-COMPLETION-VISIBILITY-1’s exclusive source/test window is CLOSED following its published source/regression handoff and RodneySr job3’s completed verification/handoff at held tip 4ac4ff76c89bbde25f87319cc9b0c6ff314d89c7. Source ownership returns to Roadmap. This satisfies BLURBY-BUSINESS-1’s source/test start gate after provider readback. Visibility remains In Flight; ARM64 launch, integration, merge and release gates remain. Further visibility source work requires a fresh ownership window.

Preserve existing Notes, Status, Seq and prerequisites. **Business’s gate clears only after that explicit Notes update is confirmed and read back**, as the [charter requires](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/docs/planning/epics/2026-10-30-blurby-business/charter.md:86).

**Q2 and parallel placement**

**Yes:** RodneySR is the approved Business execution host under Brain’s technical oversight and Roadmap’s dispatch control. Use the existing epic packet, with a **named Business execution owner separate from A2’s doer**. Record the actual owner and consumed packet receipt before source edits. Do not change host permissions or bypass approval controls.

Business source work, dependency preparation and portable checks may overlap A2’s pure/synthetic work because their files and dependencies are isolated. Reserve:

- Business: `C:\Projects\bb-business`, branch `eb/blurby-business-1`, its own `node_modules`, temp directories and artifact root.
- CPU: its existing worktree, two-MJS fence, unchanged A1 test and CPU evidence roots.

Neither lane may edit the other’s files or share dependency links. Keep test workers bounded for RAM; avoid concurrent full suites/builds/package jobs. A2’s small targeted/synthetic checks may coexist. Actual measurement, native application/package checks and conflicting desktop/profile custody require separately serialized reservations. **A2’s clock, scope and caps are unchanged.**

**Repository creation**

The packet labels its old repository anchor as an assumption. It may be fulfilled through the verified repository at:

`C:\Users\estra\Projects\Blurby`  
common Git directory: `C:\Users\estra\Projects\Blurby\.git`

Use that repository to create the separate Business worktree. **Do not operate through or alter old `C:\Projects\bq-main`, its detached `36ac7466`, stash or evidence.**

Before creation, the Business owner must:

1. Check whether the destination or Business branch already exists; if so, reconcile as a possible resume—never force-create.
2. Fetch current `main` without pruning; record its exact full SHA and remote identity.
3. Verify that pin contains the packet/scaffold ancestry and required frozen charter inputs.
4. Create the new worktree/branch from that **exact SHA**, then record the clean starting state and packet hashes.

Coordinate common Git ref mutations with A2; separate worktree indexes remain independently owned. Do not silently substitute CPU’s c90 baseline or merge held application branches into Business.

Business may begin non-editing discovery while provider confirmation completes. After readback and its fresh host/input checks, Roadmap may launch the existing epic within its charter and current wave limits. Design choices remain the owner’s; charter merge/release holds and Native’s pause remain intact.

No source, register or host mutation occurred here. Fresh Business ownership/input receipts and contrary-writer checks remain execution prerequisites.

---

**BB-2026-11-02-1 amendment: approve `gpt-6.1-sol` with `high` reasoning for the existing Business coordinator.** This is a routine execution-environment correction within delegated technical authority; no owner confirmation is needed.

I read the actual fork: chat `01a19e5f-a0f9-7831-ab5a-c864e33a3a30` failed with **“The 'gpt-5.5' model is not supported when using Codex with a ChatGPT account.”** Its failed turn contains no assistant/tool activity.

The parent may resend the existing Business discovery instruction to **that same chat**, explicitly setting:

```text
model: gpt-6.1-sol
thinking: high
```

Preserve the failed-turn evidence and verify actual uptake afterward. Do not create another fork or inherit A2’s accounting. This changes only the coordinator’s model: Business’s charter, launch gates, ownership, wave limits and publication restrictions remain binding. A2 and Native’s pause are unchanged.

I did not change the model or send a continuation; successful recovery remains unverified.
