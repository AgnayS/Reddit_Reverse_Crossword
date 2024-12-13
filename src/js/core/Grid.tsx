import React from 'react';
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
        if (grid.length !== this.size || grid.some(row => row.length !== this.size)) {
            throw new Error(`Grid size mismatch: expected ${this.size}x${this.size}`);
        }
        this.cells = grid.map(row => [...row]);
        console.log('Grid initialized:', this.cells);
    }

    public setValidCells(words: WordInfo[]): void {
        this.validCells.clear();
        for (const wordInfo of words) {
            const { word, startX, startY, isVertical } = wordInfo;
            for (let i = 0; i < word.length; i++) {
                const x = startX + (isVertical ? 0 : i);
                const y = startY + (isVertical ? i : 0);
                this.validCells.add(`${x},${y}`);
            }
        }
        console.log('Valid cells set:', this.cells);
    }

    public renderGrid(container: HTMLDivElement | null): void {
        if (!container) return;
        container.innerHTML = '';

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell');
                cellDiv.dataset.row = row.toString();
                cellDiv.dataset.col = col.toString();
                cellDiv.textContent = (this.cells[row][col] || '').toUpperCase();
                container.appendChild(cellDiv);
            }
        }
    }

    public clearGrid(): void {
        this.cells = Array.from({ length: this.size }, () => Array(this.size).fill(''));
        console.log('Grid cleared.');
    }

    public toggleCell(cellElement: HTMLDivElement, row: number, col: number): void {
        cellElement.classList.toggle('blackout');
    }

    public checkSolution(): boolean {
        const container = document.querySelector<HTMLDivElement>('#grid');
        if (!container) return false;

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = container.querySelector<HTMLDivElement>(`.cell[data-row="${row}"][data-col="${col}"]`);
                if (!cell) continue;

                const isBlackout = cell.classList.contains('blackout');
                const key = `${col},${row}`;
                const shouldBeValid = this.validCells.has(key);

                if (shouldBeValid && isBlackout) return false;
                if (!shouldBeValid && !isBlackout) return false;
            }
        }
        return true;
    }

    public reset(): void {
        const container = document.querySelector<HTMLDivElement>('#grid');
        if (container) {
            container.querySelectorAll('.cell.blackout').forEach(cell => {
                cell.classList.remove('blackout');
            });
        }
    }

    /**
     * showPeekBad highlights a cell in red (using .peek-bad) to indicate it needs to be blacked out.
     */
    public showPeekBad(row: number, col: number): void {
        const container = document.querySelector<HTMLDivElement>('#grid');
        if (!container) return;
        const cell = container.querySelector<HTMLDivElement>(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('peek-bad');
        }
    }

    /**
     * hidePeekBad removes the red highlight from all peeked cells.
     */
    public hidePeekBad(): void {
        const container = document.querySelector<HTMLDivElement>('#grid');
        if (!container) return;
        container.querySelectorAll('.cell.peek-bad').forEach(cell => {
            cell.classList.remove('peek-bad');
        });
    }

    public getState(): GridState {
        return { validCells: this.validCells, grid: this.cells };
    }
}
