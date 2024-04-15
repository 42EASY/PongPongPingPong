import EndGame from "../../pages/EndGame.js";
import Modal from "../../components/Modal/Modal.js";
import GameBoardSocketManager from "../../state/GameBoardSocketManager.js";
import { getNumberUserId } from "../../state/State.js";

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
var socket_res;

const DIR = {
  IDLE: 0,
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
};

const Ball = {
  new: function (option) {
    return {
      width: 18,
      height: 18,
      x: canvas.width / 2 - 9,
      y: canvas.height / 2 - 9,
      moveX: DIR.IDLE,
      moveY: DIR.IDLE,
      speed: option === "SPEED" ? 10 : 2,
    };
  },
};

const Paddle = {
  new: function (side) {
    return {
      width: 10,
      height: 100,
      x: side === "left" ? 40 : canvas.width - 40 - 10,
      y: canvas.height / 2 - 35,
      score: 0,
      move: DIR.IDLE,
      speed: 10,
    };
  },
};

function listen(pongGame, socket) {
  document.addEventListener("keydown", (key) => {
    if (pongGame.running) {
      if (key.key === "ArrowUp") {
        // pongGame.rightPlayer.move = DIR.UP;
        socket.sendAction({ action: "press_key", key: 1 });
      }
      if (key.key === "ArrowDown") {
        // pongGame.rightPlayer.move = DIR.DOWN;
        socket.sendAction({ action: "press_key", key: 0 });
      }
    }
  });

  document.addEventListener("keyup", (key) => {
    if (key.key === "ArrowUp" || key.key === "ArrowDown") {
      // pongGame.rightPlayer.move = DIR.IDLE;
      socket.sendAction({ action: "unpress_key", key: 1 });
    }
  });
}

function showReadyGameModal(socket) {
  Modal("readyGame").then((response) => {
    if (response.isPositive) {
      // 준비 완료 소켓 액션 전송
      socket.sendAction({ action: "ready_game" });
    }
  });
}

function showStartGameModal(pongGame, socket) {
  Modal("startGame").then((response) => {
    if (response.isPositive) {
      // 게임 시작 소켓 액션 전송
      socket.sendAction({ action: "start_game" });
    }
  });
}

function updateGame(pongGame, info) {
  // 서버에서 받은 데이터로 게임 상태 업데이트
  const data = info.data;
  const userId = getNumberUserId(); // 현재 사용자의 ID
  const { paddles, ball } = data;

  // console.log(data);

  // 패들 위치 결정
  const myPaddle =
    paddles.player1.user_id === userId ? paddles.player1 : paddles.player2;
  const opponentPaddle =
    paddles.player1.user_id === userId ? paddles.player2 : paddles.player1;

  // 화면에 그릴 위치 조정
  // 자신을 오른쪽 패들로 설정
  pongGame.rightPlayer.y = myPaddle.y;
  pongGame.leftPlayer.y = opponentPaddle.y;
  pongGame.rightPlayer.score = myPaddle.score;
  pongGame.leftPlayer.score = opponentPaddle.score;

  // 공의 위치 계산
  if (myPaddle === paddles.player1) {
    // 자신이 player1이면, 공의 위치를 반전
    pongGame.ball.x = canvas.width - ball.x - pongGame.ball.width;
  } else {
    // 자신이 player2이면, 정상 위치
    pongGame.ball.x = ball.x;
  }
  pongGame.ball.y = ball.y;

  pongGame.draw(); // 게임 상태를 다시 그림
}

function setupSocketListeners(pongGame, socket) {
  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    switch (data.action) {
      case "update_board_state":
        updateGame(pongGame, data);
        break;
      case "game_over":
        handleGameOver(pongGame, data, socket);
        break;
      case "user_ready":
        handleUserReady(pongGame, data, socket);
        break;
      default:
        console.log("Unknown action:", data.action);
    }
  };
}

function handleGameOver(pongGame, data, socket) {
  pongGame.gameOver = true;
  socket.close();

  setTimeout(() => changeUrl(pongGame.info, data, "/endgame"), 0);
}

function handleUserReady(pongGame, data, socket) {
  if (data.user_id !== getNumberUserId()) {
    showStartGameModal(pongGame, socket);
  }
}

function changeUrl(info, result, requestedUrl) {
  const path = `./src/styles${requestedUrl}.css`;
  document.getElementById("styles").setAttribute("href", path);
  history.pushState(null, null, window.location.pathname);
  console.log("change url @@@@@@@@@@@@@@@@@@@@");
  EndGame({ info: info, result: result });
}

export default function RemoteBoard(info) {
  console.log("REMOTE BOARD: ", info);
  const socket = GameBoardSocketManager.getInstance(info.game_id);
  const opponentInfo = info.player_info;

  canvas.height = 550;
  canvas.width = canvas.height * 1.45;
  const pongGame = createPongGame(canvas, info);
  setupSocketListeners(pongGame, socket);
  listen(pongGame, socket);

  if (getNumberUserId() > opponentInfo.user_id) {
    showReadyGameModal(socket);
  }

  pongGame.start();
  return canvas;
}

function createPongGame(canvas, info) {
  const pongGame = {
    info: info,
    canvas: canvas,
    context: canvas.getContext("2d"),
    leftPlayer: Paddle.new.call(this, "left"),
    rightPlayer: Paddle.new.call(this, "right"),
    ball: Ball.new.call(info.option),
    running: false,
    gameOver: false,
    draw: function () {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#000000";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#ffffff";

      // leftPlayer
      context.fillRect(
        this.leftPlayer.x,
        this.leftPlayer.y,
        this.leftPlayer.width,
        this.leftPlayer.height
      );

      // rightPlayer
      context.fillRect(
        this.rightPlayer.x,
        this.rightPlayer.y,
        this.rightPlayer.width,
        this.rightPlayer.height
      );

      // 가운데 선
      context.beginPath();
      context.setLineDash([10, 10]);
      context.moveTo(canvas.width / 2, canvas.height);
      context.lineTo(canvas.width / 2, 0);
      context.lineWidth = 8;
      context.strokeStyle = "#ffffff";
      context.stroke();

      // 공
      context.beginPath();
      context.arc(
        this.ball.x + this.ball.width / 2,
        this.ball.y + this.ball.height / 2,
        this.ball.width / 2,
        0,
        2 * Math.PI
      );
      context.fillStyle = "#3ec70b";
      context.fill();

      context.font = "bold 70px sans-serif";
      context.textAlign = "center";

      // left score
      context.fillStyle = "#ffffff";
      context.fillText(
        this.leftPlayer.score.toString().padStart(2, "0"),
        canvas.width / 2 - 60,
        70
      );

      // right score
      context.fillText(
        this.rightPlayer.score.toString().padStart(2, "0"),
        canvas.width / 2 + 60,
        70
      );
    },
    start: function () {
      this.running = true;
      requestAnimationFrame(this.loop.bind(this));
    },
    loop: function () {
      if (!this.gameOver) {
        this.draw();
        requestAnimationFrame(this.loop.bind(this));
      }
    },
  };
  return pongGame;
}
