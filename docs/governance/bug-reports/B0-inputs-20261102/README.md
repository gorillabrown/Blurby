# Canonical B0 expected-tree planning inputs

Generated 2026-11-02 from actual local historical Git tree objects. Static governance metadata only; no source-content publication, merge/ref/index change, checker/application execution, native qualification, provider write or B0 admission.

Binding authority: `../Brain.NARRATE-PAUSED-CLICK-1.B0-manifest-transfer.2026-11-02.md`; controls/topology in the corresponding B0-controls and B0-contract records. The transfer amendment supersedes the earlier manifest schema.

Generation repository: `C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby`; planning HEAD observed `a7f7a8ab70f8be759f9ffe02fbcfdf427e5bbb87`. Historical tree IDs below, rather than HEAD/candidate/index state, are the independent expected inputs. No fetch was required.

## Closed schema and serialization

`{schemaVersion:"blurby.b0.expected-tree.v1",stage:"I1"|"I2",historicalTree:<fixed40hex>,entries:[{path,mode,type,object}]}`. No exemption list or configurable authority is included.

Each inventory is the complete recursive leaf result of binary `git ls-tree -r -z --full-tree <historicalTree>`, exit0/empty stderr. NUL records are split before header/tab parsing; path bytes decode as strict UTF-8, preserving exact case. Modes, actual object types and full Git object IDs are retained. All actual entries are type blob, but type remains explicit. No broad exclusion is applied.

Paths are unique with case-sensitive identity and sorted by UTF-16 ordinal code units (matching .NET StringComparer.Ordinal); no case folding/locale sorting. Deterministic JSON property order: schemaVersion,stage,historicalTree,entries; each entry path,mode,type,object. UTF-8 without BOM, ensure_ascii=false, indent2, LF newlines and one final LF. Raw hashes refer to exact serialized bytes, not normalized text.

## Inventories and byte identities

| File | Historical tree | Entries | Raw manifest SHA256 | Binary ls-tree stdout SHA256 |
|---|---|---:|---|---|
| I1.canonical.json | 7e8a4a9a128fdf56da18cf018927a3d5fa69c6a6 | 2479 | 8b9aaec0a5f57369d653c771cd67fc35cae48654381e4b40fabfdd582660936f | 28c21ba0c9cf342ee607ae8b45c2b211bf8e37f8e0780277b17115ced9516d3d |
| I2.canonical.json | 40f74988b799605d4fcb264a3f8f5870a2aa300d | 2491 | 8a53b6c42f4bfe021a91d14fa3130d7ebe20d7ba00e5126e5897de782ce57ac5 | a103d6b3adf099df8b87887fd3d4f8e0f78d1c05c14c5ed885e64cfa4623cfbd |

## Historical absence and fixed comparison exemptions

Both manifests include ROADMAP.md because it actually exists in both historical trees. The following four later ac19 governance paths are absent from BOTH historical trees and were not fabricated or injected:

- `docs/planning/roadmap-reviews/2026-10-31-handoff-upcoming-work.md`
- `docs/planning/specs/2026-10-30/FOCUS-WORD-ONLY-1.amendment.md`
- `docs/planning/specs/2026-10-30/NARRATE-PAUSED-CLICK-1.amendment.md`
- `docs/planning/specs/2026-10-30/PAGE-ENTRY-KEYS-1.amendment.md`

The checker/pointer exempts exactly the five named ac19 governance paths, and additionally docs/governance/BUG_REPORT.md at I2 for separately reviewed N-Q3 differences. Both historical manifests still include their actual BUG_REPORT.md entries. All other docs/source/tests/config/assets/package/lock paths remain inventoried. Exemptions belong to the fixed reviewed checker/pointer, not editable manifest grants. Candidate additions among those four exempt paths do not become invented historical entries.

## Separate three I2 source pins

Read actual Git blob bytes with binary git cat-file, independently SHA256-hashed during generation; all three match the frozen source pins. These are not worktree text hashes.

| Path | I2 Git blob | Raw Git blob SHA256 |
|---|---|---|
| src/reader/modes/narrate/ModeRuntime.ts | 261c725ef3af41683b4dd994247835fd2dd80373 | 37819f3d7f28e70e5c193fc0c8ec6c3be292cd894c4cd0171ef813fb94141c1a |
| src/reader/modes/narrate/engine/narrateEngine.ts | 1848b7768c5f6723855c5ad1a7b8cdc486059706 | cce3c660e1ef8b7945864339b53375af9de80ba76ebd0ac550422e68c98cf130 |
| tests/narrate/narrate.mode.test.ts | 76585ab3afc74c6cb95989122d7a7c1fd9ee5d33 | c6164c25c9c012b559183b9b32c99338856713ff050514e70b2b3adfe1d0af69 |

## Transfer and non-claims

Parent must publish these exact governance input bytes, then record their actual Git blob IDs and containing governance commit in the final pointer/transfer receipt. Those publication identities are pending; this README cannot assert the commit that will contain itself. Receiver copies exact bytes to its owned expected/I1.canonical.json and expected/I2.canonical.json and verifies the published hashes/counts/schema/stage/tree identity before consumption.

Under the explicit transfer amendment the quiet host need not possess either historical expected-tree object after exact published manifest authority/hash consumption is proved. Actual subject trees must still exist and have tree type in the quiet Git repository. This does not waive new integration custody, full parity, protected governance preservation, topology or ordered reviews.

No wrong-pin variants were authored here. During a separately admitted control wave they are exact copies changing only ModeRuntime.ts entry.object to40zeros; other metadata/entries remain unchanged. Literal expected object IDs need not exist in Git. Do not regenerate canonical data from candidate/index or special-case a variant.

All writes in this generation are restricted to these two new canonical JSONs and this README. Existing data/source/refs remain unchanged. No Ready or execution-admission claim.
