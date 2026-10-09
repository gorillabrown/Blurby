// Flow-private copy of findSectionForWord from src/types/narration.ts (READER-MODE-SEPARATION-2 Q-C).
// The original stays TTS infrastructure behind Narrate's audio port; this mode's section sync
// (legacy useFoliateSync effect 3) uses its own copy. Body verbatim.
import type { SectionBoundary } from "../../../../types/narration";

export function findSectionForWord(sections: SectionBoundary[], globalWordIdx: number): SectionBoundary | null {
  for (const sec of sections) {
    if (globalWordIdx >= sec.startWordIdx && globalWordIdx < sec.endWordIdx) {
      return sec;
    }
  }
  return null;
}
