import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const READER_SRC = path.resolve(__dirname, "..", "src/components/ReaderContainer.tsx");
const readerSrc = fs.readFileSync(READER_SRC, "utf-8");
// READER-MODE-SEPARATION-2 (OC-5): owners of behavior that left ReaderContainer at E1.
const readModeFile = (mode: string, file: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", `src/reader/modes/${mode}/${file}`), "utf-8");
const READER_MODES = ["page", "focus", "flow"] as const;

describe("Foliate bridge contracts (NARR-LAYER-1B)", () => {
  it("documents Focus paused versus active surface ownership", () => {
    // OC-5b: the Focus RSVP overlay is owned by Focus's view and renders only while Focus plays.
    const focusView = readModeFile("focus", "ModeView.tsx");
    expect(focusView).toContain("{useFoliate && playing && (");
    expect(focusView).toContain('<div className="rm-focus-overlay">');
    expect(readModeFile("focus", "useModeBindings.ts")).toContain("playing: snapshot.playing,");
    expect(readerSrc).toContain('readingMode === "focus" || readingMode === "flow"');
  });

  it("imports and calls jumpFoliateToWordAnchor for jump-back", () => {
    // OC-5a: jump-back moved into each mode runtime (jumpBack) and its surface controller.
    for (const mode of READER_MODES) {
      expect(readModeFile(mode, "surface.ts")).toContain("jumpFoliateToWordAnchor");
      expect(readModeFile(mode, "ModeRuntime.ts")).toContain("handleJumpBackToPersistentWord");
      expect(readModeFile(mode, "helpers/usePersistentReadingAnchor.ts")).toContain("persistentWordIndexRef.current");
      // Supplementary code-level checks (the two fragments above match doc comments in the new owners).
      expect(readModeFile(mode, "ModeRuntime.ts")).toContain("const anchor = this.state.canonicalWordIndex;");
      expect(readModeFile(mode, "ModeRuntime.ts")).toContain("if (this.document.useFoliate) void this.surface.jumpToWordAnchor(anchor);");
    }
  });

  it("passes showJumpBackToAnchor={isBrowsedAway} to FoliatePageView", () => {
    // OC-5b: each mode binding passes its own browse-away state to its own Foliate view.
    for (const mode of READER_MODES) {
      expect(readModeFile(mode, "useModeBindings.ts")).toContain("showJumpBackToAnchor: snapshot.isBrowsedAway,");
    }
  });
});
