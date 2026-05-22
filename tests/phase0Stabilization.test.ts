import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { getFoliateMaxColumnCount } from "../src/utils/foliateLayout";

const SRC_DIR = path.resolve(__dirname, "../src");

function readFile(relPath: string): string {
  return fs.readFileSync(path.resolve(SRC_DIR, relPath), "utf-8");
}

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
  it("word index 0 is valid for flow-mode visual recentering (no targetIdx > 0 guard)", () => {
    const source = readFile("components/FoliatePageView.tsx");
    const lines = source.split("\n");
    const recentering = lines.filter(
      (l) => l.includes("targetIdx > 0") && !l.trimStart().startsWith("//"),
    );
    expect(recentering).toEqual([]);
  });

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

  it("delayed Foliate extraction retries preserve the options object in startFlow", () => {
    const source = readFile("hooks/useReaderMode.ts");
    const retryMatch = source.match(
      /foliateApiRef\.current\.next\(\);\s*\n\s*setTimeout\(\(\)\s*=>\s*\{[\s\S]*?startFlow\(([^)]*)\)/,
    );
    expect(retryMatch).not.toBeNull();
    expect(retryMatch![1]).toBe("options");
  });

  it("startFlow() without options does not appear in narrate retry paths", () => {
    const source = readFile("hooks/useReaderMode.ts");
    const lines = source.split("\n");
    let inRetryBlock = false;
    const bareStartFlowInRetry: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("setTimeout(()") && lines[i - 1]?.includes("extractFoliateWords")) {
        inRetryBlock = true;
      }
      if (inRetryBlock && lines[i].includes("startFlow()")) {
        bareStartFlowInRetry.push(i + 1);
      }
      if (inRetryBlock && lines[i].includes("}, FOLIATE_SECTION_LOAD_WAIT_MS)")) {
        inRetryBlock = false;
      }
    }
    expect(bareStartFlowInRetry).toEqual([]);
  });

  it("FoliatePageView resets browse-away state on readingMode change", () => {
    const source = readFile("components/FoliatePageView.tsx");
    expect(source).toContain("userBrowsingRef.current = false");
    expect(source).toContain("lastScrollFollowPosRef.current = null");
    const hasResetEffect = /useEffect\(\(\)\s*=>\s*\{[^}]*userBrowsingRef\.current\s*=\s*false[^}]*lastScrollFollowPosRef\.current\s*=\s*null[^}]*\},\s*\[readingMode\]/s.test(source);
    expect(hasResetEffect).toBe(true);
  });

  it("flow/narrate scrolled surface uses single-column layout", () => {
    expect(getFoliateMaxColumnCount(true, 2000)).toBe("1");
  });
});
