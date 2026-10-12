import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// READER-MODE-SEPARATION-2 (design §D.5): parallel assertion at the new owner. Flow's pause-on-miss moved
// from createInstance's flow branch into the Flow runtime's engine callback (src/reader/modes/flow/ModeRuntime.ts).
describe("Flow runtime pause-on-miss (new owner)", () => {
  const FLOW_RUNTIME_SRC = fs.readFileSync(path.resolve(__dirname, "..", "src/reader/modes/flow/ModeRuntime.ts"), "utf-8");

  it("pauses the flow engine, queues the pending word and turns the page when the word is not loaded", () => {
    expect(FLOW_RUNTIME_SRC).toContain('const found = this.surface.highlight(idx, "flow", { allowMotion: false });');
    expect(FLOW_RUNTIME_SRC).toContain("this.engine?.pause();\n        s.pendingResume = idx;\n        this.surface.next();");
  });
});
