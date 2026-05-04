import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  MOSS_NANO_ELECTRON_LIVE_DRIVER_MODES,
  buildDriverSelectorContract,
  buildElectronLaunchArgs,
  readRendererTraceEvents,
  shouldRetryNanoPlaybackStart,
  hasRequiredLiveCaptureDriverEvents,
  buildTraceConfig,
  buildTraceEnv,
} from "../scripts/moss_nano_electron_live_driver.mjs";

describe("MOSS Nano Electron live driver contract", () => {
  it("builds a fail-closed per-mode trace config for production capture", () => {
    expect(MOSS_NANO_ELECTRON_LIVE_DRIVER_MODES).toEqual(["page", "focus", "flow", "narrate"]);

    const config = buildTraceConfig("flow", {
      runIdPrefix: "moss-nano-13d",
      fixtureTitlePrefix: "Automated",
    });

    expect(config).toMatchObject({
      mode: "flow",
      runId: "moss-nano-13d-flow",
      scenarioId: "moss-nano-13c-flow-live-evidence",
      fixture: {
        id: "live-flow",
        title: "Automated Flow",
        sourceType: "prose",
        expectedCoverage: [],
      },
    });
  });

  it("rejects unsupported modes before launching Electron", () => {
    expect(() => buildTraceConfig("scroll")).toThrow("Unsupported MOSS Nano live driver mode");
    expect(() => buildTraceEnv({
      mode: "scroll",
      traceDir: "artifacts/tts-eval/example/traces",
    })).toThrow("Unsupported MOSS Nano live driver mode");
  });

  it("constructs Electron args and env without shell string interpolation", () => {
    const args = buildElectronLaunchArgs({
      appRoot: "C:/repo/Blurby",
      remoteDebuggingPort: 9333,
      userDataDir: "C:/tmp/blurby-profile",
    });

    expect(args).toContain("C:/repo/Blurby");
    expect(args).toContain("--remote-debugging-port=9333");
    expect(args).toContain("--user-data-dir=C:/tmp/blurby-profile");

    const env = buildTraceEnv({
      mode: "page",
      traceDir: "artifacts/tts-eval/moss-nano-13d-live-capture/traces",
      baseEnv: { KEEP_ME: "yes" },
    });

    expect(env.KEEP_ME).toBe("yes");
    expect(env.BLURBY_TTS_EVAL_TRACE_DIR).toBe(path.resolve("artifacts/tts-eval/moss-nano-13d-live-capture/traces"));
    expect(JSON.parse(env.BLURBY_TTS_EVAL_TRACE_CONFIG)).toMatchObject({
      mode: "page",
      runId: "moss-nano-13d-page",
    });
  });

  it("declares stable UI selectors the driver must satisfy", () => {
    expect(buildDriverSelectorContract()).toEqual({
      addDocumentButton: '[aria-label="Add document"]',
      documentTitleInput: '[aria-label="Document title"]',
      documentContentInput: '[aria-label="Document content"]',
      openMenuButton: '[aria-label="Open menu"]',
      goToSettingsButton: '[aria-label="Go to settings"]',
      readerPlayButton: '[aria-label="Play"]',
      readerPauseButton: '[aria-label="Pause"]',
      pageModeButton: '[aria-label="Page mode"]',
      focusModeButton: '[aria-label="Focus mode"]',
      flowModeButton: '[aria-label="Flow mode"]',
      narrateModeButton: '[aria-label="Narrate mode"]',
    });
  });

  it("reads live preload trace events through getEvents when the bridge array is stale", async () => {
    const client = {
      evaluate: async (fn) => fn({
        events: [],
        getEvents: () => [
          {
            kind: "nano-segment",
            phase: "playback",
            startIdx: 0,
            endIdx: 8,
          },
        ],
      }),
    };

    await expect(readRendererTraceEvents(client)).resolves.toEqual([
      {
        kind: "nano-segment",
        phase: "playback",
        startIdx: 0,
        endIdx: 8,
      },
    ]);
  });

  it("does not retry the Play click while narration is already active", () => {
    expect(shouldRetryNanoPlaybackStart({
      hasPlayback: false,
      hasPlayButton: false,
      hasPauseButton: true,
    })).toBe(false);

    expect(shouldRetryNanoPlaybackStart({
      hasPlayback: false,
      hasPlayButton: true,
      hasPauseButton: false,
    })).toBe(true);
  });

  it("summarizes the fail-closed evidence the UI driver must wait for", () => {
    expect(hasRequiredLiveCaptureDriverEvents([
      { kind: "flow-position", wordIndex: 3 },
      { kind: "transition", transition: "handoff", context: "mode-switch-anchor-preserved" },
      { kind: "lifecycle", state: "pause", mode: "page", wordIndex: 3 },
      { kind: "lifecycle", state: "resume", mode: "page", wordIndex: 3 },
      { kind: "nano-segment", phase: "playback" },
    ], "page")).toEqual({
      flowPosition: true,
      modeSwitchAnchorPreserved: true,
      pauseResumeSameMode: true,
      nanoPlayback: true,
    });

    expect(hasRequiredLiveCaptureDriverEvents([
      { kind: "flow-position", wordIndex: 3 },
      { kind: "transition", transition: "handoff", context: "mode-switch-anchor-preserved" },
      { kind: "lifecycle", state: "pause", mode: "narrate", wordIndex: 3 },
      { kind: "lifecycle", state: "resume", mode: "narrate", wordIndex: 3 },
      { kind: "nano-segment", phase: "playback" },
    ], "page").pauseResumeSameMode).toBe(false);
  });
});
