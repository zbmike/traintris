import "./styles/index.scss";
const THREE = require('three');
const tetrominoes = require('./tetromino');

// Tetris logic
const ARENA_WIDTH = 8;
const ARENA_HEIGHT = 12;

let arena = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
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

arena = new Array(ARENA_HEIGHT).fill().map(()=> new Array(ARENA_WIDTH));
console.log(arena);

let gameover = false;
let pause = true;
let forward = true;
let piece, next, score = 0, level = 1;
let speed = 1000; // the smaller the faster

function clearActiveBlock() {
  for (let y = 0; y < arena.length; y++) {
    for (let x = 0; x < arena[0].length; x++) {
      arena[y][x] = (arena[y][x] > 10) ? arena[y][x] : 0;
    }
  }
}

function predictCollision(piece) {
  const { tetromino, x, y } = piece;
  const mid = (tetromino.length <= 2) ? 0 : 1;
  for (let ly = 0; ly < tetromino.length; ly++) {
    const actualY = y + ly - mid;
    if (actualY < 0) continue;
    for (let lx = 0; lx < tetromino[0].length; lx++) {
      const actualX = x + lx - mid;
      if (tetromino[ly][lx]) {
        if (actualY >= ARENA_HEIGHT) return true;
        if (arena[actualY][actualX] > 10) return true;
        else if (actualX < 0) return 1;
        else if (actualX >= ARENA_WIDTH) return -1;
      }
    }
  }
  return false;
}

function addPieceToArena(piece) {
  const { tetromino, x, y } = piece;
  const mid = (tetromino.length === 2) ? 0 : 1;
  for (let ly = 0; ly < tetromino.length; ly++) {
    const actualY = y + ly - mid;
    if (actualY < 0) continue;
    for (let lx = 0; lx < tetromino[0].length; lx++) {
      const actualX = x + lx - mid;
      if (tetromino[ly][lx]) {
        if (actualX < 0) throw Error('Block should not be able to go outside');
        arena[actualY][actualX] = tetromino[ly][lx];
      } else {
        if (actualX < 0) continue;
      }
    }
  }
}

function movePieceDown() {
  let nextPiece = Object.assign({}, piece);
  nextPiece.y++;
  if (predictCollision(nextPiece)) {
    solidify();
  } else {
    clearActiveBlock();
    piece.y++;
    addPieceToArena(piece);
  }

  resetScene();
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
}

// similar to move down but will not cause solidify
function movePieceLeft() {
  let nextPiece = Object.assign({}, piece);
  nextPiece.x--;
  if (!predictCollision(nextPiece)) {
    clearActiveBlock();
    piece.x--;
    addPieceToArena(piece);
  }

  resetScene();
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
}

function movePieceRight() {
  let nextPiece = Object.assign({}, piece);
  nextPiece.x++;
  if (!predictCollision(nextPiece)) {
    clearActiveBlock();
    piece.x++;
    addPieceToArena(piece);
  }

  resetScene();
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
}

function rotatePiece() {
  let nextPiece = Object.assign({}, piece);
  const rotation = (nextPiece.rotation + 1) % 4;
  nextPiece.rotation = rotation;
  nextPiece.tetromino = tetrominoes[nextPiece.type][rotation];
  
  const result = predictCollision(nextPiece);
  if (result) {
    if (result === 1) {
      nextPiece.x++;
      if (!predictCollision(nextPiece)) {
        clearActiveBlock();
        piece.rotation = rotation;
        piece.x++;
        piece.tetromino = tetrominoes[nextPiece.type][rotation];
        addPieceToArena(piece);
      } else {
        nextPiece.x++;
        if (!predictCollision(nextPiece)) {
          clearActiveBlock();
          piece.rotation = rotation;
          piece.x+=2;
          piece.tetromino = tetrominoes[nextPiece.type][rotation];
          addPieceToArena(piece);
        }
      }
    } else if (result === -1) {
      nextPiece.x--;
      if (!predictCollision(nextPiece)) {
        clearActiveBlock();
        piece.rotation = rotation;
        piece.x--;
        piece.tetromino = tetrominoes[nextPiece.type][rotation];
        addPieceToArena(piece);
      }
    }
  } else {
    clearActiveBlock();
    piece.rotation = rotation;
    piece.tetromino = tetrominoes[nextPiece.type][rotation];
    addPieceToArena(piece);
  }
  resetScene();
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
}

function solidify() {
  for (let y = 0; y < arena.length; y++) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] > 0 && arena[y][x] < 10) {
        arena[y][x] = arena[y][x] + 10;
      }
    }
  }
  scoreRow();
  piece = next;
  next = generateNewPiece();
  drawNextTetro();
  if (predictCollision(piece)) {
    gameover = true;
    alert('Game Over!');
  } else {
    addPieceToArena(piece);
  }
}

function scoreRow() {
  let lines = 0;
  for (let y = 0; y < arena.length; y++) {
    let fullLine = true;
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] < 10) {
        fullLine = false;
      }
    }
    if (fullLine) {
      arena.splice(y, 1);
      arena.splice(0, 0, new Array(8).fill(0))
      y--;
      lines++;
    }
  }
  switch (lines) {
    case 1:
      score += 40;
      break;
    case 2:
      score += 100;
      break;
    case 3:
      score += 300;
      break;
    case 4:
      score += 1200;
      break;
  }
  if (lines) {
    document.getElementById('score').innerText = score;
    level = Math.floor(score/800 + 1);
    document.getElementById('level').innerText = level;
    speed = 1000 - (level-1)*80;
  };
}

function generateNewPiece() {
  const pieces = ['t', 'z', 's', 'o', 'i', 'j', 'l'] 
  const type = pieces[Math.floor(Math.random()*pieces.length)];
  return {
    type, rotation: 0, x:3, y:0, tetromino:tetrominoes[type][0]
  }
}

function hardDrop() {
  let nextPiece = Object.assign({}, piece);
  while (!predictCollision(nextPiece)) {
    nextPiece.y++;
  }
  clearActiveBlock();
  piece.y = nextPiece.y - 1;
  addPieceToArena(piece);

  resetScene();
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
}

document.onkeydown = function (e) {
  // console.log(e.keyCode)
  if (!gameover && !pause){
    if (e.keyCode === 65) {
      e.preventDefault();
      movePieceLeft();
    } else if (e.keyCode === 68) {
      e.preventDefault();
      movePieceRight();
    } else if (e.keyCode === 83) {
      e.preventDefault();
      timer = 0;
      movePieceDown();
    } else if (e.keyCode === 32) {
      e.preventDefault();
      rotatePiece();
    } else if (e.keyCode === 87) {
      e.preventDefault();
      timer = 500;
      hardDrop();
    }
  }
  if (e.keyCode === 81) {
    e.preventDefault();
    pause = !pause;
    if (!pause) gameLoop();
  } 
}

// three.js stuff below
let Tetris = {};
let vector = new THREE.Vector3(0, 0, 0);

Tetris.init = function () {
  // scene dimension
  const WIDTH = 480;
  const HEIGHT = 720;

  // camera attributes
  const VIEW_ANGLE = 90;
  const ASPECT = WIDTH / HEIGHT;
  const NEAR = 0.1;
  const FAR = 10000;

  // create renderer, camera and a scene
  Tetris.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  Tetris.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT,
    NEAR, FAR);
  Tetris.scene = new THREE.Scene();

  // reposition the camera
  Tetris.camera.position.z = 450;
  Tetris.scene.add(Tetris.camera);

  Tetris.renderer.setSize(WIDTH, HEIGHT);

  // attach the render-supplied DOM element
  document.getElementById('main')
  .appendChild(Tetris.renderer.domElement);
}

Tetris.init();

// make a bounding box to align the tetrominoes
let boundingBoxConfig = {
  width: 480,
  height: 720,
  depth: 60,
  splitX: 8,
  splitY: 12,
  splitZ: 1
};

Tetris.boundingBoxConfig = boundingBoxConfig;
Tetris.blockSize = boundingBoxConfig.width / boundingBoxConfig.splitX;

Tetris.pointLight = new THREE.PointLight(0xffffff, 1.5);
Tetris.pointLight.position.set(-100, 100, 500);
Tetris.scene.add(Tetris.pointLight);

let cubeGeo = new THREE.CubeGeometry(
  boundingBoxConfig.width, boundingBoxConfig.height, boundingBoxConfig.depth,
  boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ);

let boundingBox = new THREE.LineSegments(
  new THREE.EdgesGeometry(cubeGeo),
  new THREE.LineBasicMaterial({ color: 0x1073C4, linewidth: 2 })
);
Tetris.scene.add(boundingBox);

// function to convert arena blocks to 3d objects
Tetris.addStaticBlock = function (x, y, val) {
  let color;
  switch (val) {
    case 1:
      color = 0x72CB3B
      break;
    case 2:
    case 3:
      color = 0xFFD500
      break;
    case 4:
    case 5:
      color = 0xFF971C
      break;
    case 6:
      color = 0xFF3213
      break;
    case 7:
      color = 0x1073C4
      break;
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
    case 17:
      color = 0x0341AE
      break;
    default:
      color = 0x0341AE
      break;
  }
  // if (val > 0 && val < 10) color = 0xff0000;
  // else if (val > 10) color = 0x0000ff;

  let blockGeo = new THREE.CubeGeometry(Tetris.blockSize+1, Tetris.blockSize+1, Tetris.blockSize+1);

  let outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(blockGeo),
    new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 5 })
  );

  const mesh = new THREE.Mesh(new THREE.CubeGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize),
    new THREE.MeshPhongMaterial({ color, wireframe: false })
  );

  mesh.position.x = (x - Tetris.boundingBoxConfig.splitX / 2) * Tetris.blockSize + Tetris.blockSize / 2;
  mesh.position.y = (Tetris.boundingBoxConfig.splitY / 2 - y) * Tetris.blockSize - Tetris.blockSize / 2;
  mesh.position.z = (-Tetris.boundingBoxConfig.splitZ / 2) * Tetris.blockSize + Tetris.blockSize / 2;

  outline.position.x = (x - Tetris.boundingBoxConfig.splitX / 2) * Tetris.blockSize + Tetris.blockSize / 2;
  outline.position.y = (Tetris.boundingBoxConfig.splitY / 2 - y) * Tetris.blockSize - Tetris.blockSize / 2;
  outline.position.z = (-Tetris.boundingBoxConfig.splitZ / 2) * Tetris.blockSize + Tetris.blockSize / 2;
  // mesh.overdraw = true;

  Tetris.scene.add(mesh);
  Tetris.scene.add(outline);
};

function convertArenaToBlocks() {
  for (const [y, row] of arena.entries()) {
    for (const [x, val] of row.entries()) {
      if (val) Tetris.addStaticBlock(x, y, val);
    }
  }
}

function clearScene() {
  while (Tetris.scene.children.length > 0) {
    Tetris.scene.remove(Tetris.scene.children[0]);
  }
}

function drawNextTetro() {
  const canvas = document.getElementById('nextTetromino');
  const width = 32;
  const ctx = canvas.getContext('2d');
  const matrix = next.tetromino;
  const colorScheme = {t: "#72CB3B", z:"#FFD500", s:"#FFD500", 
                       j: "#FF971C", l:"#FF971C", i:"#FF3213", o:"#1073C4"};
  canvas.width = width * matrix.length;
  canvas.height = width * matrix.length;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, width);
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeRect(x * width,
          y * width,
          width, width);
        ctx.fillStyle = colorScheme[next.type];
        ctx.fillRect(x*width,
          y*width,
          width, width);
      }
    });
  });
}

// render and animation below

let lastTime = 0;
let timer = 0;

function resetScene() {
  clearScene();
  convertArenaToBlocks();
  Tetris.scene.add(Tetris.camera);
  Tetris.scene.add(boundingBox);
  Tetris.scene.add(Tetris.pointLight);
}

let lightPos = 0;

function gameLoop(time = 0) {
  const frameTime = time - lastTime;
  lastTime = time;

  if (Tetris.camera.position.x < 80) {
    // Tetris.camera.position.y += 1;
    Tetris.camera.position.x += 1;
  }

  if (forward && Tetris.pointLight.position.x < 500) {
    lightPos++;
    Tetris.pointLight.position.x = ((lightPos * lightPos) -500000 )/ 500000 * 500;
  } else if (forward && Tetris.pointLight.position.x >= 500) forward = false;
  else if (!forward && Tetris.pointLight.position.x > -500) {
    lightPos--;
    Tetris.pointLight.position.x = ((lightPos * lightPos) - 500000) / 500000 * 500;
  } else if (!forward && Tetris.pointLight.position.x <= -500) forward = true;
  console.log(Tetris.pointLight.position.x)

  Tetris.camera.lookAt(vector);

  if (!gameover && !pause) {
    timer += frameTime;
    if (timer > speed) {
      timer = 0;
      resetScene()
      movePieceDown();
      Tetris.renderer.render(Tetris.scene, Tetris.camera);
    }
  }

  Tetris.renderer.render(Tetris.scene, Tetris.camera);
  requestAnimationFrame(gameLoop);
}

piece = generateNewPiece();
next = generateNewPiece();
drawNextTetro();
addPieceToArena(piece);
convertArenaToBlocks();
Tetris.renderer.render(Tetris.scene, Tetris.camera);
gameLoop();
