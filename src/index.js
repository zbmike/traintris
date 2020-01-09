import "./styles/index.scss";
const THREE = require('three');
const tetrominoes = require('./tetromino');

// Tetris logic
let gameover = false;

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

let piece;

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
        if (actualY > 11) return true;
        if (arena[actualY][actualX] > 10) return true;
        else if (actualX < 0) return 1;
        else if (actualX > 7) return -1;
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
      if (actualX < 0) continue;
      if (tetromino[ly][lx]) {
        arena[actualY][actualX] = tetromino[ly][lx];
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
  generateNewPiece();
  console.log(arena);
  if (predictCollision(piece)) {
    gameover = true;
    alert('Game Over!');
  }
}

function scoreRow() {
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
    }
  }
}

function generateNewPiece() {
  const pieces = ['t', 'z', 's', 'o', 'i', 'j', 'l'] 
  const type = pieces[Math.floor(Math.random()*pieces.length)];
  piece = {
    type, rotation: 0, x:3, y:-1, tetromino:tetrominoes[type][0]
  }
}

document.onkeydown = function (e) {
  // console.log(e.keyCode)
  if (e.keyCode === 65) {
    movePieceLeft();
  } else if (e.keyCode === 68) {
    movePieceRight();
  } else if (e.keyCode === 83) {
    movePieceDown();
    timer = 0;
  } else if (e.keyCode === 32) {
    rotatePiece();
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
  Tetris.renderer = new THREE.WebGLRenderer({ antialias: true });
  Tetris.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT,
    NEAR, FAR);
  Tetris.scene = new THREE.Scene();
  Tetris.scene.background = new THREE.Color(0xffffff);

  // reposition the camera
  Tetris.camera.position.z = 550;
  Tetris.scene.add(Tetris.camera);

  Tetris.renderer.setSize(WIDTH, HEIGHT);

  // attach the render-supplied DOM element
  document.body.appendChild(Tetris.renderer.domElement);
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

Tetris.pointLight = new THREE.PointLight(0xffffff, 3);
Tetris.pointLight.position.set(-100, 100, 100);
Tetris.scene.add(Tetris.pointLight);

let cubeGeo = new THREE.CubeGeometry(
  boundingBoxConfig.width, boundingBoxConfig.height, boundingBoxConfig.depth,
  boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ);

let boundingBox = new THREE.LineSegments(
  new THREE.EdgesGeometry(cubeGeo),
  new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
);
Tetris.scene.add(boundingBox);

// function to convert arena blocks to 3d objects
Tetris.addStaticBlock = function (x, y, val) {
  let color;

  // switch (val) {
  //   case 1:
  //     color = 0xff00ff
  //     break;
  //   case 11:
  //     color = 0x0000ff
  //     break;
  //   default:
  //     color = 0xff00ff
  //     break;
  // }
  if (val > 0 && val < 10) color = 0xff0000;
  else if (val > 10) color = 0x0000ff;

  const mesh = new THREE.Mesh(new THREE.CubeGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize),
    new THREE.MeshPhongMaterial({ color, wireframe: false })
  );

  mesh.position.x = (x - Tetris.boundingBoxConfig.splitX / 2) * Tetris.blockSize + Tetris.blockSize / 2;
  mesh.position.y = (Tetris.boundingBoxConfig.splitY / 2 - y) * Tetris.blockSize - Tetris.blockSize / 2;
  mesh.position.z = (-Tetris.boundingBoxConfig.splitZ / 2) * Tetris.blockSize + Tetris.blockSize / 2;
  // mesh.overdraw = true;

  Tetris.scene.add(mesh);
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

function gameLoop(time = 0) {
  const frameTime = time - lastTime;
  lastTime = time;

  if (Tetris.camera.position.x < 100) {
    // Tetris.camera.position.y += 1;
    Tetris.camera.position.x += 1;
  }

  Tetris.camera.lookAt(vector);

  timer += frameTime;
  if (timer > 1000) {
    timer = 0;
    resetScene()
    movePieceDown();
  }

  Tetris.renderer.render(Tetris.scene, Tetris.camera);
  if (!gameover) requestAnimationFrame(gameLoop);
}

generateNewPiece();
piece.y++;
addPieceToArena(piece);
convertArenaToBlocks();
Tetris.renderer.render(Tetris.scene, Tetris.camera);
gameLoop();
