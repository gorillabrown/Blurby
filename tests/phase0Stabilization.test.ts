import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { getFoliateMaxColumnCount } from "../src/utils/foliateLayout";

const SRC_DIR = path.resolve(__dirname, "../src");

function allSourceFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...allSourceFiles(full));
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      results.push(full);
    }
  }
  return results;
}

describe("Phase 0 stabilization gates", () => {
  it("restartEngineFromRefs does not exist in production source", () => {
    const files = allSourceFiles(SRC_DIR);
    const matches: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes("restartEngineFromRefs")) {
        matches.push(path.relative(SRC_DIR, file));
      }
    }
    expect(matches).toEqual([]);
  });

  it("flow/narrate scrolled surface uses single-column layout", () => {
    expect(getFoliateMaxColumnCount(true, 2000)).toBe("1");
  });
});
