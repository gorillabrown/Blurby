/**
 * Console ring buffer for bug reports (HOTFIX-11).
 * Captures console.log/warn/error/debug into a fixed-size ring buffer
 * so bug reports include recent console output. Must be initialized
 * before React mounts (call installConsoleCapture() in main.tsx).
 */

export interface ConsoleEntry {
  timestamp: number;
  level: "log" | "warn" | "error" | "debug";
  message: string;
}

const MAX_ENTRIES = 200;
const _buffer: ConsoleEntry[] = [];
let _installed = false;

/** Get the current ring buffer contents (oldest first). */
export function getConsoleBuffer(): ConsoleEntry[] {
  return _buffer;
}

/** Clear the ring buffer (test cleanup). */
export function clearConsoleBuffer(): void {
  _buffer.length = 0;
}

/** Install console capture. Call once before React mount. Idempotent. */
export function installConsoleCapture(): void {
  if (_installed) return;
  _installed = true;

  const levels = ["log", "warn", "error", "debug"] as const;
  for (const level of levels) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      const message = args.map(a => {
        if (typeof a === "string") return a;
        try { return JSON.stringify(a); }
        catch { return String(a); }
      }).join(" ");

      _buffer.push({ timestamp: Date.now(), level, message });
      if (_buffer.length > MAX_ENTRIES) _buffer.shift();

      original(...args);
    };
  }
}

/** Format the buffer as a compact multi-line string for bug reports. */
export function formatConsoleBuffer(): string {
  return _buffer.map(e => {
    const time = new Date(e.timestamp).toISOString().slice(11, 23);
    return `[${time}] ${e.level.toUpperCase()}: ${e.message}`;
  }).join("\n");
}
