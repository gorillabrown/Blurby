import { describe, expect, it } from "vitest";
import { validateTtsDiagnosticsBundleArtifact } from "../scripts/tts_eval_runner.mjs";

describe("tts eval runner diagnostics bundle validation", () => {
  it("accepts redacted tts-diagnostics-v1 bundles", () => {
    const result = validateTtsDiagnosticsBundleArtifact({
      schemaVersion: "tts-diagnostics-v1",
      audioPayloadIncluded: false,
      redaction: { includeAudio: false, includesRawText: false, includesErrorStacks: false },
      session: { selectedEngine: "kokoro", voiceId: "af_bella", rate: 1.2, segmentIds: ["s1"] },
      providers: { kokoro: { capabilities: { providerId: "kokoro", timingTruth: "word-native" } } },
      normalizedSegments: [{ segmentId: "s1", originalTextHash: "sha256:o", normalizedTextHash: "sha256:n" }],
      cacheEntries: [{ chunkId: "c1", cacheKeyComponents: { providerId: "kokoro" } }],
      timingSidecars: [{ chunkId: "c1", timingTruth: "word-native", wordTimestampCount: 2 }],
      schedulerTruthEvents: [{ source: "kokoro", wordIndex: 1 }],
      highlightSyncDecisions: [{ decision: { mode: "word", syncLevel: "word-synced" } }],
      errors: [],
    });

    expect(result).toEqual({ ok: true, issues: [] });
  });

  it("rejects diagnostics bundles with audio payloads or raw text", () => {
    const result = validateTtsDiagnosticsBundleArtifact({
      schemaVersion: "tts-diagnostics-v1",
      audioPayloadIncluded: false,
      redaction: { includeAudio: false, includesRawText: false, includesErrorStacks: false },
      session: { selectedEngine: "kokoro", segmentIds: [] },
      providers: {},
      normalizedSegments: [{ segmentId: "s1", normalizedText: "leaked text" }],
      cacheEntries: [{ chunkId: "c1", audioPayload: "base64-audio" }],
      timingSidecars: [],
      schedulerTruthEvents: [],
      highlightSyncDecisions: [],
      errors: [],
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContain("raw text fields are not allowed in diagnostics bundles");
    expect(result.issues).toContain("audio payload fields are not allowed in diagnostics bundles");
  });
});
