import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8");

describe("cursor-source clamp — Step 3.5 structural contract", () => {
  it("audioScheduler tick clamps cursor to the playing source", () => {
    const src = read("src/utils/audioScheduler.ts");
    expect(src).toContain("getPlayingSourceMaxWordIndex");
    expect(src).toContain("maxPlayingWord != null && currentBoundary.wordIndex > maxPlayingWord");
  });

  it("getAudioProgress clamps returned wordIndex to the playing source", () => {
    const src = read("src/utils/audioScheduler.ts");
    // Verify the clamp exists in getAudioProgress
    expect(src).toContain("const maxPlayingWord = getPlayingSourceMaxWordIndex(audioCtx.currentTime)");
    expect(src).toContain("clamped ? maxPlayingWord : current.wordIndex");
  });
});

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

describe("content-contiguous synthesis — Step 3.6 structural contract", () => {
  it("speakNextChunkKokoro reads from nextGenWordIndexRef, not lastConfirmedAudioWordRef", () => {
    const src = read("src/hooks/useNarration.ts");
    expect(src).toContain("const startIdx = nextGenWordIndexRef.current");
    // The old pattern that would skip words by following the cursor lead must not appear
    // in the speakNextChunkKokoro body. The ref is still used elsewhere (cursor updates),
    // but generation must anchor to nextGenWordIndexRef.
    const speakNextIdx = src.indexOf("const speakNextChunkKokoro");
    expect(speakNextIdx).toBeGreaterThan(-1);
    const speakNextBody = src.slice(speakNextIdx, speakNextIdx + 500);
    expect(speakNextBody).toContain("nextGenWordIndexRef.current");
    expect(speakNextBody).not.toContain("const startIdx = lastConfirmedAudioWordRef.current");
  });

  it("kokoroStrategy fires onChunkProduced with produced-end", () => {
    const src = read("src/hooks/narration/kokoroStrategy.ts");
    expect(src).toContain("deps.onChunkProduced?.(chunk.startIdx + chunk.words.length)");
  });
});
