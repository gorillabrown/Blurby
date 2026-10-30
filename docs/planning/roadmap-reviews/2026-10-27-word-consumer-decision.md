# Brain WORD clamp and consumer-handoff ruling — 2026-10-27

Technical authority Blurby.Brain01a179e8-7a40-75c0-93f4-d3045ad99027; planning only, zero source/runtime/experiment activation.

Preserve the prior explicit last-word clamp ONLY when original legacy contract is independently established, exact source content identity is supported, legacy array nonempty, and supplied position is a valid nonnegative integer at/above its length. Effective index=length−1; map that exact occurrence to candidate and require source/word correspondence. Revalidate current document/incarnation/content/position authority before committing. Origin mismatch, unresolved/unsupported history, changed/unproved content, empty array, invalid/negative/nonintegral position or ambiguous mapping NEVER clamps: stored position/CFI remain intact, unresolved HOLD.

Receipt records original index, effective legacy index, resulting canonical index, original contract/content evidence and reason=clamped-out-of-range. sameWord describes the EFFECTIVE legacy word; it cannot imply that an out-of-range original position named a recoverable word.

Unsupported/ambiguous/unresolved remap HOLDS before a new canonical word table/index handoff or numbering session starts. Never return unchanged old index alongside new table, clear its pending mark or silently fall back to renderer words using the new join.

Actual f61 source: resolveLoadedDocResult recognizes `{userError}` at src/utils/loadDocResult.ts:13–16; generic `{error}` is NOT its recognized rejection and can fall through to existing doc.content. Both EPUB load-doc-content branches currently return filepath immediately at main/ipc/library.js:168–176. The remap gate must precede these handoffs and use the actual recognized error contract, with real-caller tests.

extract-epub-words can return `{error}`, but ReaderContainer:282–284 converts missing words/sections to null, and mode canonical-unavailable fallback exists. Error/null alone cannot prove numbering/start/persistence is blocked. Specification must establish/test per-document numbering admission and actual open/ensureBookWords/mode start/selection/persistence call order and error propagation. GROUP trace records the fallback risks.

Until exact consumer disposition/source fence/real tests are specified, U3/U4/U7 remain GAP and WORD NOT READY. This correctness hold needs no owner design choice now; it does not grant new UI/error-copy/fallback functionality or silently expand shared-core/source ownership.
