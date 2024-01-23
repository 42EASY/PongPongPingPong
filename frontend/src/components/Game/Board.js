import EndGame from "../../pages/EndGame.js";

export default function Board(mode, option) {
  console.log(mode);
  console.log(option);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
  };

  const maxScore = 3;

  const Ball = {
    new: function () {
      return {
        width: 18,
        height: 18,
        x: canvas.width / 2 - 9,
        y: canvas.height / 2 - 9,
        moveX: DIRECTION.IDLE,
        moveY: DIRECTION.IDLE,
        speed: option === "speed" ? 13 : 4,
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
        move: DIRECTION.IDLE,
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
      console.log(
        "initial serve : " + (this.serve === this.leftPlayer ? "left" : "right")
      );
      this.timer = this.round = 0;

      this.menu();
      this.listen();
      window.addEventListener("resize", () => {
        this.setCanvasSize();
        this.draw();
      });
    },

    changeUrl: function (requestedUrl) {
      const path = `./src/styles${requestedUrl}.css`;
      document.getElementById("styles").setAttribute("href", path);
      history.pushState(null, null, window.location.pathname);
      EndGame(mode, this.leftPlayer.score, this.rightPlayer.score);
    },

    menu: function () {
      // Draw all the Pong objects in their current state
      this.draw();

      // Change the canvas font size and color
      context.font = "50px sans-serif";
      context.fillStyle = "#ffffff";

      // Draw the rectangle behind the 'Press any key to begin' text.
      context.fillRect(
        canvas.width / 2 - 350,
        canvas.height / 2 - 48,
        700,
        100
      );

      // Change the canvas color;
      context.fillStyle = "#000000";

      // Draw the 'press any key to begin' text
      context.fillText(
        "Press any key to begin",
        canvas.width / 2,
        canvas.height / 2 + 15
      );
    },

    // Update all objects (move the player, paddle, ball, increment the score, etc.)
    update: function () {
      if (!this.gameOver) {
        // If the ball collides with the bound limits - correct the x and y coords.
        if (this.ball.x <= 0) Pong._resetTurn.call(this, this.rightPlayer);
        if (this.ball.x >= this.canvas.width - this.ball.width)
          Pong._resetTurn.call(this, this.leftPlayer);
        if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
        if (this.ball.y >= this.canvas.height - this.ball.height)
          this.ball.moveY = DIRECTION.UP;

        // Move player if they player.move value was updated by a keyboard event
        if (this.leftPlayer.move === DIRECTION.UP)
          this.leftPlayer.y -= this.leftPlayer.speed;
        else if (this.leftPlayer.move === DIRECTION.DOWN)
          this.leftPlayer.y += this.leftPlayer.speed;

        // On new serve (start of each turn) move the ball to the correct side
        // and randomize the direction to add some challenge.
        if (Pong._turnDelayIsOver.call(this) && this.turnOver) {
          // 서브할 때 공 설정 -> 이거 그냥 공 초기화할 때 해도 되지 않나
          console.log(
            "serve!!!!!!!!!!!!!!!!!! : " +
              (this.serve === this.leftPlayer ? "left" : "right")
          );
          this.ball.moveX =
            this.serve === this.leftPlayer ? DIRECTION.LEFT : DIRECTION.RIGHT;
          this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][
            Math.round(Math.random())
          ];
          this.ball.y =
            Math.floor(Math.random() * this.canvas.height - 200) + 200;
          this.turnOver = false; //turnOver, gameOver
        }

        // If the player collides with the bound limits, update the x and y coords.
        if (this.leftPlayer.y <= 0) this.leftPlayer.y = 0;
        else if (
          this.leftPlayer.y >=
          this.canvas.height - this.leftPlayer.height
        )
          this.leftPlayer.y = this.canvas.height - this.leftPlayer.height;

        // Move ball in intended direction based on moveY and moveX values
        if (this.ball.moveY === DIRECTION.UP)
          this.ball.y -= this.ball.speed / 1.5;
        else if (this.ball.moveY === DIRECTION.DOWN)
          this.ball.y += this.ball.speed / 1.5;
        if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
        else if (this.ball.moveX === DIRECTION.RIGHT)
          this.ball.x += this.ball.speed;

        // Handle right player UP and DOWN movement
        if (this.rightPlayer.move === DIRECTION.UP)
          this.rightPlayer.y -= this.rightPlayer.speed;
        else if (this.rightPlayer.move === DIRECTION.DOWN)
          this.rightPlayer.y += this.rightPlayer.speed;

        // Handle right player wall collision
        if (this.rightPlayer.y >= this.canvas.height - this.rightPlayer.height)
          this.rightPlayer.y = this.canvas.height - this.rightPlayer.height;
        else if (this.rightPlayer.y <= 0) this.rightPlayer.y = 0;

        // Handle leftPlayer-Ball collisions
        if (
          this.ball.x - this.ball.width <= this.leftPlayer.x &&
          this.ball.x >= this.leftPlayer.x - this.leftPlayer.width
        ) {
          if (
            this.ball.y <= this.leftPlayer.y + this.leftPlayer.height &&
            this.ball.y + this.ball.height >= this.leftPlayer.y
          ) {
            this.ball.x = this.leftPlayer.x + this.ball.width;
            this.ball.moveX = DIRECTION.RIGHT;
          }
        }

        // Handle rightPlayer-ball collision
        if (
          this.ball.x - this.ball.width <= this.rightPlayer.x &&
          this.ball.x >= this.rightPlayer.x - this.rightPlayer.width
        ) {
          if (
            this.ball.y <= this.rightPlayer.y + this.rightPlayer.height &&
            this.ball.y + this.ball.height >= this.rightPlayer.y
          ) {
            this.ball.x = this.rightPlayer.x - this.ball.width;
            this.ball.moveX = DIRECTION.LEFT;
          }
        }
      }

      // // Handle the end of round transition
      // // Check to see if the player won the round.
      if (
        this.leftPlayer.score === maxScore ||
        this.rightPlayer.score === maxScore
      ) {
        this.gameOver = true;
        setTimeout(function () {
          Pong.changeUrl("/endgame");
        }, 1000);
      }
    },

    // Draw the objects to the canvas element
    draw: function () {
      // Clear the Canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Set the fill style to black
      context.fillStyle = "#000000";

      // Draw the background
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Set the fill style to white (For the paddles and the ball)
      context.fillStyle = "#ffffff";

      // Draw the leftPlayer
      context.fillRect(
        this.leftPlayer.x,
        this.leftPlayer.y,
        this.leftPlayer.width,
        this.leftPlayer.height
      );

      // Draw the rightPlayer
      context.fillRect(
        this.rightPlayer.x,
        this.rightPlayer.y,
        this.rightPlayer.width,
        this.rightPlayer.height
      );

      // Draw the net (Line in the middle)
      context.beginPath();
      context.setLineDash([10, 10]);
      context.moveTo(canvas.width / 2, canvas.height);
      context.lineTo(canvas.width / 2, 0);
      context.lineWidth = 8;
      context.strokeStyle = "#ffffff";
      context.stroke();

      // Draw the Ball
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

      // Set the default canvas font and align it to the center
      context.font = "bold 70px sans-serif";
      context.textAlign = "center";

      // Draw the players score (left)
      context.fillStyle = "#ffffff";
      context.fillText(
        this.leftPlayer.score.toString().padStart(2, "0"),
        canvas.width / 2 - 60,
        70
      );

      // Draw the paddles score (right)
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

    listen: function () {
      document.addEventListener("keydown", (key) => {
        // Handle the 'Press any key to begin' function and start the game.
        if (this.running === false) {
          this.running = true;
          window.requestAnimationFrame(() => this.loop());
        }
        if (key.key === "w") this.leftPlayer.move = DIRECTION.UP;
        if (key.key === "s") this.leftPlayer.move = DIRECTION.DOWN;
        if (key.key === "ArrowUp") this.rightPlayer.move = DIRECTION.UP;
        if (key.key === "ArrowDown") this.rightPlayer.move = DIRECTION.DOWN;
      });

      // Stop the player from moving when there are no keys being pressed.
      document.addEventListener("keyup", (key) => {
        if (key.key === "w" || key.key === "s")
          this.leftPlayer.move = DIRECTION.IDLE;
        if (key.key === "ArrowUp" || key.key === "ArrowDown")
          this.rightPlayer.move = DIRECTION.IDLE;
      });
    },

    // Reset the ball location, the player turns and set a delay before the next round begins.
    _resetTurn: function (victor) {
      this.turnOver = true;
      console.log(
        "game over. this serve was " +
          (this.serve === this.leftPlayer ? "left" : "right")
      );
      this.ball = Ball.new.call(this);
      this.serve =
        this.serve === this.leftPlayer ? this.rightPlayer : this.leftPlayer;
      this.timer = new Date().getTime();

      victor.score++;
      console.log(
        "next serve will : " +
          (this.serve === this.leftPlayer ? "left" : "right")
      );
    },

    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function () {
      return new Date().getTime() - this.timer >= 1000;
    },

    setCanvasSize: function () {
      this.canvas.height = window.innerHeight * 0.85;
      this.canvas.width = canvas.height * 1.45;
      this.canvas.style.width = this.canvas.width + "px";
      this.canvas.style.height = this.canvas.height + "px";

      // 창 크기가 변경될 때 게임 객체의 위치 업데이트
      this.leftPlayer.x = 70;
      this.leftPlayer.y = this.canvas.height / 2 - 35;

      this.rightPlayer.x = this.canvas.width - 70;
      this.rightPlayer.y = this.canvas.height / 2 - 35;

      this.ball.x = this.canvas.width / 2 - 9;
      this.ball.y = this.canvas.height / 2 - 9;
    },
  };

  var Pong = pongGame;
  Pong.initialize();
  return canvas;
}
