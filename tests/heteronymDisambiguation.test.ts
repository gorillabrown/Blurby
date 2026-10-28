import { describe, expect, it } from "vitest";
import { normalizeSegmentText } from "../src/utils/segmentNormalizer";

const positiveCases = [
  { input: "I had read the report yesterday.", expected: "I had red the report yesterday." },
  { input: "Please wind the clock up.", expected: "Please wined the clock up." },
  { input: "A tear rolled down her cheek.", expected: "A tier rolled down her cheek." },
  { input: "Stay close to your team.", expected: "Stay klohs to your team." },
  { input: "The lead pipe was heavy.", expected: "The led pipe was heavy." },
  { input: "The live show starts soon.", expected: "The lyve show starts soon." },
  { input: "You must bow down now.", expected: "You must bau down now." },
  { input: "A minute detail was missed.", expected: "A mynewt detail was missed." },
] as const;

const negativeCases = [
  { input: "I read books every day.", expected: "I read books every day." },
  { input: "The wind is cold tonight.", expected: "The wind is cold tonight." },
  { input: "She flew to St. Louis last year.", expected: "She flew to St. Louis last year." },
] as const;

describe("heteronym disambiguation", () => {
  it("applies context-window alternates for supported heteronyms", () => {
    for (const testCase of positiveCases) {
      const result = normalizeSegmentText(testCase.input, { locale: "en-US" });
      expect(result.normalizedText).toBe(testCase.expected);
      expect(result.transforms.map((transform) => transform.id)).toContain("heteronym-disambiguation");
    }
  });

  it("does not force alternates when context does not match", () => {
    for (const testCase of negativeCases) {
      const result = normalizeSegmentText(testCase.input, { locale: "en-US" });
      expect(result.normalizedText).toBe(testCase.expected);
      expect(result.transforms.map((transform) => transform.id)).not.toContain("heteronym-disambiguation");
    }
  });
});
