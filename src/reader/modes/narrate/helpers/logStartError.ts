// NARRATE-START-STACK-1 (BUG-206): where Narrate shows a start error to the reader, error.log also gets the error's
// full stack, once, so the next occurrence names its call site (the renderer otherwise shows only the message).

/** Log one start error with its stack (`String(err)` when it has none). Never throws. */
export function logNarrateStartError(where: string, err: unknown): void {
  try {
    const stack = err instanceof Error ? err.stack || String(err) : typeof err === "string" ? err : String(err);
    const api = (globalThis as { electronAPI?: { logError?: (message: string) => void } }).electronAPI;
    api?.logError?.(`[narrate] ${where}: ${stack}`);
  } catch { /* logging must never break narration */ }
}
