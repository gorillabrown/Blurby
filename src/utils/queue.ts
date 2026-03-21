interface QueueDoc {
  id: string;
  position: number;
  wordCount: number;
  lastReadAt?: number | null;
  created: number;
}

export function bubbleCount(progressPercent: number): number {
  return Math.floor(progressPercent / 10);
}

export function sortReadingQueue<T extends QueueDoc>(docs: T[]): T[] {
  const inProgress: T[] = [];
  const unread: T[] = [];

  for (const doc of docs) {
    const progress = doc.wordCount > 0 ? (doc.position / doc.wordCount) * 100 : 0;
    if (progress >= 100) continue;
    if (doc.position > 0) {
      inProgress.push(doc);
    } else {
      unread.push(doc);
    }
  }

  inProgress.sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0));
  unread.sort((a, b) => b.created - a.created);

  return [...inProgress, ...unread];
}
