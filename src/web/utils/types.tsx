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

export interface WordCluesResponse {
    theme: string;
    words: string[];
    clues: Record<string, string>;
}

export interface PuzzleResult {
    grid: string[][];
    words: WordInfo[];
}

export interface UIElements {
    grid: HTMLDivElement | null;
    timer: HTMLDivElement | null;
    cluesList: HTMLDivElement | null;
    message: HTMLDivElement | null;
    themeDisplay: HTMLDivElement | null;
    submitBtn: HTMLButtonElement | null;
    resetBtn: HTMLButtonElement | null;
    peekBtn: HTMLButtonElement | null;
}
