import { describe, expect, it } from "vitest";
import { resolveFoliateWordHighlightClass } from "../src/utils/foliateWordHighlight";

describe("Foliate word highlight style resolution", () => {
  it("treats narrate as a flow-family surface for per-word cursor styling", () => {
    expect(resolveFoliateWordHighlightClass("flow")).toBe("page-word--flow-cursor");
    expect(resolveFoliateWordHighlightClass("narrate")).toBe("page-word--flow-cursor");
    expect(resolveFoliateWordHighlightClass("page")).toBe("page-word--highlighted");
  });

  it("lets an explicit flow hint use the flow cursor style from any surface", () => {
    expect(resolveFoliateWordHighlightClass("page", "flow")).toBe("page-word--flow-cursor");
    expect(resolveFoliateWordHighlightClass("focus", "flow")).toBe("page-word--flow-cursor");
  });
});
