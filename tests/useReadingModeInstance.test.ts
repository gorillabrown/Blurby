import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SRC = path.resolve(__dirname, "..", "src/hooks/useReadingModeInstance.ts");
const src = fs.readFileSync(SRC, "utf-8");

describe("useReadingModeInstance (NARR-LAYER-1B)", () => {
  it("creates focus mode branch", () => {
    expect(src).toContain('case "focus":');
    expect(src).toContain("new FocusMode(");
  });

  it("creates flow mode branch", () => {
    expect(src).toContain('case "flow":');
    expect(src).toContain("new FlowMode(");
  });

  it("creates page mode branch", () => {
    expect(src).toContain('case "page":');
    expect(src).toContain("new PageMode(");
  });

  it("does not create a narration mode branch", () => {
    expect(src).not.toContain('case "narration"');
    expect(src).not.toContain("NarrateMode");
  });

  it("pending resume supports the shared flow and narrate surfaces", () => {
    expect(src).toContain("pendingResumeRef: React.MutableRefObject<{ wordIndex: number; mode: \"flow\" | \"narrate\" } | null>;");
    expect(src).not.toContain("mode: \"narration\"");
  });

  it("clears any stale narration truth-sync callback when a visual mode instance is created", () => {
    expect(src).toContain("narration.setOnTruthSync(null);");
  });
});
