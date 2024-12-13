import React from 'react';
import { Grid } from './Grid.tsx';
import { Timer } from './Timer.tsx';
import { ClueManager } from '../ui/ClueManager.tsx';
import { MessageHandler } from '../ui/MessageHandler.tsx';
import { PuzzleGenerator, PuzzleConfig } from '../utils/PuzzleGenerator.tsx';
import { getDailyTheme } from '../utils/ThemeManager.tsx';
import type { Theme, UIElements } from '../utils/types.tsx';

export class Game {
    private grid: Grid;
    private timer: Timer;
    private clueManager: ClueManager;
    private messageHandler: MessageHandler;
    private theme: Theme;
    private peeksLeft: number;
    private isPeeking: boolean;
    private peekTimeout: number | null;
    private ui: UIElements;

    constructor() {
        console.log('Initializing Game...');
        this.grid = new Grid(7);
        this.timer = new Timer();
        this.clueManager = new ClueManager();
        this.messageHandler = new MessageHandler();
        this.theme = getDailyTheme();
        this.peeksLeft = 3;
        this.isPeeking = false;
        this.peekTimeout = null;

        // Initialize UI elements
        this.ui = {
            grid: document.querySelector<HTMLDivElement>('#grid'),
            timer: document.querySelector<HTMLDivElement>('#timer'),
            cluesList: document.querySelector<HTMLDivElement>('#clues-list'),
            message: document.querySelector<HTMLDivElement>('#message'),
            peeksLeftSpan: document.querySelector<HTMLSpanElement>('#peeks-left'),
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

    private init(): void {
        console.log('Initializing Game Setup...');
        this.setupGame();
        this.setupControls();
    }

    /**
     * Initializes the puzzle by generating a new one and setting it up on the grid.
     * This method can be called both during initial setup and during reset without affecting the timer.
     */
    private initializePuzzle(): void {
        const config = new PuzzleConfig(7, 7);
        const generator = new PuzzleGenerator(config);
        const puzzle = generator.generate(this.theme.words);

        console.log('Generated Puzzle:', puzzle);

        this.grid.initialize(puzzle.grid);
        this.grid.setValidCells(puzzle.words);
        this.clueManager.initialize(puzzle.words, this.theme.clues);
    }

    private setupGame(): void {
        console.log('Setting up game with theme:', this.theme);

        // Initialize the puzzle
        this.initializePuzzle();

        if (this.ui.themeDisplay) {
            this.ui.themeDisplay.textContent = `Today's theme: ${this.theme.name}`;
        }

        // Start the timer once at the beginning
        this.timer.start();

        if (this.ui.peeksLeftSpan) {
            this.ui.peeksLeftSpan.textContent = this.peeksLeft.toString();
        }

        console.log('Game setup complete.');
    }

    private setupControls(): void {
        console.log('Setting up controls...');

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

        if (this.ui.submitBtn) {
            this.ui.submitBtn.addEventListener('click', () => this.checkSolution());
        }

        if (this.ui.resetBtn) {
            this.ui.resetBtn.addEventListener('click', () => this.reset());
        }

        if (this.ui.peekBtn) {
            this.ui.peekBtn.addEventListener('click', () => this.handlePeek());
        }

        console.log('Controls setup complete.');
    }

    private reset(): void {
        console.log('Resetting game grid...');
        this.grid.reset();
        this.clueManager.reset();
        this.messageHandler.clear();

        // Reinitialize the puzzle (but do NOT restart or reset the timer)
        this.initializePuzzle();

        console.log('Grid reset complete, puzzle reinitialized.');
    }

    private checkSolution(): void {
        console.log('Checking solution...');
        const isCorrect = this.grid.checkSolution();

        if (isCorrect) {
            console.log('Solution is correct!');
            this.messageHandler.showSuccess();
            this.clueManager.markAllSolved();
            this.timer.stop();
        } else {
            console.log('Solution is incorrect.');
            this.messageHandler.showError();
        }
    }

    private handlePeek(): void {
        if (this.peeksLeft <= 0 || this.isPeeking) return;

        this.isPeeking = true;
        this.peeksLeft--;

        if (this.ui.peeksLeftSpan) {
            this.ui.peeksLeftSpan.textContent = this.peeksLeft.toString();
        }

        if (this.ui.peekBtn) {
            this.ui.peekBtn.disabled = this.peeksLeft <= 0;
        }

        const allCells = [...Array(7)].flatMap((_, row) =>
            [...Array(7)].map((_, col) => ({ row, col }))
        );

        console.log('All cells for peeking:', allCells);

        // Shuffle cells
        for (let i = allCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
        }

        // Show hints for 3 random cells
        const { validCells } = this.grid.getState();
        allCells.slice(0, 3).forEach(({ row, col }) => {
            const shouldBeBlackedOut = !validCells.has(`${col},${row}`);
            this.grid.showPeek(row, col, !shouldBeBlackedOut);
        });

        if (this.peekTimeout) {
            window.clearTimeout(this.peekTimeout);
        }

        this.peekTimeout = window.setTimeout(() => {
            this.grid.hidePeek();
            this.isPeeking = false;
        }, 2000);

        console.log('Peek handled.');
    }
}
