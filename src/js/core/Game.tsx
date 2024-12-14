// src/js/core/Game.tsx
import { PuzzleGenerator } from '../utils/PuzzleGenerator.tsx';
import type { Theme, WordInfo } from '../utils/types.tsx';
import { fetchWordsAndClues } from '../utils/WordFetcher.tsx';

export class Game {
    private puzzleGrid: string[][] = [];
    private words: WordInfo[] = [];
    private blackedOutCells: boolean[][] = Array(7).fill().map(() => Array(7).fill(false));
    private validCells: Set<string> = new Set();
    private peeksLeft: number = 3;
    private isPeeking: boolean = false;
    private peekTimeout: number | null = null;
    private theme: Theme | null = null;
    private initialPuzzle: { grid: string[][]; words: WordInfo[] } | null = null;
    private startTime: number | null = null;
    private timerInterval: number | null = null;
    private peekCooldown: boolean = false;

    constructor() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    private async init(): Promise<void> {
        try {
            await this.setupTheme();
            this.setupUIElements();
            this.generatePuzzle();
            this.renderGame();
            this.updatePeekButton();
            this.startTimer();
        } catch (error) {
            console.error("Error initializing game:", error);
            this.showError("Failed to load the game. Please try refreshing the page.");
        }
    }

    private async setupTheme(): Promise<void> {
        try {
            const response = await fetchWordsAndClues();
            this.theme = {
                name: response.theme,
                words: response.words,
                clues: response.clues
            };
        } catch (error) {
            console.error("Error fetching theme:", error);
            throw error;
        }
    }

    private startTimer(): void {
        this.startTime = Date.now();
        
        if (this.timerInterval) {
            window.clearInterval(this.timerInterval);
        }

        this.timerInterval = window.setInterval(() => {
            this.updateTimerDisplay();
        }, 1000);

        this.updateTimerDisplay();
    }

    private updateTimerDisplay(): void {
        const timerElement = document.getElementById('timer');
        if (!timerElement || !this.startTime) return;

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        timerElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    private stopTimer(): void {
        if (this.timerInterval) {
            window.clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    private resetTimer(): void {
        this.stopTimer();
        this.startTimer();
    }

    private setupUIElements(): void {
        const grid = document.getElementById("grid");
        const submitBtn = document.getElementById("submit-btn");
        const resetBtn = document.getElementById("reset-btn");
        const peekBtn = document.getElementById("peek-btn");
        const peeksLeftSpan = document.getElementById("peeks-left");
        const message = document.getElementById("message");
        const themeDisplay = document.getElementById("theme-display");
        const cluesSection = document.getElementById("clues-section");

        if (!grid || !submitBtn || !resetBtn || !peekBtn || !peeksLeftSpan || 
            !message || !themeDisplay || !cluesSection) {
            console.error("Required DOM elements not found");
            return;
        }

        submitBtn.addEventListener("click", () => this.checkSolution());
        resetBtn.addEventListener("click", () => this.resetGrid());
        peekBtn.addEventListener("click", () => this.handlePeek());
        grid.addEventListener("click", (e) => this.handleCellClick(e));
    }

    private generatePuzzle(): void {
        if (!this.theme) return;

        if (!this.initialPuzzle) {
            const generator = new PuzzleGenerator(7, 7);
            this.initialPuzzle = generator.generate(this.theme.words);
        }

        this.puzzleGrid = this.initialPuzzle.grid.map(row => [...row]);
        this.words = [...this.initialPuzzle.words];
        this.validCells = this.getValidCells();
        this.blackedOutCells = Array(7).fill().map(() => Array(7).fill(false));
    }

    private getValidCells(): Set<string> {
        const validCells = new Set<string>();
        this.words.forEach(wordInfo => {
            const { word, startX, startY, isVertical } = wordInfo;
            for (let i = 0; i < word.length; i++) {
                const x = isVertical ? startX : startX + i;
                const y = isVertical ? startY + i : startY;
                validCells.add(`${x},${y}`);
            }
        });
        return validCells;
    }

    private renderGame(): void {
        this.renderGrid();
        this.renderClues();
        this.renderTheme();
    }

    private renderGrid(): void {
        const grid = document.getElementById("grid");
        if (!grid) return;

        grid.innerHTML = '';
        this.puzzleGrid.forEach((row, rowIndex) => {
            row.forEach((letter, colIndex) => {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.textContent = letter;
                cell.dataset.row = rowIndex.toString();
                cell.dataset.col = colIndex.toString();
                if (this.blackedOutCells[rowIndex][colIndex]) {
                    cell.classList.add("blackout");
                }
                grid.appendChild(cell);
            });
        });
    }

    private renderClues(): void {
        const cluesList = document.getElementById("clues-list");
        if (!cluesList || !this.theme) return;

        cluesList.innerHTML = '';
        this.words.forEach(wordInfo => {
            const clue = this.theme?.clues[wordInfo.word];
            if (!clue) return;

            const clueElement = document.createElement("div");
            clueElement.className = "clue-item";
            clueElement.textContent = `• ${clue}`;
            clueElement.dataset.word = wordInfo.word;
            
            clueElement.addEventListener('mouseenter', () => this.highlightWord(wordInfo));
            clueElement.addEventListener('mouseleave', () => this.unhighlightWord(wordInfo));
            
            cluesList.appendChild(clueElement);
        });
    }

    private renderTheme(): void {
        const themeDisplay = document.getElementById("theme-display");
        if (!themeDisplay || !this.theme) return;
        themeDisplay.textContent = `Today's theme: ${this.theme.name}`;
    }

    private handleCellClick(e: Event): void {
        const cell = e.target as HTMLElement;
        if (!cell.classList.contains("cell")) return;

        const row = parseInt(cell.dataset.row || "0");
        const col = parseInt(cell.dataset.col || "0");
        
        this.toggleCell(cell, row, col);
        this.clearMessage();
    }

    private toggleCell(cell: HTMLElement, row: number, col: number): void {
        cell.classList.toggle("blackout");
        this.blackedOutCells[row][col] = !this.blackedOutCells[row][col];
    }

    private handlePeek(): void {
        if (this.peeksLeft <= 0 || this.isPeeking || this.peekCooldown) return;
        
        this.isPeeking = true;
        this.peeksLeft--;
        this.peekCooldown = true;
        this.updatePeekButton();
    
        const incorrectCells = [];
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                const shouldBeBlackedOut = !this.validCells.has(`${col},${row}`);
                if (shouldBeBlackedOut && !this.blackedOutCells[row][col]) {
                    incorrectCells.push({row, col});
                }
            }
        }
    
        for (let i = incorrectCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [incorrectCells[i], incorrectCells[j]] = [incorrectCells[j], incorrectCells[i]];
        }
    
        const cellsToShow = incorrectCells.slice(0, 3);
        cellsToShow.forEach(({row, col}) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`) as HTMLElement;
            if (cell) {
                cell.classList.add('peek', 'hint-blackout');
            }
        });
    
        if (this.peekTimeout) {
            clearTimeout(this.peekTimeout);
        }
    
        this.peekTimeout = window.setTimeout(() => {
            document.querySelectorAll('.cell.peek').forEach(cell => {
                cell.classList.remove('peek', 'hint-blackout');
            });
            this.isPeeking = false;
            
            setTimeout(() => {
                this.peekCooldown = false;
                this.updatePeekButton();
            }, 2000);
        }, 2000);
    }
    
    private updatePeekButton(): void {
        const peeksLeftSpan = document.getElementById("peeks-left");
        const peekBtn = document.getElementById("peek-btn");
        
        if (peeksLeftSpan) {
            peeksLeftSpan.textContent = this.peeksLeft.toString();
        }
        
        if (peekBtn) {
            if (this.peeksLeft <= 0) {
                peekBtn.disabled = true;
                peekBtn.textContent = 'No Peeks Left';
            } else if (this.isPeeking || this.peekCooldown) {
                peekBtn.disabled = true;
                peekBtn.innerHTML = `Peek (${this.peeksLeft}) <span class="cooldown"></span>`;
            } else {
                peekBtn.disabled = false;
                peekBtn.textContent = `Peek (${this.peeksLeft})`;
            }
        }
    }

    private checkSolution(): void {
        let isCorrect = true;
        
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                const shouldBeBlackedOut = !this.validCells.has(`${col},${row}`);
                const isBlackedOut = this.blackedOutCells[row][col];
                
                if (shouldBeBlackedOut !== isBlackedOut) {
                    isCorrect = false;
                }
            }
        }
    
        this.showSolutionFeedback(isCorrect);
    }

    private showSolutionFeedback(isCorrect: boolean): void {
        const message = document.getElementById("message");
        if (message) {
            message.className = `message ${isCorrect ? 'success' : 'error'}`;
            message.textContent = isCorrect 
                ? "Congratulations! You've revealed the hidden crossword!" 
                : "Not quite right. Keep trying!";
        }

        const grid = document.getElementById("grid");
        if (!grid) return;

        grid.querySelectorAll('.cell').forEach((cell: Element) => {
            const cellElement = cell as HTMLElement;
            const row = parseInt(cellElement.dataset.row || '0');
            const col = parseInt(cellElement.dataset.col || '0');
            const shouldBeBlackedOut = !this.validCells.has(`${col},${row}`);
            const isBlackedOut = cellElement.classList.contains('blackout');

            cellElement.classList.remove('correct-cell', 'incorrect-cell');

            if (isCorrect) {
                if (shouldBeBlackedOut) {
                    cellElement.classList.add('solution-blackout');
                } else {
                    cellElement.classList.add('solution-word');
                }
            } else {
                if (shouldBeBlackedOut === isBlackedOut) {
                    cellElement.classList.add('correct-cell');
                } else {
                    cellElement.classList.add('incorrect-cell');
                }
            }
        });

        if (isCorrect) {
            document.querySelectorAll('.clue-item').forEach(clue => {
                clue.classList.add('solved');
            });
            this.stopTimer();
        }
    }

    private resetGrid(): void {
        this.blackedOutCells = Array(7).fill().map(() => Array(7).fill(false));
        
        document.querySelectorAll(".cell").forEach(cell => {
            cell.classList.remove("blackout", "peek");
        });
        document.querySelectorAll('.clue-item').forEach(clue => {
            clue.classList.remove('solved');
        });
        
        this.clearMessage();
    }

    private clearMessage(): void {
        const message = document.getElementById("message");
        if (message) {
            message.className = "message";
            message.textContent = "";
        }
    }

    private showError(message: string): void {
        const messageElement = document.getElementById("message");
        if (messageElement) {
            messageElement.className = "message error";
            messageElement.textContent = message;
        }
    }

    private highlightWord(wordInfo: WordInfo): void {
        const { word, startX, startY, isVertical } = wordInfo;
        for (let i = 0; i < word.length; i++) {
            const x = isVertical ? startX : startX + i;
            const y = isVertical ? startY + i : startY;
            const cell = document.querySelector(`[data-row="${y}"][data-col="${x}"]`);
            if (cell && !cell.classList.contains('blackout')) {
                cell.classList.add('highlight');
            }
        }
    }

    private unhighlightWord(wordInfo: WordInfo): void {
        const { word, startX, startY, isVertical } = wordInfo;
        for (let i = 0; i < word.length; i++) {
            const x = isVertical ? startX : startX + i;
            const y = isVertical ? startY + i : startY;
            const cell = document.querySelector(`[data-row="${y}"][data-col="${x}"]`);
            if (cell) {
                cell.classList.remove('highlight');
            }
        }
    }
}