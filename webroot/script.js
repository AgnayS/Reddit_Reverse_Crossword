document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("grid");

  // Define the crossword letters
  const letters = [
      ["R", "A", "I", "N", " "],
      ["H", "E", "A", "T", " "],
      ["S", "N", "O", "W", " "],
      ["C", "O", "L", "D", " "],
      [" ", " ", " ", " ", " "]
  ];

  // Populate the grid with letters
  letters.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
          const cell = document.createElement("div");
          cell.classList.add("cell");
          cell.textContent = letter;

          // Toggle blackout on click
          cell.addEventListener("click", () => {
              cell.classList.toggle("blackout");
          });

          grid.appendChild(cell);
      });
  });

  // Submit button to validate the grid
  document.getElementById("submit-btn").addEventListener("click", () => {
      alert("Validation logic will go here!");
  });
});
