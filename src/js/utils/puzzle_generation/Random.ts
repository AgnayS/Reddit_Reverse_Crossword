export class Random {
    nextDouble(): number {
      return Math.random();
    }
    nextInt(n: number): number {
      return Math.floor(Math.random() * n);
    }
  }
  