# Close-out — GOV-NOTION-MAPPING-1: Restore the Notion mapping and sync the podcast addition (2026-10-22)

- **Origin:** roadmap — GOV-NOTION-MAPPING-1 (absorbed from held plan `2026-10-15-notion-mapping-podcast-sync`, HB-4). Seq 60, Platform & Maintenance, surface E.
- **Branch:** `eb/hb-4` from `main` at `0e86e895`.
- **Outcome:** Complete. All six Done-when items met.

## Result

| # | Done when | Evidence |
|---|---|---|
| 1 | Mapping valid; only `lane`/`workstream` differ from the reviewed candidate | Primary candidate SHA-256 `4a73a49a…dd49` verified before copy. Python asserts: no `lane`, `workstream == "Lane"`, `deliverable == "Deliverable"`, changed keys exactly {lane, workstream}. `provider --actor roadmap-review` exits 0 with mutation capabilities; the unrepaired candidate refuses ("names both 'lane' and 'workstream'"). Commit `054ffc72`. |
| 2 | Fresh full SQL read; no conflicting Workstream values; snapshot import | Guard read: 125 rows, Workstream populated 0, Lane 125. Full read in pages (`ORDER BY "Sprint Code", url LIMIT 100 OFFSET 0/100`, has_more false). 17 per-field checksums from the live read equal the cached snapshot's; a one-character control perturbation was detected. The rows were rebuilt from the verified cache and imported through `snapshot --import` (21:35:43Z): item content was unchanged, and revisions moved only because `deliverable` joined the field set. `items --all` reads six product lanes as workstreams; PODCAST-SOURCE-1 Queued, Seq 50, Stub, prerequisite APP-TABS-1. No Notion column was renamed, deleted or populated. |
| 3 | Only Description and Notes written, through the handshake | `mutation-plan --operation set-status` (fields: description, notes; revision `66ef8d68…`; key `HB-4-GOV-NOTION-MAPPING-1-PODCAST-SOURCE-1-TEXT`; recovery `20261022T213641Z-external-set-status-PODCAST-SOURCE-1`). Rows-mode read showed the Notes were plain text (safe to append). Pre-write SQL equality was 1 for Description, Notes and the 14 protected properties. One `update_properties` call (Description, Notes). Post-write bound SQL equality: desc 1, notes 1 (625/673 chars, no literal backticks). `mutation-confirm --succeeded`. `recovery` shows no open HB-4 record. Snapshot re-imported at 21:37:49Z: only PODCAST-SOURCE-1 description/notes/revision changed. Commit `7c1138ff`. |
| 4 | Other properties and catalog preserved | Post-write protected_eq 1 on the item. Catalog checksums after the write: 17 of 19 unchanged; Description and Notes moved by exactly the predicted (Δlen × 16) amounts, 6,928 and 8,112. |
| 5 | Failure behavior | The precondition guard refused three in-memory mismatches (Notes text, revision, Status) before any mutation call. No retry was needed. Limitation: the provider revision is not a server-side compare-and-swap; the pre-write SQL equality is the concurrency check, and a gap of seconds remains between it and the write. |
| 6 | Hygiene and lesson | `git diff --check` clean; `--stat` shows no truncation. LL-163 was added. No application code, tests, UI or credentials were touched. |

## Notes for the planner

- The pre-existing unresolved recovery record `20261015T134121Z-external-set-status-FOLDER-NOTICE-1` was left untouched as the spec requires; it still needs an owner.
- The main checkout's manifest still carries the unrepaired candidate (the alias collision). After this merges, the primary tree's `Virtuoso/workspace-layout.json` differs from `main` only by those uncommitted lines. Reconcile it to `main` the next time the primary tree is tidied (not done here: Rule 10).
- Downstream: PODCAST-SOURCE-1's register text now matches ROADMAP.md#podcast-source-1. Its status and position are unchanged.
- Deviation, recorded: the full fresh read was taken as per-row fingerprints plus per-field checksums rather than full text. The rows imported were the cached snapshot rows, proven equal to the live read. Same evidence, much less re-typed data.

## Lessons

- **New:** LL-163 — A registry alias that is renamed upstream becomes a hard refusal; map the canonical key to the populated column.
- **Applied:**
  - **LL-155 (verify Notion text by SQL plain-text equality):** held. Description and Notes were confirmed by bound SQL equality (1 and 1), with no literal backticks stored.
  - **LL-154 (no schema or view edits; SQL reads):** held. No column was renamed, deleted or populated, and every read was SQL.
  - **Standing rule 46 (the implementation agent never writes the register):** held. The single connector update ran through the planner's handshake, and the completion was recorded by the conductor (Blurby.Roadmap).

## Addendum — close-out crossing (Blurby.Roadmap, 2026-10-22)

- The FOLDER-NOTICE-1 recovery record noted above was resolved after this report as abandoned (`d1f9846c`, merged `e32a72df`). `recovery` reports nothing outstanding.
- The primary tree's manifest was restored to HEAD by the executing session; its backup is `Virtuoso/.recovery/workspace-layout.pre-GOV-NOTION-MAPPING-1.20261022T221918Z.json.bak` (untracked, kept).
- The held entry stays `absorbed`: it was absorbed as GOV-NOTION-MAPPING-1 before it ran, so the item closes as a roadmap item and `executed` does not apply.
- Terminal record TR-075; register Completed, Seq cleared. Timing: estimate 8m, actual 5m.
