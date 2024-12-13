export interface WordInfo {
    word: string;
    startX: number;
    startY: number;
    isVertical: boolean;
    length: number;
}

export interface Theme {
    name: string;
    words: string[];
    clues: { [key: string]: string };
}

export interface PuzzleResult {
    grid: string[][];
    words: WordInfo[];
}

export interface GameState {
    blackedOutCells: boolean[][];
    validCells: Set<string>;
}

export interface UIElements {
    grid: HTMLDivElement | null;
    timer: HTMLDivElement | null;
    cluesList: HTMLDivElement | null;
    message: HTMLDivElement | null;
    peeksLeftSpan: HTMLSpanElement | null;
    themeDisplay: HTMLDivElement | null;
    submitBtn: HTMLButtonElement | null;
    resetBtn: HTMLButtonElement | null;
    peekBtn: HTMLButtonElement | null;
}