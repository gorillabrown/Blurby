import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SRC = path.resolve(__dirname, "..", "src/components/FoliatePageView.tsx");
const src = fs.readFileSync(SRC, "utf-8");

describe("Foliate bridge contracts (NARR-LAYER-1B)", () => {
  it("highlightWordByIndex accepts flow hint only", () => {
    expect(src).toContain('highlightWordByIndex: (wordIndex: number, styleHint?: "flow") => boolean;');
  });

  it("does not render narration overlay element", () => {
    expect(src).not.toContain("foliate-narration-highlight");
    expect(src).not.toContain("ref={highlightRef}");
  });

  it("flow mode narration index uses flow cursor style", () => {
    expect(src).toContain('if (readingMode !== "flow" || narrationWordIndex == null) return;');
    expect(src).toContain('applyVisualHighlightByIndex(narrationWordIndex, "flow", false);');
  });
});
