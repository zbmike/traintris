import "./styles/index.scss";
const tetrominoes = require('./tetromino');

const arenaWidth = 12;
const arenaHeight = 20;

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById('canvas');
  canvas.width = 480;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  ctx.scale(40, 40);

  let piece = tetrominoes.t2;

  let currentPosition = { x: 5, y: 0 };
  
  render(piece, currentPosition, ctx);
});

function render(piece, currentPosition, ctx) {
  renderFrame(piece, currentPosition, ctx);
  requestAnimationFrame(render);
}

function renderFrame(piece, currentPosition, ctx) {
  console.log(ctx);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  drawTetromino(piece, currentPosition, ctx);
}

function drawTetromino(piece, offset, ctx){
  piece.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value){
        ctx.fillStyle = 'green';
        ctx.fillRect(x + offset.x,
                         y + offset.y,
                         1, 1);
      }
    });
  });
}