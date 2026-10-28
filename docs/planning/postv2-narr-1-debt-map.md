# POSTV2-NARR-1 Debt Map

Status: follow-up slicing map for structural debt found during POSTV2 audit remediation.

This sprint intentionally avoided broad refactors. The items below are the highest-value follow-up cuts because they slow safe changes across narration, Foliate rendering, and evidence tooling.

## 1. `useNarration`

Problem: The hook owns engine selection, lifecycle state, cursor truth, timing callbacks, error snapshots, and portability behavior in one surface. Small engine-policy changes require reading unrelated playback and diagnostics paths.

Follow-up slice: extract engine selection/readiness into a pure adapter contract, then keep cursor truth and UI-facing lifecycle state in the hook. Preserve Kokoro default/available, MOSS-Nano recommended opt-in, Pocket TTS available opt-in, and Qwen retired/disabled while slicing.

Test anchor: focused hook tests around engine readiness, terminal snapshots, and cursor truth before each extraction.

## 2. `FoliatePageView`

Problem: EPUB loading, iframe word wrapping, selection anchoring, flow scrolling, Narrate highlighting, and page navigation live in one component. Highlight contract drift happened because flow-family surfaces had multiple gates.

Follow-up slice: extract a `foliateWordHighlighter` module around `resolveWordState`, class clearing, style hints, and section-miss behavior. Keep React effects thin and mode-driven.

Test anchor: DOM-level tests for page, flow, and narrate highlighting over the extracted highlighter, plus one bridge test that FoliatePageView wires the correct mode contract.

## 3. `ReaderContainer`

Problem: ReaderContainer is the integration hub for modes, settings, bottom bar, Foliate props, narration status, and engine-facing UI copy. Release posture copy can drift from engine policy because it is embedded near view orchestration.

Follow-up slice: extract reader engine status copy into a tiny pure presenter with explicit engine-policy fixtures.

Test anchor: static or pure tests that Kokoro is default/available copy, Nano is recommended opt-in, Pocket is opt-in, and Qwen remains retired/disabled.

## 4. `scripts/moss_nano_probe.mjs`

Problem: The probe script mixes CLI parsing, runtime provisioning assumptions, process execution, metrics collection, and artifact writing. That makes it hard to change artifact policy without risking evidence semantics.

Follow-up slice: separate artifact path planning from probe execution. Default bulky outputs to ignored locations and require an explicit promoted-summary path for canonical evidence.

Test anchor: CLI parser/path-planner tests that prove generated audio/temp/profile output paths are ignored by default while summary outputs remain intentional.

## 5. `tests/mossNanoProbe.test.js`

Problem: The test file has grown into a broad probe-contract net. It is useful, but failures are hard to map to CLI parsing, path policy, lifecycle behavior, or summary schema.

Follow-up slice: split into parser, artifact policy, lifecycle summary, and stale-output guard suites.

Test anchor: keep one end-to-end smoke contract after splitting so the smaller suites do not lose integration coverage.

## 6. Legacy Parsers

Problem: Legacy document and evidence parsers still share ad hoc string and path assumptions with newer release workflows. That raises the cost of tightening URL and artifact contracts.

Follow-up slice: inventory parser entry points, classify external inputs versus local files, and route URL-like fields through shared protocol validation helpers.

Test anchor: table-driven protocol validation tests for every parser-facing URL field, with no new live network capture.
