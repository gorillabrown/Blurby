# Roadmap archive — completed agent consolidation, 2026-11-02

Source: ROADMAP.md at base 88e82ba59ccb93281c6c0b949e3ed4a826195897, as checked out for the owner-approved Phase A reconciliation. The section below is preserved byte-identical (including its working-tree line endings).

Section SHA256: b825af19390347feab75416ac5d3466f4d5017cdac6973aa4852fb7c9ba453d5; bytes: 3320

#### AGENT-PROTOCOL-CONSOLIDATION-1 — Use standard Virtuoso agents with Blurby overlays ✅ COMPLETED *(2026-10-30; Platform & Maintenance)* <a id="agent-protocol-consolidation-1"></a>
- **Completed 2026-10-30:** dispatch merge `4a1b7aa5`, then close-out Step 0 applied the staging memo to main. Close-out: [docs/governance/close-outs/CloseOut.AGENT-PROTOCOL-CONSOLIDATION-1.2026-10-30.md](docs/governance/close-outs/CloseOut.AGENT-PROTOCOL-CONSOLIDATION-1.2026-10-30.md).
- **Full specification (2026-10-30):** [docs/planning/specs/2026-10-30/AGENT-PROTOCOL-CONSOLIDATION-1.md](docs/planning/specs/2026-10-30/AGENT-PROTOCOL-CONSOLIDATION-1.md). It is built on the owner's 2026-10-30 rule "follow the plugin skills to the letter":
  - Overlays add Blurby facts only.
  - Athena, Simonides and Solon are retired.
  - Reviews run in the plugin's order.
  - The "5+ tasks" wave rule gives way to the plugin's sizing; standing rule 10 is retired.
  - There is no Quick-tier self-review.
  - `roadmap.lanes` → `workstreams` with seven lanes, including Blurby Business (F-006).
  - Governance-doc changes travel in a staging memo, which `/dispatch-closeout` applies to main as Wave 2 Step 0 after the merge (plugin Rules 1 and 4; Blurby.Brain1 2026-10-30).
  - Host: Rodney, in place, docs-only (rule 6b).
  - Mapping: 235 items, of which 123 duplicate the plugin, 6 become overlay facts, 12 are CLAUDE.md rules and 94 are stale.
  The stub text below is superseded.
- **What / source:** Owner directive2026-10-28: after the current NATIVE-PATH-ATTESTATION-1 dispatch closes out, adopt Virtuoso's standard agent/protocol definitions, register additive Blurby-specific overlays and remove duplicated local protocols. This is the first governance follow-up after Native; it does not change the current dispatch's pinned Zeus input, running scope or holds. **Prerequisites:** none — released 2026-10-30: NATIVE parked by R-2026-10-30-1; owner directive 2026-10-28's intent (do not disrupt the native dispatch) satisfied (Blurby.Brain1 Phase C ruling 3; the owner may reverse this reading). **Added scope (2026-10-30, owner-approved):** Findings F-006, the reviewed `policy.roadmap.lanes` → `workstreams` rename behind preflight's standing warning. **Effort:** M. **Owners:** planner, Brain technical authority, implementation agent and independent reviewer. Detailed migration specification/admission pending; NOT dispatch-ready.
- **Done when:** Inventory local Codex/Claude agent definitions and callers; map each retained project requirement to AGENTS.md/CLAUDE.md or a registry-resolved skill/agent overlay; load standard plugin roles/protocols without copied generic behavior; retain only necessary thin host adapters; remove superseded duplicated protocols after references migrate, preserving historical evidence; update mandatory startup/dispatch instructions and stale model/tool assumptions; preserve Brain/owner decision boundaries, mode isolation, review independence and existing release/custody gates; verify a fresh planning/execution session resolves the intended plugin version, overlays and adapters with no stale fallback. Plan/transfer/verify the quiet-machine destination before this future long-running dispatch launches. Do not modify shipped plugin files or delete currently pinned inputs early.

