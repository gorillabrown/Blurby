import { describe, expect, it } from "vitest";
import { FOLIATE_TWO_COLUMN_BREAKPOINT_PX } from "../src/constants";
import { getFoliateMaxColumnCount } from "../src/utils/foliateLayout";

describe("foliate layout policy", () => {
  it("keeps Flow and Narrate flow surfaces in one column even on wide windows", () => {
    expect(getFoliateMaxColumnCount(true, FOLIATE_TWO_COLUMN_BREAKPOINT_PX + 400)).toBe("1");
  });

  it("allows page/focus paginated surfaces to use two columns on wide windows", () => {
    expect(getFoliateMaxColumnCount(false, FOLIATE_TWO_COLUMN_BREAKPOINT_PX + 400)).toBe("2");
  });

  it("keeps narrow paginated surfaces in one column", () => {
    expect(getFoliateMaxColumnCount(false, FOLIATE_TWO_COLUMN_BREAKPOINT_PX - 1)).toBe("1");
  });
});
