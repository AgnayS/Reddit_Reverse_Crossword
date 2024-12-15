import { WordCluesResponse } from "./types.tsx";

export async function fetchWordsAndClues(): Promise<WordCluesResponse> {
    try {
        const response = await fetch("https://vercel-darkword-backend.vercel.app/api/handler");
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            theme: data.theme,
            words: data.words,
            clues: Object.keys(data.clues).reduce((acc, key) => {
                acc[key.toUpperCase()] = data.clues[key];
                return acc;
            }, {} as Record<string, string>),
        };
    } catch (error) {
        console.error("Error fetching words and clues:", error);
        throw error;
    }
}
