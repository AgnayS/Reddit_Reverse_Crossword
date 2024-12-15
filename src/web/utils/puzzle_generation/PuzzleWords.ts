export class PuzzleWords {
    static sortByBest(words: string[]): string[] {
      const allChars = words.join("").split("");
      const allCharCount = allChars.length;
      const frequency: Map<string, number> = new Map();
      for (const c of allChars) {
        frequency.set(c, (frequency.get(c) ?? 0) + 1);
      }
      for (const [k, v] of frequency) {
        frequency.set(k, v / allCharCount);
      }
  
      function rateWord(word: string): number {
        return word.split("").reduce((sum, c) => sum + (frequency.get(c) ?? 0), 0);
      }
  
      return [...words].sort((a, b) => rateWord(b) - rateWord(a));
    }    
  }
  