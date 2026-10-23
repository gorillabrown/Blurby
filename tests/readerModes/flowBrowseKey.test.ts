// FLOW-KEYS-FIX-1 amendment (k1): in Flow, only unmodified PageUp and PageDown browse away (pause and turn a
// page). Plain ←/→ change speed and modified arrows move the word, so none of them may browse away.
import { describe, expect, it } from "vitest";
import { isFlowBrowseKey } from "../../src/reader/modes/flow/helpers/flowBrowseKey";

const NONE = { shiftKey: false, ctrlKey: false, altKey: false, metaKey: false };
const MODIFIERS = ["shiftKey", "ctrlKey", "altKey", "metaKey"] as const;

describe("isFlowBrowseKey", () => {
  it.each(["ArrowLeft", "ArrowRight"])("%s alone does not browse away", (key) => {
    expect(isFlowBrowseKey({ key, ...NONE })).toBe(false);
  });

  it.each(["ArrowLeft", "ArrowRight"].flatMap((key) => MODIFIERS.map((mod) => [key, mod] as const)))(
    "%s with %s does not browse away",
    (key, mod) => {
      expect(isFlowBrowseKey({ key, ...NONE, [mod]: true })).toBe(false);
    },
  );

  it.each(["PageUp", "PageDown"])("%s alone browses away", (key) => {
    expect(isFlowBrowseKey({ key, ...NONE })).toBe(true);
  });

  it.each(["PageUp", "PageDown"].flatMap((key) => MODIFIERS.map((mod) => [key, mod] as const)))(
    "%s with %s does not browse away",
    (key, mod) => {
      expect(isFlowBrowseKey({ key, ...NONE, [mod]: true })).toBe(false);
    },
  );

  it.each(["ArrowUp", "ArrowDown", " ", "Home", "End"])("%s does not browse away", (key) => {
    expect(isFlowBrowseKey({ key, ...NONE })).toBe(false);
  });
});
