import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  QWEN_DEFAULT_SPEAKER,
  createDefaultNarrationProfile,
} from "../src/constants";

describe("Qwen-first narration defaults", () => {
  it("uses Qwen as the default engine for new settings", () => {
    expect(DEFAULT_SETTINGS.ttsEngine).toBe("qwen");
    expect(DEFAULT_SETTINGS.ttsVoiceName).toBe(QWEN_DEFAULT_SPEAKER);
  });

  it("creates new narration profiles with the default Qwen speaker", () => {
    const profile = createDefaultNarrationProfile("Default");

    expect(profile.ttsEngine).toBe("qwen");
    expect(profile.ttsVoiceName).toBe(QWEN_DEFAULT_SPEAKER);
  });
});
