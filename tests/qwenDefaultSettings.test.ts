import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  createDefaultNarrationProfile,
} from "../src/constants";

describe("Qwen deactivation narration defaults", () => {
  it("does not use disabled Qwen for new settings", () => {
    expect(DEFAULT_SETTINGS.ttsEngine).toBe("kokoro");
    expect(DEFAULT_SETTINGS.ttsVoiceName).toBeNull();
  });

  it("creates new narration profiles on the Kokoro lane instead of Qwen or Nano", () => {
    const profile = createDefaultNarrationProfile("Default");

    expect(profile.ttsEngine).toBe("kokoro");
    expect(profile.ttsVoiceName).toBeNull();
  });
});
