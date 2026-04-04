import type { NarrateDiagSnapshot, NarrateDiagEvent } from "./narrateDiagnostics";
import type { ConsoleEntry } from "./consoleCapture";

export interface BugReportAppState {
  timestamp: string;
  docId: string | null;
  docTitle: string | null;
  docSource: string | null;
  docExt: string | null;
  wordCount: number | null;
  position: number | null;
  furthestPosition: number | null;
  cfi: string | null;
  foliateFraction: number | null;
  readingMode: string | null;
  narrationStatus: string | null;
  ttsEngine: string | null;
  ttsVoice: string | null;
  ttsSpeed: number | null;
  wpm: number | null;
  theme: string | null;
  focusTextSize: number | null;
  windowWidth: number;
  windowHeight: number;
  electronVersion: string | null;
  appVersion: string | null;
  platform: string | null;
  // HOTFIX-11: Narration diagnostics + console log
  narrateDiagSnapshot?: NarrateDiagSnapshot | null;
  narrateDiagEvents?: NarrateDiagEvent[];
  consoleLog?: ConsoleEntry[];
}

interface GatherInput {
  docId?: string | null;
  docTitle?: string | null;
  docSource?: string | null;
  docExt?: string | null;
  wordCount?: number | null;
  position?: number | null;
  furthestPosition?: number | null;
  cfi?: string | null;
  foliateFraction?: number | null;
  readingMode?: string | null;
  narrationStatus?: string | null;
  ttsEngine?: string | null;
  ttsVoice?: string | null;
  ttsSpeed?: number | null;
  wpm?: number | null;
  theme?: string | null;
  focusTextSize?: number | null;
  platform?: string | null;
  // HOTFIX-11
  narrateDiagSnapshot?: NarrateDiagSnapshot | null;
  narrateDiagEvents?: NarrateDiagEvent[];
  consoleLog?: ConsoleEntry[];
}

export function gatherAppState(input: GatherInput): BugReportAppState {
  return {
    timestamp: new Date().toISOString(),
    docId: input.docId ?? null,
    docTitle: input.docTitle ?? null,
    docSource: input.docSource ?? null,
    docExt: input.docExt ?? null,
    wordCount: input.wordCount ?? null,
    position: input.position ?? null,
    furthestPosition: input.furthestPosition ?? null,
    cfi: input.cfi ?? null,
    foliateFraction: input.foliateFraction ?? null,
    readingMode: input.readingMode ?? null,
    narrationStatus: input.narrationStatus ?? null,
    ttsEngine: input.ttsEngine ?? null,
    ttsVoice: input.ttsVoice ?? null,
    ttsSpeed: input.ttsSpeed ?? null,
    wpm: input.wpm ?? null,
    theme: input.theme ?? null,
    focusTextSize: input.focusTextSize ?? null,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    electronVersion: navigator.userAgent.match(/Electron\/([\d.]+)/)?.[1] ?? null,
    appVersion: navigator.userAgent.match(/Blurby\/([\d.]+)/)?.[1] ?? null,
    platform: input.platform ?? null,
    narrateDiagSnapshot: input.narrateDiagSnapshot ?? null,
    narrateDiagEvents: input.narrateDiagEvents ?? [],
    consoleLog: input.consoleLog ?? [],
  };
}
