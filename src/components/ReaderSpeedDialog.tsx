// READER-MODE-SEPARATION-2 speed amendment (design §E): the shell's speed dialog for Focus, Flow and Narrate.
// Passive UI: the selected value lives in the active runtime (snapshot.speed); this dialog only reports
// the user's choice through onChange. Every value is an integer slider index, so nothing is ever rounded.
import { useEffect, useId, useRef } from "react";
import {
  FOCUS_FLOW_SPEED_MAX_HUNDREDTHS,
  FOCUS_FLOW_SPEED_MIN_HUNDREDTHS,
  NARRATE_SPEED_MAX_HUNDREDTHS,
  NARRATE_SPEED_MIN_HUNDREDTHS,
  SPEED_DIALOG_REFERENCE_WPM,
  SPEED_DIALOG_STEP_HUNDREDTHS,
} from "../constants";
import type { ReaderModeSpeed } from "../reader/modes/ReaderModeAdapter";
import { useFocusTrap } from "../hooks/useFocusTrap";

export type SpeedDialogMode = "focus" | "flow" | "narrate";

function range(mode: SpeedDialogMode): { readonly min: number; readonly max: number } {
  return mode === "narrate"
    ? { min: NARRATE_SPEED_MIN_HUNDREDTHS, max: NARRATE_SPEED_MAX_HUNDREDTHS }
    : { min: FOCUS_FLOW_SPEED_MIN_HUNDREDTHS, max: FOCUS_FLOW_SPEED_MAX_HUNDREDTHS };
}

/** Highest slider index: 88 for Focus/Flow (0.40–4.80x), 24 for Narrate (0.80–2.00x). */
export function speedMaxIndex(mode: SpeedDialogMode): number {
  const { min, max } = range(mode);
  return (max - min) / SPEED_DIALOG_STEP_HUNDREDTHS;
}

function hundredthsAt(mode: SpeedDialogMode, index: number): number {
  return range(mode).min + SPEED_DIALOG_STEP_HUNDREDTHS * index;
}

/** Index → speed. Focus/Flow: (40 + 5i) × 2.5 WPM; Narrate: (80 + 5j) / 100. Exact in binary. */
export function speedAt(mode: SpeedDialogMode, index: number): ReaderModeSpeed {
  const h = hundredthsAt(mode, index);
  return mode === "narrate"
    ? { kind: "rate", rate: h / 100 }
    : { kind: "wpm", wpm: (h * SPEED_DIALOG_REFERENCE_WPM) / 100 };
}

function speedHundredths(speed: ReaderModeSpeed): number {
  return speed.kind === "rate" ? Math.round(speed.rate * 100) : Math.round((speed.wpm * 100) / SPEED_DIALOG_REFERENCE_WPM);
}

/** Speed → the nearest slider index (display only; nothing is written until the user moves the slider). */
export function speedIndexOf(mode: SpeedDialogMode, speed: ReaderModeSpeed): number {
  const i = Math.round((speedHundredths(speed) - range(mode).min) / SPEED_DIALOG_STEP_HUNDREDTHS);
  return Math.max(0, Math.min(speedMaxIndex(mode), i));
}

/** "0.45x" — the multiplier as displayed (Focus/Flow relative to SPEED_DIALOG_REFERENCE_WPM). */
export function formatSpeedMultiplier(speed: ReaderModeSpeed): string {
  return `${(speedHundredths(speed) / 100).toFixed(2)}x`;
}

/** Slider aria-valuetext: "0.45x, 112.5 words per minute" (Focus/Flow) or "1.05x" (Narrate). */
export function formatSpeedValueText(speed: ReaderModeSpeed): string {
  const multiplier = formatSpeedMultiplier(speed);
  return speed.kind === "wpm" ? `${multiplier}, ${speed.wpm} words per minute` : multiplier;
}

const MODE_LABEL: Record<SpeedDialogMode, string> = { focus: "Focus", flow: "Flow", narrate: "Narrate" };

export interface ReaderSpeedDialogProps {
  readonly mode: SpeedDialogMode;
  readonly speed: ReaderModeSpeed;
  readonly onChange: (speed: ReaderModeSpeed) => void;
  /** Esc / Done. The caller returns focus to its trigger. */
  readonly onClose: () => void;
}

export default function ReaderSpeedDialog({ mode, speed, onChange, onClose }: ReaderSpeedDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  const titleId = useId();
  useFocusTrap(dialogRef, []);
  useEffect(() => { sliderRef.current?.focus(); }, []);

  const max = speedMaxIndex(mode);
  const index = speedIndexOf(mode, speed);
  const select = (next: number) => {
    const clamped = Math.max(0, Math.min(max, next));
    if (clamped !== index) onChange(speedAt(mode, clamped));
  };

  // The dialog is modal: no key reaches the reader shortcuts (Space never toggles play, Esc never exits).
  const onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.target !== sliderRef.current) return;
    // Explicit range keys (same as the native ones, so jsdom and every platform agree; no double step).
    const step: Record<string, number> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 };
    if (e.key in step) { e.preventDefault(); select(index + step[e.key]); }
    else if (e.key === "Home") { e.preventDefault(); select(0); }
    else if (e.key === "End") { e.preventDefault(); select(max); }
  };

  const valueText = formatSpeedValueText(speed);
  return (
    <div
      ref={dialogRef}
      className="rbb-speed-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
    >
      <span id={titleId} className="rbb-speed-title">{MODE_LABEL[mode]} speed</span>
      <input
        ref={sliderRef}
        type="range"
        className="rbb-speed-slider"
        min={0}
        max={max}
        step={1}
        value={index}
        onChange={(e) => select(Number(e.target.value))}
        aria-labelledby={titleId}
        aria-valuetext={valueText}
      />
      <output className="rbb-speed-value" aria-live="polite">{valueText}</output>
      <button type="button" className="rbb-speed-close" onClick={onClose}>Done</button>
    </div>
  );
}
