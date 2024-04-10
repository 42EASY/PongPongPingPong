import EndGame from "../../pages/EndGame.js";
import Modal from "../../components/Modal/Modal.js";
import GameSocketManager from "../../state/GameSocketManager.js";

export default function Board(info, rightUser_id) {
  var socket;
  var socket_res;
  console.log("BOARD ARGU : ", info, rightUser_id);
  if (info.mode !== "2P") {
    socket = GameSocketManager.getInstance(info.game_id);
    console.log("start!");
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const DIR = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
  };

  const maxScore = 1;

  const Ball = {
    new: function () {
      return {
        width: 18,
        height: 18,
        x: canvas.width / 2 - 9,
        y: canvas.height / 2 - 9,
        moveX: DIR.IDLE,
        moveY: DIR.IDLE,
        speed: info.option === "SPEED" ? 10 : 2,
      };
    },
  };

  const Paddle = {
    new: function (side) {
      return {
        width: 10,
        height: 120,
        x: side === "left" ? 40 : canvas.width - 40 - 10,
        y: canvas.height / 2 - 35,
        score: 0,
        move: DIR.IDLE,
        speed: 10,
      };
    },
  };

  const pongGame = {
    canvas: canvas,
    initialize: function () {
      this.canvas.height = window.innerHeight * 0.85;
      this.canvas.width = canvas.height * 1.45;

      this.leftPlayer = Paddle.new.call(this, "left");
      this.rightPlayer = Paddle.new.call(this, "right");
      this.ball = Ball.new.call(this);

      this.running = this.gameOver = false;
      this.turnOver = true;
      this.serve = Math.random() < 0.5 ? this.leftPlayer : this.rightPlayer;
      this.timer = this.round = 0;

      Modal(
        this.serve === this.leftPlayer ? "gameLeftServe" : "gameRightServe"
      ).then((result) => {
        this.running = true;
        window.requestAnimationFrame(() => this.loop());
      });

      this.draw();
      this.listen();
      if (info.mode === "NORMAL" || info.mode === "TOURNAMENT")
        this.remoteListen();
    },

    changeUrl: function (requestedUrl) {
      const path = `./src/styles${requestedUrl}.css`;
      document.getElementById("styles").setAttribute("href", path);
      history.pushState(null, null, window.location.pathname);
      console.log("change url @@@@@@@@@@@@@@@@@@@@");
      if (info.mode === "2P")
        EndGame({
          info: info,
          result: {
            leftScore: this.leftPlayer.score,
            rightScore: this.rightPlayer.score,
          },
        });
      else EndGame({ info: info, result: socket_res });
    },

    // Update all objects (move the player, paddle, ball, increment the score, etc.)
    update: function () {
      if (!this.gameOver) {
        // If the ball collides with the bound limits - correct the x and y coords.
        if (this.ball.x <= 0) {
          console.log("will call resetTurn()");
          Pong._resetTurn.call(this, this.rightPlayer);
        }
        if (this.ball.x >= this.canvas.width - this.ball.width) {
          console.log("will call resetTurn()");
          Pong._resetTurn.call(this, this.leftPlayer);
        }
        if (this.ball.y <= 0) this.ball.moveY = DIR.DOWN;
        if (this.ball.y >= this.canvas.height - this.ball.height)
          this.ball.moveY = DIR.UP;

        // 서브할 때 공 방향 랜덤으로 설정 -> 한 사람만 send해야 함
        if (Pong._turnDelayIsOver.call(this) && this.turnOver) {
          // (1) left or right
          this.ball.moveX =
            this.serve === this.leftPlayer ? DIR.LEFT : DIR.RIGHT;
          if (
            info.mode === "2P" ||
            info.player_info[0].user_id === rightUser_id
          ) {
            // (2) up or down
            this.ball.moveY = Math.random() < 0.5 ? DIR.UP : DIR.DOWN;
            // (3) 공의 초기 y 위치
            this.ball.y =
              Math.floor(Math.random() * this.canvas.height - 200) + 200;
            if (info.mode !== "2P") {
              console.log("will send init ball");
              socket.sendAction({
                action: "round_start",
                ball_position: {
                  moveX: this.ball.moveX, //필요x
                  moveY: this.ball.moveY,
                  y: this.ball.y,
                },
              });
            }
            console.log(
              "ball random setting success : ",
              this.ball.moveX,
              this.ball.moveY,
              this.ball.y
            );
          }
          this.turnOver = false; //turnOver, gameOver
        }
        // Move ball in intended direction based on moveY and moveX values
        if (this.ball.moveY === DIR.UP) this.ball.y -= this.ball.speed / 1.5;
        else if (this.ball.moveY === DIR.DOWN)
          this.ball.y += this.ball.speed / 1.5;
        if (this.ball.moveX === DIR.LEFT) this.ball.x -= this.ball.speed;
        else if (this.ball.moveX === DIR.RIGHT) this.ball.x += this.ball.speed;

        // 왼쪽 플레이어 방향에 따른 위치 설정
        if (this.leftPlayer.move === DIR.UP)
          this.leftPlayer.y -= this.leftPlayer.speed;
        else if (this.leftPlayer.move === DIR.DOWN)
          this.leftPlayer.y += this.leftPlayer.speed;
        // 벽에 충돌 시
        if (this.leftPlayer.y >= this.canvas.height - this.leftPlayer.height)
          this.leftPlayer.y = this.canvas.height - this.leftPlayer.height;
        else if (this.leftPlayer.y <= 0) this.leftPlayer.y = 0;

        // 오른쪽 플레이어 위치 설정
        if (this.rightPlayer.move === DIR.UP)
          this.rightPlayer.y -= this.rightPlayer.speed;
        else if (this.rightPlayer.move === DIR.DOWN)
          this.rightPlayer.y += this.rightPlayer.speed;
        // 벽에 충돌 시
        if (this.rightPlayer.y >= this.canvas.height - this.rightPlayer.height)
          this.rightPlayer.y = this.canvas.height - this.rightPlayer.height;
        else if (this.rightPlayer.y <= 0) this.rightPlayer.y = 0;

        // 왼쪽 패들에 공 충돌 시
        if (
          this.ball.x - this.ball.width <= this.leftPlayer.x &&
          this.ball.x >= this.leftPlayer.x - this.leftPlayer.width
        ) {
          if (
            this.ball.y <= this.leftPlayer.y + this.leftPlayer.height &&
            this.ball.y + this.ball.height >= this.leftPlayer.y
          ) {
            this.ball.x = this.leftPlayer.x + this.ball.width;
            this.ball.moveX = DIR.RIGHT;
          }
        }
        // 오른쪽 패들에 공 충돌 시
        if (
          this.ball.x - this.ball.width <= this.rightPlayer.x &&
          this.ball.x >= this.rightPlayer.x - this.rightPlayer.width
        ) {
          if (
            this.ball.y <= this.rightPlayer.y + this.rightPlayer.height &&
            this.ball.y + this.ball.height >= this.rightPlayer.y
          ) {
            this.ball.x = this.rightPlayer.x - this.ball.width;
            this.ball.moveX = DIR.LEFT;
          }
        }
      }
    },

    // canvas 그리기
    draw: function () {
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
      if (this._turnDelayIsOver()) {
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
      }

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

    loop: function () {
      pongGame.update();
      pongGame.draw();

      // If the game is not over, draw the next frame.
      if (!pongGame.gameOver) requestAnimationFrame(pongGame.loop);
    },

    // 이름 바꾸기
    listen: function () {
      // 키 눌렸을 때
      document.addEventListener("keydown", (key) => {
        if (this.running) {
          if (info.mode === "2P") {
            if (key.key === "w") this.leftPlayer.move = DIR.UP;
            if (key.key === "s") this.leftPlayer.move = DIR.DOWN;
          }

          if (key.key === "ArrowUp") {
            this.rightPlayer.move = DIR.UP;
            if (info.mode === "NORMAL" || info.mode === "TOURNAMENT")
              socket.sendAction({ action: "press_key", key: 1 });
          }
          if (key.key === "ArrowDown") {
            this.rightPlayer.move = DIR.DOWN;
            if (info.mode === "NORMAL" || info.mode === "TOURNAMENT")
              socket.sendAction({ action: "press_key", key: 0 });
          }
        }
      });

      // 키 뗐을 때
      document.addEventListener("keyup", (key) => {
        if (info.mode === "2P" && (key.key === "w" || key.key === "s"))
          this.leftPlayer.move = DIR.IDLE;
        if (key.key === "ArrowUp" || key.key === "ArrowDown") {
          this.rightPlayer.move = DIR.IDLE;
          if (info.mode === "NORMAL" || info.mode === "TOURNAMENT")
            socket.sendAction({ action: "unpress_key", key: 1 });
        }
      });
    },

    // 이름 바꾸기
    remoteListen: function () {
      socket.onmessage = (e) => {
        socket_res = JSON.parse(e.data);
        console.log("game onmessage!!!", socket_res);
        // 1. 키 눌렀을 때
        if (socket_res.action === "press_key") {
          if (socket_res.key === 1) this.leftPlayer.move = DIR.UP;
          if (socket_res.key === 0) this.leftPlayer.move = DIR.DOWN;
        }
        // 2. 키 뗐을 때
        if (socket_res.action === "unpress_key") {
          this.leftPlayer.move = DIR.IDLE;
        }
        // 3. 공 초기화
        if (socket_res.action === "round_start") {
          this.ball.moveY = socket_res.ball_position.moveY;
          this.ball.y = socket_res.ball_position.y;
        }
        // 4. 게임 끝났을 때
        if (socket_res.status === "game_over") {
          // 이거맞나?????? normal_game_over..??????
          console.log("game is over. will change url");

          if (socket.readyState === WebSocket.OPEN) {
            console.log("socket.close()");
            socket.close();
          } else {
            console.log("WebSocket is already closing or closed.");
          }

          pongGame.gameOver = true;
          console.log("gameOver = true");
          setTimeout(() => Pong.changeUrl("/endgame"), 0);
        }
      };
    },

    // Reset the ball location, the player turns and set a delay before the next round begins.
    _resetTurn: function (victor) {
      if (
        (info.mode === "NORMAL" || info.mode === "TOURNAMENT") &&
        victor === this.rightPlayer
      ) {
        console.log("you got point");
        socket.sendAction({ action: "round_win" });
      } else {
        console.log("you lose point");
      }

      victor.score++;
      this.turnOver = true;
      this.ball = Ball.new.call(this);
      this.serve =
        this.serve === this.leftPlayer ? this.rightPlayer : this.leftPlayer;
      this.timer = new Date().getTime();
      if (
        // (info.mode !== "2P" && socket_res.status === "game_over") || // 이거지우기..
        info.mode === "2P" &&
        (this.leftPlayer.score === maxScore ||
          this.rightPlayer.score === maxScore)
      ) {
        this.gameOver = true;
        console.log("hehehheheheheheheheheheh eheeh eh hehe ");
        Pong.changeUrl("/endgame");
      } else
        Modal(
          this.serve === this.leftPlayer ? "gameLeftServe" : "gameRightServe"
        );
    },

    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function () {
      return new Date().getTime() - this.timer >= 3000;
    },
  };

  let Pong = pongGame;
  Pong.initialize();
  return canvas;
}
