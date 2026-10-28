import { describe, expect, it, vi } from "vitest";
import {
  jumpFoliateToWordAnchor,
  type FoliateAnchorNavigationApi,
} from "../src/utils/foliateAnchorNavigation";

function makeApi(overrides: Partial<FoliateAnchorNavigationApi> = {}): FoliateAnchorNavigationApi {
  return {
    clearUserBrowsing: vi.fn(),
    highlightWordByIndex: vi.fn(() => true),
    getSectionForWordIndex: vi.fn(() => 0),
    goToSection: vi.fn(() => Promise.resolve()),
    waitForSectionReady: vi.fn(() => Promise.resolve(0)),
    ...overrides,
  };
}

describe("jumpFoliateToWordAnchor", () => {
  it("returns false for null or undefined API", async () => {
    expect(await jumpFoliateToWordAnchor(null, 10)).toBe(false);
    expect(await jumpFoliateToWordAnchor(undefined, 10)).toBe(false);
  });

  it("returns false for invalid word index", async () => {
    const api = makeApi();
    expect(await jumpFoliateToWordAnchor(api, -1)).toBe(false);
    expect(await jumpFoliateToWordAnchor(api, NaN)).toBe(false);
  });

  it("clears user browsing before movement", async () => {
    const api = makeApi();
    await jumpFoliateToWordAnchor(api, 42, "flow");
    expect(api.clearUserBrowsing).toHaveBeenCalled();
    const clearOrder = (api.clearUserBrowsing as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    const highlightOrder = (api.highlightWordByIndex as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    expect(clearOrder).toBeLessThan(highlightOrder);
  });

  it("calls highlightWordByIndex with allowMotion: true", async () => {
    const api = makeApi();
    await jumpFoliateToWordAnchor(api, 42, "flow");
    expect(api.highlightWordByIndex).toHaveBeenCalledWith(42, "flow", { allowMotion: true, forceMotion: true });
  });

  it("returns true when highlight hits on first attempt", async () => {
    const api = makeApi({ highlightWordByIndex: vi.fn(() => true) });
    expect(await jumpFoliateToWordAnchor(api, 42)).toBe(true);
    expect(api.goToSection).not.toHaveBeenCalled();
  });

  it("navigates to section and retries when highlight misses", async () => {
    let callCount = 0;
    const api = makeApi({
      highlightWordByIndex: vi.fn(() => {
        callCount++;
        return callCount > 1;
      }),
      getSectionForWordIndex: vi.fn(() => 3),
    });

    const result = await jumpFoliateToWordAnchor(api, 500, "narrate");
    expect(result).toBe(true);
    expect(api.getSectionForWordIndex).toHaveBeenCalledWith(500);
    expect(api.goToSection).toHaveBeenCalledWith(3);
    expect(api.waitForSectionReady).toHaveBeenCalled();
    expect(api.highlightWordByIndex).toHaveBeenCalledTimes(2);
  });

  it("returns false when section cannot be resolved", async () => {
    const api = makeApi({
      highlightWordByIndex: vi.fn(() => false),
      getSectionForWordIndex: vi.fn(() => null),
    });
    const result = await jumpFoliateToWordAnchor(api, 500);
    expect(result).toBe(false);
    expect(api.goToSection).not.toHaveBeenCalled();
  });

  it("returns false when retry also misses after section navigation", async () => {
    const api = makeApi({
      highlightWordByIndex: vi.fn(() => false),
      getSectionForWordIndex: vi.fn(() => 2),
    });
    const result = await jumpFoliateToWordAnchor(api, 500);
    expect(result).toBe(false);
    expect(api.goToSection).toHaveBeenCalledWith(2);
  });

  it("preserves word index 0 as valid", async () => {
    const api = makeApi();
    const result = await jumpFoliateToWordAnchor(api, 0, "flow");
    expect(result).toBe(true);
    expect(api.highlightWordByIndex).toHaveBeenCalledWith(0, "flow", { allowMotion: true, forceMotion: true });
  });
});
