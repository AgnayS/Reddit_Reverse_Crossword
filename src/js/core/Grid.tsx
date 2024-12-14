import { WordInfo } from '../utils/types.tsx';

interface GridState {
    validCells: Set<string>;
    grid: string[][];
}

export class Grid {
    private size: number;
    private cells: string[][];
    private validCells: Set<string>;

    constructor(size: number) {
        this.size = size;
        this.cells = Array.from({ length: size }, () => Array(size).fill(''));
        this.validCells = new Set();
    }

    public initialize(grid: string[][]): void {
        this.cells = grid.map(row => [...row]);
    }

    public setValidCells(words: WordInfo[]): void {
        this.validCells.clear();
        for (const wordInfo of words) {
            const { word, startX, startY, isVertical } = wordInfo;
            for (let i = 0; i < word.length; i++) {
                const x = isVertical ? startX : startX + i;
                const y = isVertical ? startY + i : startY;
                this.validCells.add(`${x},${y}`);
            }
        }
    }

    public clearBlackouts(): void {
        const container = document.querySelector<HTMLDivElement>('#grid');
        if (!container) return;

        container.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('blackout', 'peek-hint', 'solution-correct', 'solution-incorrect');
        });
    }

    public showPeekHint(row: number, col: number): void {
        const cell = document.querySelector<HTMLDivElement>(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );
        if (cell) {
            cell.classList.add('peek-hint');
        }
    }

    public clearPeekHints(): void {
        document.querySelectorAll('.cell.peek-hint').forEach(cell => {
            cell.classList.remove('peek-hint');
        });
    }

    public revealSolution(): void {
        const container = document.querySelector<HTMLDivElement>('#grid');
        if (!container) return;

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = container.querySelector<HTMLDivElement>(
                    `.cell[data-row="${row}"][data-col="${col}"]`
                );
                if (!cell) continue;

                const isBlackedOut = cell.classList.contains('blackout');
                const shouldBeBlackedOut = !this.validCells.has(`${col},${row}`);

                if (shouldBeBlackedOut && !isBlackedOut) {
                    cell.classList.add('solution-incorrect');
                } else if (!shouldBeBlackedOut && isBlackedOut) {
                    cell.classList.add('solution-incorrect');
                } else {
                    cell.classList.add('solution-correct');
                }
            }
        }
    }

    public checkSolution(): boolean {
        const container = document.querySelector<HTMLDivElement>('#grid');
        if (!container) return false;

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = container.querySelector<HTMLDivElement>(
                    `.cell[data-row="${row}"][data-col="${col}"]`
                );
                if (!cell) continue;

                const isBlackedOut = cell.classList.contains('blackout');
                const shouldBeBlackedOut = !this.validCells.has(`${col},${row}`);

                if (isBlackedOut !== shouldBeBlackedOut) return false;
            }
        }
        return true;
    }

    public getState(): { validCells: Set<string>; grid: string[][] } {
        return { validCells: this.validCells, grid: this.cells };
    }
}