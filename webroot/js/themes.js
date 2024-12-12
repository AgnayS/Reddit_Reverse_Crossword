const THEMES = [
  {
    name: "Ocean Life",
    // Provide more words than needed - generator will use what fits best
    words: [
      "WHALE", "CORAL", "SHARK", "FISH", "WAVES", "DEEP", "BLUE",
      "SEAL", "SWIM", "REEF", "TIDE", "SAND", "SHIP"
    ],
    // Object mapping for clues so we only need clues for words that get used
    clues: {
      "WHALE": "I'm the giant of the seas, with songs that travel miles",
      "CORAL": "I'm a living rainbow beneath the waves, building homes for many",
      "SHARK": "Fear my fin cutting through water, though I'm often misunderstood",
      "FISH": "Scales and fins help me glide through currents",
      "WAVES": "I dance on the surface, pushed by winds from afar",
      "DEEP": "Where light struggles to reach and pressure builds",
      "BLUE": "The color that dominates our planet from space",
      "SEAL": "Playful swimmer, master of both land and sea",
      "SWIM": "How creatures move through liquid space",
      "REEF": "City of the sea, teeming with life",
      "TIDE": "Moon's pull makes me come and go",
      "SAND": "Millions of tiny grains beneath the waves",
      "SHIP": "Vessel floating on salty roads"
    }
  },
  {
    name: "Space Exploration",
    words: [
      "STAR", "MOON", "MARS", "ORBIT", "SPACE", "SHIP", "ALIEN",
      "NOVA", "DUST", "VOID", "FUEL", "BEAM", "DOCK"
    ],
    clues: {
      "STAR": "I twinkle in the night, a burning ball of gas",
      "MOON": "Earth's faithful companion, controlling the tides",
      "MARS": "The red wanderer, named for war",
      "ORBIT": "A cosmic dance around a central point",
      "SPACE": "The final frontier, vast and endless",
      "SHIP": "Vehicle for cosmic exploration",
      "ALIEN": "A visitor from another world",
      "NOVA": "When a star burns exceptionally bright",
      "DUST": "Cosmic debris scattered between stars",
      "VOID": "The emptiness between celestial bodies",
      "FUEL": "Powers our journey through the stars",
      "BEAM": "Stream of light or energy",
      "DOCK": "Where spaceships come to rest"
    }
  }
];

function getDailyTheme() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return THEMES[dayOfYear % THEMES.length];
}

export { THEMES, getDailyTheme };