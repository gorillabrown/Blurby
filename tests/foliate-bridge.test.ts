import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SRC = path.resolve(__dirname, "..", "src/components/FoliatePageView.tsx");
const src = fs.readFileSync(SRC, "utf-8");

describe("Foliate bridge contracts (NARR-LAYER-1B)", () => {
  it("highlightWordByIndex accepts a flow hint and no-motion options", () => {
    expect(src).toContain('highlightWordByIndex: (wordIndex: number, styleHint?: "flow", options?: FoliateHighlightOptions) => boolean;');
  });

  it("does not render narration overlay element", () => {
    expect(src).not.toContain("foliate-narration-highlight");
    expect(src).not.toContain("ref={highlightRef}");
  });

  it("flow mode narration index uses flow cursor style", () => {
    expect(src).toContain('if ((readingMode !== "flow" && readingMode !== "narrate") || narrationWordIndex == null) return;');
    expect(src).toContain('applyVisualHighlightByIndex(narrationWordIndex, "flow", false);');
  });

  it("imperative highlight API keeps motion enabled only by default", () => {
    expect(src).toContain('return applyVisualHighlightByIndex(wordIndex, styleHint, options?.allowMotion ?? true);');
  });
});
