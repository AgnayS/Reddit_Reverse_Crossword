# DarkWord 🎯

A unique reverse crossword puzzle game built for Reddit! Unlike traditional crosswords, in DarkWord you see ALL the letters and need to black out the extras to reveal the hidden crossword underneath.

## 🎮 How to Play

1. Each puzzle has a daily theme (Ocean Life, Space Exploration, etc.)
2. The grid is filled with letters - some are part of real words, others are distractors
3. Read the cryptic clues to figure out what words are hidden
4. Click cells to black them out
5. Your goal is to black out all distractor letters, leaving only the real crossword visible!

Example:
```
Before:          After blacking out:
S T A R S        S T A R ■
P E A L E        P E A L ■
I R O N Y   →    I R O N ■
T E N T S        T E N T ■
E D G E S        ■ ■ ■ ■ ■
```

## 🚀 Features

- 🎨 Daily themes with themed word sets
- 🤔 Cryptic clues that don't give away word positions
- 👀 Peek feature (3 uses per game) to help when stuck
- 🎯 Hover over clues to see related cells
- 🔄 Random letter filling for non-word spaces
- ✨ Score tracking and progress saving

## 🛠️ Technical Details

Built using:
- Vanilla JavaScript for game logic
- CSS for styling
- Reddit's Devvit platform for deployment

## 🏃‍♂️ Running Locally

1. Clone this repository
2. Open VSCode
3. Install the "Live Server" extension
4. Right-click on `webroot/index.html` and select "Open with Live Server"
5. The game should open in your default browser!

Note: Direct file opening won't work due to module imports - you need to use a local server.

## 📁 Project Structure
```
project/
├── src/              # Devvit app files
│   ├── main.tsx
│   └── createPost.tsx
└── webroot/          # Game files
    ├── index.html    # Main game page
    ├── style.css     # Styles
    └── js/
        ├── generator.js  # Puzzle generation
        ├── themes.js     # Theme data
        └── game.js       # Game logic
```

## 🎯 Game Mechanics

1. **Theme Selection**: Each day has a unique theme with related words
2. **Puzzle Generation**: 
   - Words are placed in crossword pattern
   - Empty spaces are filled with random letters
3. **Clue System**:
   - Each word has a cryptic clue
   - Clues are randomized to hide word positions
4. **Peek System**:
   - Players get 3 peeks per game
   - Each peek reveals 3 random cells
   - Yellow highlight = should be blacked out
   - Green highlight = part of a real word

## 🤝 Contributing

Feel free to submit issues and enhancement requests!