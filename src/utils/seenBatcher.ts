// LIBRARY-SETTINGS-FIX-1: dwell-then-batch tracker for library "New" dots.
// An id counts as seen after it stays entered for dwellMs; seen ids are
// delivered to onFlush in one batch flushDelayMs later (or on flush()/dispose()).

export interface SeenBatcherOptions {
  dwellMs: number;
  flushDelayMs: number;
  onFlush: (ids: string[]) => void;
}

export interface SeenBatcher {
  enter(id: string): void;
  leave(id: string): void;
  cancelPending(): void;
  flush(): void;
  dispose(): void;
}

export function createSeenBatcher({ dwellMs, flushDelayMs, onFlush }: SeenBatcherOptions): SeenBatcher {
  const dwellTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const pending = new Set<string>(); // seen, not yet flushed
  const seen = new Set<string>(); // every id ever marked seen
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (pending.size === 0) return;
    const ids = [...pending];
    pending.clear();
    onFlush(ids);
  };

  const cancelPending = () => {
    for (const timer of dwellTimers.values()) clearTimeout(timer);
    dwellTimers.clear();
  };

  return {
    enter(id) {
      if (dwellTimers.has(id) || seen.has(id)) return;
      dwellTimers.set(id, setTimeout(() => {
        dwellTimers.delete(id);
        seen.add(id);
        pending.add(id);
        if (!flushTimer) flushTimer = setTimeout(flush, flushDelayMs);
      }, dwellMs));
    },
    leave(id) {
      const timer = dwellTimers.get(id);
      if (timer) {
        clearTimeout(timer);
        dwellTimers.delete(id);
      }
    },
    cancelPending,
    flush,
    dispose() {
      cancelPending();
      flush();
    },
  };
}
