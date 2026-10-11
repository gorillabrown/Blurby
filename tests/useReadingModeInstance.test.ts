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
    expect(src).toContain("narration.setOnTruthSync?.(null);");
  });
});

// READER-MODE-SEPARATION-2 (design §D.5): parallel assertion at the new owner. Flow's pause-on-miss moved
// from createInstance's flow branch into the Flow runtime's engine callback (src/reader/modes/flow/ModeRuntime.ts).
describe("Flow runtime pause-on-miss (new owner)", () => {
  const FLOW_RUNTIME_SRC = fs.readFileSync(path.resolve(__dirname, "..", "src/reader/modes/flow/ModeRuntime.ts"), "utf-8");

  it("pauses the flow engine, queues the pending word and turns the page when the word is not loaded", () => {
    expect(FLOW_RUNTIME_SRC).toContain('const found = this.surface.highlight(idx, "flow", { allowMotion: false });');
    expect(FLOW_RUNTIME_SRC).toContain("this.engine?.pause();\n        s.pendingResume = idx;\n        this.surface.next();");
  });
});
