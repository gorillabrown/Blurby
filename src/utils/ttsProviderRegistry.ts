import type { TtsEngine } from "../types";
import type { TTSProvider } from "../types/ttsProvider";

export const TTS_PROVIDER_IDS = ["web", "kokoro", "qwen", "nano", "pocket-tts"] as const satisfies readonly TtsEngine[];

const PROVIDERS = [
  {
    id: "web",
    capabilities: {
      id: "web",
      label: "System",
      selectable: true,
      defaultEngine: false,
      experimental: false,
      disabledReason: null,
      offline: false,
      requiresSidecar: false,
      canStream: false,
      providesWordTimings: false,
      timingTruth: "unreliable-boundary",
      canBlendVoices: false,
      supportsVoiceCloning: false,
      supportedLanguages: [],
      sampleRate: null,
      license: "platform",
      cacheable: false,
      statusKind: "browser",
    },
    copy: {
      buttonLabel: "System",
      posture: "System voices remain available as a fallback/reach layer, but boundary events are not timing truth.",
      readyHint: "Using system Web Speech voices.",
      blockedHint: "System voice availability depends on the host browser/runtime.",
    },
  },
  {
    id: "kokoro",
    capabilities: {
      id: "kokoro",
      label: "Kokoro",
      selectable: true,
      defaultEngine: true,
      experimental: false,
      disabledReason: null,
      offline: true,
      requiresSidecar: false,
      canStream: false,
      providesWordTimings: true,
      timingTruth: "word-native",
      canBlendVoices: false,
      supportsVoiceCloning: false,
      supportedLanguages: ["en"],
      sampleRate: 24000,
      license: "model-specific",
      cacheable: true,
      statusKind: "local-model",
    },
    copy: {
      buttonLabel: "Kokoro (Default)",
      posture: "Kokoro is the default and operational floor.",
      readyHint: "Using default Kokoro voices.",
      blockedHint: "Kokoro needs local model, tokenizer, config, and voice assets before playback.",
    },
  },
  {
    id: "qwen",
    capabilities: {
      id: "qwen",
      label: "Qwen AI",
      selectable: false,
      defaultEngine: false,
      experimental: true,
      disabledReason: "retired-desktop-v2",
      offline: true,
      requiresSidecar: true,
      canStream: true,
      providesWordTimings: false,
      timingTruth: "none",
      canBlendVoices: false,
      supportsVoiceCloning: false,
      supportedLanguages: [],
      sampleRate: 24000,
      license: "model-specific",
      cacheable: false,
      statusKind: "disabled",
    },
    copy: {
      buttonLabel: "Qwen AI (Retired)",
      posture: "Qwen is retired for Desktop v2 and remains disabled.",
      readyHint: "Qwen is disabled and should not be used for live narration.",
      blockedHint: "Qwen remains disabled unless a separate future approval reactivates it.",
    },
  },
  {
    id: "nano",
    capabilities: {
      id: "nano",
      label: "MOSS-Nano",
      selectable: true,
      defaultEngine: false,
      experimental: true,
      disabledReason: null,
      offline: true,
      requiresSidecar: true,
      canStream: false,
      providesWordTimings: false,
      timingTruth: "segment-following",
      canBlendVoices: false,
      supportsVoiceCloning: false,
      supportedLanguages: ["en"],
      sampleRate: 24000,
      license: "model-specific",
      cacheable: true,
      statusKind: "sidecar",
    },
    copy: {
      buttonLabel: "MOSS-Nano (Recommended opt-in)",
      posture: "Nano is selectable as a recommended opt-in local runtime and requires the local MOSS Nano sidecar.",
      readyHint: "Using recommended opt-in MOSS-Nano through the local sidecar.",
      blockedHint: "MOSS-Nano remains selected only as a blocked recommended opt-in option until the sidecar is ready. Nano preview becomes available only after the sidecar reports ready.",
    },
  },
  {
    id: "pocket-tts",
    capabilities: {
      id: "pocket-tts",
      label: "Pocket TTS",
      selectable: true,
      defaultEngine: false,
      experimental: true,
      disabledReason: null,
      offline: true,
      requiresSidecar: true,
      canStream: false,
      providesWordTimings: false,
      timingTruth: "segment-following",
      canBlendVoices: false,
      supportsVoiceCloning: true,
      supportedLanguages: ["en"],
      sampleRate: 24000,
      license: "model-specific",
      cacheable: true,
      statusKind: "sidecar",
    },
    copy: {
      buttonLabel: "Pocket TTS (Opt-in)",
      posture: "Pocket TTS is available as an explicit opt-in local runtime, with upstream synthesis scaffolded until adapter work is approved.",
      readyHint: "Using opt-in Pocket TTS through the local sidecar.",
      blockedHint: "Pocket remains selected only as a blocked opt-in option until the sidecar is ready. Preview becomes available only after the sidecar reports ready. Upstream synthesis remains scaffolded until adapter work is approved.",
    },
  },
] as const satisfies readonly TTSProvider[];

const PROVIDER_BY_ID = new Map<TtsEngine, TTSProvider>(
  PROVIDERS.map((provider) => [provider.id, provider]),
);

export function listTtsProviders(): readonly TTSProvider[] {
  return PROVIDERS;
}

export function listSelectableTtsProviders(): readonly TTSProvider[] {
  return PROVIDERS.filter((provider) => provider.capabilities.selectable);
}

export function getTtsProvider(id: TtsEngine): TTSProvider | undefined {
  return PROVIDER_BY_ID.get(id);
}

export function getTtsProviderOrThrow(id: TtsEngine): TTSProvider {
  const provider = getTtsProvider(id);
  if (!provider) throw new Error(`Unknown TTS provider: ${id}`);
  return provider;
}

export function getTtsProviderRegistrySnapshot() {
  const providers = PROVIDERS.reduce((acc, provider) => {
    acc[provider.id] = provider;
    return acc;
  }, {} as Record<TtsEngine, TTSProvider>);

  return {
    defaultProviderId: PROVIDERS.find((provider) => provider.capabilities.defaultEngine)?.id ?? null,
    providers,
  };
}
