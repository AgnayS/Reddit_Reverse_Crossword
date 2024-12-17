// FILE: js/utils/PuzzleGenerator.tsx
import { WordInfo } from './types.tsx';
import { PuzzleConfig } from './puzzle_generation/PuzzleConfig.ts';
import { Puzzle } from './puzzle_generation/Puzzle.ts';
import { PuzzleWords } from './puzzle_generation/PuzzleWords.ts';

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

    const sortedWords = PuzzleWords.sortByBest(uppercaseWords);
    if (sortedWords.length === 0) {
      return { grid: this.emptyGrid(), words: [] };
    }

    const initialWord = sortedWords[0];
    const restWords = sortedWords.slice(1);

    const config = new PuzzleConfig(this.width, this.height, false);
    const puzzles = Puzzle.generate(initialWord, restWords, config);
    const bestPuzzle = puzzles.sort((a, b) => b.density - a.density)[0];

    // Convert puzzle's internal chars to a 2D grid (with spaces where empty)
    const partialGrid = this.convertGrid(bestPuzzle, config);


    // Now fill the empty spaces with random letters
    this.fillEmptySpaces(partialGrid);

    const finalWords = this.extractWordInfo(bestPuzzle);

    return { grid: partialGrid, words: finalWords };
  }

  private emptyGrid(): string[][] {
    return Array.from({ length: this.height }, () => Array(this.width).fill(''));
  }

  private convertGrid(puzzle: Puzzle, config: PuzzleConfig): string[][] {
    const grid: string[][] = [];
    for (let y = 0; y < config.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < config.width; x++) {
        let ch = puzzle.getChar(x, y);
        row.push(ch);
      }
      grid.push(row);
    }
    return grid;
  }

  private extractWordInfo(puzzle: Puzzle): WordInfo[] {
    const annotation = puzzle.getAnnotation();
    const wordsInfo: WordInfo[] = [];

    for (const [pt, annos] of annotation.entries()) {
      for (const anno of annos) {
        wordsInfo.push({
          word: anno.word,
          startX: pt.x,
          startY: pt.y,
          isVertical: anno.vertical,
          length: anno.word.length
        });
      }
    }

    return wordsInfo;
  }

  private fillEmptySpaces(grid: string[][]): void {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (grid[y][x] === ' ') {
          grid[y][x] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
  }
}
