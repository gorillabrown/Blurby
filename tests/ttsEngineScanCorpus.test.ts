import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type Fixture = {
  id: string;
  file: string;
};

const root = path.resolve("tests/fixtures/narration/engine-scan");
const manifestPath = path.join(root, "manifest.json");

describe("tts engine scan corpus", () => {
  it("covers the required fixture classes", () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
      fixtures: Fixture[];
    };
    const ids = manifest.fixtures.map((fixture) => fixture.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        "literary-punctuation",
        "long-sentence-cadence",
        "dialogue-attribution",
        "heading-short-lines",
        "continuous-chapter-passage",
        "transition-reentry",
      ]),
    );
  });

  it("contains a continuous passage that is large enough for 5+ minutes of narration", () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
      fixtures: Fixture[];
    };
    const fixture = manifest.fixtures.find(
      (item) => item.id === "continuous-chapter-passage",
    );

    expect(fixture).toBeTruthy();

    const text = fs.readFileSync(path.join(root, fixture!.file), "utf8");
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    expect(wordCount).toBeGreaterThanOrEqual(1000);
  });
});
