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
let playerName = "";
let startTime;
let endTime;

// Firebase 相關
const dbRef = firebase.database().ref("leaderboard");

function initGame() {
    snake = [{ x: 10, y: 10 }];
    apple = { x: 5, y: 5 };
    dx = 1;
    dy = 0;
    score = 0;
    startTime = Date.now(); // 記錄遊戲開始時間
}

function gameLoop() {
    if (!gameStarted) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (
        head.x < 0 || head.y < 0 ||
        head.x >= tileCount || head.y >= tileCount ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        gameOver();
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
    playerName = document.getElementById("playerName").value.trim();
    if (!playerName) {
        alert("請輸入玩家名稱！");
        return;
    }

    initGame();
    document.getElementById("startScreen").style.display = "none";
    gameStarted = true;
    gameInterval = setInterval(gameLoop, 100);
}

function gameOver() {
    gameStarted = false;
    clearInterval(gameInterval);
    endTime = Date.now();
    const playTime = Math.floor((endTime - startTime) / 1000); // 計算遊玩秒數
    document.getElementById("finalScore").textContent = score;
    document.getElementById("playTime").textContent = playTime;
    document.getElementById("gameOverScreen").style.display = "flex";
}

function submitScore() {
    const playTime = Math.floor((endTime - startTime) / 1000);
    const timestamp = Date.now();

    dbRef.push({
        name: playerName,
        score: score,
        time: playTime,
        savedAt: timestamp
    }).then(() => {
        alert("分數已提交！");
        document.getElementById("gameOverScreen").style.display = "none";
        showLeaderboard();
    }).catch(error => {
        console.error("Error saving score to Firebase:", error);
        alert("提交分數失敗，請稍後再試。");
    });
}

function showLeaderboard() {
    document.getElementById("leaderboard").innerHTML = ""; // 清空排行榜
    dbRef.orderByChild("score").limitToLast(10).once("value", snapshot => { // 取得最高分前 10 名
        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${data.name}</span>
                <span>分數：${data.score}</span>
                <span>時間：${data.time} 秒</span>
            `;
            document.getElementById("leaderboard").appendChild(li);
        });
        document.getElementById("leaderboardScreen").style.display = "flex";
    });
}

function showStartScreen() {
    document.getElementById("leaderboardScreen").style.display = "none";
    document.getElementById("startScreen").style.display = "flex";
}