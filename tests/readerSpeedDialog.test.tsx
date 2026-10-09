// @vitest-environment jsdom
// READER-MODE-SEPARATION-2 speed amendment (design §E, acceptance items 1–6; OC-6/OC-7/OC-8).
// Values are checked on the dialog's pure index math, the UI through ReaderBottomBar, and the effects
// through the real router + real mode runtimes over the fake port infrastructure (a mini shell merges each
// settings.update patch into the snapshot and forwards it, as ReaderContainer does).
import React, { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ReaderBottomBar from "../src/components/ReaderBottomBar";
import {
  formatSpeedMultiplier,
  formatSpeedValueText,
  speedAt,
  speedIndexOf,
  speedMaxIndex,
} from "../src/components/ReaderSpeedDialog";
import { NARRATE_SPEED_SETTLE_MS, TTS_DEFAULT_ENGINE } from "../src/constants";
import type { BlurbySettings } from "../src/types";
import type { ReaderModeSpeed } from "../src/reader/modes/ReaderModeAdapter";
import { createReaderSettingsSnapshot, type ReaderSettingsSnapshot } from "../src/reader/document/ReaderDocumentSnapshot";
import { createReaderPorts, type ReaderPortInfrastructure } from "../src/reader/ports/createReaderPorts";
import { createReaderModeRouter, READER_MODE_MODULES } from "../src/reader/useReaderModeOrchestrator";
import { FocusMode } from "../src/reader/modes/focus/ModeRuntime";
import { FlowMode } from "../src/reader/modes/flow/ModeRuntime";
import { createFakeInfrastructure } from "./readerModes/harness/fakePorts";

// ── Values (acceptance items 3 and 4) ────────────────────────────────────────

describe("speed dialog values", () => {
  it.each(["focus", "flow"] as const)("%s enumerates exactly 89 values, 0.40x–4.80x, each multiplier × 250 WPM", (mode) => {
    expect(speedMaxIndex(mode)).toBe(88);
    const values = Array.from({ length: 89 }, (_, i) => speedAt(mode, i));
    const labels = values.map(formatSpeedMultiplier);
    expect(labels[0]).toBe("0.40x");
    expect(labels[88]).toBe("4.80x");
    expect(new Set(labels).size).toBe(89);
    values.forEach((speed, i) => {
      expect(speed).toEqual({ kind: "wpm", wpm: (40 + 5 * i) * 2.5 });
      // multiplier × 250, exactly (no integer rounding): label hundredths × 2.5.
      expect(speed.kind === "wpm" && speed.wpm).toBe(Number(labels[i].slice(0, -1)) * 250);
      expect(speedIndexOf(mode, speed)).toBe(i);
    });
    expect(values[1]).toEqual({ kind: "wpm", wpm: 112.5 });
    expect(labels[1]).toBe("0.45x");
    expect(values[12]).toEqual({ kind: "wpm", wpm: 250 });
    expect(labels[12]).toBe("1.00x");
    expect(values[88]).toEqual({ kind: "wpm", wpm: 1200 });
    expect(formatSpeedValueText(values[1])).toBe("0.45x, 112.5 words per minute");
  });

  it("narrate enumerates exactly 25 values, 0.80x–2.00x in 0.05x steps", () => {
    expect(speedMaxIndex("narrate")).toBe(24);
    const values = Array.from({ length: 25 }, (_, j) => speedAt("narrate", j));
    expect(values.map((s) => s.kind === "rate" && s.rate)).toEqual([
      0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4,
      1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2.0,
    ]);
    values.forEach((speed, j) => expect(speedIndexOf("narrate", speed)).toBe(j));
    expect(formatSpeedValueText(values[5])).toBe("1.05x");
  });
});

// ── Mini shell: real router + real runtimes over the fake ports ───────────────

function openShell(initial: Partial<BlurbySettings> = {}) {
  const fake = createFakeInfrastructure();
  const base = fake.infra.settings.read();
  let settings: ReaderSettingsSnapshot = createReaderSettingsSnapshot({
    settings: { ...(base.settings as BlurbySettings), ...initial },
    wpm: base.wpm,
    effectiveWpm: base.effectiveWpm,
    focusTextSize: base.focusTextSize,
    isEink: base.isEink,
    isMac: base.isMac,
  });
  const infra: ReaderPortInfrastructure = {
    ...fake.infra,
    settings: {
      read: () => settings,
      update: (patch) => {
        fake.infra.settings.update(patch);
        settings = createReaderSettingsSnapshot({ ...settings, settings: { ...(settings.settings as BlurbySettings), ...patch } as BlurbySettings });
      },
      setWpm: fake.infra.settings.setWpm,
    },
  };
  const router = createReaderModeRouter({
    modules: READER_MODE_MODULES,
    broker: createReaderPorts(infra),
    getDocument: () => fake.infra.document.snapshot(),
    getSettings: () => settings,
  });
  router.openDocument(fake.infra.document.snapshot());
  return {
    fake,
    router,
    /** The shell's settings effect: forward the merged snapshot to the active runtime. */
    sync: () => router.applySettings(settings),
    settings: () => settings.settings,
    speed: () => router.getSnapshot()?.speed ?? null,
    /** settings.update patches written since `from`. */
    patches: (from = 0) => fake.effects.slice(from).filter((c) => c.method === "settings.update").map((c) => c.args[0] as Record<string, unknown>),
  };
}

/** Patches that touch a speed key, so mode-switch bookkeeping (readingMode, lastReadingMode) is ignored. */
function speedPatches(patches: Record<string, unknown>[]) {
  return patches.filter((p) => "focusWpm" in p || "flowWpm" in p || "ttsRate" in p || "wpm" in p);
}

describe("runtime setSpeed (acceptance items 2–5)", () => {
  it("Focus persists only focusWpm, exactly, and neither moves nor plays", () => {
    const shell = openShell();
    shell.router.select("focus");
    const before = shell.router.getSnapshot()!;
    const from = shell.fake.effects.length;
    shell.router.setSpeed({ kind: "wpm", wpm: 112.5 });
    expect(shell.patches(from)).toEqual([{ focusWpm: 112.5 }]);
    expect(shell.fake.effects.slice(from).map((c) => c.method)).toEqual(["settings.update"]);
    shell.sync();
    const after = shell.router.getSnapshot()!;
    expect(after.speed).toEqual({ kind: "wpm", wpm: 112.5 });
    expect(after.playing).toBe(false);
    expect(after.currentWordIndex).toBe(before.currentWordIndex);
    expect(after.highlightedWordIndex).toBe(before.highlightedWordIndex);
  });

  it("Flow persists only flowWpm, exactly, and neither moves nor plays", () => {
    const shell = openShell();
    shell.router.select("flow");
    const before = shell.router.getSnapshot()!;
    const from = shell.fake.effects.length;
    shell.router.setSpeed({ kind: "wpm", wpm: 1187.5 });
    expect(shell.patches(from)).toEqual([{ flowWpm: 1187.5 }]);
    expect(shell.fake.effects.slice(from).map((c) => c.method)).toEqual(["settings.update"]);
    shell.sync();
    const after = shell.router.getSnapshot()!;
    expect(after.speed).toEqual({ kind: "wpm", wpm: 1187.5 });
    expect(after.playing).toBe(false);
    expect(after.currentWordIndex).toBe(before.currentWordIndex);
  });

  it.each([0.8, 1.05, 2.0])("Narrate stores %s and hands exactly that rate to its audio port, without starting playback", (rate) => {
    vi.useFakeTimers({ now: 0 });
    try {
      const shell = openShell();
      shell.router.select("narrate");
      const before = shell.router.getSnapshot()!;
      const from = shell.fake.effects.length;
      shell.router.setSpeed({ kind: "rate", rate });
      // Persisted at once; the audio port gets the settled rate after the quiet period (settle).
      expect(shell.fake.effects.slice(from)).toEqual([{ method: "settings.update", args: [{ ttsRate: rate }] }]);
      vi.advanceTimersByTime(NARRATE_SPEED_SETTLE_MS);
      expect(shell.fake.effects.slice(from)).toEqual([
        { method: "settings.update", args: [{ ttsRate: rate }] },
        { method: "audio.adjustRate", args: [rate] },
      ]);
      shell.sync();
      const after = shell.router.getSnapshot()!;
      expect(after.speed).toEqual({ kind: "rate", rate });
      expect(after.playing).toBe(false);
      expect(after.currentWordIndex).toBe(before.currentWordIndex);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("a running Focus or Flow clock takes the new speed (effective rate)", () => {
    vi.useFakeTimers({ now: 0 });
    const focusSpy = vi.spyOn(FocusMode.prototype, "setSpeed");
    const flowSpy = vi.spyOn(FlowMode.prototype, "setSpeed");
    try {
      const focus = openShell();
      focus.router.select("focus");
      focus.router.togglePlay();
      vi.advanceTimersByTime(500);
      expect(focus.router.getSnapshot()!.playing).toBe(true);
      focus.router.setSpeed({ kind: "wpm", wpm: 612.5 });
      expect(focusSpy).toHaveBeenLastCalledWith(612.5);
      focus.router.destroy();

      const flow = openShell();
      flow.router.select("flow");
      flow.router.togglePlay();
      vi.advanceTimersByTime(500);
      expect(flow.router.getSnapshot()!.playing).toBe(true);
      flow.router.setSpeed({ kind: "wpm", wpm: 137.5 });
      expect(flowSpy).toHaveBeenLastCalledWith(137.5);
      flow.router.destroy();
    } finally {
      focusSpy.mockRestore();
      flowSpy.mockRestore();
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("rejects out-of-range and wrong-kind speeds without any write (never clamps or rounds)", () => {
    const shell = openShell();
    shell.router.select("focus");
    let from = shell.fake.effects.length;
    for (const speed of [
      { kind: "wpm", wpm: 87.5 }, { kind: "wpm", wpm: 1212.5 }, { kind: "wpm", wpm: Number.NaN }, { kind: "rate", rate: 1.05 },
    ] as ReaderModeSpeed[]) shell.router.setSpeed(speed);
    expect(shell.fake.effects.slice(from)).toEqual([]);

    shell.router.select("flow");
    from = shell.fake.effects.length;
    for (const speed of [{ kind: "wpm", wpm: 99 }, { kind: "wpm", wpm: 1201 }, { kind: "rate", rate: 1 }] as ReaderModeSpeed[]) shell.router.setSpeed(speed);
    expect(shell.fake.effects.slice(from)).toEqual([]);

    shell.router.select("narrate");
    from = shell.fake.effects.length;
    for (const speed of [{ kind: "rate", rate: 0.75 }, { kind: "rate", rate: 2.05 }, { kind: "wpm", wpm: 250 }] as ReaderModeSpeed[]) shell.router.setSpeed(speed);
    expect(shell.fake.effects.slice(from)).toEqual([]);
  });

  it("Page has no speed, setSpeed is a no-op and Space (togglePlay) stays a no-op (item 1)", () => {
    const shell = openShell();
    expect(shell.router.getActive()?.mode).toBe("page");
    const before = shell.router.getSnapshot()!;
    expect(before.speed).toBeNull();
    const from = shell.fake.effects.length;
    shell.router.setSpeed({ kind: "wpm", wpm: 250 });
    shell.router.togglePlay();
    expect(shell.fake.effects.slice(from)).toEqual([]);
    expect(shell.router.getSnapshot()).toEqual(before);
    expect(shell.router.getSnapshot()!.playing).toBe(false);
  });
});

// Live G6 finding on 966e3261: 8 slider steps reached the audio port as 8 re-seeds (final rate response
// 9482 ms). Narrate persists every step but applies only the settled value (parent Type 1b).
describe("Narrate applies one settled rate to audio (settle, live finding)", () => {
  const adjustCalls = (shell: ReturnType<typeof openShell>, from: number) =>
    shell.fake.effects.slice(from).filter((c) => c.method === "audio.adjustRate").map((c) => c.args[0]);

  beforeEach(() => { vi.useFakeTimers({ now: 0 }); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it("8 rapid steps 1.05 → 1.40 persist 8 times and reach the audio port once, as 1.4, after the quiet period", () => {
    const shell = openShell();
    shell.router.select("narrate");
    const from = shell.fake.effects.length;
    for (let index = 5; index <= 12; index += 1) {
      shell.router.setSpeed(speedAt("narrate", index));
      shell.sync();
      vi.advanceTimersByTime(90); // ~738 ms / 8 in the live run: each step lands inside the previous quiet window
    }
    const persisted = speedPatches(shell.patches(from));
    expect(persisted).toHaveLength(8);
    expect(persisted.at(-1)).toEqual({ ttsRate: 1.4 });
    expect(shell.speed()).toEqual({ kind: "rate", rate: 1.4 });
    expect(adjustCalls(shell, from)).toEqual([]);
    vi.advanceTimersByTime(NARRATE_SPEED_SETTLE_MS - 90 - 1);
    expect(adjustCalls(shell, from)).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(adjustCalls(shell, from)).toEqual([1.4]);
    vi.advanceTimersByTime(60_000);
    expect(adjustCalls(shell, from)).toEqual([1.4]);
  });

  it.each(["stop", "destroy"] as const)("%s during the quiet window makes no audio call", (end) => {
    const shell = openShell();
    shell.router.select("narrate");
    const from = shell.fake.effects.length;
    shell.router.setSpeed({ kind: "rate", rate: 1.25 });
    vi.advanceTimersByTime(NARRATE_SPEED_SETTLE_MS - 1);
    if (end === "stop") shell.router.select("focus");
    else shell.router.destroy();
    vi.advanceTimersByTime(60_000);
    expect(adjustCalls(shell, from)).toEqual([]);
  });

  it("returning to the rate already applied before the timer fires makes no audio call", () => {
    const shell = openShell();
    shell.router.select("narrate");
    expect(shell.settings().ttsRate).toBe(1); // the fake audio port reports rate 1
    const from = shell.fake.effects.length;
    shell.router.setSpeed({ kind: "rate", rate: 1.05 });
    vi.advanceTimersByTime(100);
    shell.router.setSpeed({ kind: "rate", rate: 1 });
    vi.advanceTimersByTime(60_000);
    expect(speedPatches(shell.patches(from))).toEqual([{ ttsRate: 1.05 }, { ttsRate: 1 }]);
    expect(adjustCalls(shell, from)).toEqual([]);
  });
});

describe("speed isolation between modes (item 5, OC-6)", () => {
  it("Focus, Flow and Narrate each keep their own key; a change in one is invisible to the others", () => {
    const shell = openShell();
    const legacyWpm = 300; // fake shell: wpm 300, no per-mode keys
    const legacySettingsWpm = shell.settings().wpm;
    const legacyRate = shell.settings().ttsRate;
    const from = shell.fake.effects.length;

    shell.router.select("focus");
    expect(shell.speed()).toEqual({ kind: "wpm", wpm: legacyWpm });
    shell.router.setSpeed({ kind: "wpm", wpm: 112.5 });
    shell.sync();

    shell.router.select("flow");
    expect(shell.speed()).toEqual({ kind: "wpm", wpm: legacyWpm });
    shell.router.setSpeed({ kind: "wpm", wpm: 1012.5 });
    shell.sync();

    shell.router.select("narrate");
    expect(shell.speed()).toEqual({ kind: "rate", rate: legacyRate });
    shell.router.setSpeed({ kind: "rate", rate: 1.65 });
    shell.sync();

    shell.router.select("focus");
    expect(shell.speed()).toEqual({ kind: "wpm", wpm: 112.5 });
    shell.router.select("flow");
    expect(shell.speed()).toEqual({ kind: "wpm", wpm: 1012.5 });
    shell.router.select("narrate");
    expect(shell.speed()).toEqual({ kind: "rate", rate: 1.65 });

    // Each mode wrote only its own key; the shared legacy wpm was never written.
    expect(speedPatches(shell.patches(from))).toEqual([{ focusWpm: 112.5 }, { flowWpm: 1012.5 }, { ttsRate: 1.65 }]);
    expect(shell.fake.effects.some((c) => c.method === "settings.setWpm")).toBe(false);
    expect(shell.settings()).toMatchObject({ wpm: legacySettingsWpm, focusWpm: 112.5, flowWpm: 1012.5, ttsRate: 1.65 });
  });

  it("↑/↓ step the active mode's own key by 2 dialog steps, staying on the 12.5 WPM grid", () => {
    const shell = openShell({ focusWpm: 112.5, flowWpm: 1187.5 });
    shell.router.select("focus");
    let from = shell.fake.effects.length;
    shell.router.adjustSpeed(25);
    expect(speedPatches(shell.patches(from))).toEqual([{ focusWpm: 137.5 }]);
    shell.router.select("flow");
    from = shell.fake.effects.length;
    shell.router.adjustSpeed(25);
    expect(speedPatches(shell.patches(from))).toEqual([{ flowWpm: 1200 }]);
    shell.sync();
    expect(shell.speed()).toEqual({ kind: "wpm", wpm: 1200 });
    expect(shell.settings().focusWpm).toBe(137.5);
  });

  it.each([
    { lastReadingMode: "focus", patch: { focusWpm: 325 } },
    { lastReadingMode: "flow", patch: { flowWpm: 325 } },
    { lastReadingMode: "narrate", patch: { ttsRate: 1.05 } },
  ] as const)("Page ↑ adjusts the speed key of lastReadingMode=$lastReadingMode (OC-8)", ({ lastReadingMode, patch }) => {
    expect(TTS_DEFAULT_ENGINE).toBe("kokoro");
    const shell = openShell({ lastReadingMode, ttsEngine: "kokoro", ttsRate: 1.0 });
    const from = shell.fake.effects.length;
    shell.router.adjustSpeed(25);
    expect(shell.patches(from)).toEqual([patch]);
    expect(shell.router.getSnapshot()!.speed).toBeNull();
  });
});

// ── UI: ReaderBottomBar trigger + dialog (items 1, 2, 5, 6) ───────────────────

const activeDoc = { id: "doc-1", title: "Speed", content: "alpha beta gamma delta", wordCount: 4 } as never;

function barProps(readingMode: "page" | "focus" | "flow" | "narrate") {
  return {
    activeDoc,
    words: ["alpha", "beta", "gamma", "delta"],
    wordIndex: 1,
    wpm: 300,
    focusTextSize: 100,
    readingMode,
    isNarrating: false,
    playing: false,
    isEink: false,
    chapters: [],
    onAdjustFocusTextSize: vi.fn(),
    onEnterPage: vi.fn(),
    onEnterFocus: vi.fn(),
    onEnterFlow: vi.fn(),
    onToggleNarration: vi.fn(),
    onTogglePlay: vi.fn(),
  };
}

describe("ReaderBottomBar speed trigger and dialog", () => {
  let container: HTMLDivElement;
  let root: Root;
  let windowKeys: string[];
  const onWindowKey = (e: KeyboardEvent) => { windowKeys.push(e.key); };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    windowKeys = [];
    window.addEventListener("keydown", onWindowKey);
  });

  afterEach(async () => {
    window.removeEventListener("keydown", onWindowKey);
    await act(async () => { root.unmount(); });
    container.remove();
  });

  /** The bar with the speed held like the router holds it: onSetSpeed → new snapshot.speed. */
  async function renderBar(readingMode: "focus" | "flow" | "narrate" | "page", initial: ReaderModeSpeed | null) {
    const props = barProps(readingMode);
    const onSetSpeed = vi.fn();
    function Harness() {
      const [speed, setSpeed] = useState<ReaderModeSpeed | null>(initial);
      return <ReaderBottomBar {...props} speed={speed} onSetSpeed={(next) => { onSetSpeed(next); setSpeed(next); }} />;
    }
    await act(async () => { root.render(<Harness />); });
    return { props, onSetSpeed };
  }

  const trigger = () => container.querySelector<HTMLButtonElement>("button.rbb-speed-trigger");
  const dialog = () => container.querySelector<HTMLElement>('[role="dialog"]');
  const slider = () => container.querySelector<HTMLInputElement>('[role="dialog"] input[type="range"]');
  async function key(target: Element, k: string) {
    await act(async () => { target.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true })); });
  }

  it("Page renders no speed trigger, no slider and no WPM label", async () => {
    await renderBar("page", null);
    expect(trigger()).toBeNull();
    expect(container.querySelector('input[type="range"].rbb-wpm-slider, input[type="range"].rbb-speed-slider')).toBeNull();
    expect(container.querySelector(".rbb-wpm-label")).toBeNull();
    expect(container.querySelector(".rbb-rate-buttons")).toBeNull();
  });

  it.each([
    { mode: "focus", speed: { kind: "wpm", wpm: 300 }, label: "1.20x" },
    { mode: "flow", speed: { kind: "wpm", wpm: 112.5 }, label: "0.45x" },
    { mode: "narrate", speed: { kind: "rate", rate: 1.05 }, label: "1.05x" },
  ] as const)("$mode shows its current value on a dialog trigger, replacing the old slider/buckets", async ({ mode, speed, label }) => {
    await renderBar(mode, speed);
    expect(trigger()?.textContent).toBe(label);
    expect(trigger()?.getAttribute("aria-haspopup")).toBe("dialog");
    expect(container.querySelector(".rbb-wpm-slider")).toBeNull();
    expect(container.querySelector(".rbb-rate-buttons")).toBeNull();
    expect(dialog()).toBeNull();
  });

  it("click opens a labelled modal dialog with a visible value; Done closes it; nothing else happens", async () => {
    const { props, onSetSpeed } = await renderBar("focus", { kind: "wpm", wpm: 300 });
    await act(async () => { trigger()!.click(); });
    const d = dialog()!;
    expect(d.getAttribute("aria-modal")).toBe("true");
    const title = document.getElementById(d.getAttribute("aria-labelledby")!);
    expect(title?.textContent).toBe("Focus speed");
    expect(slider()!.min).toBe("0");
    expect(slider()!.max).toBe("88");
    expect(slider()!.step).toBe("1");
    expect(slider()!.value).toBe("16");
    expect(slider()!.getAttribute("aria-valuetext")).toBe("1.20x, 300 words per minute");
    expect(d.querySelector(".rbb-speed-value")?.textContent).toBe("1.20x, 300 words per minute");
    expect(document.activeElement).toBe(slider());
    await act(async () => { d.querySelector<HTMLButtonElement>(".rbb-speed-close")!.click(); });
    expect(dialog()).toBeNull();
    expect(onSetSpeed).not.toHaveBeenCalled();
    expect(props.onTogglePlay).not.toHaveBeenCalled();
    expect(props.onEnterPage).not.toHaveBeenCalled();
    expect(props.onEnterFocus).not.toHaveBeenCalled();
    expect(props.onEnterFlow).not.toHaveBeenCalled();
  });

  it.each(["Enter", " "])("keyboard: %j on the trigger opens it without reaching the reader shortcuts (no play)", async (k) => {
    const { props } = await renderBar("flow", { kind: "wpm", wpm: 250 });
    await key(trigger()!, k);
    expect(dialog()).not.toBeNull();
    expect(windowKeys).toEqual([]);
    expect(props.onTogglePlay).not.toHaveBeenCalled();
  });

  it("keyboard: ←/→ step one value, Home/End jump to the ends, Esc closes and returns focus", async () => {
    const { props, onSetSpeed } = await renderBar("flow", { kind: "wpm", wpm: 250 });
    await key(trigger()!, "Enter");
    await key(slider()!, "ArrowRight");
    expect(onSetSpeed).toHaveBeenLastCalledWith({ kind: "wpm", wpm: 262.5 });
    expect(trigger()!.textContent).toBe("1.05x");
    await key(slider()!, "ArrowLeft");
    await key(slider()!, "ArrowLeft");
    expect(onSetSpeed).toHaveBeenLastCalledWith({ kind: "wpm", wpm: 237.5 });
    await key(slider()!, "Home");
    expect(onSetSpeed).toHaveBeenLastCalledWith({ kind: "wpm", wpm: 100 });
    expect(slider()!.getAttribute("aria-valuetext")).toBe("0.40x, 100 words per minute");
    await key(slider()!, "ArrowLeft"); // already at the end: no write below 0.40x
    await key(slider()!, "End");
    expect(onSetSpeed).toHaveBeenLastCalledWith({ kind: "wpm", wpm: 1200 });
    await key(slider()!, "ArrowRight"); // already at the end: no write above 4.80x
    expect(onSetSpeed).toHaveBeenCalledTimes(5);
    await key(slider()!, "Escape");
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger());
    // No dialog key reached the reader shortcuts (Esc would exit the reader, arrows would seek or pace).
    expect(windowKeys).toEqual([]);
    expect(props.onTogglePlay).not.toHaveBeenCalled();
  });

  it("keys that arrive before a re-render are not lost (held or fast arrows step every press)", async () => {
    // G6 live finding: 8 quick ArrowRights moved only +6. Both presses land in one act(), so no re-render between.
    const { onSetSpeed } = await renderBar("narrate", { kind: "rate", rate: 1.0 });
    await key(trigger()!, "Enter");
    const s = slider()!;
    await act(async () => {
      for (let i = 0; i < 3; i++) s.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    });
    expect(onSetSpeed.mock.calls.map(([v]) => v)).toEqual([
      { kind: "rate", rate: 1.05 }, { kind: "rate", rate: 1.1 }, { kind: "rate", rate: 1.15 },
    ]);
    expect(trigger()!.textContent).toBe("1.15x");
  });

  it("Narrate's slider covers 0.80x–2.00x and reports 1.05x exactly", async () => {
    const { onSetSpeed } = await renderBar("narrate", { kind: "rate", rate: 1.0 });
    await act(async () => { trigger()!.click(); });
    expect(slider()!.max).toBe("24");
    expect(slider()!.value).toBe("4");
    await key(slider()!, "ArrowRight");
    expect(onSetSpeed).toHaveBeenLastCalledWith({ kind: "rate", rate: 1.05 });
    expect(slider()!.getAttribute("aria-valuetext")).toBe("1.05x");
    await key(slider()!, "Home");
    expect(onSetSpeed).toHaveBeenLastCalledWith({ kind: "rate", rate: 0.8 });
    await key(slider()!, "End");
    expect(onSetSpeed).toHaveBeenLastCalledWith({ kind: "rate", rate: 2.0 });
  });

  it("a pointer change of the range input selects by index (no fractional step for the browser to round)", async () => {
    const { onSetSpeed } = await renderBar("focus", { kind: "wpm", wpm: 250 });
    await act(async () => { trigger()!.click(); });
    const input = slider()!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "1");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(onSetSpeed).toHaveBeenLastCalledWith({ kind: "wpm", wpm: 112.5 });
    expect(trigger()!.textContent).toBe("0.45x");
  });
});

// The displayed value is what the runtime persisted: dialog → router → runtime → snapshot → trigger.
describe("end to end: the persisted value equals the displayed value", () => {
  it.each([
    { mode: "focus", index: 1, persisted: { focusWpm: 112.5 }, label: "0.45x" },
    { mode: "flow", index: 88, persisted: { flowWpm: 1200 }, label: "4.80x" },
    { mode: "narrate", index: 5, persisted: { ttsRate: 1.05 }, label: "1.05x" },
  ] as const)("$mode index $index", ({ mode, index, persisted, label }) => {
    const shell = openShell();
    shell.router.select(mode);
    const from = shell.fake.effects.length;
    shell.router.setSpeed(speedAt(mode, index));
    shell.sync();
    expect(speedPatches(shell.patches(from))).toEqual([persisted]);
    expect(formatSpeedMultiplier(shell.speed()!)).toBe(label);
    expect(shell.settings()).toMatchObject(persisted);
  });
});
