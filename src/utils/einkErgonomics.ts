export interface EinkPhraseOptions {
  isEink?: boolean;
  phraseGrouping?: boolean;
  maxWords?: number;
}

export interface EinkGhostingLoadResult {
  nextLoad: number;
  shouldRefresh: boolean;
}

const EINK_PHRASE_BOUNDARY_RE = /[.!?,;:\u2014]$/;

export function buildEinkFocusPhrase(
  words: string[],
  index: number,
  options: EinkPhraseOptions = {}
): string {
  if (!options.isEink || !options.phraseGrouping) return words[index] || "";

  const maxWords = Math.max(2, options.maxWords ?? 3);
  const phrase: string[] = [];
  const end = Math.min(index + maxWords, words.length);

  for (let i = index; i < end; i++) {
    const word = words[i] || "";
    if (!word) continue;
    phrase.push(word);
    if (phrase.length >= 2 && EINK_PHRASE_BOUNDARY_RE.test(word)) break;
  }

  return phrase.join(" ");
}

export function nextEinkGhostingLoad(
  currentLoad: number,
  changeEstimate: number,
  threshold: number,
  enabled = true
): EinkGhostingLoadResult {
  const nextLoad = Math.max(0, currentLoad) + Math.max(0, changeEstimate);
  if (enabled && nextLoad >= threshold) {
    return { nextLoad: 0, shouldRefresh: true };
  }
  return { nextLoad, shouldRefresh: false };
}
