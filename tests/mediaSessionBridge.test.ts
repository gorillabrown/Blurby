import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  findNextSentenceStart,
  findPreviousSentenceStart,
  resolveMediaSessionPlaybackState,
  syncMediaSession,
} from "../src/utils/mediaSessionBridge";

type MediaSessionStub = {
  metadata: unknown;
  playbackState: "none" | "paused" | "playing";
  handlers: Record<string, ((details?: unknown) => void) | null>;
  setActionHandler: (action: string, handler: ((details?: unknown) => void) | null) => void;
};

function createMediaSessionStub(): MediaSessionStub {
  return {
    metadata: null,
    playbackState: "none",
    handlers: {},
    setActionHandler(action, handler) {
      this.handlers[action] = handler;
    },
  };
}

const originalMediaSession = (navigator as Navigator & { mediaSession?: unknown }).mediaSession;
const originalMediaMetadata = (globalThis as { MediaMetadata?: unknown }).MediaMetadata;

beforeEach(() => {
  Object.defineProperty(navigator, "mediaSession", {
    configurable: true,
    writable: true,
    value: createMediaSessionStub(),
  });

  class FakeMediaMetadata {
    title: string;
    artist: string;
    artwork: Array<{ src: string }>;
    constructor(init: { title: string; artist?: string; artwork?: Array<{ src: string }> }) {
      this.title = init.title;
      this.artist = init.artist ?? "";
      this.artwork = init.artwork ?? [];
    }
  }

  Object.defineProperty(globalThis, "MediaMetadata", {
    configurable: true,
    writable: true,
    value: FakeMediaMetadata,
  });
});

afterEach(() => {
  Object.defineProperty(navigator, "mediaSession", {
    configurable: true,
    writable: true,
    value: originalMediaSession,
  });
  Object.defineProperty(globalThis, "MediaMetadata", {
    configurable: true,
    writable: true,
    value: originalMediaMetadata,
  });
});

describe("resolveMediaSessionPlaybackState", () => {
  it("maps speaking to playing", () => {
    expect(resolveMediaSessionPlaybackState("speaking")).toBe("playing");
  });

  it("maps user-stop pause to paused", () => {
    expect(resolveMediaSessionPlaybackState("paused", "user-stop")).toBe("paused");
  });

  it("keeps auto-resume pauses as playing for MediaSession transport continuity", () => {
    expect(resolveMediaSessionPlaybackState("paused", "rate-change")).toBe("playing");
    expect(resolveMediaSessionPlaybackState("paused", "voice-change")).toBe("playing");
    expect(resolveMediaSessionPlaybackState("paused", "forward-seek")).toBe("playing");
    expect(resolveMediaSessionPlaybackState("paused", "backward-seek")).toBe("playing");
  });

  it("maps holding/warming to paused", () => {
    expect(resolveMediaSessionPlaybackState("holding")).toBe("paused");
    expect(resolveMediaSessionPlaybackState("warming")).toBe("paused");
  });

  it("maps idle/error/loading to none", () => {
    expect(resolveMediaSessionPlaybackState("idle")).toBe("none");
    expect(resolveMediaSessionPlaybackState("error")).toBe("none");
    expect(resolveMediaSessionPlaybackState("loading")).toBe("none");
  });
});

describe("findNextSentenceStart", () => {
  it("returns 0 for empty word arrays", () => {
    expect(findNextSentenceStart([], 12)).toBe(0);
  });

  it("advances to the next sentence boundary", () => {
    const words = ["Hello", "world.", "Another", "line."];
    expect(findNextSentenceStart(words, 0)).toBe(2);
  });

  it("skips abbreviation periods when finding sentence end", () => {
    const words = ["Dr.", "Smith", "arrived.", "Then", "left."];
    expect(findNextSentenceStart(words, 0)).toBe(3);
  });

  it("clamps to the last word when no sentence boundary exists", () => {
    const words = ["no", "boundary", "tokens"];
    expect(findNextSentenceStart(words, 0)).toBe(words.length - 1);
  });
});

describe("findPreviousSentenceStart", () => {
  it("returns 0 for empty word arrays", () => {
    expect(findPreviousSentenceStart([], 4)).toBe(0);
  });

  it("returns the previous sentence start when cursor is mid-sentence", () => {
    const words = ["One.", "Two", "three.", "Four", "five."];
    expect(findPreviousSentenceStart(words, 4)).toBe(3);
  });

  it("moves to the prior sentence when cursor is already at a sentence start", () => {
    const words = ["One.", "Two", "three.", "Four", "five."];
    expect(findPreviousSentenceStart(words, 3)).toBe(1);
  });

  it("falls back to 0 when there is no earlier boundary", () => {
    const words = ["alpha", "beta", "gamma"];
    expect(findPreviousSentenceStart(words, 2)).toBe(0);
  });

  it("does not treat abbreviations as sentence boundaries", () => {
    const words = ["Dr.", "Smith", "arrived.", "Then", "left."];
    expect(findPreviousSentenceStart(words, 4)).toBe(3);
  });
});

describe("syncMediaSession", () => {
  it("clears metadata and playback state when narration is inactive", () => {
    const mediaSession = (navigator as Navigator & { mediaSession: MediaSessionStub }).mediaSession;
    syncMediaSession({
      book: { title: "Meditations", author: "Marcus Aurelius", coverArtUrl: "data:image/png;base64,abc" },
      status: "idle",
      handlers: {
        onPlay: () => {},
        onPause: () => {},
        onStop: () => {},
        onNextTrack: () => {},
        onPreviousTrack: () => {},
      },
    });

    expect(mediaSession.metadata).toBeNull();
    expect(mediaSession.playbackState).toBe("none");
    expect(mediaSession.handlers.play).toBeNull();
    expect(mediaSession.handlers.pause).toBeNull();
    expect(mediaSession.handlers.stop).toBeNull();
    expect(mediaSession.handlers.nexttrack).toBeNull();
    expect(mediaSession.handlers.previoustrack).toBeNull();
  });

  it("writes metadata, playback state, and action handlers when active", () => {
    const mediaSession = (navigator as Navigator & { mediaSession: MediaSessionStub }).mediaSession;
    const counters = {
      play: 0,
      pause: 0,
      stop: 0,
      next: 0,
      prev: 0,
    };

    syncMediaSession({
      book: { title: "Meditations", author: "Marcus Aurelius", coverArtUrl: "data:image/png;base64,abc" },
      status: "speaking",
      handlers: {
        onPlay: () => { counters.play += 1; },
        onPause: () => { counters.pause += 1; },
        onStop: () => { counters.stop += 1; },
        onNextTrack: () => { counters.next += 1; },
        onPreviousTrack: () => { counters.prev += 1; },
      },
    });

    expect(mediaSession.playbackState).toBe("playing");
    const metadata = mediaSession.metadata as {
      title: string;
      artist: string;
      artwork: ReadonlyArray<{ src: string }>;
    };
    expect(metadata.title).toBe("Meditations");
    expect(metadata.artist).toBe("Marcus Aurelius");
    expect(metadata.artwork[0]?.src).toBe("data:image/png;base64,abc");

    mediaSession.handlers.play?.();
    mediaSession.handlers.pause?.();
    mediaSession.handlers.stop?.();
    mediaSession.handlers.nexttrack?.();
    mediaSession.handlers.previoustrack?.();
    expect(counters).toEqual({ play: 1, pause: 1, stop: 1, next: 1, prev: 1 });
  });

  it("uses paused playback state for paused narration", () => {
    const mediaSession = (navigator as Navigator & { mediaSession: MediaSessionStub }).mediaSession;
    syncMediaSession({
      book: { title: "Meditations" },
      status: "paused",
      handlers: {
        onPlay: () => {},
        onPause: () => {},
        onStop: () => {},
        onNextTrack: () => {},
        onPreviousTrack: () => {},
      },
    });
    expect(mediaSession.playbackState).toBe("paused");
  });

  it("clears metadata when no book metadata is available", () => {
    const mediaSession = (navigator as Navigator & { mediaSession: MediaSessionStub }).mediaSession;
    syncMediaSession({
      book: null,
      status: "speaking",
      handlers: {
        onPlay: () => {},
        onPause: () => {},
        onStop: () => {},
        onNextTrack: () => {},
        onPreviousTrack: () => {},
      },
    });
    expect(mediaSession.metadata).toBeNull();
    expect(mediaSession.playbackState).toBe("none");
  });
});
