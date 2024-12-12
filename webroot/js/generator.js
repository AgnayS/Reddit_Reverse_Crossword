class PuzzleConfig {
  constructor(width = 7, height = 7, wrapping = false) {
      this.width = width;
      this.height = height;
      this.wrapping = wrapping;
  }
}

class PuzzleGenerator {
  constructor(config) {
      this.config = config;
      this.chars = new Array(config.width * config.height).fill(' ');
      this.words = new Set();
      this.usedCells = new Set(); // Track which cells are part of valid words
  }

  toIndex(x, y) {
      return y * this.config.width + (x % this.config.width);
  }

  getChar(x, y) {
      if (y < 0 || y >= this.config.height || 
          (!this.config.wrapping && (x < 0 || x >= this.config.width))) {
          return ' ';
      }
      return this.chars[this.toIndex(x, y)];
  }

  setChar(x, y, char) {
      if (y >= 0 && y < this.config.height &&
          x >= 0 && x < this.config.width) {
          this.chars[this.toIndex(x, y)] = char;
          if (char !== ' ') {
              this.usedCells.add(`${x},${y}`);
          }
      }
  }

  fits(word, vertical, x, y) {
      let connected = this.words.size === 0; // First word doesn't need connection
      
      // Check if word fits within bounds
      if (vertical && y + word.length > this.config.height) return false;
      if (!vertical && x + word.length > this.config.width) return false;
      
      for (let i = 0; i < word.length; i++) {
          const locX = vertical ? x : x + i;
          const locY = vertical ? y + i : y;
          const existing = this.getChar(locX, locY);
          
          const same = existing === word[i];
          const isEmpty = existing === ' ';
          
          // Must either match existing letter or be empty
          if (!(same || isEmpty)) return false;
          
          // If matching existing letter, counts as connected
          if (same) connected = true;
          
          // If empty, check adjacent cells
          if (isEmpty) {
              const hasAdjacentLetter = 
                  (vertical && (this.getChar(locX - 1, locY) !== ' ' || this.getChar(locX + 1, locY) !== ' ')) ||
                  (!vertical && (this.getChar(locX, locY - 1) !== ' ' || this.getChar(locX, locY + 1) !== ' '));
              
              // Can't have adjacent letters unless they're part of crossing word
              if (hasAdjacentLetter) return false;
          }
      }

      // Check word edges
      if (vertical) {
          if (y > 0 && this.getChar(x, y - 1) !== ' ') return false;
          if (y + word.length < this.config.height && this.getChar(x, y + word.length) !== ' ') return false;
      } else {
          if (x > 0 && this.getChar(x - 1, y) !== ' ') return false;
          if (x + word.length < this.config.width && this.getChar(x + word.length, y) !== ' ') return false;
      }

      return connected;
  }

  placeWord(word, x, y, vertical) {
      // Place the word
      for (let i = 0; i < word.length; i++) {
          const locX = vertical ? x : x + i;
          const locY = vertical ? y + i : y;
          this.setChar(locX, locY, word[i]);
      }
      
      this.words.add({
          word,
          startX: x,
          startY: y,
          isVertical: vertical,
          length: word.length
      });
  }

  fillWithRandomLetters() {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let y = 0; y < this.config.height; y++) {
          for (let x = 0; x < this.config.width; x++) {
              if (!this.usedCells.has(`${x},${y}`)) {
                  const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
                  this.setChar(x, y, randomLetter);
              }
          }
      }
  }

  generate(words) {
      // Sort words by length (longest first)
      words = [...words].sort((a, b) => b.length - a.length);
      
      // Place first word in center horizontally
      const firstWord = words[0];
      const startX = Math.floor((this.config.width - firstWord.length) / 2);
      const startY = Math.floor(this.config.height / 2);
      this.placeWord(firstWord, startX, startY, false);

      // Try to place each remaining word
      for (let i = 1; i < words.length; i++) {
          const word = words[i];
          let placed = false;

          // Try vertical placement
          for (let x = 0; x < this.config.width && !placed; x++) {
              for (let y = 0; y < this.config.height && !placed; y++) {
                  if (this.fits(word, true, x, y)) {
                      this.placeWord(word, x, y, true);
                      placed = true;
                  }
              }
          }

          // Try horizontal if vertical didn't work
          if (!placed) {
              for (let y = 0; y < this.config.height && !placed; y++) {
                  for (let x = 0; x < this.config.width && !placed; x++) {
                      if (this.fits(word, false, x, y)) {
                          this.placeWord(word, x, y, false);
                          placed = true;
                      }
                  }
              }
          }
      }

      // Fill empty spaces with random letters
      this.fillWithRandomLetters();

      return {
          grid: this.getGrid(),
          words: Array.from(this.words),
          density: this.calculateDensity()
      };
  }

  getGrid() {
      const grid = [];
      for (let y = 0; y < this.config.height; y++) {
          const row = [];
          for (let x = 0; x < this.config.width; x++) {
              row.push(this.chars[this.toIndex(x, y)]);
          }
          grid.push(row);
      }
      return grid;
  }

  calculateDensity() {
      return this.usedCells.size / (this.config.width * this.config.height);
  }
}

export { PuzzleConfig, PuzzleGenerator };