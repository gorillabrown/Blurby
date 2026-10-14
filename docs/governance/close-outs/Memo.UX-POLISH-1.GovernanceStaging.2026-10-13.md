# Sprint Close-Out Governance Staging — UX-POLISH-1

Base `05a5480a` (P5 merged). Branch `eb/ux-polish-1`. `useReaderKeys` ends at `handleEnterNarrate` (slot 28) on the base; `lastReadingMode` is slot 29 as specified. No register writes (standing rule 46).

## Evidence

### Done-when 1 — positive control at C1 (hook unchanged)

`npx vitest run tests/readerKeyboard.test.tsx` → exit 1, 5 failed / 6 passed (11):

- × (a) Space with lastReadingMode focus enters Focus only
- × (b) Space with lastReadingMode flow enters Flow only
- × (c) Space with lastReadingMode narrate enters Narrate only
- × (d) Space with lastReadingMode unset enters Flow
- × (e) Space with lastReadingMode narrate but no enterNarrate bound falls back to Flow

Each fails with `AssertionError: togglePlay: expected "vi.fn()" to be called +0 times, but got 1 times`. (f), (g) and the four existing Flow/N tests pass.
