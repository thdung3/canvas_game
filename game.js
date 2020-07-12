/*
  Code modified from:
  http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
  using graphics purchased from vectorstock.com
*/

/* Initialization.
Here, we create and add our "canvas" to the page.
We also load all of our images. 
*/


let canvas;
let ctx;
let maxWidthBg = 1200;

// canvas = document.createElement("canvas");
canvas = document.getElementById('myCanvas')
ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

let gameSpriteReady
let gameSprite

let startTime = Date.now();
const SECONDS_PER_ROUND = 30;
let hiScore = 0;
let score = 0;
let isLose = false;
let maxJump = 10;
let heightJump = 10;
let countJump = 0;
let isJumpMax = false;
let speedTotal = 20;
let isBigTreeShow = false
let isChooseBigTreeStyle = false
let isSmallTreeShow = false
let isChooseSmallTreeStyle = false
let isBirdShow = false
let barriers = ['big', 'small', 'bird']
let randomMonster = []
let randomPosition = canvas.width
let myStorage = window.localStorage;
var rect = {
    x: 380,
    y: 170,
    width: 95,
    height: 42
};


// Size: 1233 x 68
let background = {
    x: 0,
    y: 300,
    posX: 0,
    posY: 51,
    width: canvas.width,
    height: 51,
    speed: 20,
}

let player = {
    x: 50,
    y: (background.y - 34),
    yMove: (background.y - 34), // 166
    yDown: (background.y - 17), // 183
    posX: 846,
    posY: 0,
    posXMove: 846,
    posYMove: 0,
    posXDown: 1110,
    posYDown: 20,
    width: 44,
    height: 47,
    widthMove: 44,
    heightMove: 47,
    widthDown: 60,
    heightDown: 30,
    speed: 5,
    frameX: 0,
    frameY: 0,
    // state: stop, move, up, down
    state: 'stop',
    totalFramesMove: 3,
    totalFramesUp: 0,
    totalFramesDown: 1,
    isJumping: false
}

let bigTree = {
    x: canvas.width,
    y: (background.y - 34),
    posX: 333,
    posY: 0,
    width: 25,
    height: 47,
    speed: speedTotal,
    frameX: 1,
    amountTree: 2
}

let smallTree = {
    x: canvas.width,
    y: (background.y - 20),
    posX: 225,
    posY: 0,
    width: 18,
    height: 40,
    speed: speedTotal,
    frameX: 0,
    amountTree: 1
}

let bird = {
    x: canvas.width,
    y: (background.y - 59),
    posX: 135,
    posY: 0,
    width: 45,
    height: 40,
    speed: speedTotal,
    frameX: 0,
    totalFrames: 1,
}

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
function isInside(pos, rect) {
    return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.heigth && pos.y > rect.y
}

var rect = {
    x: 380,
    y: 170,
    width: 95,
    heigth: 42
};

function loadImages() {
    gameSprite = new Image();
    gameSprite.onload = function () {
        // show the background image
        gameSpriteReady = true;
    };
    gameSprite.src = ('images/dino.png')

    if (!isNaN(myStorage.getItem('hiScore'))) {
        hiScore = myStorage.getItem('hiScore')
    }
}

/** 
 * Keyboard Listeners
 * You can safely ignore this part, for now. 
 * 
 * This is just to let JavaScript know when the user has pressed a key.
*/
let keysDown = {};
function setupKeyboardListeners() {
    // Check for keys pressed where key represents the keycode captured
    // For now, do not worry too much about what's happening here. 
    addEventListener("keydown", function (key) {
        keysDown[key.keyCode] = true;
    }, false);

    addEventListener("keyup", function (key) {
        delete keysDown[key.keyCode];
        player.state = 'move';
    }, false);
}

/**
 *  Update game objects - change player position based on key pressed
 *  and check to see if the monster has been caught!
 *  
 *  If you change the value of 5, the player will move at a different rate.
 */
let update = function () {
    // Update the time.
    // if (score == SECONDS_PER_ROUND) {
    //     isLose = true
    //     return
    // }
    if (isLose) {
        if (score > hiScore) {
            hiScore = score
            myStorage.setItem('hiScore', score)
        }
        return
    }
    score = Math.floor((Date.now() - startTime) / 10);

    // default state
    if (player.isJumping == false && player.state != 'down') {
        player.state = 'move'
        player.y = player.yMove
        player.posX = player.posXMove
        player.posY = player.posYMove
        player.width = player.widthMove
        player.height = player.heightMove
    }

    if ((38 in keysDown || 32 in keysDown) && player.state != 'down') { // Player is holding up key
        player.isJumping = true
    }
    if (player.isJumping == true) {
        jump()
    }
    if ((40 in keysDown) && player.isJumping == false) { // Player is holding down key
        player.state = 'down'
        player.y = player.yDown
        player.posX = player.posXDown
        player.posY = player.posYDown
        player.width = player.widthDown
        player.height = player.heightDown
    }

    // Move background
    background.posX += background.speed;
    if (background.posX >= maxWidthBg) {
        background.posX = 0;
    }

    // Move big tree
    if (isBigTreeShow) {
        bigTree.x -= speedTotal
    }
    if (bigTree.x < (0 - bigTree.amountTree * bigTree.width)) {
        isBigTreeShow = false
        bigTree.x = canvas.width
        randomMonster.shift()
        isChooseBigTreeStyle = false
    }
    // Move small tree
    if (isSmallTreeShow) {
        smallTree.x -= speedTotal
    }
    if (smallTree.x < (0 - smallTree.amountTree * smallTree.width)) {
        isSmallTreeShow = false
        smallTree.x = canvas.width
        randomMonster.shift()
        isChooseSmallTreeStyle = false
    }
    // Move bird
    if (isBirdShow) {
        bird.x -= speedTotal
    }
    if (bird.x < (0 - bird.width)) {
        isBirdShow = false
        bird.x = canvas.width
        randomMonster.shift()
    }

    // Get position to push monster
    randomPosition -= speedTotal

    // Check if player and big tree collided.
    if (
        player.x + player.width > bigTree.x
        && player.y + player.height > bigTree.y
        && bigTree.x + bigTree.width > player.x
        && bigTree.y + bigTree.height > player.y
    ) {
        isLose = true;
    }

    // Check if player and small tree collided.
    if (
        player.x + player.width > smallTree.x
        && player.y + player.height > smallTree.y
        && smallTree.x + smallTree.width > player.x
        && smallTree.y + smallTree.height > player.y
    ) {
        isLose = true;
    }

    // Check if player and bird collided.
    if (
        player.x + player.width > bird.x
        && player.y + player.height > bird.y
        && bird.x + bird.width > player.x
        && bird.y + bird.height > player.y
    ) {
        isLose = true;
    }
};

function jump() {
    player.isJumping = true
    player.state = 'up'
    if (isJumpMax == false) {
        if (countJump < maxJump) {
            countJump++;
            player.y -= heightJump
        } else {
            isJumpMax = true
        }
    } else {
        if (countJump > 0) {
            countJump--;
            player.y += heightJump
        } else {
            isJumpMax = false
            player.isJumping = false
        }
    }
}

function handlePlayerFrame() {
    if (isLose == false) {
        switch (player.state) {
            case 'move': {
                if (player.frameX < player.totalFramesMove) {
                    if (player.frameX == 0) { player.frameX++ }
                    player.frameX++
                } else {
                    player.frameX = 0;
                }
                break;
            }
            case 'up': {
                if (player.frameX < player.totalFramesUp) {
                    player.frameX++
                } else {
                    player.frameX = 0;
                }
                break;
            }
            case 'down': {
                if (player.frameX < player.totalFramesDown) {
                    player.frameX++
                } else {
                    player.frameX = 0;
                }
                break;
            }
            default:
                player.frameX = 0;
        }
    }
}

function handleBirdFrame() {
    if (isLose == false) {
        if (bird.frameX < bird.totalFrames) {
            bird.frameX++
        } else {
            bird.frameX = 0;
        }
    }
}

function handleRandomBigTree() {
    if (isBigTreeShow == true && isChooseBigTreeStyle == false) {
        // Random Image of tree
        bigTree.frameX = Math.floor(Math.random() * 3)
        // Random amount of tree
        bigTree.amountTree = Math.floor(Math.random() * 3) + 1
        isChooseBigTreeStyle = true
    }
}

function handleRandomSmallTree() {
    if (isSmallTreeShow == true && isChooseSmallTreeStyle == false) {
        // Random Image of tree
        smallTree.frameX = Math.floor(Math.random() * 3)
        // Random amount of tree
        smallTree.amountTree = Math.floor(Math.random() * 3) + 1
        isChooseSmallTreeStyle = true
    }
}

function handleRandomPosition() {
    //0 Big tree, 1 Small tree, 2 Bird
    randomPosition = Math.floor(Math.floor(Math.random() * (canvas.width - canvas.width / 1.25)) + canvas.width / 1.25)
    let added = false;
    while (!added) {
        let index = Math.floor(Math.random() * 3)
        if (randomMonster.includes(barriers[index]) == false) {
            randomMonster.push(barriers[index])
            switch (index) {
                case 0: {
                    isBigTreeShow = true;
                    break;
                }
                case 1: {
                    isSmallTreeShow = true;
                    break;
                }
                case 2: {
                    isBirdShow = true;
                    break;
                }
            }
            added = true
        }
    }
}

function resetGame() {
    startTime = Date.now();
    score = 0;
    isLose = false;
    countJump = 0;
    speedTotal = 20;
    isBigTreeShow = false
    isChooseBigTreeStyle = false
    isSmallTreeShow = false
    isChooseSmallTreeStyle = false
    isBirdShow = false
    randomMonster = []
    randomPosition = canvas.width
    let background = {
        x: 0,
        y: 300,
        posX: 0,
        posY: 51,
        width: canvas.width,
        height: 51,
        speed: 20,
    }

    player = {
        x: 50,
        y: (background.y - 34),
        yMove: (background.y - 34), // 166
        yDown: (background.y - 17), // 183
        posX: 846,
        posY: 0,
        posXMove: 846,
        posYMove: 0,
        posXDown: 1110,
        posYDown: 20,
        width: 44,
        height: 47,
        widthMove: 44,
        heightMove: 47,
        widthDown: 60,
        heightDown: 30,
        speed: 5,
        frameX: 0,
        frameY: 0,
        // state: stop, move, up, down
        state: 'stop',
        totalFramesMove: 3,
        totalFramesUp: 0,
        totalFramesDown: 1,
        isJumping: false
    }

    bigTree = {
        x: canvas.width,
        y: (background.y - 34),
        posX: 333,
        posY: 0,
        width: 25,
        height: 47,
        speed: speedTotal,
        frameX: 1,
        amountTree: 2
    }

    smallTree = {
        x: canvas.width,
        y: (background.y - 20),
        posX: 225,
        posY: 0,
        width: 18,
        height: 40,
        speed: speedTotal,
        frameX: 0,
        amountTree: 1
    }

    bird = {
        x: canvas.width,
        y: (background.y - 59),
        posX: 135,
        posY: 0,
        width: 45,
        height: 40,
        speed: speedTotal,
        frameX: 0,
        totalFrames: 1,
    }
}

/**
 * This function, render, runs as often as possible.
 */
var render = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    //background 
    if (gameSpriteReady) {
        ctx.drawImage(gameSprite, background.posX, background.posY, background.width, background.height, background.x, background.y, background.width, background.height);
        if (background.posX >= (maxWidthBg - canvas.width - background.speed)) {
            ctx.drawImage(gameSprite, 0, background.posY, background.width, background.height, maxWidthBg - background.posX - 2 * background.speed, background.y, background.width, background.height);
        }
    }

    // Character
    if (gameSpriteReady) {
        handlePlayerFrame()
        ctx.drawImage(gameSprite, player.posX + (player.frameX * player.width), player.posY, player.width, player.height, player.x, player.y, player.width, player.height);
    }
    if (gameSpriteReady) {
        if (randomPosition <= Math.floor(canvas.width / 4)) {
            handleRandomPosition()
        }
        if (isBigTreeShow) {
            handleRandomBigTree()
            ctx.drawImage(gameSprite, bigTree.posX + (bigTree.frameX * bigTree.width), bigTree.posY, bigTree.width * bigTree.amountTree, bigTree.height, bigTree.x, bigTree.y, bigTree.width * bigTree.amountTree, bigTree.height);
        }
        if (isSmallTreeShow) {
            handleRandomSmallTree()
            ctx.drawImage(gameSprite, smallTree.posX + (smallTree.frameX * smallTree.width), smallTree.posY, smallTree.width * smallTree.amountTree, smallTree.height, smallTree.x, smallTree.y, smallTree.width * smallTree.amountTree, smallTree.height);
        }
        if (isBirdShow) {
            handleBirdFrame()
            ctx.drawImage(gameSprite, bird.posX + (bird.frameX * bird.width), bird.posY, bird.width, bird.height, bird.x, bird.y, bird.width, bird.height);
        }
    }
    ctx.font = "28px Arial";
    ctx.fillText(`Hi Score: ${hiScore}`, 100, 50);
    ctx.fillText(`Score: ${score}`, 600, 50);
    if (isLose) {
        ctx.fillText(`Game Over`, 350, 150);
        ctx.rect(380, 170, 95, 42);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillStyle = 'rgba(225,225,225,0.5)';
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.fillText('Reset', 390, 200);
        canvas.addEventListener('click', function (evt) {
            var mousePos = getMousePos(canvas, evt);
            // debugger;
            if (isInside(mousePos, rect)) {
                resetGame()
            }
        }, false);

    }
};

/**
 * The main game loop. Most every game will have two distinct parts:
 * update (updates the state of the game, in this case our hero and monster)
 * render (based on the state of our game, draw the right things)
 */

setInterval(function () {
    update();
    render();
    // requestAnimationFrame(main);
}, 50)

// var main = function () {
//     update();
//     render();

//     // Request to do this again ASAP. This is a special method
//     // for web browsers. 
//     requestAnimationFrame(main);
// };

// Cross-browser support for requestAnimationFrame.
// Safely ignore this line. It's mostly here for people with old web browsers.
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
loadImages();
setupKeyboardListeners();
// main();

