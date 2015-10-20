(function (window) {
    "use strict";
    /*global console, Paddle, Ball, Block, Image, document, window*/

  // GAME object, holds score and current status, as well as all objects on screen.
    var Game = {
        init: function () {
            var block,
                i,
                img = new Image();
            img.src = 'img/log.png';
            this.canvas = document.getElementById("game");
            this.ctx = this.canvas.getContext("2d");
            this.noBlocks = 151;
            this.blocks = [];
            this.paddle = new Paddle(img);
            this.ball = new Ball();
            this.playing = false;
            this.winStatus = 'playing';
            this.score = 0;
            // THIS MUST BE IN ANY GAME for the frame to update
            this.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

            //Add listeners for key presses
            window.addEventListener("keydown", this.buttonDown);
            window.addEventListener("keyup", this.buttonUp);

            // Add all blocks to game object to draw on screen later
            for (i = 0; i < this.noBlocks; i += 1) {
                block = new Block();
                this.blocks.push(block);
            }
            // Start the game
            this.loop();
            this.message("Press SPACE to start", 40, this.canvas.height / 2);
        },
        //On the press of a button, figure out what the key is
        buttonDown: function (e) {
            if (e.keyCode === 37 || e.keyCode ===  65) { // 'A' or LEFT
                Game.paddle.moving = "left";
            } else if (e.keyCode === 39 || e.keyCode === 68) { //'D' or RIGHT
                Game.paddle.moving = "right";
            }
        },
        //On release of a button, stop moving the paddle
        buttonUp: function (e) {
            if (e.keyCode === 37 || e.keyCode === 65) { // 'A' or LEFT
                Game.paddle.moving = false;
            } else if (e.keyCode === 39 || e.keyCode === 68) { // 'D' or RIGHT
                Game.paddle.moving = false;
            } else if (e.keyCode === 32) { // SPACE to pause
                if (Game.playing === true) {
                    Game.playing = false;
                } else {
                    Game.playing = true;
                    if (Game.winStatus === 'playing') {
                        Game.loop();
                    } else {
                        Game.init();
                    }
                }
            } else if (e.keyCode === 82) { // 'R' to reset
                Game.init();
            }
        },
        //Draw some text on the canvas based on the parameters provided
        message: function (text, x, y) {
            Game.ctx.font = 'Bold 30pt Calibri';
            Game.ctx.fillStyle = '#000';
            Game.ctx.fillText(text, x, y);
        },
        //Run this until the game ends
        loop: function () {
            // CLEAR the canvas on each frame so you can draw the ball in its new place
            Game.ctx.fillStyle = "#fff";
            Game.ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
            // REDRAW all game objects (Paddle and Ball)
            Game.paddle.draw();
            Game.paddle.update();
            //draw here
            Game.ball.draw();
            //update here
            Game.ball.update();

            Game.message("Score: " + Game.score, 0, Game.canvas.height - 20);

            var x = 0,
                y = 0,
                i = 0,
                blockCount = 0;
            // Only draw the blocks that have not been hit
            for (i = 0; i < Game.blocks.length; i += 1) {
                if (Game.blocks[i].hit === false) {
                    Game.blocks[i].draw(x, y);
                    blockCount += 1;
                }
                x += Game.blocks[i].width + Game.blocks[i].padding;
                if (x > Game.canvas.width) {
                    x = 0;
                    y += Game.blocks[i].height + Game.blocks[i].padding;
                }
            }
            if (blockCount === 0) {
                Game.message('Winner!');
                Game.playing = false;
                Game.winStatus = 'won';
                Game.init();
            }
            // THIS MUST BE INCLUDED IN ANY GAME!
            if (Game.playing === true) {
                Game.currentFrame = Game.requestAnimationFrame.call(window, Game.loop);
            }
        }
    };

    // PADDLE functions - Attributes like width and speed as well as functions to move based on keys
    var Paddle = function (img) {
        this.height = 10;
        this.width = 100;
        this.sprite = img;
        this.x = Game.canvas.width / 2 - this.width / 2;
        this.y = Game.canvas.height - this.height;
        this.speed = 5;
        this.moving = false;
        this.colour = "#000";
        this.padding = 10;
    };

    Paddle.prototype.draw = function () {
        Game.ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    };

    Paddle.prototype.update = function () {
        if (this.moving === "left" && this.x > 0) {
            this.x -= this.speed;
        } else if (this.moving === "right" && this.x + this.width < Game.canvas.width) {
            this.x += this.speed;
        }
    };

    // BLOCK functions - Attributes and function to draw based on coordinates
    var Block = function () {
        this.height = 10;
        this.width = 40;
        this.padding = 10;
        this.colour = "#000";
        this.hit = false;
        this.score = 10;
    };

    // Redraw the block on each frame
    Block.prototype.draw = function (x, y) {
        this.x = x;
        this.y = y;
        Game.ctx.fillStyle = this.colour;
        Game.ctx.fillRect(x, y, this.width, this.height);
    };

    // BALL functions - Set basic attributes and draw, change speed on collision and detect collisions
    var Ball = function () {
        this.radius = 10;
        this.x = Game.canvas.width / 2;
        this.y = Game.canvas.height / 2;
        this.radians = Math.random() * 2 * Math.PI;
        this.colour = "#008080";
        this.speed = 5;
        this.speedInc = 0.3;
        this.deltaX = Math.cos(this.radians) * this.speed;
        this.deltaY = Math.sin(this.radians) * this.speed;
    };

    // Redraw the ball in its new position on each new frame
    Ball.prototype.draw = function () {
        Game.ctx.fillStyle = this.colour;
        Game.ctx.beginPath();
        Game.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        Game.ctx.stroke();
        Game.ctx.fill();
    };

    // Update the speed of the ball on each hit
    Ball.prototype.updateSpeed = function () {
        this.speed += this.speedInc;
        this.deltaX = Math.cos(this.radians) * this.speed;
        this.deltaY = Math.sin(this.radians) * this.speed;
    };

    Ball.prototype.update = function () {
        var i = 0,
            block,
            blockHit = false;
        this.x += this.deltaX;
        this.y += this.deltaY;
        //Check to see if any blocks have been hit
        for (i  = 0; i < Game.blocks.length; i += 1) {
            block = Game.blocks[i];
            if (block.hit === false) {
                if (this.x > block.x && this.x < block.x + block.width) {
                    if (this.y >= block.y && this.y <= block.y + block.height) {
                        block.hit = true;
                        Game.score += block.score;
                        if (Game.paddle.width >= 40) {
                            Game.paddle.width -= 10;
                        }
                        blockHit = true;
                        this.updateSpeed();
                    }
                }
            }
        }
        if (this.x < this.radius) {
            // LEFT
            this.deltaX = -this.deltaX;
            this.x = 2 * (this.radius) - this.x;
        } else if (this.x > Game.canvas.width - this.radius) {
            // RIGHT
            this.deltaX = -this.deltaX;
            this.x = 2 * (Game.canvas.width - this.radius) - this.x;
        }
        if (this.y < this.radius || blockHit) {
            // TOP
            //set i to 1
            var i = 1;
            // Stop ball yo yo ing when it hits the top, ensure it keeps coming back down
            if (this.deltaY < 0) {
                this.deltaY = -this.deltaY;
            }
            this.y = 2 * (this.radius) - this.y;
        } else if (this.y > Game.canvas.height - this.radius) {
              // BOTTOM
            if (this.x >= Game.paddle.x - 10 && this.x <= Game.paddle.x + Game.paddle.width / 2) {
                  //LEFT SIDE OF paddle
                this.deltaX = -this.deltaX;
                this.x = 2 * (this.radius) - this.x;
                this.deltaY = -this.deltaY;
                this.y = 2 * (Game.canvas.height - this.radius) - this.y;
            } else if (this.x <= Game.paddle.x + Game.paddle.width + 10 && this.x >= Game.paddle.x + Game.paddle.width / 2) {
                //RIGHT SIDE OF PADDLE
                this.deltaX = -this.deltaX;
                this.x = 2 * (Game.canvas.width - this.radius) - this.x;
                this.deltaY = -this.deltaY;
                this.y = 2 * (Game.canvas.height - this.radius) - this.y;
            } else {
                //PADDLE MISSED
                Game.message("Foiled Again, SPACE to restart", 40, Game.canvas.height / 2);
                Game.playing = false;
                Game.winStatus = 'lost';
            }
        }
    };

    Game.init();
}(window));
