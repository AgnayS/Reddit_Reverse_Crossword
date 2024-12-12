document.addEventListener("DOMContentLoaded", () => {
  class DarkWordGame {
      constructor() {
          this.grid = document.getElementById("grid");
          this.submitBtn = document.getElementById("submit-btn");
          this.resetBtn = document.getElementById("reset-btn");
          this.message = document.getElementById("message");
          
          // Game data - Full grid with real words and distractors
          this.letters = [
              ['S', 'T', 'A', 'R', 'S'], // STARS (distractor)
              ['P', 'E', 'A', 'L', 'E'], // PEALE (distractor)
              ['I', 'R', 'O', 'N', 'Y'], // IRONY (distractor)
              ['T', 'E', 'N', 'T', 'S'], // TENTS (distractor)
              ['E', 'D', 'G', 'E', 'S']  // EDGES (distractor)
          ];

          // Solution pattern - true means it should be blacked out
          // We black out all distractors to reveal the real crossword
          this.solution = [
              [false, false, false, false, true],  // Keep STAR, black out S
              [false, false, false, false, true],  // Keep PEAL, black out E
              [false, false, false, false, true],  // Keep IRON, black out Y
              [false, false, false, false, true],  // Keep TENT, black out S
              [true, true, true, true, true]       // Black out EDGES entirely
          ];

          // Crossword clues
          this.clues = {
              across: [
                  "1. Celestial body (4)",
                  "2. Ring out, like a bell (4)",
                  "3. Metal element (4)",
                  "4. Camping shelter (4)"
              ],
              down: [
                  "1. Spiral (4)",
                  "2. Teaching (4)",
                  "3. Go by air (3)",
                  "4. Nodded off (2)"
              ]
          };

          this.blackedOutCells = Array(5).fill().map(() => Array(5).fill(false));
          
          this.initializeGame();
          this.setupEventListeners();
      }

      initializeGame() {
          // Create grid cells
          this.letters.forEach((row, rowIndex) => {
              row.forEach((letter, colIndex) => {
                  const cell = document.createElement("div");
                  cell.className = "cell";
                  cell.textContent = letter;
                  cell.dataset.row = rowIndex;
                  cell.dataset.col = colIndex;
                  this.grid.appendChild(cell);
              });
          });

          // Add clues to the page
          const cluesList = document.getElementById("clues-list");
          cluesList.innerHTML = `
              <div class="across-clues">
                  <h3>Across</h3>
                  ${this.clues.across.map(clue => `<p>${clue}</p>`).join('')}
              </div>
              <div class="down-clues">
                  <h3>Down</h3>
                  ${this.clues.down.map(clue => `<p>${clue}</p>`).join('')}
              </div>
          `;
      }

      setupEventListeners() {
          // Cell click handler
          this.grid.addEventListener("click", (e) => {
              if (e.target.classList.contains("cell")) {
                  const row = parseInt(e.target.dataset.row);
                  const col = parseInt(e.target.dataset.col);
                  this.toggleCell(e.target, row, col);
              }
          });

          // Button handlers
          this.submitBtn.addEventListener("click", () => this.checkSolution());
          this.resetBtn.addEventListener("click", () => this.resetGrid());
      }

      toggleCell(cell, row, col) {
          cell.classList.toggle("blackout");
          this.blackedOutCells[row][col] = !this.blackedOutCells[row][col];
          this.message.className = "message";
      }

      checkSolution() {
          const isCorrect = this.blackedOutCells.every((row, i) => 
              row.every((cell, j) => cell === this.solution[i][j])
          );

          this.message.className = `message ${isCorrect ? 'success' : 'error'}`;
          this.message.textContent = isCorrect 
              ? "Congratulations! You've revealed the hidden crossword!" 
              : "Not quite right. Some words are still hidden!";
      }

      resetGrid() {
          this.blackedOutCells = Array(5).fill().map(() => Array(5).fill(false));
          document.querySelectorAll(".cell").forEach(cell => {
              cell.classList.remove("blackout");
          });
          this.message.className = "message";
      }
  }

  // Start the game
  new DarkWordGame();
});