import { describe, expect, it } from "vitest";
import * as legacyWordHighlight from "../src/utils/foliateWordHighlight";
import * as pageWordHighlight from "../src/reader/modes/page/helpers/foliateWordHighlight";
import * as focusWordHighlight from "../src/reader/modes/focus/helpers/foliateWordHighlight";
import * as flowWordHighlight from "../src/reader/modes/flow/helpers/foliateWordHighlight";

// READER-MODE-SEPARATION-2 (design §D.5): the same cases also run against each mode's private copy
// (src/reader/modes/<mode>/helpers/), next to the retained legacy util.
function wordHighlightCases({ resolveFoliateWordHighlightClass }: typeof legacyWordHighlight) {
describe("Foliate word highlight style resolution", () => {
  it("keeps the Flow cursor style separate from the plain highlight on the shared EPUB canvas", () => {
    expect(resolveFoliateWordHighlightClass("flow")).toBe("page-word--flow-cursor");
    expect(resolveFoliateWordHighlightClass("page")).toBe("page-word--highlighted");
  });

  it("lets an explicit flow hint use the flow cursor style from any surface", () => {
    expect(resolveFoliateWordHighlightClass("page", "flow")).toBe("page-word--flow-cursor");
    expect(resolveFoliateWordHighlightClass("focus", "flow")).toBe("page-word--flow-cursor");
  });
});
}

wordHighlightCases(legacyWordHighlight);

describe.each([
  ["page", pageWordHighlight],
  ["focus", focusWordHighlight],
  ["flow", flowWordHighlight],
] as const)("%s mode helper copy", (_mode, wordHighlight) => {
  wordHighlightCases(wordHighlight);
});
