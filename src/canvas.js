const tetrominoes = require('./tetromino');

const arenaWidth = 12;
const arenaHeight = 20;

const canvas = document.getElementById('canvas');
canvas.width = 480;
canvas.height = 800;
const ctx = canvas.getContext('2d');
ctx.scale(40, 40);

let piece = tetrominoes.t2;

let currentPosition = { x: 5, y: 0 };

render();

let lastTime = 0;
let timer = 0;

function render(time = 0) {
    const frameTime = time - lastTime;
    lastTime = time;

    timer += frameTime;
    if (timer > 1000) {
        currentPosition.y += 1;
        timer = 0;
    }

    renderFrame();
    requestAnimationFrame(render);
}

function renderFrame() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);

    drawTetromino();
}

function drawTetromino() {
    piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = 'green';
                ctx.fillRect(x + currentPosition.x,
                    y + currentPosition.y,
                    1, 1);
            }
        });
    });
}