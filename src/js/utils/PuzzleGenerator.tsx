import { WordInfo } from './types.tsx';

export class PuzzleGenerator {
  private width: number;
  private height: number;
  private attempts: number;
  private dictionarySampleSize: number;

  constructor(width: number, height: number, attempts: number = 10, dictionarySampleSize: number = 500) {
    this.width = width;
    this.height = height;
    this.attempts = attempts;
    this.dictionarySampleSize = dictionarySampleSize;
  }

  public generate(words: string[]): { grid: string[][]; words: WordInfo[] } {
    const uppercaseWords = words.map(w => w.toUpperCase());

    let bestPuzzle = { grid: this.emptyGrid(), words: [] as WordInfo[] };
    let bestScore = 0;

    for (let i = 0; i < this.attempts; i++) {
      const puzzle = this.tryGenerate(uppercaseWords);
      const score = puzzle.words.reduce((acc, w) => acc + w.word.length, 0);

      if (score > bestScore) {
        bestScore = score;
        bestPuzzle = puzzle;
      }
    }

    // Fill empty spaces with random letters
    this.fillEmptySpaces(bestPuzzle.grid);

    return { grid: bestPuzzle.grid, words: bestPuzzle.words };
  }

  private tryGenerate(words: string[]): { grid: string[][]; words: WordInfo[] } {
    let grid = this.emptyGrid();
    const placedWords: WordInfo[] = [];

    if (words.length === 0) {
      return { grid, words: [] };
    }

    const initialWord = words[0];
    const vertical = Math.random() < 0.5;
    const startX = vertical
      ? Math.floor(this.width / 2)
      : Math.max(0, Math.floor((this.width - initialWord.length) / 2));
    const startY = vertical
      ? Math.max(0, Math.floor((this.height - initialWord.length) / 2))
      : Math.floor(this.height / 2);

    if (!this.canPlaceWord(grid, initialWord, startX, startY, vertical ? 0 : 1, vertical ? 1 : 0)) {
      const placed = this.placeRandomly(grid, initialWord);
      if (!placed) return { grid, words: [] };
      grid = placed.grid;
      placedWords.push({
        word: initialWord,
        startX: placed.startX,
        startY: placed.startY,
        isVertical: placed.isVertical,
        length: initialWord.length
      });
    } else {
      grid = this.writeWord(grid, initialWord, startX, startY, vertical ? 0 : 1, vertical ? 1 : 0);
      placedWords.push({
        word: initialWord,
        startX,
        startY,
        isVertical: vertical,
        length: initialWord.length
      });
    }

    // Shuffle remaining words
    const remaining = [...words.slice(1)];
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    // Attempt to place remaining words by intersection
    for (const w of remaining) {
      const added = this.placeByIntersection(grid, placedWords, w);
      if (added) {
        grid = added.grid;
        placedWords.push({
          word: w,
          startX: added.startX,
          startY: added.startY,
          isVertical: added.isVertical,
          length: w.length
        });
      }
    }

    return { grid, words: placedWords };
  }

  private emptyGrid(): string[][] {
    return Array.from({ length: this.height }, () => Array(this.width).fill(''));
  }

  private canPlaceWord(grid: string[][], word: string, startX: number, startY: number, dx: number, dy: number): boolean {
    for (let i = 0; i < word.length; i++) {
      const x = startX + i * dx;
      const y = startY + i * dy;

      if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
      const cell = grid[y][x];
      if (cell !== '' && cell !== word[i]) return false;
    }
    return true;
  }

  private writeWord(grid: string[][], word: string, startX: number, startY: number, dx: number, dy: number): string[][] {
    const newGrid = grid.map(row => [...row]);
    for (let i = 0; i < word.length; i++) {
      const x = startX + i * dx;
      const y = startY + i * dy;
      newGrid[y][x] = word[i];
    }
    return newGrid;
  }

  private placeRandomly(grid: string[][], word: string): { grid: string[][]; startX: number; startY: number; isVertical: boolean } | null {
    const maxAttempts = 50;
    const directions = [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }];
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const startX = Math.floor(Math.random() * this.width);
      const startY = Math.floor(Math.random() * this.height);

      const dir = directions[Math.floor(Math.random() * directions.length)];

      if (this.canPlaceWord(grid, word, startX, startY, dir.dx, dir.dy)) {
        const newGrid = this.writeWord(grid, word, startX, startY, dir.dx, dir.dy);
        return { grid: newGrid, startX, startY, isVertical: dir.dy === 1 };
      }
    }
    return null;
  }

  private placeByIntersection(grid: string[][], placedWords: WordInfo[], word: string): { grid: string[][]; startX: number; startY: number; isVertical: boolean } | null {
    const letters = word.split('');
    const attempts = 50;

    for (let attempt = 0; attempt < attempts; attempt++) {
      const letter = letters[Math.floor(Math.random() * letters.length)];
      const matches: { x: number; y: number }[] = [];

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (grid[y][x] === letter) {
            matches.push({ x, y });
          }
        }
      }

      if (matches.length === 0) continue;

      for (const m of matches) {
        const letterIndex = letters.indexOf(letter);

        // Horizontal attempt
        const startXh = m.x - letterIndex;
        const startYh = m.y;
        if (this.canPlaceWord(grid, word, startXh, startYh, 1, 0)) {
          return { grid: this.writeWord(grid, word, startXh, startYh, 1, 0), startX: startXh, startY: startYh, isVertical: false };
        }

        // Vertical attempt
        const startXv = m.x;
        const startYv = m.y - letterIndex;
        if (this.canPlaceWord(grid, word, startXv, startYv, 0, 1)) {
          return { grid: this.writeWord(grid, word, startXv, startYv, 0, 1), startX: startXv, startY: startYv, isVertical: true };
        }
      }
    }
    return null;
  }

  private fillEmptySpaces(grid: string[][]): void {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (grid[y][x] === '') {
          grid[y][x] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
  }
}
