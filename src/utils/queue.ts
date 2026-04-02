interface QueueDoc {
  id: string;
  position: number;
  wordCount: number;
  lastReadAt?: number | null;
  created: number;
  queuePosition?: number;
}

export function bubbleCount(progressPercent: number): number {
  return Math.floor(progressPercent / 10);
}

export function sortReadingQueue<T extends QueueDoc>(docs: T[]): T[] {
  const queued: T[] = [];
  const inProgress: T[] = [];
  const unread: T[] = [];

  for (const doc of docs) {
    const progress = doc.wordCount > 0 ? (doc.position / doc.wordCount) * 100 : 0;
    if (progress >= 100) continue;
    if (doc.queuePosition !== undefined) {
      queued.push(doc);
    } else if (doc.position > 0) {
      inProgress.push(doc);
    } else {
      unread.push(doc);
    }
  }

  queued.sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0));
  inProgress.sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0));
  unread.sort((a, b) => b.created - a.created);

  return [...queued, ...inProgress, ...unread];
}
