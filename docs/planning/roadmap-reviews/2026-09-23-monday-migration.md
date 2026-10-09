# Blurby — monday.com register migration
Date: 2026-09-23. Outcome: verified. Authority: the owner's instruction to drop the XLSX register and use the supplied Monday board.

## Provenance
- Live provider: monday.com connector, exposed through Virtuoso's external-register provider.
- Source: monday:board/18432450217.
- Final full read: 2026-09-23T18:38:41Z; 57 total board items, complete pagination.
- Source provider: XLSX Catalog, captured 2026-09-23T18:27:44Z; 52 source records and all 15 original columns preserved in [migration-source.json](2026-09-23-migration-source.json).
- Source workbook SHA-256 before and after: 67544fae2259b2e762a3aebe4f04ff5b113733127994b55a432308e0569c7990.
- Current board: [Blurby](https://estrattbrown.monday.com/boards/18432450217); workspace name observed in the final metadata read: Active Projects.

## Delivered
All 52 source records were created and read back. The final comparison checked 832 canonical field values across 16 mapped fields, with zero mismatches after the declared transformations below. The five pre-existing template items were preserved and excluded from the register because they have no Sprint Code.

The board has four groups: Active conveyor, Blocked / deferred, Completed history, and Retired history. The Conveyor table filters Seq > 0 and sorts ascending. The Work register table filters to nonempty Sprint Code. The original template groups remain intact.

Monday owns identity, sequence, state, dates, and work-item details. ROADMAP.md remains the specification store; four active items have exact section references. Virtuoso/work-register.snapshot.json is a timestamped connector mirror for the provider, not a second authority. Future reads must refresh from the connector before consequential work; mutations must use the provider plan, connector operation, confirmation, and refreshed snapshot.

## Declared transformations
1. Complete and Completed normalized to Completed; Fullspec normalized to Full Spec. Raw source spellings remain in the preserved source JSON.
2. The legacy Catalog used NARR-MEDIA-1 for both a dissolved predecessor and completed integration. The dissolved row became LEGACY-NARR-MEDIA-1-DISSOLVED, retaining its original ID and source-row provenance in Notes. The completed NARR-MEDIA-1 identity remains unchanged.
3. HYG-XLSX-DASHBOARD-RESTORE became Superseded, Seq cleared, disposition dated 2026-09-23. This records the owner's switch to Monday; no Excel restoration was implemented. Its complete former spec is retained in [retired-specs.md](2026-09-23-retired-specs.md).
4. The four active full-spec records received ROADMAP.md anchors in Spec Reference. No implementation status or dispatch-readiness verdict was inferred from those links.
5. Empty source values remain empty. Mixed numeric and t-shirt effort values are preserved as text.

## Verified resulting register
| State | Records |
|---|---:|
| Completed | 40 |
| Dissolved | 6 |
| Superseded | 1 |
| Queued | 3 |
| Blocked | 2 |
| Total | 52 |

The four sequenced records are HEARD-CURSOR (1), APPLYRATECHANGE-COLLAPSE (2), SUBSCRIBER-CURSOR (3, blocked), and UX-POLISH (4). KOKORO-EXPORT remains blocked/deferred without a sequence.

## Local integration
The registry now declares the Monday board as workRegister; the workbook is registered as read-only migration evidence. ROADMAP.md and CLAUDE.md route current queue operations to Monday. The former dashboard-restoration spec was archived in full and removed from the active section. Source code and tests were not changed by the migration.

Backups:
- Virtuoso/.backups/20260923T182425Z-approved-roadmap-review-repair
- Virtuoso/.backups/20260923T182435Z-repair
- Virtuoso/.backups/20260923T182909Z-monday-register-migration
- Virtuoso/.backups/20260923T183445Z-monday-document-routing

The workbook remains byte-for-byte unchanged. No Git staging, commit, merge, push, or worktree removal was performed.

## Verification evidence
- [Initial full read and migration comparison](2026-09-23-monday-live-read.json)
- [52 creation plans](2026-09-23-monday-mutation-plans.json) and [confirmations](2026-09-23-monday-mutation-confirmations.json)
- [Four spec-link plans](2026-09-23-monday-spec-link-plans.json) and [confirmations](2026-09-23-monday-spec-link-confirmations.json)
- [Final board metadata and all 57 items](2026-09-23-monday-final-read.json)
- Provider recovery check: no outstanding records after all 56 mutations were confirmed.
- Registry preflight: ready, zero findings, zero writes in check mode.
- No runtime tests were run for this data/documentation migration.

## Historical reconciliation remains separate
The four roadmap-only completed entries and two register-only dissolved entries are disclosed in [the Phase A audit](2026-09-23-audit.md). They were not silently added or relabelled during migration. The new terminal ledger is empty: ordinary record writers default to pointer-closeout, while roadmap-review has correction permission only. The pending terminal-record batch is routed for close-out rather than misrepresented as ledger-complete.

