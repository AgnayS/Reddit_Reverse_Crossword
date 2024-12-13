import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

(async () => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a crossword puzzle theme and clue generator.",
        },
        {
          role: "user",
          content: `Generate a crossword puzzle theme with 10 words and their corresponding clues in JSON format. Example format:
          {
            "theme": "Animals",
            "words": ["Cat", "Dog", "Elephant"],
            "clues": {
              "Cat": "A small domesticated carnivorous mammal.",
              "Dog": "A domesticated carnivorous mammal with a bark."
            }
          }`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Safely access the content
    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned by OpenAI API");
    }

    // Parse the JSON response
    const result = JSON.parse(content);
    console.log("Crossword Puzzle Data (Parsed):");
    console.log(result);

    // Example: Access individual properties
    console.log("\nTheme:", result.theme);
    console.log("Words:", result.words);
    console.log("Clues:", result.clues);
  } catch (error) {
    console.error("Error fetching crossword data:", error);
  }
})();
