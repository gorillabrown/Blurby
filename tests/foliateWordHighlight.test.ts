import { describe, expect, it } from "vitest";
import { resolveFoliateWordHighlightClass, shouldSuppressNarrateFlowCursor } from "../src/utils/foliateWordHighlight";
import type { ChunkReadingVisualState } from "../src/types/chunkReading";

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
