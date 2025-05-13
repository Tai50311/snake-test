const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake;
let apple;
let dx;
let dy;
let score;
let gameInterval;
let gameStarted = false;

function initGame() {
  snake = [{ x: 10, y: 10 }];
  apple = { x: 5, y: 5 };
  dx = 1;
  dy = 0;
  score = 0;
}

function gameLoop() {
  if (!gameStarted) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (
    head.x < 0 || head.y < 0 ||
    head.x >= tileCount || head.y >= tileCount ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    alert("遊戲結束！得分：" + score);
    clearInterval(gameInterval);
    document.getElementById("startScreen").style.display = "flex";
    return;
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score++;
    apple = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lime";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });

  ctx.fillStyle = "red";
  ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize - 2, gridSize - 2);
}

document.addEventListener("keydown", e => {
  if (!gameStarted) return;
  switch (e.key) {
    case "ArrowUp": if (dy === 0) { dx = 0; dy = -1; } break;
    case "ArrowDown": if (dy === 0) { dx = 0; dy = 1; } break;
    case "ArrowLeft": if (dx === 0) { dx = -1; dy = 0; } break;
    case "ArrowRight": if (dx === 0) { dx = 1; dy = 0; } break;
  }
});

function startGame() {
  initGame();
  document.getElementById("startScreen").style.display = "none";
  gameStarted = true;
  gameInterval = setInterval(gameLoop, 100);
}
