const PUNCTUATION_ONLY_RE = /^[\p{P}\p{S}]+$/u;

export interface SpokenWordFilterResult {
  spokenWords: string[];
  spokenToDisplayMap: number[];
  displayToSpokenMap: Array<number | null>;
}

export function isPunctuationOnlyWord(word: string): boolean {
  const token = word.trim();
  return token.length > 0 && PUNCTUATION_ONLY_RE.test(token);
}

export function filterSpokenWords(words: string[]): SpokenWordFilterResult {
  const spokenWords: string[] = [];
  const spokenToDisplayMap: number[] = [];
  const displayToSpokenMap: Array<number | null> = Array.from({ length: words.length }, () => null);

  for (let displayIdx = 0; displayIdx < words.length; displayIdx += 1) {
    const word = words[displayIdx];
    if (isPunctuationOnlyWord(word)) continue;
    const spokenIdx = spokenWords.length;
    spokenWords.push(word);
    spokenToDisplayMap.push(displayIdx);
    displayToSpokenMap[displayIdx] = spokenIdx;
  }

  return {
    spokenWords,
    spokenToDisplayMap,
    displayToSpokenMap,
  };
}
