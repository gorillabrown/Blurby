/**
 * Types for the foliate EPUB ↔ mode class bridge.
 *
 * When a reading mode advances past the loaded EPUB sections,
 * the bridge pauses the mode, requests a page turn, and resumes
 * after the new section's words are extracted.
 */

/** Tracks a mode that's waiting for a section load to resume */
export interface PendingResume {
  readonly wordIndex: number;
  readonly mode: "flow" | "narration";
}

/** Callbacks for the section boundary bridge */
export interface SectionBridgeCallbacks {
  onMiss: (pending: PendingResume) => void;
  onResume: (pending: PendingResume) => void;
}
