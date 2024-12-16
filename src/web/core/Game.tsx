import { PuzzleGenerator } from '../utils/PuzzleGenerator.tsx';
import type { Theme, WordInfo } from '../utils/types.tsx';
import { fetchWordsAndClues } from '../utils/WordFetcher.tsx';

const GRID_WIDTH = 7;
const GRID_HEIGHT = 7;

interface Score {
    username: string;
    time: string;
    score: number;
    date: string;
}

interface GameUser {
    username: string;
    lastPlayedDate?: string;
    highScore?: number;
}

export class Game {
    private puzzleGrid: string[][] = [];
    private words: WordInfo[] = [];
    private blackedOutCells: boolean[][];
    private validCells: Set<string> = new Set();
    private peeksLeft: number = 3;
    private isPeeking: boolean = false;
    private peekTimeout: number | null = null;
    private theme: Theme | null = null;
    private initialPuzzle: { grid: string[][]; words: WordInfo[] } | null = null;
    private startTime: number | null = null;
    private timerInterval: number | null = null;
    private peekCooldown: boolean = false;
    private currentUser: GameUser;

    constructor() {
        this.currentUser = {
            username: 'guest'
        };
        this.blackedOutCells = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(false));

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
        const response = await fetchWordsAndClues();
        this.theme = {
            name: response.theme,
            words: response.words,
            clues: response.clues
        };
    }

    private saveScore(time: string, score: number): void {
        const existingScores = JSON.parse(localStorage.getItem('darkword_scores') || '[]');
        const newScore = {
            username: this.currentUser.username,
            time,
            score,
            date: new Date().toISOString()
        };
        existingScores.push(newScore);
        localStorage.setItem('darkword_scores', JSON.stringify(existingScores));
    }

    private calculateScore(time: number, mistakes: number): number {
        const baseScore = 100;
        const timeMultiplier = Math.max(0, 1 - (time / 300)); // 5 minutes max
        const mistakePenalty = mistakes * 5;
        return Math.max(0, Math.round(baseScore * timeMultiplier - mistakePenalty));
    }

    private startTimer(): void {
        this.startTime = Date.now();
        
        if (this.timerInterval !== null) {
            window.clearInterval(this.timerInterval);
        }

        this.timerInterval = window.setInterval(() => {
            this.updateTimerDisplay();
        }, 1000);

        this.updateTimerDisplay();
    }

    private updateTimerDisplay(): void {
        const timerElement = document.getElementById('timer');
        if (!timerElement || this.startTime === null) return;

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        timerElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    private stopTimer(): void {
        if (this.timerInterval !== null) {
            window.clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    private setupUIElements(): void {
        const grid = document.getElementById("grid");
        const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement | null;
        const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement | null;
        const peekBtn = document.getElementById("peek-btn") as HTMLButtonElement | null;

        if (!grid || !submitBtn || !resetBtn || !peekBtn) {
            console.error("Required DOM elements not found");
            return;
        }

        const newGrid = grid.cloneNode(true);
    grid.parentNode?.replaceChild(newGrid, grid);

    // Add the click handler to the new grid
    newGrid.addEventListener("click", (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const cellElement = target.closest(".cell");
        
        if (!cellElement) return;
        
        // Prevent event bubbling
        e.stopPropagation();
        
        const row = parseInt(cellElement.getAttribute("data-row") || "0", 10);
        const col = parseInt(cellElement.getAttribute("data-col") || "0", 10);

        // Add debug logging
        console.log(`Click on cell ${row},${col}`);
        console.log(`Current state before toggle:`, this.blackedOutCells[row][col]);
        
        this.toggleCell(cellElement as HTMLElement, row, col);
        this.clearMessage();
    });

        submitBtn.addEventListener("click", () => this.checkSolution());
        resetBtn.addEventListener("click", () => this.resetGrid());
        peekBtn.addEventListener("click", () => this.handlePeek());
    }

    private renderGrid(): void {
        const grid = document.getElementById("grid");
        if (!grid) return;
    
        grid.innerHTML = '';
        this.puzzleGrid.forEach((row, rowIndex) => {
            row.forEach((letter, colIndex) => {
                const cell = document.createElement("div");
                cell.className = "cell";
                const letterSpan = document.createElement("span");
                letterSpan.textContent = letter;
                letterSpan.className = "select-none";
                cell.appendChild(letterSpan);
                
                cell.dataset.row = rowIndex.toString();
                cell.dataset.col = colIndex.toString();
                if (this.blackedOutCells[rowIndex][colIndex]) {
                    cell.classList.add("blackout");
                }
                grid.appendChild(cell);
            });
        });
    }

    private generatePuzzle(): void {
        if (!this.theme) return;

        if (!this.initialPuzzle) {
            const generator = new PuzzleGenerator(GRID_WIDTH, GRID_HEIGHT);
            this.initialPuzzle = generator.generate(this.theme.words);
        }

        this.puzzleGrid = this.initialPuzzle.grid.map(row => [...row]);
        this.words = [...this.initialPuzzle.words];
        this.validCells = this.getValidCells();
        this.blackedOutCells = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(false));
    }

    private getValidCells(): Set<string> {
        const valid = new Set<string>();
        this.words.forEach(wordInfo => {
            const { word, startX, startY, isVertical } = wordInfo;
            for (let i = 0; i < word.length; i++) {
                const x = isVertical ? startX : startX + i;
                const y = isVertical ? startY + i : startY;
                valid.add(`${x},${y}`);
            }
        });
        return valid;
    }

    private renderGame(): void {
        this.renderGrid();
        this.renderClues();
        this.renderTheme();
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
    
            cluesList.appendChild(clueElement);
        });
    }

    private renderTheme(): void {
        const themeDisplay = document.getElementById("theme-display");
        if (!themeDisplay || !this.theme) return;
        themeDisplay.textContent = `Today's theme: ${this.theme.name}`;
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

        const incorrectCells: { row: number, col: number }[] = [];
        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                const shouldBeBlackedOut = !this.validCells.has(`${col},${row}`);
                if (shouldBeBlackedOut && !this.blackedOutCells[row][col]) {
                    incorrectCells.push({ row, col });
                }
            }
        }

        // Shuffle incorrect cells
        for (let i = incorrectCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [incorrectCells[i], incorrectCells[j]] = [incorrectCells[j], incorrectCells[i]];
        }

        const cellsToShow = incorrectCells.slice(0, 3);
        cellsToShow.forEach(({ row, col }) => {
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
        const peekBtn = document.getElementById("peek-btn") as HTMLButtonElement | null;

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

        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                const shouldBeBlackedOut = !this.validCells.has(`${col},${row}`);
                const isBlackedOut = this.blackedOutCells[row][col];
                if (shouldBeBlackedOut !== isBlackedOut) {
                    isCorrect = false;
                    break;
                }
            }
            if (!isCorrect) break;
        }

        this.showSolutionFeedback(isCorrect);
    }

    private showSolutionFeedback(isCorrect: boolean): void {
        const message = document.getElementById("message");
        if (!message) return;

        message.className = `message ${isCorrect ? 'success' : 'error'}`;
        message.textContent = isCorrect
            ? "Congratulations! That's correct!"
            : "Not quite right. Keep trying!";

        if (isCorrect) {
            this.stopTimer();
            if (this.startTime !== null) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const score = this.calculateScore(elapsed, 0);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                const timeStr = `${minutes}:${seconds}`;
                this.saveScore(timeStr, score);
            }
        }
    }

    private resetGrid(): void {
        this.blackedOutCells = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(false));
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            cell.classList.remove("blackout", "peek", "hint-blackout");
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

    private showError(msg: string): void {
        const messageElement = document.getElementById("message");
        if (messageElement) {
            messageElement.className = "message error";
            messageElement.textContent = msg;
        }
    }

}
