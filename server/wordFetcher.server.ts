// server/wordFetcher.server.ts

interface WordCluesResponse {
    theme: string;
    words: string[];
    clues: Record<string, string>;
}

// Mock data for development and testing
/* const MOCK_DATA: WordCluesResponse = {
    theme: "nature",
    words: [
        "FOREST",
        "MOUNTAi",
        "RIVER",
        "OCEAN",
        "PLANTS",
        "ANIMALS",
        "WILLOW",
        "BLOOMS",
        "MEADOW",
        "CREEK",
        "MOSS",
        "FROST",
        "SEDGE",
        "FLIGHT",
        "RAVINE"
    ],
    clues: {
        "FOREST": "Large area covered chiefly with trees",
        "MOUNTAi": "Large natural elevation of the earth's surface",
        "RIVER": "Large natural stream of water",
        "OCEAN": "Vast body of saltwater",
        "PLANTS": "Living organisms that grow typically in soil",
        "ANIMALS": "Living creatures that are not plants",
        "WILLOW": "A type of tree with long branches",
        "BLOOMS": "Flowers produced by plants",
        "MEADOW": "Land that is covered with grass and often wildflowers",
        "CREEK": "A small stream",
        "MOSS": "A small green plant that grows in damp places",
        "FROST": "Thin layer of ice crystals",
        "SEDGE": "Grass-like plant found in wetlands",
        "FLIGHT": "Act of flying",
        "RAVINE": "Deep, narrow gorge with steep sides"
    }
}; */

export async function fetchWordsAndClues(): Promise<WordCluesResponse> {
    // TODO: Once domain is allowlisted, uncomment the real fetch code
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

    // Return mock data for testing
    // return Promise.resolve(MOCK_DATA);
}