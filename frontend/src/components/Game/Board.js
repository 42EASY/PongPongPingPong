import EndGame from "../../pages/EndGame.js";

export default function Board(mode) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	const DIRECTION = {
		IDLE: 0,
		UP: 1,
		DOWN: 2,
		LEFT: 3,
		RIGHT: 4
	  };
	
	const maxScore = 1;

	const Ball = {
		new: function (incrementedSpeed) {
		  return {
			width: 18,
			height: 18,
			x: canvas.width / 2 - 9,
			y: canvas.height / 2 - 9,
			moveX: DIRECTION.IDLE,
			moveY: DIRECTION.IDLE,
			speed: incrementedSpeed || 9
		  };
		}
	  };
	
	  const Paddle = {
		new: function (side) {
		  return {
			width: 10,
			height: 120,
			x: side === "left" ? 40 : canvas.width - 40 - 10,
			y: (canvas.height / 2) - 35,
			score: 0,
			move: DIRECTION.IDLE,
			speed: 10
		  };
		}
	  };
	
	  const pongGame = {
		canvas: canvas,
		initialize: function () {
			console.log("Initializing the game...");
			this.canvas.height = window.innerHeight * 0.85;
			this.canvas.width = canvas.height * 1.45;
		
			this.player = Paddle.new.call(this, "left");
			this.paddle = Paddle.new.call(this, "right");
			this.ball = Ball.new.call(this);

			console.log(this.canvas.width);
			console.log(this.paddle.x);
		
			this.paddle.speed = 8;
			this.running = this.over = false;
			this.turn = this.paddle;
			this.timer = this.round = 0;
			console.log("Initialization completed.");
		
			this.menu();
			this.listen();
			window.addEventListener('resize', () => {
				this.setCanvasSize();
				this.draw();
			});
		},

		changeUrl: function (requestedUrl) {
			const path = `./src/styles${requestedUrl}.css`;
			document.getElementById("styles").setAttribute("href", path);
			history.pushState(null, null, window.location.pathname);
			EndGame(mode, this.player.score, this.paddle.score);
		},
	
		menu: function () {
			// Draw all the Pong objects in their current state
			this.draw();
	
			// Change the canvas font size and color
			context.font = '50px sans-serif';
			context.fillStyle = '#ffffff';
	
			// Draw the rectangle behind the 'Press any key to begin' text.
			context.fillRect(
				canvas.width / 2 - 350,
				canvas.height / 2 - 48,
				700,
				100
			);
	
			// Change the canvas color;
			context.fillStyle = '#000000';
	
			// Draw the 'press any key to begin' text
			context.fillText('Press any key to begin',
				canvas.width / 2,
				canvas.height / 2 + 15
			);
		},
	
		// Update all objects (move the player, paddle, ball, increment the score, etc.)
		update: function () {
			if (!this.over) {
				// If the ball collides with the bound limits - correct the x and y coords.
				if (this.ball.x <= 0) Pong._resetTurn.call(this, this.paddle, this.player);
				if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.paddle);
				if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
				if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;
	
				// Move player if they player.move value was updated by a keyboard event
				if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
				else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;
	
				// On new serve (start of each turn) move the ball to the correct side
				// and randomize the direction to add some challenge.
				if (Pong._turnDelayIsOver.call(this) && this.turn) {
					this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
					this.ball.moveY = Math.random() < 0.5 ? DIRECTION.UP : DIRECTION.DOWN;
					this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
					this.turn = null;
				}
	
				// If the player collides with the bound limits, update the x and y coords.
				if (this.player.y <= 0) this.player.y = 0;
				else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);
	
				// Move ball in intended direction based on moveY and moveX values
				if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
				else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
				if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
				else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
	
				// Handle paddle (AI) UP and DOWN movement
				if (this.paddle.y > this.ball.y - (this.paddle.height / 2)) {
					if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y -= this.paddle.speed / 1.5;
					else this.paddle.y -= this.paddle.speed / 4;
				}
				if (this.paddle.y < this.ball.y - (this.paddle.height / 2)) {
					if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y += this.paddle.speed / 1.5;
					else this.paddle.y += this.paddle.speed / 4;
				}
	
				// Handle paddle (AI) wall collision
				if (this.paddle.y >= this.canvas.height - this.paddle.height) this.paddle.y = this.canvas.height - this.paddle.height;
				else if (this.paddle.y <= 0) this.paddle.y = 0;
	
				// Handle Player-Ball collisions
				if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
					if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
						this.ball.x = (this.player.x + this.ball.width);
						this.ball.moveX = DIRECTION.RIGHT;
					}
				}
	
				// Handle paddle-ball collision
				if (this.ball.x - this.ball.width <= this.paddle.x && this.ball.x >= this.paddle.x - this.paddle.width) {
					if (this.ball.y <= this.paddle.y + this.paddle.height && this.ball.y + this.ball.height >= this.paddle.y) {
						this.ball.x = (this.paddle.x - this.ball.width);
						this.ball.moveX = DIRECTION.LEFT;
					}
				}
			}
	
			// // Handle the end of round transition
			// // Check to see if the player won the round.
			if (this.player.score === maxScore) {
				this.over = true;
				setTimeout(function () { Pong.changeUrl("/endgame"); }, 1000);
			}
			// Check to see if the paddle/AI has won the round.
			else if (this.paddle.score === maxScore) {
				this.over = true;
				setTimeout(function () { Pong.changeUrl("/endgame"); }, 1000);
			}
		},
	
		// Draw the objects to the canvas element
		draw: function () {
			// Clear the Canvas
			context.clearRect(
				0,
				0,
				canvas.width,
				canvas.height
			);
	
			// Set the fill style to black
			context.fillStyle = '#000000';
	
			// Draw the background
			context.fillRect(
				0,
				0,
				canvas.width,
				canvas.height
			);
	
			// Set the fill style to white (For the paddles and the ball)
			context.fillStyle = '#ffffff';
	
			// Draw the Player
			context.fillRect(
				this.player.x,
				this.player.y,
				this.player.width,
				this.player.height
			);
	
			// Draw the Paddle
			context.fillRect(
				this.paddle.x,
				this.paddle.y,
				this.paddle.width,
				this.paddle.height
			);
	
			// Draw the net (Line in the middle)
			context.beginPath();
			context.setLineDash([10, 10]);
			context.moveTo((canvas.width / 2), canvas.height);
			context.lineTo((canvas.width / 2), 0);
			context.lineWidth = 8;
			context.strokeStyle = '#ffffff';
			context.stroke();
			
			// Draw the Ball
			if (this._turnDelayIsOver()) {
				context.beginPath();
				context.arc (
					this.ball.x + this.ball.width / 2,
					this.ball.y + this.ball.height / 2,
					this.ball.width / 2,
					0,
					2 * Math.PI
				);
				context.fillStyle = '#3ec70b';
				context.fill();
			}
	
			// Set the default canvas font and align it to the center
			context.font = 'bold 70px sans-serif';
			context.textAlign = 'center';
	
			// Draw the players score (left)
			context.fillStyle = '#ffffff';
			context.fillText(
				this.player.score.toString().padStart(2, '0'),
				(canvas.width / 2) - 60,
				70
			);
	
			// Draw the paddles score (right)
			context.fillText(
				this.paddle.score.toString().padStart(2, '0'),
				(canvas.width / 2) + 60,
				70
			);
		},
	
		loop: function () {
			pongGame.update();
			pongGame.draw();
	
			// If the game is not over, draw the next frame.
			if (!pongGame.over) requestAnimationFrame(pongGame.loop);
		},
	
		listen: function () {
			document.addEventListener('keydown', (key) => {
				console.log('Key down:', key.key);
				// Handle the 'Press any key to begin' function and start the game.
				if (this.running === false) {
					this.running = true;
					window.requestAnimationFrame(() => this.loop());
				}
				if (key.key === "ArrowUp" || key.key === "w") this.player.move = DIRECTION.UP;
				if (key.key === "ArrowDown" || key.key === "s") this.player.move = DIRECTION.DOWN;
			});
	
			// Stop the player from moving when there are no keys being pressed.
			document.addEventListener('keyup', (key) => { console.log('Key up:', key.key); this.player.move = DIRECTION.IDLE; });
		},
	
		// Reset the ball location, the player turns and set a delay before the next round begins.
		_resetTurn: function(victor, loser) {
			this.ball = Ball.new.call(this, this.ball.speed);
			this.turn = loser;
			this.timer = (new Date()).getTime();
	
			victor.score++;
		},
	
		// Wait for a delay to have passed after each turn.
		_turnDelayIsOver: function() {
			return ((new Date()).getTime() - this.timer >= 1000);
		},

		setCanvasSize: function() {
			this.canvas.height = window.innerHeight * 0.85;
			this.canvas.width = canvas.height * 1.45;
			this.canvas.style.width = this.canvas.width + "px";
			this.canvas.style.height = this.canvas.height + "px";
		
			// 창 크기가 변경될 때 게임 객체의 위치 업데이트
			this.player.x = 70;
				this.player.y = (this.canvas.height / 2) - 35;
	
				this.paddle.x = this.canvas.width - 70;
				this.paddle.y = (this.canvas.height / 2) - 35;
	
				this.ball.x = this.canvas.width / 2 - 9;
				this.ball.y = this.canvas.height / 2 - 9;
			
		}
	};

	var Pong = pongGame;
	Pong.initialize();
	return canvas;
}