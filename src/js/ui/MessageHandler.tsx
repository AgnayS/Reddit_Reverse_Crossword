import React from 'react';

export class MessageHandler {
    private element: HTMLDivElement | null;

    constructor() {
        this.element = document.querySelector<HTMLDivElement>('#message');
    }

    public showSuccess(message: string = "Congratulations! You've revealed the hidden crossword!"): void {
        if (!this.element) return;
        this.element.className = 'message success';
        this.element.textContent = message;
    }

    public showError(message: string = "Not quite right. Keep trying!"): void {
        if (!this.element) return;
        this.element.className = 'message error';
        this.element.textContent = message;
    }

    public clear(): void {
        if (!this.element) return;
        this.element.className = 'message';
        this.element.textContent = '';
    }
}