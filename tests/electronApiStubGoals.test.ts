// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { installStub, stubControl } from "../src/test-harness/electron-api-stub";

describe("electron api stub reading goals defaults", () => {
  afterEach(() => {
    delete (window as any).electronAPI;
    delete (window as any).__blurbyStub;
    window.sessionStorage.clear();
  });

  it("includes readingGoals in default browser settings", () => {
    installStub();
    stubControl.clearPersistence();

    expect(stubControl.getSettings().readingGoals).toEqual([]);
  });

  it("returns retired Qwen disabled compatibility shapes", async () => {
    installStub();
    const api = window.electronAPI;

    await expect(api.qwenVoices?.()).resolves.toMatchObject({
      voices: [],
      error: expect.stringContaining("retired"),
      status: "unavailable",
      reason: "qwen-disabled",
      recoverable: false,
    });

    await expect(api.qwenStreamStart("hello", "Ryan", 1)).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining("retired"),
      status: "unavailable",
      reason: "qwen-disabled",
      recoverable: false,
    });

    await expect(api.qwenStreamStatus()).resolves.toMatchObject({
      status: "unavailable",
      reason: "qwen-disabled",
      recoverable: false,
      ready: false,
      model_loaded: false,
      device: "disabled",
    });
  });
});
