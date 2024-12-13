import OpenAI from "openai";
import { WordCluesResponse } from "./types.tsx";

const openai = new OpenAI({
    apiKey: "",
    dangerouslyAllowBrowser: true, // Temporarily allow browser usage
});

export async function fetchWordsAndClues(): Promise<WordCluesResponse> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an advanced crossword puzzle generator. Generate unique themes with 15 words and clues for each word, formatted strictly as JSON.",
                },
                {
                    role: "user",
                    content: `Generate a unique crossword puzzle theme with 15 words and their corresponding clues. Prioritize words between 4-7 letters. The output should strictly follow this format:

{
  "theme": "<unique theme>",
  "words": [
    { "word": "<word1>", "clue": "<clue1>" },
    { "word": "<word2>", "clue": "<clue2>" },
    ...
    { "word": "<word15>", "clue": "<clue15>" }
  ]
}`,
                },
            ],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        console.log("Raw API Response:", content);

        if (!content) {
            throw new Error("No content returned by OpenAI API");
        }

        const rawResult = JSON.parse(content);

        const result: WordCluesResponse = {
            theme: rawResult.theme,
            words: rawResult.words.map((entry: { word: string; clue: string }) => entry.word),
            clues: rawResult.words.reduce((acc: Record<string, string>, entry: { word: string; clue: string }) => {
                acc[entry.word.toUpperCase()] = entry.clue; // Convert keys to uppercase
                return acc;
            }, {}),
        };

        console.log("Parsed WordCluesResponse:", result);

        return result;
    } catch (error) {
        console.error("Error fetching words and clues:", error);
        throw error;
    }
}
