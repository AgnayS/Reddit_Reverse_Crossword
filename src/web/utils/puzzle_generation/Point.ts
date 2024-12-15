export class Point {
  underlying: number;
  constructor(underlying: number) {
    this.underlying = underlying;
  }
  get x(): number {
    return (this.underlying & 0xffff) << 16 >> 16; // replicate signed 16-bit behavior
  }
  get y(): number {
    return (this.underlying >>> 16) << 16 >> 16; // replicate signed 16-bit behavior
  }
  toString(): string {
    return `Point(${this.x}, ${this.y})`;
  }

  static apply(x: number, y: number): Point {
    // Store x and y as signed 16-bit each in a single int
    const ux = (x << 16 >> 16) & 0xffff;
    const uy = (y << 16 >> 16) & 0xffff;
    return new Point((ux & 0xffff) | (uy << 16));
  }
}

export class CharPoint {
  char: string;
  x: number;
  y: number;
  vertical: boolean;
  constructor(char: string, x: number, y: number, vertical: boolean) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.vertical = vertical;
  }
}

export class AnnotatedPoint {
  index: number;
  vertical: boolean;
  word: string;
  constructor(index: number, vertical: boolean, word: string) {
    this.index = index;
    this.vertical = vertical;
    this.word = word;
  }
}
