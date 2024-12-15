import { Point, CharPoint, AnnotatedPoint } from "./Point.ts";
import { PuzzleConfig } from "./PuzzleConfig.ts";
import { Random } from "./Random.ts";

export class Puzzle {
  chars: string[];
  config: PuzzleConfig;
  words: Set<string>;

  constructor(chars: string[], config: PuzzleConfig, words: Set<string>) {
    this.chars = chars;
    this.config = config;
    this.words = words;
  }

  static empty(config: PuzzleConfig): Puzzle {
    return new Puzzle(Array(config.width * config.height).fill(' '), config, new Set<string>());
  }

  get density(): number {
    let letters = 0;
    for (const w of this.words) {
      letters += w.length;
    }
    return letters / this.chars.length;
  }

  private toIndex(x: number, y: number): number {
    return y * this.config.width + ((x % this.config.width) + this.config.width) % this.config.width;
  }

  getChar(x: number, y: number): string {
    if (y < 0 || y >= this.config.height || (!this.config.wrapping && (x < 0 || x >= this.config.width))) return ' ';
    return this.chars[this.toIndex(x, y)];
  }

  private isEmpty(x: number, y: number): boolean {
    return this.getChar(x, y) === ' ';
  }

  private hasChar(x: number, y: number): boolean {
    return this.getChar(x, y) !== ' ';
  }

  private copyWithWord(x: number, y: number, vertical: boolean, word: string): Puzzle {
    const newChars = this.chars.slice();
    if (vertical) {
      for (let i = 0; i < word.length; i++) {
        newChars[this.toIndex(x, y + i)] = word[i];
      }
    } else {
      for (let i = 0; i < word.length; i++) {
        newChars[this.toIndex(x + i, y)] = word[i];
      }
    }
    const newWords = new Set(this.words);
    newWords.add(word);
    return new Puzzle(newChars, this.config, newWords);
  }

  private fits(word: string, vertical: boolean, x: number, y: number): boolean {
    let connect = false;
    for (let i = 0; i < word.length; i++) {
      const locX = vertical ? x : x + i;
      const locY = vertical ? y + i : y;
      const existingChar = this.getChar(locX, locY);
      const same = existingChar === word[i];
      const empty = existingChar === ' ';
      if (same) connect = true;
      if (!((same || empty) &&
         (!empty || (
           vertical ? (!this.hasChar(locX - 1, locY) && !this.hasChar(locX + 1, locY))
                    : (!this.hasChar(locX, locY - 1) && !this.hasChar(locX, locY + 1)))
          )
        )) {
        return false;
      }
    }
    if (!connect) return false;

    // test ends of word
    if (vertical) {
      return (!this.hasChar(x, y - 1) && !this.hasChar(x, y + word.length));
    } else {
      return (!this.hasChar(x - 1, y) && !this.hasChar(x + word.length, y));
    }
  }

  addWord(word: string): Puzzle[] {
    const positions = this.positions;
    // group word chars by char
    const charIndicesMap: Map<string, number[]> = new Map();
    for (let i = 0; i < word.length; i++) {
      const c = word[i];
      if (!charIndicesMap.has(c)) charIndicesMap.set(c, []);
      charIndicesMap.get(c)!.push(i);
    }

    const results: Puzzle[] = [];
    for (const [char, indicesList] of charIndicesMap.entries()) {
      const pts = positions.get(char) ?? [];
      for (const point of pts) {
        for (const index of indicesList) {
          const startX = point.vertical ? point.x : (point.x - index);
          const startY = point.vertical ? (point.y - index) : point.y;
          const endX = point.vertical ? startX : (startX + word.length - 1);
          const endY = point.vertical ? (startY + word.length - 1) : startY;
          if (startX >= 0 && startY >= 0 &&
              endX < this.config.width && endY < this.config.height &&
              this.fits(word, point.vertical, startX, startY)) {
            results.push(this.copyWithWord(startX, startY, point.vertical, word));
          } else if (this.config.wrapping && this.fits(word, point.vertical, startX, startY)) {
            // if wrapping is allowed, we trust fits to handle wrapping conditions
            results.push(this.copyWithWord(startX, startY, point.vertical, word));
          }
        }
      }
    }

    return results;
  }

  get positions(): Map<string, CharPoint[]> {
    const list: CharPoint[] = [];
    for (let index = 0; index < this.chars.length; index++) {
      const char = this.chars[index];
      if (char !== ' ') {
        const x = index % this.config.width;
        const y = Math.floor(index / this.config.width);
        // The Scala logic for adding positions:
        // horizontal possibility
        if (this.isEmpty(x+1, y) && this.isEmpty(x-1, y) &&
            ((this.isEmpty(x+1, y+1) && this.isEmpty(x+1, y-1) && x < this.config.width -1) ||
             (this.isEmpty(x-1, y+1) && this.isEmpty(x-1, y-1) && x > 0))) {
          list.push(new CharPoint(char, x, y, false));
        } else if (this.isEmpty(x, y+1) && this.isEmpty(x, y-1) &&
                   ((this.isEmpty(x+1, y+1) && this.isEmpty(x-1, y+1) && y < this.config.height -1) ||
                    (this.isEmpty(x+1, y-1) && this.isEmpty(x-1, y-1) && y > 0))) {
          list.push(new CharPoint(char, x, y, true));
        }
      }
    }
    const map = new Map<string, CharPoint[]>();
    for (const cp of list) {
      if (!map.has(cp.char)) map.set(cp.char, []);
      map.get(cp.char)!.push(cp);
    }
    return map;
  }

  getAnnotation(): Map<Point, AnnotatedPoint[]> {
    const result = new Map<Point, AnnotatedPoint[]>();
    let index = 0;
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        const nonEmpty = !this.isEmpty(x, y);
        const vertical = this.isEmpty(x, y-1);
        const horizontal = this.isEmpty(x-1, y);
        if (nonEmpty && (vertical || horizontal)) {
          const point = Point.apply(x, y);
          const vWord = vertical && this.getWord(point, true).length > 1 ? this.getWord(point, true) : "";
          const hWord = horizontal && this.getWord(point, false).length > 1 ? this.getWord(point, false) : "";
          const annos: AnnotatedPoint[] = [];
          if (vWord.length > 1) {
            index += 1;
            annos.push(new AnnotatedPoint(index, true, vWord));
          }
          if (hWord.length > 1) {
            index += 1;
            annos.push(new AnnotatedPoint(index, false, hWord));
          }
          result.set(point, annos);
        }
      }
    }
    return result;
  }

  private getWord(point: Point, vertical: boolean): string {
    let str = "";
    for (let c = 0; c < Math.max(this.config.width, this.config.height); c++) {
      const ch = vertical ? this.getChar(point.x, point.y + c) : this.getChar(point.x + c, point.y);
      if (ch === ' ' || ch === undefined) break;
      str += ch;
    }
    return str;
  }

  getCharsShownInPartialSolution(random: Random = new Random(), solvedFraction: number = 0.30): Set<Point> {
    let resultSet = new Set<Point>();
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        if (this.hasChar(x, y)) {
          const point = Point.apply(x, y);
          const hasVerticalNeighbor = this.hasChar(x, y-1) || this.hasChar(x, y+1);
          const hasHorizontalNeighbor = this.hasChar(x-1, y) || this.hasChar(x+1, y);
          const isIntersection = hasVerticalNeighbor && hasHorizontalNeighbor;
          if (!isIntersection &&
              random.nextDouble() < solvedFraction &&
              !resultSet.has(Point.apply(x-1, y)) &&
              !resultSet.has(Point.apply(x, y-1))) {
            resultSet.add(point);
          }
        }
      }
    }
    return resultSet;
  }

  static generate(initialWord: string, list: string[], config: PuzzleConfig): Puzzle[] {
    const emptyPuzzle = Puzzle.empty(config);
    const p1 = Puzzle.initial(emptyPuzzle, initialWord, false, false);
    const p2 = Puzzle.initial(emptyPuzzle, initialWord, true, false);
    return [Puzzle.generateAndFinalize(p1, list), Puzzle.generateAndFinalize(p2, list)];
  }

  private static generateAndFinalize(puzzle: Puzzle, words: string[]): Puzzle {
    let basePuzzle = puzzle;
    let finalPuzzle = Puzzle.generateLoop(basePuzzle, words, []);
    while (finalPuzzle.words.size > basePuzzle.words.size) {
      basePuzzle = finalPuzzle;
      finalPuzzle = Puzzle.generateLoop(basePuzzle, words, []);
    }
    return finalPuzzle;
  }

  private static initial(emptyPuzzle: Puzzle, word: string, vertical: boolean, center: boolean): Puzzle {
    const random = new Random();
    if (!center) {
      if (vertical) {
        const x = random.nextInt(emptyPuzzle.config.width);
        const y = random.nextInt(emptyPuzzle.config.height - word.length + 1);
        return emptyPuzzle.copyWithWord(x, y, vertical, word);
      } else {
        const x = random.nextInt(emptyPuzzle.config.width - word.length + 1);
        const y = random.nextInt(emptyPuzzle.config.height);
        return emptyPuzzle.copyWithWord(x, y, vertical, word);
      }
    } else {
      if (vertical) {
        return emptyPuzzle.copyWithWord(emptyPuzzle.config.width / 2, (emptyPuzzle.config.height - word.length) / 2, vertical, word);
      } else {
        return emptyPuzzle.copyWithWord((emptyPuzzle.config.width - word.length) / 2, emptyPuzzle.config.height / 2, vertical, word);
      }
    }
  }

  static finalize(puzzle: Puzzle, words: string[]): Puzzle {
    const random = new Random();
    // From Scala: "the sorted list used in finalize method"
    const sorted = Puzzle.shuffleArray(words).slice(0,10000).sort((a,b) => b.length - a.length);
    return Puzzle.generateLoop(puzzle, sorted, []);
  }

  // Equivalent to generate method in Scala (tailrec)
  private static generateLoop(puzzle: Puzzle, words: string[], tried: string[]): Puzzle {
    let currentPuzzle = puzzle;
    let remainingWords = words;
    let triedWords = tried;

    while (remainingWords.length > 0) {
      const w = remainingWords[0];
      remainingWords = remainingWords.slice(1);
      if (currentPuzzle.words.has(w)) {
        continue;
      }
      const options = currentPuzzle.addWord(w);
      if (options.length === 0) {
        triedWords.unshift(w);
      } else {
        const random = new Random();
        const nextPuzzle = options[random.nextInt(options.length)];
        currentPuzzle = Puzzle.generateLoop(nextPuzzle, triedWords.concat(remainingWords), []);
        return currentPuzzle;
      }
    }
    return currentPuzzle;
  }

  static shuffleArray<T>(array: T[]): T[] {
    const arr = array.slice();
    for (let i = arr.length -1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  toString(): string {
    const scan = [...Array(this.config.width).keys()];
    const lines: string[] = [];
    for (let y = 0; y < this.config.height; y++) {
      let line = "";
      for (let x = 0; x < this.config.width; x++) {
        line += this.getChar(x, y);
      }
      lines.push(line);
    }
    return `Density: ${(this.density*100).toFixed(0)}%, Words: ${this.words.size}, ${this.config.width}x${this.config.height}\n` + lines.join("\n");
  }
}
