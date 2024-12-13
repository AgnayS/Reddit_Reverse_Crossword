import React from 'react';
import type { WordInfo } from '../utils/types.tsx';

export class ClueManager {
    private element: HTMLDivElement | null;

    constructor() {
        this.element = document.querySelector<HTMLDivElement>('#clues-list');
    }

    public initialize(words: WordInfo[], clues: { [key: string]: string }): void {
        if (!this.element) return;

        this.element.innerHTML = '';
        words.forEach(wordInfo => {
            const clue = clues[wordInfo.word];
            if (!clue) return;

            const clueWrapper = document.createElement('div');
            clueWrapper.className = 'clue-item';

            const clueText = document.createElement('div');
            clueText.textContent = `• ${clue}`;
            clueText.className = 'clue-text';

            clueWrapper.appendChild(clueText);
            this.element?.appendChild(clueWrapper);
        });
    }

    public markAllSolved(): void {
        document.querySelectorAll<HTMLElement>('.clue-item').forEach(clue => {
            clue.classList.add('solved');
        });
    }

    public reset(): void {
        document.querySelectorAll<HTMLElement>('.clue-item').forEach(clue => {
            clue.classList.remove('solved');
        });
    }
}