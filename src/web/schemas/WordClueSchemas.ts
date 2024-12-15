export const WordCluesSchema = {
  type: "object",
  properties: {
      theme: { type: "string" },
      words: { type: "array", items: { type: "string" } },
      clues: { type: "object", additionalProperties: { type: "string" } },
  },
  required: ["theme", "words", "clues"],
  additionalProperties: false,
};
