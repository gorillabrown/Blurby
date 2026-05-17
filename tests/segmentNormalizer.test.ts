import { describe, expect, it } from "vitest";
import fixtures from "./fixtures/tts-normalization/english-v1.json";
import { TTS_NORMALIZER_VERSION } from "../src/constants";
import {
  normalizeSegmentText,
  stableSegmentTextHash,
  type SegmentNormalizationFixture,
  type SegmentNormalizationTransformId,
} from "../src/utils/segmentNormalizer";

const fixtureCases = fixtures as SegmentNormalizationFixture[];

describe("SegmentNormalizer", () => {
  it("normalizes conservative English golden fixtures with explicit transform metadata", () => {
    for (const fixture of fixtureCases) {
      const result = normalizeSegmentText(fixture.input, { locale: fixture.locale });

      expect(result.originalText).toBe(fixture.input);
      expect(result.normalizedText).toBe(fixture.expected);
      expect(result.locale).toBe(fixture.locale);
      expect(result.normalizerVersion).toBe(TTS_NORMALIZER_VERSION);
      expect(result.sourceTextHash).toBe(stableSegmentTextHash(fixture.input));
      expect(result.normalizedTextHash).toBe(stableSegmentTextHash(fixture.expected));
      expect(result.normalizedToOriginalMap).toEqual(fixture.expectedNormalizedToOriginalMap);
      expect(result.transforms.map((transform) => transform.id)).toEqual(fixture.expectedTransforms);
    }
  });

  it("keeps pronunciation overrides as the first transform and visible in identity", () => {
    const result = normalizeSegmentText("Dr. Qing visited NASA.", {
      locale: "en-US",
      pronunciationOverrides: [
        { id: "qing", from: "Qing", to: "Ching", enabled: true },
      ],
    });

    expect(result.normalizedText).toBe("Doctor Ching visited NASA.");
    expect(result.pronunciationOverrideHash).toMatch(/[a-z0-9]+/);
    expect(result.transforms.map((transform) => transform.id)).toEqual([
      "pronunciation-overrides",
      "abbreviation-expansion",
    ] satisfies SegmentNormalizationTransformId[]);
  });

  it("is deterministic, pure, and leaves source display words untouched", () => {
    const words = ["Dr.", "Qing", "paid", "$12.50."];
    const sourceText = words.join(" ");

    const first = normalizeSegmentText(sourceText, { locale: "en-US" });
    const second = normalizeSegmentText(sourceText, { locale: "en-US" });

    expect(first).toEqual(second);
    expect(words).toEqual(["Dr.", "Qing", "paid", "$12.50."]);
    expect(first.originalText).toBe(sourceText);
    expect(first.normalizedText).toBe("Doctor Qing paid twelve dollars and fifty cents.");
    expect(first.sourceTextHash).not.toBe(first.normalizedTextHash);
  });

  it("maps expanded normalized tokens back to original word indices", () => {
    const result = normalizeSegmentText('"Mr. Wells owes $12.50," she said.', { locale: "en-US" });
    expect(result.normalizedText).toBe('"Mister Wells owes twelve dollars and fifty cents," she said.');
    expect(result.normalizedToOriginalMap).toEqual([0, 1, 2, 3, 3, 3, 3, 3, 4, 5]);
  });

  it("keeps required transform ordering constraints for enrichment transforms", () => {
    const dottedBeforeAbbreviation = normalizeSegmentText("Dr. U.S.A. arrived.", { locale: "en-US" });
    expect(dottedBeforeAbbreviation.transforms.map((transform) => transform.id)).toEqual([
      "dotted-acronym-normalization",
      "abbreviation-expansion",
    ]);

    const addressBeforeNumberConversion = normalizeSegmentText("Meet at St. 42 tonight.", { locale: "en-US" });
    expect(addressBeforeNumberConversion.transforms.map((transform) => transform.id)).toEqual([
      "address-abbreviation-expansion",
      "cardinal-expansion",
    ]);

    const urlBeforeNumberConversion = normalizeSegmentText("See https://blurby.app/2026 updates.", { locale: "en-US" });
    expect(urlBeforeNumberConversion.transforms.map((transform) => transform.id)).toEqual([
      "url-normalization",
      "cardinal-expansion",
    ]);

    const heteronymAfterTextTransforms = normalizeSegmentText("She had read 3/4 of the notes.", { locale: "en-US" });
    expect(heteronymAfterTextTransforms.transforms.map((transform) => transform.id)).toEqual([
      "fraction-expansion",
      "heteronym-disambiguation",
    ]);
  });
});
