// P0-2 word map: the implementation moved to main/narrate/wordmap.js (P3) so the product's producer and
// this harness share it; this module re-exports it unchanged. Policy text: phase0/MAPPING_POLICY.md
import wordmap from "../../../main/narrate/wordmap.js";

export const { PUNCT, SYLLABLE_WEIGHT, ACCEPT_UNIT_COST, kokoroPost, phonemeGroups, compareForm, consonants, syllables, buildWordMap } = wordmap;
