import React from 'react';
import { GameState, WordInfo } from '../utils/types.tsx';

export class Grid {
    private element: HTMLDivElement | null;
    private blackedOutCells: boolean[][];
    private validCells: Set<string>;

    constructor(private size: number = 7) {
        this.element = document.querySelector<HTMLDivElement>('#grid');
        this.blackedOutCells = Array(size).fill(null).map(() => Array(size).fill(false));
        this.validCells = new Set();
    }

    public initialize(puzzleGrid: string[][]): void {
        if (!this.element) return;

        this.element.innerHTML = '';
        puzzleGrid.forEach((row, rowIndex) => {
            row.forEach((letter, colIndex) => {
                const cell = document.createElement('div') as HTMLDivElement;
                cell.className = 'cell';
                cell.textContent = letter;
                cell.dataset.row = rowIndex.toString();
                cell.dataset.col = colIndex.toString();
                this.element?.appendChild(cell);
            });
        });
    }

    public setValidCells(words: WordInfo[]): void {
        this.validCells.clear();
        words.forEach(wordInfo => {
            const { word, startX, startY, isVertical } = wordInfo;
            for (let i = 0; i < word.length; i++) {
                const x = isVertical ? startX : startX + i;
                const y = isVertical ? startY + i : startY;
                this.validCells.add(`${x},${y}`);
            }
        });
    }

    public toggleCell(cell: HTMLDivElement, row: number, col: number): void {
        const isBlackingOut = !cell.classList.contains('blackout');
        cell.classList.toggle('blackout');
        this.blackedOutCells[row][col] = isBlackingOut;
    }

    public reset(): void {
        this.blackedOutCells = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
        document.querySelectorAll<HTMLDivElement>('.cell').forEach(cell => {
            cell.classList.remove('blackout');
            cell.style.backgroundColor = 'white';
        });
    }

    public checkSolution(): boolean {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const isValidCell = this.validCells.has(`${col},${row}`);
                const isBlackedOut = this.blackedOutCells[row][col];
                if (isValidCell === isBlackedOut) {
                    return false;
                }
            }
        }
        return true;
    }

    public showPeek(row: number, col: number, isCorrectCell: boolean): void {
        const cell = document.querySelector<HTMLDivElement>(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('peek');
            cell.style.backgroundColor = isCorrectCell ? '#90EE90' : '#ffd700';
        }
    }

    public hidePeek(): void {
        document.querySelectorAll<HTMLDivElement>('.cell.peek').forEach(cell => {
            cell.classList.remove('peek');
            cell.style.backgroundColor = cell.classList.contains('blackout') ? '#1a1a1a' : 'white';
        });
    }

    public getState(): Pick<GameState, 'blackedOutCells' | 'validCells'> {
        return {
            blackedOutCells: this.blackedOutCells,
            validCells: this.validCells
        };
    }
}