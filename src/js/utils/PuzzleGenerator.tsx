import React from 'react';
import { WordInfo, PuzzleResult } from './types.tsx';

export class PuzzleConfig {
    constructor(
        public width: number = 7,
        public height: number = 7,
        public wrapping: boolean = false
    ) {}
}

export class PuzzleGenerator {
    private chars: string[];
    private words: Set<WordInfo>;
    private usedCells: Set<string>;

    constructor(private config: PuzzleConfig) {
        this.chars = new Array(config.width * config.height).fill(' ');
        this.words = new Set();
        this.usedCells = new Set();
    }

    private toIndex(x: number, y: number): number {
        return y * this.config.width + (x % this.config.width);
    }

    private getChar(x: number, y: number): string {
        if (y < 0 || y >= this.config.height || 
            (!this.config.wrapping && (x < 0 || x >= this.config.width))) {
            return ' ';
        }
        return this.chars[this.toIndex(x, y)];
    }

    private setChar(x: number, y: number, char: string): void {
        if (y >= 0 && y < this.config.height &&
            x >= 0 && x < this.config.width) {
            this.chars[this.toIndex(x, y)] = char;
            if (char !== ' ') {
                this.usedCells.add(`${x},${y}`);
            }
        }
    }

    private fits(word: string, vertical: boolean, x: number, y: number): boolean {
        let connected = this.words.size === 0;
        
        if (vertical && y + word.length > this.config.height) return false;
        if (!vertical && x + word.length > this.config.width) return false;
        
        for (let i = 0; i < word.length; i++) {
            const locX = vertical ? x : x + i;
            const locY = vertical ? y + i : y;
            const existing = this.getChar(locX, locY);
            
            const same = existing === word[i];
            const isEmpty = existing === ' ';
            
            if (!(same || isEmpty)) return false;
            if (same) connected = true;
            
            if (isEmpty) {
                const hasAdjacentLetter = 
                    (vertical && (this.getChar(locX - 1, locY) !== ' ' || this.getChar(locX + 1, locY) !== ' ')) ||
                    (!vertical && (this.getChar(locX, locY - 1) !== ' ' || this.getChar(locX, locY + 1) !== ' '));
                
                if (hasAdjacentLetter) return false;
            }
        }

        return connected;
    }

    private placeWord(word: string, x: number, y: number, vertical: boolean): void {
        for (let i = 0; i < word.length; i++) {
            const locX = vertical ? x : x + i;
            const locY = vertical ? y + i : y;
            this.setChar(locX, locY, word[i]);
        }
        
        this.words.add({
            word,
            startX: x,
            startY: y,
            isVertical: vertical,
            length: word.length
        });
    }

    private fillWithRandomLetters(): void {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                if (!this.usedCells.has(`${x},${y}`)) {
                    const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
                    this.setChar(x, y, randomLetter);
                }
            }
        }
    }

    private getGrid(): string[][] {
        const grid: string[][] = [];
        for (let y = 0; y < this.config.height; y++) {
            const row: string[] = [];
            for (let x = 0; x < this.config.width; x++) {
                row.push(this.chars[this.toIndex(x, y)]);
            }
            grid.push(row);
        }
        return grid;
    }

    generate(words: string[]): PuzzleResult {
        words = [...words].sort((a, b) => b.length - a.length);
        
        const firstWord = words[0];
        const startX = Math.floor((this.config.width - firstWord.length) / 2);
        const startY = Math.floor(this.config.height / 2);
        this.placeWord(firstWord, startX, startY, false);

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            let placed = false;

            for (let x = 0; x < this.config.width && !placed; x++) {
                for (let y = 0; y < this.config.height && !placed; y++) {
                    if (this.fits(word, true, x, y)) {
                        this.placeWord(word, x, y, true);
                        placed = true;
                    }
                }
            }

            if (!placed) {
                for (let y = 0; y < this.config.height && !placed; y++) {
                    for (let x = 0; x < this.config.width && !placed; x++) {
                        if (this.fits(word, false, x, y)) {
                            this.placeWord(word, x, y, false);
                            placed = true;
                        }
                    }
                }
            }
        }

        this.fillWithRandomLetters();

        return {
            grid: this.getGrid(),
            words: Array.from(this.words)
        };
    }
}