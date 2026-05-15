import { describe, expect, it } from "vitest";
import {
  TTS_DIAGNOSTICS_SCHEMA_VERSION,
  createNarrationDiagnosticsBundle,
  validateNarrationDiagnosticsBundle,
} from "../src/utils/narrateDiagnostics";

describe("narration diagnostics bundle", () => {
  it("builds a provider-neutral redacted bundle with timing and highlight sync evidence", () => {
    const bundle = createNarrationDiagnosticsBundle({
      session: {
        bookId: "book-1",
        sessionId: "session-1",
        selectedEngine: "kokoro",
        voiceId: "af_bella",
        rate: 1.3,
        segmentIds: ["book-1:0:segment-0"],
      },
      normalizedSegments: [
        {
          segmentId: "book-1:0:segment-0",
          chunkId: "book-1:0",
          originalTextHash: "sha256:original",
          normalizedTextHash: "sha256:normalized",
          normalizerVersion: "normalize-v2",
        },
      ],
      cacheEntries: [
        {
          chunkId: "book-1:0",
          cacheKeyComponents: {
            providerId: "kokoro",
            voiceId: "af_bella",
            rateBucket: 1.2,
            normalizedTextHash: "sha256:normalized",
          },
        },
      ],
      timingSidecars: [
        {
          chunkId: "book-1:0",
          segmentId: "book-1:0:segment-0",
          timingTruth: "word-native",
          durationMs: 800,
          wordTimestampCount: 2,
          classification: "trusted-word-timing",
        },
      ],
      schedulerTruthEvents: [
        {
          source: "kokoro",
          wordIndex: 1,
          timingTruth: "word-native",
          chunkId: "book-1:0",
        },
      ],
      highlightSyncDecisions: [
        {
          input: { wordIndex: 1, followingEnabled: true },
          decision: {
            mode: "word",
            syncLevel: "word-synced",
            activeChunkRange: { startWordIndex: 0, endWordIndex: 2 },
            activeWordIndex: 1,
            reason: "trusted-word-timing",
          },
        },
      ],
      errors: [{ source: "scheduler", message: "Recovered from stale prefetch." }],
    });

    expect(bundle.schemaVersion).toBe(TTS_DIAGNOSTICS_SCHEMA_VERSION);
    expect(bundle.audioPayloadIncluded).toBe(false);
    expect(bundle.redaction).toEqual({
      includeAudio: false,
      includesRawText: false,
      includesErrorStacks: false,
    });
    expect(bundle.session).toEqual(expect.objectContaining({
      selectedEngine: "kokoro",
      voiceId: "af_bella",
      rate: 1.3,
      segmentIds: ["book-1:0:segment-0"],
    }));
    expect(bundle.providers.kokoro.capabilities).toEqual(expect.objectContaining({
      providerId: "kokoro",
      timingTruth: "word-native",
    }));
    expect(bundle.normalizedSegments[0]).toEqual({
      segmentId: "book-1:0:segment-0",
      chunkId: "book-1:0",
      originalTextHash: "sha256:original",
      normalizedTextHash: "sha256:normalized",
      normalizerVersion: "normalize-v2",
    });
    expect(bundle.cacheEntries[0].cacheKeyComponents).toEqual(expect.objectContaining({
      providerId: "kokoro",
      voiceId: "af_bella",
      normalizedTextHash: "sha256:normalized",
    }));
    expect(bundle.timingSidecars[0]).toEqual(expect.objectContaining({
      timingTruth: "word-native",
      wordTimestampCount: 2,
      classification: "trusted-word-timing",
    }));
    expect(bundle.schedulerTruthEvents).toHaveLength(1);
    expect((bundle.highlightSyncDecisions[0].decision as { reason: string }).reason).toBe("trusted-word-timing");
    expect(validateNarrationDiagnosticsBundle(bundle)).toEqual({ ok: true, issues: [] });
  });

  it("redacts raw text and audio payloads by default even if callers provide them", () => {
    const bundle = createNarrationDiagnosticsBundle({
      session: {
        bookId: "book-secret",
        sessionId: "session-secret",
        selectedEngine: "kokoro",
        voiceId: "af_bella",
        rate: 1,
        segmentIds: ["secret-segment"],
      },
      normalizedSegments: [
        {
          segmentId: "secret-segment",
          chunkId: "secret-chunk",
          originalText: "Dorian Gray",
          normalizedText: "dorian gray",
          originalTextHash: "sha256:original-secret",
          normalizedTextHash: "sha256:normalized-secret",
        } as any,
      ],
      cacheEntries: [
        {
          chunkId: "secret-chunk",
          audioPayload: "base64-audio",
          cacheKeyComponents: {
            providerId: "kokoro",
            normalizedTextHash: "sha256:normalized-secret",
          },
        } as any,
      ],
      timingSidecars: [],
      schedulerTruthEvents: [],
      highlightSyncDecisions: [],
    });

    const serialized = JSON.stringify(bundle);
    expect(serialized).not.toContain("Dorian Gray");
    expect(serialized).not.toContain("dorian gray");
    expect(serialized).not.toContain("base64-audio");
    expect(bundle.audioPayloadIncluded).toBe(false);
    expect(validateNarrationDiagnosticsBundle(bundle).ok).toBe(true);
  });

  it("rejects bundles that contain raw text or audio payload fields", () => {
    const compromised = {
      schemaVersion: TTS_DIAGNOSTICS_SCHEMA_VERSION,
      audioPayloadIncluded: false,
      redaction: { includeAudio: false, includesRawText: false, includesErrorStacks: false },
      session: { selectedEngine: "kokoro", segmentIds: [] },
      providers: {},
      normalizedSegments: [{ segmentId: "s1", originalText: "leaked text" }],
      cacheEntries: [{ chunkId: "c1", audioPayload: "base64-audio" }],
      timingSidecars: [],
      schedulerTruthEvents: [],
      highlightSyncDecisions: [],
      errors: [],
    };

    const result = validateNarrationDiagnosticsBundle(compromised);
    expect(result.ok).toBe(false);
    expect(result.issues).toContain("raw text fields are not allowed in diagnostics bundles");
    expect(result.issues).toContain("audio payload fields are not allowed in diagnostics bundles");
  });
});
