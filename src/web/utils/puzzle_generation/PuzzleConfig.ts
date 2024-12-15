export class PuzzleConfig {
  width: number;
  height: number;
  wrapping: boolean;

  constructor(width: number = 18, height: number = 18, wrapping: boolean = false) {
    this.width = width;
    this.height = height;
    this.wrapping = wrapping;
  }
}
