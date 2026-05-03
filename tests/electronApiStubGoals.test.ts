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
});
