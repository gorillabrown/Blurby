import { isSentenceEnd } from "./pauseDetection";
import type { PauseReason } from "../types/narration";

export type NarrationPlaybackStatus =
  | "idle"
  | "loading"
  | "speaking"
  | "paused"
  | "holding"
  | "error"
  | "warming";

export type MediaSessionPlaybackState = "none" | "paused" | "playing";

export interface MediaSessionBookMetadata {
  title: string;
  author?: string | null;
  coverArtUrl?: string | null;
}

export interface MediaSessionBridgeHandlers {
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNextTrack: () => void;
  onPreviousTrack: () => void;
}

export interface MediaSessionBridgeSyncInput {
  book: MediaSessionBookMetadata | null;
  status: NarrationPlaybackStatus;
  pauseReason?: PauseReason | null;
  handlers: MediaSessionBridgeHandlers;
}

function getMediaSession(): MediaSession | null {
  if (typeof navigator === "undefined") return null;
  return navigator.mediaSession ?? null;
}

function createMediaMetadata(book: MediaSessionBookMetadata): MediaMetadata | null {
  const artwork = book.coverArtUrl
    ? [{ src: book.coverArtUrl }]
    : [];
  const payload = {
    title: book.title,
    artist: book.author ?? "",
    artwork,
  };

  if (typeof MediaMetadata === "function") {
    return new MediaMetadata(payload);
  }
  return payload as unknown as MediaMetadata;
}

function setActionHandler(
  mediaSession: MediaSession,
  action: MediaSessionAction,
  handler: MediaSessionActionHandler | null,
): void {
  try {
    mediaSession.setActionHandler(action, handler);
  } catch {
    // Some environments/actions throw when unsupported.
  }
}

function clearActionHandlers(mediaSession: MediaSession): void {
  setActionHandler(mediaSession, "play", null);
  setActionHandler(mediaSession, "pause", null);
  setActionHandler(mediaSession, "stop", null);
  setActionHandler(mediaSession, "nexttrack", null);
  setActionHandler(mediaSession, "previoustrack", null);
}

export function resolveMediaSessionPlaybackState(
  status: NarrationPlaybackStatus,
  pauseReason: PauseReason | null = null,
): MediaSessionPlaybackState {
  if (status === "speaking") return "playing";
  if (status === "paused") {
    if (
      pauseReason === "rate-change"
      || pauseReason === "voice-change"
      || pauseReason === "forward-seek"
      || pauseReason === "backward-seek"
    ) {
      return "playing";
    }
    return "paused";
  }
  if (status === "holding" || status === "warming") {
    return "paused";
  }
  return "none";
}

export function findNextSentenceStart(
  words: string[],
  cursorWordIndex: number,
): number {
  if (words.length === 0) return 0;
  const clampedCursor = Math.max(0, Math.min(cursorWordIndex, words.length - 1));
  for (let i = clampedCursor; i < words.length - 1; i += 1) {
    const nextWord = words[i + 1];
    if (!isSentenceEnd(words[i], nextWord)) continue;
    const candidate = i + 1;
    if (candidate > clampedCursor) return candidate;
  }
  return words.length - 1;
}

export function findPreviousSentenceStart(
  words: string[],
  cursorWordIndex: number,
): number {
  if (words.length === 0) return 0;
  const clampedCursor = Math.max(0, Math.min(cursorWordIndex, words.length - 1));
  if (clampedCursor === 0) return 0;

  for (let i = clampedCursor - 1; i >= 0; i -= 1) {
    const nextWord = i + 1 < words.length ? words[i + 1] : undefined;
    if (!isSentenceEnd(words[i], nextWord)) continue;
    const candidate = i + 1;
    if (candidate < clampedCursor) return candidate;
  }

  return 0;
}

export function syncMediaSession(input: MediaSessionBridgeSyncInput): void {
  const mediaSession = getMediaSession();
  if (!mediaSession) return;

  const playbackState = resolveMediaSessionPlaybackState(input.status, input.pauseReason ?? null);
  const isActive = playbackState !== "none";

  if (!isActive || !input.book) {
    clearActionHandlers(mediaSession);
    mediaSession.metadata = null;
    mediaSession.playbackState = "none";
    return;
  }

  mediaSession.metadata = createMediaMetadata(input.book);
  mediaSession.playbackState = playbackState;

  setActionHandler(mediaSession, "play", input.handlers.onPlay);
  setActionHandler(mediaSession, "pause", input.handlers.onPause);
  setActionHandler(mediaSession, "stop", input.handlers.onStop);
  setActionHandler(mediaSession, "nexttrack", input.handlers.onNextTrack);
  setActionHandler(mediaSession, "previoustrack", input.handlers.onPreviousTrack);
}
