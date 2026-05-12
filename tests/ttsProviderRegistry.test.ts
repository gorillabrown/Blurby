import { describe, expect, it } from "vitest";
import {
  TTS_PROVIDER_IDS,
  getTtsProvider,
  getTtsProviderRegistrySnapshot,
  listSelectableTtsProviders,
  listTtsProviders,
} from "../src/utils/ttsProviderRegistry";
import type { TtsEngine } from "../src/types";

const REQUIRED_CAPABILITY_FIELDS = [
  "id",
  "label",
  "selectable",
  "defaultEngine",
  "experimental",
  "disabledReason",
  "offline",
  "requiresSidecar",
  "canStream",
  "providesWordTimings",
  "timingTruth",
  "canBlendVoices",
  "supportsVoiceCloning",
  "supportedLanguages",
  "sampleRate",
  "license",
  "cacheable",
  "statusKind",
] as const;

describe("TTS provider capability registry", () => {
  it("registers capability metadata for every persisted TTS engine id", () => {
    const expectedIds: TtsEngine[] = ["web", "kokoro", "qwen", "nano", "pocket-tts"];

    expect(TTS_PROVIDER_IDS).toEqual(expectedIds);
    expect(listTtsProviders().map((provider) => provider.id)).toEqual(expectedIds);

    for (const id of expectedIds) {
      const provider = getTtsProvider(id);
      expect(provider).toBeDefined();
      for (const field of REQUIRED_CAPABILITY_FIELDS) {
        expect(provider?.capabilities).toHaveProperty(field);
      }
    }
  });

  it("preserves product posture and timing truth without changing engine defaults", () => {
    const kokoro = getTtsProvider("kokoro")?.capabilities;
    const web = getTtsProvider("web")?.capabilities;
    const qwen = getTtsProvider("qwen")?.capabilities;
    const nano = getTtsProvider("nano")?.capabilities;
    const pocket = getTtsProvider("pocket-tts")?.capabilities;

    expect(kokoro).toMatchObject({
      selectable: true,
      defaultEngine: true,
      offline: true,
      requiresSidecar: false,
      canStream: false,
      providesWordTimings: true,
      timingTruth: "word-native",
      canBlendVoices: false,
      supportsVoiceCloning: false,
      sampleRate: 24000,
      statusKind: "local-model",
    });

    expect(web).toMatchObject({
      selectable: true,
      defaultEngine: false,
      offline: false,
      requiresSidecar: false,
      providesWordTimings: false,
      timingTruth: "unreliable-boundary",
      cacheable: false,
      statusKind: "browser",
    });

    expect(qwen).toMatchObject({
      selectable: false,
      defaultEngine: false,
      experimental: true,
      disabledReason: "retired-desktop-v2",
      offline: true,
      requiresSidecar: true,
      canStream: true,
      providesWordTimings: false,
      timingTruth: "none",
      cacheable: false,
      statusKind: "disabled",
    });

    expect(nano).toMatchObject({
      selectable: true,
      defaultEngine: false,
      experimental: true,
      offline: true,
      requiresSidecar: true,
      providesWordTimings: false,
      timingTruth: "segment-following",
      canBlendVoices: false,
      supportsVoiceCloning: false,
      sampleRate: 24000,
      statusKind: "sidecar",
    });

    expect(pocket).toMatchObject({
      selectable: true,
      defaultEngine: false,
      experimental: true,
      offline: true,
      requiresSidecar: true,
      providesWordTimings: false,
      timingTruth: "segment-following",
      canBlendVoices: false,
      supportsVoiceCloning: true,
      sampleRate: 24000,
      statusKind: "sidecar",
    });
  });

  it("returns selectable providers without reactivating disabled Qwen", () => {
    expect(listSelectableTtsProviders().map((provider) => provider.id)).toEqual([
      "web",
      "kokoro",
      "nano",
      "pocket-tts",
    ]);

    const snapshot = getTtsProviderRegistrySnapshot();
    expect(snapshot.defaultProviderId).toBe("kokoro");
    expect(snapshot.providers.qwen.capabilities.selectable).toBe(false);
    expect(snapshot.providers.qwen.capabilities.disabledReason).toBe("retired-desktop-v2");
  });
});
