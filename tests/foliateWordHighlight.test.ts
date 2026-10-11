import { describe, expect, it } from "vitest";
import * as legacyWordHighlight from "../src/utils/foliateWordHighlight";
import * as pageWordHighlight from "../src/reader/modes/page/helpers/foliateWordHighlight";
import * as focusWordHighlight from "../src/reader/modes/focus/helpers/foliateWordHighlight";
import * as flowWordHighlight from "../src/reader/modes/flow/helpers/foliateWordHighlight";
import * as narrateWordHighlight from "../src/reader/modes/narrate/helpers/foliateWordHighlight";
import type { ChunkReadingVisualState } from "../src/types/chunkReading";

// READER-MODE-SEPARATION-2 (design §D.5): the same cases also run against each mode's private copy
// (src/reader/modes/<mode>/helpers/), next to the retained legacy util.
function wordHighlightCases({ resolveFoliateWordHighlightClass, shouldSuppressNarrateFlowCursor }: typeof legacyWordHighlight) {
describe("Foliate word highlight style resolution", () => {
  it("keeps Flow and Narrate cursor styles separate on the shared EPUB canvas", () => {
    expect(resolveFoliateWordHighlightClass("flow")).toBe("page-word--flow-cursor");
    expect(resolveFoliateWordHighlightClass("narrate")).toBe("page-word--narrate-cursor");
    expect(resolveFoliateWordHighlightClass("page")).toBe("page-word--highlighted");
  });

  it("lets an explicit flow hint use the flow cursor style from any surface", () => {
    expect(resolveFoliateWordHighlightClass("page", "flow")).toBe("page-word--flow-cursor");
    expect(resolveFoliateWordHighlightClass("focus", "flow")).toBe("page-word--flow-cursor");
    expect(resolveFoliateWordHighlightClass("flow", "narrate")).toBe("page-word--narrate-cursor");
  });
});

describe("Narrate flow cursor suppression", () => {
  function narrateChunkState(overrides: Partial<ChunkReadingVisualState> = {}): ChunkReadingVisualState {
    return {
      mode: "narrate",
      activeChunkId: "sentence:1-4",
      activeChunkRange: { startWordIndex: 10, endWordIndex: 20 },
      activeWordIndex: 12,
      syncLevel: "chunk-synced",
      ...overrides,
    };
  }

  it("suppresses legacy flow cursor styling only when narrate chunk state is active", () => {
    expect(
      shouldSuppressNarrateFlowCursor("narrate", narrateChunkState()),
    ).toBe(true);
    expect(
      shouldSuppressNarrateFlowCursor("flow", narrateChunkState()),
    ).toBe(false);
    expect(
      shouldSuppressNarrateFlowCursor("narrate", narrateChunkState({ activeChunkRange: null })),
    ).toBe(false);
    expect(
      shouldSuppressNarrateFlowCursor("narrate", narrateChunkState({ mode: "flow" })),
    ).toBe(false);
    expect(
      shouldSuppressNarrateFlowCursor("narrate", null),
    ).toBe(false);
  });
});
}

wordHighlightCases(legacyWordHighlight);

describe.each([
  ["page", pageWordHighlight],
  ["focus", focusWordHighlight],
  ["flow", flowWordHighlight],
  ["narrate", narrateWordHighlight],
] as const)("%s mode helper copy", (_mode, wordHighlight) => {
  wordHighlightCases(wordHighlight);
});
