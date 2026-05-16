# ENGINE-DORMANCY-1 Close-Out

**Goal:** Disable MOSS-Nano and Pocket TTS as active/selectable engines so Kokoro remains Blurby's only active local/cacheable model engine.

**Result:** Nano and Pocket are dormant at settings selection and IPC runtime entry, stale Nano/Pocket/Qwen profile selections migrate to Kokoro on settings load, and default verification passed.

**Learned:** Engine dormancy is safest when it is dual-gated: normalize stale persisted selections at settings load and fail closed at direct IPC entry.

**Recommend:** Advance the conveyor to `TTS-INTEGRATE-1`; the original integration blocker was the now-gated MOSS Nano probe lane.

**Bottom line:** The sprint completed its authorized scope without deleting Nano/Pocket code or changing Kokoro playback behavior.

## Findings

| Finding | Disposition |
|---|---|
| Nano and Pocket are no longer selectable from the active TTS settings surface. | Accept. This matches the Kokoro-only architecture finish line. |
| Nano and Pocket IPC entry points now fail closed with `reason: "engine-dormant"`. | Accept. This prevents direct channel use from bypassing settings. |
| Persisted Nano, Pocket, and Qwen settings profiles migrate to Kokoro on settings load. | Accept. This protects users from stale saved selections after the product posture change. |
| `tests/mossNanoProbe.test.js` is gated behind explicit opt-in. | Accept. Host-sensitive Nano probe checks no longer block default Kokoro-only verification. |
| Nano/Pocket production code remains present. | Accept. Dormancy is a reversible posture change, not a deletion sprint. |
| `docs/governance/sprint-queue.xlsx` was locked by a LibreOffice session during closeout persistence. | Defer. Markdown roadmap and queue were advanced; spreadsheet reconciliation remains a follow-up once the workbook is closed. |

## Verification

- Targeted suite: 8 files, 47 tests passed.
- Full suite: 185 files passed, 1 skipped; 2499 tests passed and 132 skipped tests.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- Known non-blocking build warning remains: `settings -> tts -> settings` circular chunk warning.

## Files Touched By Sprint

- `main/ipc/tts.js`
- `main/migrations.js`
- `src/constants.ts`
- `src/utils/narrationPortability.ts`
- `src/utils/ttsProviderRegistry.ts`
- `tests/einkFoundation.test.ts`
- `tests/mossNanoIpc.test.js`
- `tests/mossNanoProbe.test.js`
- `tests/pocketTtsIpc.test.js`
- `tests/ttsEngineDeactivation.test.js`
- `tests/ttsProviderRegistry.test.ts`
- `tests/ttsSettingsMossNano.test.tsx`
- `tests/ttsSettingsPocketTts.test.tsx`

## Governance Updates

- `ROADMAP.md` advanced the active conveyor head from `ENGINE-DORMANCY-1` to `TTS-INTEGRATE-1`.
- `docs/governance/SPRINT_QUEUE.md` removed the `ENGINE-DORMANCY-1` ready pointer and made `TTS-INTEGRATE-1` the active head.
- `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` gained SRL-031 for the dual-gated engine dormancy pattern.

## Next Work

`TTS-INTEGRATE-1` is the next sprint. It should merge the already-pushed sync and diagnostics branches onto canonical `main` now that Nano probe instability has been gated out of the default suite.
