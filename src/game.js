let arena = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
];

function drawWorld() {
  for (var y = 0; y < arena.length; y++) {
    console.log(arena[y]);
  }
}

function moveShapesDown() {
  canMove = true;
  // check collision
  for (let y = arena.length - 1; y >= 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] > 0 && arena[y][x] < 10) {
        if (y + 1 === arena.length || arena[y + 1][x] > 10) {
          canMove = false;
        }
      }
    }
  }
  if (canMove) {
    for (let y = arena.length - 1; y >= 0; y--) {
      for (let x = 0; x < arena[y].length; x++) {
        if (arena[y][x] > 0 && arena[y][x] < 10) {
          arena[y + 1][x] = arena[y][x];
          arena[y][x] = 0;
        }
      }
    }
    drawWorld();
  }
}

function gameLoop() {
  moveShapesDown();
  drawWorld();
  setTimeout(gameLoop, 1000);
}

drawWorld();
gameLoop();
