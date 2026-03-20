const board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let playWithAI = false;
let aiDifficulty = "Easy";

const modeSelection = document.getElementById("mode-selection");
const gameContainer = document.getElementById("game-container");
const aiDifficultySelection = document.getElementById("ai-difficulty-selection");
const clickXSound = document.getElementById("click-x-sound");
const clickOSound = document.getElementById("click-o-sound");
const winSound = document.getElementById("win-sound");
const statusDisplay = document.getElementById("status");
const resetButton = document.getElementById("reset-btn");

const winningConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

document.getElementById("player-vs-player").addEventListener("click", () => {
  playWithAI = false;
  aiDifficultySelection.style.display = "none";
  startGame();
});

document.getElementById("player-vs-ai").addEventListener("click", () => {
  playWithAI = true;
  aiDifficultySelection.style.display = "block";
  // Keep mode selection visible so difficulty buttons remain clickable
  // until user picks a difficulty.
});

document.getElementById("difficulty-easy").addEventListener("click", () => {
  aiDifficulty = "Easy";
  startGame();
});

document.getElementById("difficulty-medium").addEventListener("click", () => {
  aiDifficulty = "Medium";
  startGame();
});

document.getElementById("difficulty-hard").addEventListener("click", () => {
  aiDifficulty = "Hard";
  startGame();
});

function startGame() {
  modeSelection.style.display = "none";
  aiDifficultySelection.style.display = "none";
  gameContainer.style.display = "flex";
  resetGame();
}

document.querySelectorAll(".cell").forEach(cell => cell.addEventListener("click", handleCellClick));

function handleCellClick(event) {
  const cell = event.target;
  const cellIndex = cell.getAttribute("data-index");
  if (board[cellIndex] !== "" || !gameActive) return;
  playClickSound(currentPlayer);
  updateCell(cell, cellIndex);
  checkResult();
  if (playWithAI && gameActive && currentPlayer === "O") {
    setTimeout(computerMove, 500);
  }
}

function playClickSound(player) { (player === "X" ? clickXSound : clickOSound).play(); }

function updateCell(cell, index) {
  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
}

function checkResult() {
  let roundWon = false;
  let winningCombo = [];

  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      roundWon = true;
      winningCombo = [a, b, c];
      break;
    }
  }

  if (roundWon) {
    highlightWinningCells(winningCombo);
    winSound.currentTime = 0;
    winSound.play();
    statusDisplay.textContent = `Player ${currentPlayer} Wins!`;
    gameActive = false;
    return;
  }

  if (!board.includes("")) {
    statusDisplay.textContent = "It's a Draw!";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
}

function highlightWinningCells(winningCombo) {
  winningCombo.forEach(index => {
    document.querySelector(`.cell[data-index='${index}']`).classList.add("win");
  });
}

function computerMove() {
  const emptyCells = board.map((val, index) => (val === "" ? index : null)).filter(val => val !== null);
  if (!emptyCells.length) return;

  let chosenIndex;

  if (aiDifficulty === "Easy") {
    chosenIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  } else if (aiDifficulty === "Medium") {
    const randomBias = Math.random();
    if (randomBias < 0.5) {
      chosenIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else {
      const best = getBestMove(board, "O");
      chosenIndex = best.index;
    }
  } else {
    const best = getBestMove(board, "O");
    chosenIndex = best.index;
  }

  if (typeof chosenIndex !== "number") {
    chosenIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  updateCell(document.querySelector(`.cell[data-index='${chosenIndex}']`), chosenIndex);
  playClickSound("O");
  checkResult();
}

function getBestMove(tmpBoard, player) {
  const winner = evaluateBoard(tmpBoard);
  if (winner !== null) {
    if (winner === "O") return { score: 10 };
    if (winner === "X") return { score: -10 };
    if (winner === "draw") return { score: 0 };
  }

  const availableCells = tmpBoard.map((val, idx) => (val === "" ? idx : null)).filter(i => i !== null);
  let moves = [];

  for (let i of availableCells) {
    tmpBoard[i] = player;
    const result = getBestMove(tmpBoard, player === "O" ? "X" : "O");
    moves.push({ index: i, score: result.score });
    tmpBoard[i] = "";
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }

  return bestMove || { index: availableCells[0], score: 0 };
}

function evaluateBoard(bd) {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
      return bd[a];
    }
  }

  if (!bd.includes("")) return "draw";
  return null;
}

function resetGame() {
  board.fill("");
  currentPlayer = "X";
  gameActive = true;
  statusDisplay.textContent = "Player X's Turn";
  document.querySelectorAll(".cell").forEach(cell => {
    cell.textContent = "";
    cell.className = "cell";
  });
}

resetButton.addEventListener("click", resetGame);

const backButton = document.getElementById("back-btn");
backButton.addEventListener("click", () => {
  gameContainer.style.display = "none";
  modeSelection.style.display = "flex";
  aiDifficultySelection.style.display = "none";
  resetGame();
});

