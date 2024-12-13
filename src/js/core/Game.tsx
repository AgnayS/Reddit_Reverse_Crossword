import React from 'react';
import { Grid } from './Grid.tsx';
import { Timer } from './Timer.tsx';
import { ClueManager } from '../ui/ClueManager.tsx';
import { MessageHandler } from '../ui/MessageHandler.tsx';
import { PuzzleGenerator } from '../utils/PuzzleGenerator.tsx';
import { fetchWordsAndClues } from '../utils/WordFetcher.tsx';
import type { Theme, UIElements } from '../utils/types.tsx';

export class Game {
    private grid: Grid;
    private timer: Timer;
    private clueManager: ClueManager;
    private messageHandler: MessageHandler;
    private theme: Theme | null = null;
    private ui: UIElements;

    constructor() {
        console.log('Initializing Game...');
        this.grid = new Grid(7);
        this.timer = new Timer();
        this.clueManager = new ClueManager();
        this.messageHandler = new MessageHandler();

        // Initialize UI elements
        this.ui = {
            grid: document.querySelector<HTMLDivElement>('#grid'),
            timer: document.querySelector<HTMLDivElement>('#timer'),
            cluesList: document.querySelector<HTMLDivElement>('#clues-list'),
            message: document.querySelector<HTMLDivElement>('#message'),
            themeDisplay: document.querySelector<HTMLDivElement>('#theme-display'),
            submitBtn: document.querySelector<HTMLButtonElement>('#submit-btn'),
            resetBtn: document.querySelector<HTMLButtonElement>('#reset-btn'),
            peekBtn: document.querySelector<HTMLButtonElement>('#peek-btn'),
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    private async init(): Promise<void> {
        console.log('Initializing Game Setup...');
        await this.fetchTheme();
        this.setupGame();
        this.setupControls();
    }

    private async fetchTheme(): Promise<void> {
        try {
            const response = await fetchWordsAndClues();
            this.theme = {
                name: response.theme,
                words: response.words,
                clues: response.clues,
            };
            console.log('Fetched Theme:', this.theme);
        } catch (error) {
            console.error('Failed to fetch theme:', error);
            this.messageHandler.showError('Error fetching theme. Please refresh the page.');
        }
    }

    private setupGame(): void {
        if (!this.theme) return;

        const generator = new PuzzleGenerator(7,7);
        const puzzle = generator.generate(this.theme.words);
        console.log('Generated Puzzle:', puzzle);

        this.grid.initialize(puzzle.grid);
        this.grid.setValidCells(puzzle.words);
        this.clueManager.initialize(puzzle.words, this.theme.clues);

        if (this.ui.themeDisplay) {
            this.ui.themeDisplay.textContent = `Today's theme: ${this.theme.name}`;
        }

        this.grid.renderGrid(this.ui.grid);
        this.timer.start();
    }

    private setupControls(): void {
        if (this.ui.submitBtn) {
            this.ui.submitBtn.addEventListener('click', () => this.checkSolution());
        }

        if (this.ui.resetBtn) {
            this.ui.resetBtn.addEventListener('click', () => this.reset());
        }

        if (this.ui.peekBtn) {
            this.ui.peekBtn.addEventListener('click', () => this.handlePeek());
        }

        if (this.ui.grid) {
            this.ui.grid.addEventListener('click', (e: MouseEvent) => {
                const target = e.target as Element;
                if (target?.classList?.contains('cell')) {
                    const cellElement = target as HTMLDivElement;
                    const row = parseInt(cellElement.dataset.row || '0', 10);
                    const col = parseInt(cellElement.dataset.col || '0', 10);
                    this.grid.toggleCell(cellElement, row, col);
                    this.messageHandler.clear();
                }
            });
        }
    }

    private reset(): void {
        this.grid.reset();
        this.clueManager.reset();
        this.messageHandler.clear();

        if (this.theme) {
            const generator = new PuzzleGenerator(7,7);
            const puzzle = generator.generate(this.theme.words);
            this.grid.initialize(puzzle.grid);
            this.grid.setValidCells(puzzle.words);
            this.clueManager.initialize(puzzle.words, this.theme.clues);
            this.grid.renderGrid(this.ui.grid);
        }
    }

    private checkSolution(): void {
        const isCorrect = this.grid.checkSolution();
        if (isCorrect) {
            this.messageHandler.showSuccess();
            this.clueManager.markAllSolved();
            this.timer.stop();
        } else {
            this.messageHandler.showError();
        }
    }

    private handlePeek(): void {
        const { validCells } = this.grid.getState();
        const container = document.querySelector<HTMLDivElement>('#grid');
        if (!container) return;

        // Collect all invalid cells that are not blacked out
        const invalidCells: {x:number, y:number}[] = [];
        for (let y = 0; y < 7; y++) {
            for (let x = 0; x < 7; x++) {
                const key = `${x},${y}`;
                if (!validCells.has(key)) {
                    // Check if this cell is not blacked out
                    const cell = container.querySelector<HTMLDivElement>(`.cell[data-row="${y}"][data-col="${x}"]`);
                    if (cell && !cell.classList.contains('blackout')) {
                        invalidCells.push({x,y});
                    }
                }
            }
        }

        if (invalidCells.length === 0) return;

        // Shuffle invalid cells
        for (let i = invalidCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [invalidCells[i], invalidCells[j]] = [invalidCells[j], invalidCells[i]];
        }

        // Pick up to 3 cells
        const peekCells = invalidCells.slice(0, 3);
        peekCells.forEach(({x,y}) => {
            this.grid.showPeekBad(y, x); // highlight in red
        });

        setTimeout(() => {
            this.grid.hidePeekBad();
        }, 2000);
    }
}
