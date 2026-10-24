// READER-ARROW-GUARD-1 (red first): Page's book view turns a page only on unmodified ←/→ and on PageUp/PageDown. A modified arrow belongs to
// useReaderKeys (word seek, paragraph), so the book view must not also turn a page on it.
import { describe, expect, it } from "vitest";
import { isPageTurnKey } from "../../src/reader/modes/page/helpers/pageTurnKey";

const NONE = { shiftKey: false, ctrlKey: false, altKey: false, metaKey: false };
const MODIFIERS = ["shiftKey", "ctrlKey", "altKey", "metaKey"] as const;

describe("isPageTurnKey", () => {
  it.each(["ArrowLeft", "ArrowRight"].flatMap((key) => MODIFIERS.map((mod) => [key, mod] as const)))(
    "%s with %s does not turn a page",
    (key, mod) => {
      expect(isPageTurnKey({ key, ...NONE, [mod]: true })).toBe(false);
    },
  );

  it.each(["ArrowLeft", "ArrowRight", "PageUp", "PageDown"])("%s alone turns a page", (key) => {
    expect(isPageTurnKey({ key, ...NONE })).toBe(true);
  });

  it.each(["PageUp", "PageDown"].flatMap((key) => MODIFIERS.map((mod) => [key, mod] as const)))(
    "%s with %s keeps turning a page",
    (key, mod) => {
      expect(isPageTurnKey({ key, ...NONE, [mod]: true })).toBe(true);
    },
  );

  it.each(["ArrowUp", "ArrowDown", " ", "Home", "End"])("%s does not turn a page", (key) => {
    expect(isPageTurnKey({ key, ...NONE })).toBe(false);
  });

  it.each(["ArrowLeft", "ArrowRight"])("%s with Shift and Ctrl does not turn a page", (key) => {
    expect(isPageTurnKey({ key, ...NONE, shiftKey: true, ctrlKey: true })).toBe(false);
  });
});
