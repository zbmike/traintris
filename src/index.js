import "./styles/index.scss";
const THREE = require('three');
const tetrominoes = require('./tetromino');

// Tetris logic
const ARENA_WIDTH = 12;
const ARENA_HEIGHT = 20;
const BASE_SPEED = 1000;

let arena;

let gameover = false;
let pause = true;
let forward = true;
let mute = false;
let piece, next, ghost, score = 0, level = 1;
let speed = BASE_SPEED; // the smaller the faster

const bgm = document.getElementById('bgm');
const hardDropSFX = document.getElementById('harddrop');
const scoreRowSFX = document.getElementById('clearrow');

function clearActiveBlock() {
  for (let y = 0; y < arena.length; y++) {
    for (let x = 0; x < arena[0].length; x++) {
      arena[y][x] = (arena[y][x] > 0 && arena[y][x] < 10 ) ? 0 :arena[y][x];
    }
  }
}

function clearGhostBlock() {
  for (let y = 0; y < arena.length; y++) {
    for (let x = 0; x < arena[0].length; x++) {
      arena[y][x] = (arena[y][x] < 0) ? 0 : arena[y][x];
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
    makeGhost();
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
    makeGhost();
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
    makeGhost();
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
  makeGhost();
  resetScene();
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
}

function solidify() {
  
  for (let y = 0; y < arena.length; y++) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] > 0 && arena[y][x] < 10) {
        arena[y][x] += 10;
      }
    }
  }
  hardDropSFX.pause();
  hardDropSFX.currentTime = 0;
  scoreRow();
  piece = next;
  next = generateNewPiece();
  makeGhost();
  drawNextTetro();
  if (predictCollision(piece)) {
    gameover = true;
    bgm.pause();
    bgm.currentTime = 0;
    setupRestart();
    document.getElementsByClassName('modal')[0].classList.add('show');
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
      arena.splice(0, 0, new Array(ARENA_WIDTH).fill(0))
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
    if (!mute) scoreRowSFX.play();
    document.getElementById('score').innerText = score;
    level = Math.floor(score/800 + 1);
    document.getElementById('level').innerText = level;
    speed = BASE_SPEED*(0.8**(level-1));
  };
}

function generateNewPiece() {
  const pieces = ['t', 'z', 's', 'o', 'i', 'j', 'l'] 
  const type = pieces[Math.floor(Math.random()*pieces.length)];
  return {
    type, rotation: 0, x:Math.floor(ARENA_WIDTH/2-1), y:0, tetromino:tetrominoes[type][0]
  }
}

function hardDrop() {
  clearActiveBlock();
  clearGhostBlock();
  piece.y = ghost.y;
  addPieceToArena(piece);
  if (!mute) hardDropSFX.play();
  resetScene();
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
}

function makeGhost() {
  ghost = Object.assign({}, piece);
  ghost.tetromino = new Array(piece.tetromino.length).fill()
                  .map(() => new Array(piece.tetromino.length).fill(0));
  for (let y = 0; y < piece.tetromino.length; y++) {
    for (let x = 0; x < piece.tetromino[y].length; x++) {
      if (piece.tetromino[y][x]) {
        ghost.tetromino[y][x] = piece.tetromino[y][x] - 10;
      }
    }
  }
  while (!predictCollision(ghost)) {
    ghost.y++;
  }
  ghost.y--;
  clearGhostBlock();
  if (piece.y !== ghost.y) addPieceToArena(ghost);
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
      timer = (speed - 500 > 0) ? speed - 500 : 0;
      hardDrop();
    }
  }
  if (e.keyCode === 81) {
    e.preventDefault();
    if (!gameover) {
      pause = !pause;
      switchModal();
      setupPause();
    }
  } 
}

function switchModal() {
  if (pause) {
    bgm.pause();
    document.getElementsByClassName('modal')[0].classList.add('show');
  }
  else {
    if (!mute) bgm.play();
    document.getElementsByClassName('modal')[0].classList.remove('show');
  }
}

function setupPause() {
  document.getElementById('message').innerText = 'Paused';
  const button = document.getElementById('start');
  button.innerText = 'Unpause';
  button.onclick = clickUnpause;
  document.getElementById('instruction').innerText = 'Or press Q to unpause';
}

function setupRestart() {
  document.getElementById('message').innerText = 'Game Over';
  const button = document.getElementById('start');
  button.innerText = 'Restart';
  button.onclick = clickRestart;
  document.getElementById('instruction').innerText = '';
}

function clickStart(e) {
  e.preventDefault();
  document.getElementsByClassName('modal')[0].classList.remove('show');
  pause = false;
  if (!mute) bgm.play();
  switchModal();
  setupPause();
}

function clickUnpause(e) {
  e.preventDefault();
  pause = false;
  if (!mute) bgm.play();
  document.getElementsByClassName('modal')[0].classList.remove('show');
}

function clickRestart(e) {
  e.preventDefault();
  arena = new Array(ARENA_HEIGHT).fill().map(() => new Array(ARENA_WIDTH).fill(0));
  score = 0, level = 1, speed = BASE_SPEED;
  document.getElementById('score').innerText = score;
  document.getElementById('level').innerText = level;
  resetScene();
  initGame();
  document.getElementsByClassName('modal')[0].classList.remove('show');
  if (!mute) bgm.play();
  gameover = false;
  setupPause();
}

function clickMute(e) {
  if (mute) {
    mute = false;
    if (!pause) bgm.play();
    document.getElementById('mute').innerText = 'Mute';
    document.getElementById('modalmute').innerText = 'Mute';
  } else {
    mute = true;
    bgm.pause();
    hardDropSFX.pause();
    hardDropSFX.currentTime = 0;
    scoreRowSFX.pause();
    scoreRowSFX.currentTime = 0;
    document.getElementById('mute').innerText = 'Unmute';
    document.getElementById('modalmute').innerText = 'Unmute';
  }
}

// three.js stuff below
let Tetris = {};
let vector = new THREE.Vector3(0, 0, 0);

Tetris.init = function () {
  // scene dimension
  const WIDTH = 480;
  const HEIGHT = 800;

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
  Tetris.camera.position.z = 480;
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
  height: 800,
  depth: 40,
  splitX: 12,
  splitY: 20,
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
  let color, mat;
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
      color = 0x72CB3B
      break;
    case 12:
    case 13:
      color = 0xFFD500
      break;
    case 14:
    case 15:
      color = 0xFF971C
      break;
    case 16:
      color = 0xFF3213
      break;
    case 17:
      color = 0x1073C4
      break;
      // color = 0x0341AE
      // break;
    default:
      color = 0x0341AE
      break;
  }
  if (val > 0) mat = { color }
  else mat = { color, opacity: 0.5, transparent: true }

  let blockGeo = new THREE.CubeGeometry(Tetris.blockSize+1, Tetris.blockSize+1, Tetris.blockSize+1);

  let outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(blockGeo),
    new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 5 })
  );

  const mesh = new THREE.Mesh(new THREE.CubeGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize),
    new THREE.MeshPhongMaterial(mat)
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

  if (pause && Tetris.camera.position.x < 100) {
    Tetris.camera.position.x += 1;
  } else if (!pause && Tetris.camera.position.x > 0) {
    Tetris.camera.position.x -= 1;
  }

  Tetris.camera.updateProjectionMatrix();

  if (forward && Tetris.pointLight.position.x < 500) {
    lightPos++;
    Tetris.pointLight.position.x = ((lightPos * lightPos) -500000 )/ 500000 * 500;
  } else if (forward && Tetris.pointLight.position.x >= 500) forward = false;
  else if (!forward && Tetris.pointLight.position.x > -500) {
    lightPos--;
    Tetris.pointLight.position.x = ((lightPos * lightPos) - 500000) / 500000 * 500;
  } else if (!forward && Tetris.pointLight.position.x <= -500) forward = true;

  Tetris.camera.lookAt(vector);

  if (!gameover && !pause) {
    timer += frameTime;
    if (timer > speed) {
      timer = 0;
      resetScene();
      movePieceDown();
      Tetris.renderer.render(Tetris.scene, Tetris.camera);
    }
  }

  Tetris.renderer.render(Tetris.scene, Tetris.camera);
  requestAnimationFrame(gameLoop);
}

arena = new Array(ARENA_HEIGHT).fill().map(() => new Array(ARENA_WIDTH).fill(0));

function initGame() {
  piece = generateNewPiece();
  next = generateNewPiece();
  drawNextTetro();
  makeGhost();
  addPieceToArena(piece);
  convertArenaToBlocks();
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
}

document.getElementById('start').onclick = clickStart;
document.getElementById('restart').onclick = clickRestart;
document.getElementById('mute').onclick = clickMute;
document.getElementById('modalmute').onclick = clickMute;
initGame();
gameLoop();
