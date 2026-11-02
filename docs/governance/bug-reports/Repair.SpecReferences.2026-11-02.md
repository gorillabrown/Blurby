# Seven specification-link repairs — verified transaction record

Date2026-11-02. Existing specifications were mapped in `Audit.Missing-spec-reference-evidence.2026-11-02.md`; root independently checked all seven archive anchors and both snapshot hashes before writes. No new specification or item was created.

Each row used qualified helper root fcfa92959b757828f29bdac6a54aa99015b2b525 with root/hash/import guard, operation store-spec-link and the prior provider revision; then Notion property-only write, full SQL row readback showing ONLY Spec Reference changed, then mutation-confirm succeeded. Text was protected with backticks during Notion writing; SQL plain-text readback matched the exact link below. FOLIATE's initial readback still showed the old value; a later read confirmed the actual write before confirmation. No duplicate write was issued.

| Sprint Code | Verified Spec Reference | Confirmed recovery |
|---|---|---|
| BAND-ALIGN-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#band-align-1` | `20261102T234721Z-external-store-spec-link-BAND-ALIGN-1` |
| FOLIATE-OBSERVER-LEAK-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#foliate-observer-leak-1` | `20261102T234751Z-external-store-spec-link-FOLIATE-OBSERVER-LEAK-1` |
| NARRATE-SENTENCE-INITIALS-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-sentence-initials-1` | `20261102T234832Z-external-store-spec-link-NARRATE-SENTENCE-INITIALS-1` |
| PAGE-HELD-TURN-FAIL-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#page-held-turn-fail-1` | `20261102T234854Z-external-store-spec-link-PAGE-HELD-TURN-FAIL-1` |
| RELEASE-RUNBOOK-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#release-runbook-1` | `20261102T234900Z-external-store-spec-link-RELEASE-RUNBOOK-1` |
| RENAME-TMP-RACE-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#rename-tmp-race-1` | `20261102T234904Z-external-store-spec-link-RENAME-TMP-RACE-1` |
| WS-PAIR-LOG-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#ws-pair-log-1` | `20261102T234909Z-external-store-spec-link-WS-PAIR-LOG-1` |

Final full SQL census at `2026-11-02T23:54:55Z`:202 unique rows,72Completed,9Dissolved,6Superseded,74InFlight,41Queued. All seven links persist; every affected Status, Seq and other property equals its pre-write row. Snapshot import reports202 rows/items, no missing ID, unknown status, mapping drift or excluded subitems. Board regenerated through the qualified helper. The registered snapshot and shell-side provider count both report202; an oversized returned representation earlier exposed only111 entries, so subsequent evidence uses producer-side compact projections rather than treating that output as complete. That observation is not evidence of cache corruption.

One WindowsApps python3 launcher invocation failed before a later plan existed. No retry broadened scope; subsequent commands used the same guard-verified interpreter C:/Python314/python.exe explicitly. All seven planned writes are individually confirmed. Status, sequence, prerequisites, terminal ledger and completion dates were not changed. No source, runtime, package or release acceptance follows from repairing these indexes.

Full live-row receipts retained externally at C:/Projects/Blurby-artifacts/roadmap-snapshot-reconcile-20261102-1/; external data is evidence, not independent register authority.
