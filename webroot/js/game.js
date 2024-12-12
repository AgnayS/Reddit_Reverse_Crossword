import { PuzzleConfig, PuzzleGenerator } from './generator.js';
import { getDailyTheme } from './themes.js';

class DarkWordGame {
    constructor() {
        // Get DOM elements
        this.grid = document.getElementById("grid");
        this.submitBtn = document.getElementById("submit-btn");
        this.resetBtn = document.getElementById("reset-btn");
        this.peekBtn = document.getElementById("peek-btn");
        this.peeksLeftSpan = document.getElementById("peeks-left");
        this.message = document.getElementById("message");
        this.themeDisplay = document.getElementById("theme-display");
        this.cluesSection = document.getElementById("clues-section");
        
        // Game state
        this.peeksLeft = 3;
        this.peekTimeout = null;
        this.isPeeking = false;
        
        // Get today's puzzle
        this.theme = getDailyTheme();
        const config = new PuzzleConfig(7, 7);
        const generator = new PuzzleGenerator(config);
        const puzzle = generator.generate(this.theme.words);
        
        // Store puzzle state
        this.puzzleGrid = puzzle.grid;
        this.words = puzzle.words;
        this.blackedOutCells = Array(7).fill().map(() => Array(7).fill(false));
        this.validCells = this.getValidCells();
        
        this.initializeGame();
        this.setupEventListeners();
        this.updatePeekButton();
    }

    getValidCells() {
        const validCells = new Set();
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

    initializeGame() {
        // Set theme display
        this.themeDisplay.textContent = `Today's theme: ${this.theme.name}`;

        // Create grid cells
        this.grid.innerHTML = ''; // Clear any existing cells
        this.puzzleGrid.forEach((row, rowIndex) => {
            row.forEach((letter, colIndex) => {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.textContent = letter;
                cell.dataset.row = rowIndex;
                cell.dataset.col = colIndex;
                this.grid.appendChild(cell);
            });
        });

        // Create clues list
        this.cluesSection.innerHTML = '<h3>Clues</h3><div id="clues-list"></div>';
        const cluesList = document.getElementById("clues-list");

        // Create clues from successfully placed words
        const usedClues = this.words.map((wordInfo, index) => {
            const clue = this.theme.clues[wordInfo.word];
            if (!clue) return null;

            const clueElement = document.createElement("div");
            clueElement.className = "clue-item";
            clueElement.textContent = `• ${clue}`;
            clueElement.dataset.word = wordInfo.word;
            
            // Add hover effect to highlight word
            clueElement.addEventListener('mouseenter', () => this.highlightWord(wordInfo));
            clueElement.addEventListener('mouseleave', () => this.unhighlightWord(wordInfo));
            
            return clueElement;
        }).filter(clue => clue !== null);

        // Randomize clue order
        for (let i = usedClues.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [usedClues[i], usedClues[j]] = [usedClues[j], usedClues[i]];
        }

        // Add clues to the list
        usedClues.forEach(clue => cluesList.appendChild(clue));
    }

    highlightWord(wordInfo) {
        const { word, startX, startY, isVertical } = wordInfo;
        for (let i = 0; i < word.length; i++) {
            const x = isVertical ? startX : startX + i;
            const y = isVertical ? startY + i : startY;
            const cell = this.getCellElement(x, y);
            if (cell && !cell.classList.contains('blackout')) {
                cell.style.backgroundColor = '#e6f3ff';
            }
        }
    }

    unhighlightWord(wordInfo) {
        const { word, startX, startY, isVertical } = wordInfo;
        for (let i = 0; i < word.length; i++) {
            const x = isVertical ? startX : startX + i;
            const y = isVertical ? startY + i : startY;
            const cell = this.getCellElement(x, y);
            if (cell) {
                cell.style.backgroundColor = cell.classList.contains('blackout') ? '#1a1a1a' : 'white';
            }
        }
    }

    getCellElement(x, y) {
        return document.querySelector(`[data-row="${y}"][data-col="${x}"]`);
    }

    setupEventListeners() {
        // Cell click handler
        this.grid.addEventListener("click", (e) => {
            if (e.target.classList.contains("cell")) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.toggleCell(e.target, row, col);
            }
        });

        // Button handlers
        this.submitBtn.addEventListener("click", () => this.checkSolution());
        this.resetBtn.addEventListener("click", () => this.resetGrid());
        this.peekBtn.addEventListener("click", () => this.handlePeek());
    }

    handlePeek() {
        if (this.peeksLeft <= 0 || this.isPeeking) return;
        
        this.isPeeking = true;
        this.peeksLeft--;
        this.updatePeekButton();

        // Get random cells that should be revealed
        const allCells = [...Array(7)].flatMap((_, row) => 
            [...Array(7)].map((_, col) => ({row, col}))
        );
        
        // Shuffle cells
        for (let i = allCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
        }

        // Show hints for 3 random cells
        allCells.slice(0, 3).forEach(({row, col}) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                const shouldBeBlackedOut = !this.validCells.has(`${col},${row}`);
                cell.classList.add('peek');
                cell.style.backgroundColor = shouldBeBlackedOut ? '#ffd700' : '#90EE90';
            }
        });

        // Remove peek effect after 2 seconds
        if (this.peekTimeout) {
            clearTimeout(this.peekTimeout);
        }
        this.peekTimeout = setTimeout(() => {
            document.querySelectorAll('.cell.peek').forEach(cell => {
                cell.classList.remove('peek');
                cell.style.backgroundColor = cell.classList.contains('blackout') ? '#1a1a1a' : 'white';
            });
            this.isPeeking = false;
        }, 2000);
    }

    updatePeekButton() {
        this.peeksLeftSpan.textContent = this.peeksLeft;
        if (this.peeksLeft <= 0) {
            this.peekBtn.disabled = true;
        }
    }

    toggleCell(cell, row, col) {
        cell.classList.toggle("blackout");
        this.blackedOutCells[row][col] = !this.blackedOutCells[row][col];
        cell.style.backgroundColor = cell.classList.contains('blackout') ? '#1a1a1a' : 'white';
        this.message.className = "message";
    }

    checkSolution() {
        let isCorrect = true;
        
        // Check each cell
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                const isValidCell = this.validCells.has(`${col},${row}`);
                const isBlackedOut = this.blackedOutCells[row][col];
                
                // Cell should be blacked out if and only if it's not part of a valid word
                if (isValidCell === isBlackedOut) {
                    isCorrect = false;
                    break;
                }
            }
            if (!isCorrect) break;
        }

        // Show result message
        this.message.className = `message ${isCorrect ? 'success' : 'error'}`;
        this.message.textContent = isCorrect 
            ? "Congratulations! You've revealed the hidden crossword!" 
            : "Not quite right. Keep trying!";

        // Mark solved clues if correct
        if (isCorrect) {
            document.querySelectorAll('.clue-item').forEach(clue => {
                clue.classList.add('solved');
            });
        }
    }

    resetGrid() {
        this.blackedOutCells = Array(7).fill().map(() => Array(7).fill(false));
        document.querySelectorAll(".cell").forEach(cell => {
            cell.classList.remove("blackout");
            cell.style.backgroundColor = 'white';
        });
        document.querySelectorAll('.clue-item').forEach(clue => {
            clue.classList.remove('solved');
        });
        this.message.className = "message";
    }
}

// Start the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new DarkWordGame();
});