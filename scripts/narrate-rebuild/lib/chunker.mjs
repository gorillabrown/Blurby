// T2 chunk bounds: the implementation moved to main/narrate/chunker.js (P3); this module re-exports it.
import chunker from "../../../main/narrate/chunker.js";

export const { FIRST_CHUNK_MAX_WORDS, PACK_TARGET_TOKENS, PAUSE_MARK, splitSentences, chunkPassage } = chunker;
