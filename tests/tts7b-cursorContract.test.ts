import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8");

describe("cursor contract after narration-mode removal", () => {
  it("FoliatePageView API no longer references narration style hint", () => {
    const src = read("src/components/FoliatePageView.tsx");
    expect(src).not.toContain('styleHint?: "flow" | "narration"');
    expect(src).toContain('styleHint?: "flow"');
  });

  it("useReadingModeInstance has no NarrateMode import", () => {
    const src = read("src/hooks/useReadingModeInstance.ts");
    expect(src).not.toContain("NarrateMode");
  });

  it("mode exports no longer include NarrateMode", () => {
    const src = read("src/modes/index.ts");
    expect(src).not.toContain("NarrateMode");
  });

  it("ReaderBottomBar keeps narrate controls visible for paused narrate selection", () => {
    const src = read("src/components/ReaderBottomBar.tsx");
    expect(src).toContain("const isNarrationSelected = readingMode === \"narrate\" || isNarrating;");
  });

  it("ReaderContainer drives narration cursor from spoken-word truth while narration is active", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("(readingMode === \"flow\" && isNarrating)");
    expect(src).toContain("narrationWordIndex={narration.speaking ? narration.cursorWordIndex : undefined}");
  });
});
