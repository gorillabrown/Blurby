# Cleanup backlog dependencies
Date: 2026-09-23. Actor: roadmap-review.
Scope: the five owner-requested cleanup items recorded in [the cleanup review](../../planning/roadmap-reviews/2026-09-23-cleanup-addendum.md).

Disposition: intentional backlog hold, not an implementation failure. Positions 6–10 are Blocked / Stub until READER-MODE-SEPARATION-2 completes and each item receives a full dispatch specification. TTS-ENGINE-SHARED-1 additionally depends on TTS-SIDECAR-SHARED-1.

Do not launch cleanup in the active mode-separation worktree. Recheck the barrel-removal scope after the parent closes, as the parent may have removed src/modes/index.ts. Preserve separate provider mutable state and dormant provider behavior during future shared-code extraction. No reading-mode recombination is admitted.

Release: verify terminal prerequisites through the live provider, resolve actual remaining edit sites, specify tests/failure/rollback/execution base, and pass current U1–U9 plus all five readiness findings via next-pointer. If a dependency or scope decision cannot be resolved, route this issue to mid-dispatch-decision. No owner decision is outstanding for recording the five backlog items.

