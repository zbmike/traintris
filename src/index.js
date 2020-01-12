import "./styles/index.scss";
const THREE = require('three');
const tetrominoes = require('./tetromino');
const brain = require('brain.js');
const lzString = require('./lib/lz-string.min.js')

// Tetris logic
const ARENA_WIDTH = 10;
const ARENA_HEIGHT = 20;
const BASE_SPEED = 1000;

let net = new brain.NeuralNetwork();

let arena;
let trainingFinished = false;
let canTrain = true;
let gameover = false;
let pause = true;
let forward = true;
let mute = false;
let enabled = false;
let predictionMode = false;
let trainingMode = false;
let piece, next, next2, next3, hold, ghost, score = 0, level = 1;
let millisecondPerDrop = BASE_SPEED;
let savedNN = localStorage.getItem('savedNN');
let prev = localStorage.getItem('traindata');
let nextTrain = 50;
let trainingData = [];
let prediction;

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
    // if (actualY < 0) continue;
    for (let lx = 0; lx < tetromino[0].length; lx++) {
      const actualX = x + lx - mid;
      if (tetromino[ly][lx]) {
        if (actualY < 0 && (actualX >= ARENA_WIDTH || actualX < 0)) return true;
        if (actualY < 0) continue;
        if (actualY >= ARENA_HEIGHT) return true;
        if (arena[actualY][actualX] > 10) return true;
        else if (actualX < 0) {
          // if (tetromino[ly][lx] < 0) return false;
          return 1;
        }
        else if (actualX >= ARENA_WIDTH) {
          // if (tetromino[ly][lx] < 0) return false;
          return -1;
        }
      }
    }
  }
  return false;
}

function addPieceToArena(piece) {
  addPieceTo(arena, piece);
}

function addPieceTo(arena, piece) {
  const { tetromino, x, y } = piece;
  const mid = (tetromino.length === 2) ? 0 : 1;
  for (let ly = 0; ly < tetromino.length; ly++) {
    const actualY = y + ly - mid;
    if (actualY < 0) continue;
    for (let lx = 0; lx < tetromino[0].length; lx++) {
      const actualX = x + lx - mid;
      if (tetromino[ly][lx]) {
        if (actualX < 0 && tetromino[ly][lx]>0) {
          // throw Error('Block should not be able to go outside');
        }
        if (actualX >= 0 && actualX < ARENA_WIDTH) arena[actualY][actualX] = tetromino[ly][lx];
      } else {
        if (actualX < 0) continue;
      }
    }
  }
  return arena;
}

function makeArenaData() {
  const arenaState = new Array(ARENA_HEIGHT*ARENA_WIDTH).fill(0);
  for (let y = 0; y < arena.length; y++) {
    for (let x = 0; x < arena[0].length; x++) {
      arenaState[y*arena[0].length+x] = (arena[y][x] > 10) ? 1 : 0;
    }
  }
  return arenaState;
}

function makeTrainingEntry() {
  const arenaState = makeArenaData();
  const types = ['t', 'z', 's', 'o', 'i', 'j', 'l'];
  arenaState.push((types.indexOf(piece.type) + 1) / 7);
  arenaState.push((types.indexOf(next.type) + 1) / 7);
  arenaState.push((types.indexOf(next2.type) + 1) / 7);
  arenaState.push((types.indexOf(next3.type) + 1) / 7);
  return {
    input: 
      arenaState,
    output: 
      [(piece.rotation + 1) / 4, (piece.x + 1) / ARENA_WIDTH]
  }
}

function trainNet() {
  trainingData.push(makeTrainingEntry());
  document.getElementById('td').innerText = trainingData.length;
  if (predictionMode && canTrain && trainingData.length >= nextTrain) {
    localStorage.setItem('traindata', lzString.compress(JSON.stringify(trainingData)));
    nextTrain = trainingData.length + 50;
    canTrain = false;
    console.log('training...', trainingData.length);
    net.trainAsync(trainingData, {
      log: true,
      time: 60000
    })
      .then(res => {
        console.log('training finished', res);
        console.log('next training:', nextTrain);
        localStorage.setItem('savedNN', lzString.compress(JSON.stringify(net.toJSON())));
        trainingFinished = true;
        canTrain = true;
        makePrediction();
      });
  }
}

function movePieceDown() {
  let nextPiece = Object.assign({}, piece);
  nextPiece.y++;
  if (predictCollision(nextPiece)) {
    trainNet();
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

function kickPieceIn(piece){
  let result = predictCollision(piece);
  if (result === 1) {
    while (result === 1) {
      piece.x++;
      result = predictCollision(piece);
    }
  } else if (result === -1) {
    while (result === -1) {
      piece.x--;
      result = predictCollision(piece);
    }
  }
  return piece;
}

function rotatePiece() {
  let nextPiece = Object.assign({}, piece);
  const rotation = (nextPiece.rotation + 1) % 4;
  nextPiece.rotation = rotation;
  nextPiece.tetromino = tetrominoes[nextPiece.type][rotation];
  
  nextPiece = kickPieceIn(nextPiece);
  if (!predictCollision(nextPiece)) {
    clearActiveBlock();
    piece.x = nextPiece.x;
    piece.rotation = rotation;
    piece.tetromino = nextPiece.tetromino;
    addPieceToArena(piece);
    makeGhost();
    resetScene();
    Tetris.renderer.render(Tetris.scene, Tetris.camera);
  }
}

function makePrediction() {
  const input = makeArenaData()
  const types = ['t', 'z', 's', 'o', 'i', 'j', 'l'];
  input.push((types.indexOf(piece.type) + 1) / 7);
  input.push((types.indexOf(next.type) + 1) / 7);
  input.push((types.indexOf(next2.type) + 1) / 7);
  input.push((types.indexOf(next3.type) + 1) / 7);
  let result = net.run(input);
  const rotation = Math.floor(result[0] * 4);
  const x = Math.floor(result[1] * ARENA_WIDTH);
  console.log('predict rotation and x:', rotation, x);
  prediction = { rotation, x }
}

function solidify() {
  for (let y = 0; y < arena.length; y++) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] > 0 && arena[y][x] < 10) {
        arena[y][x] += 10;
      }
    }
  }

  scoreRow();
  piece = next;
  next = next2;
  next2 = next3;
  next3 = generateNewPiece();
  if (trainingFinished) makePrediction();
  makeGhost();
  drawNextTetro();
  if (predictCollision(piece)) {
    gameover = true;
    pause = true;
    bgm.pause();
    bgm.currentTime = 0;
    setupRestart();
    document.getElementsByClassName('modal')[0].classList.add('show');
  } else {
    addPieceToArena(piece);
  }
}

function clearAndCountRow(arena) {
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
  return lines;
}

function scoreRow() {
  let lines = clearAndCountRow(arena);
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
    millisecondPerDrop = BASE_SPEED-(80*(level-1));
  };
}

function generateNewPiece() {
  const pieces = ['t', 'z', 's', 'o', 'i', 'j', 'l'] 
  const type = pieces[Math.floor(Math.random()*pieces.length)];
  return {
    type, 
    rotation: 0, 
    x:Math.floor(ARENA_WIDTH/2-1), 
    y:0, 
    tetromino:tetrominoes[type][0]
  }
}

function hardDrop() {
  let tempPiece = Object.assign({}, piece);
  while (!predictCollision(tempPiece)) {
    tempPiece.y++;
  }
  clearActiveBlock();
  clearGhostBlock();
  piece.y = tempPiece.y-1;
  addPieceToArena(piece);
  if (!mute) hardDropSFX.play();
  resetScene();
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
}

function createGhostTetromino(type, rotation) {
  const tetro = tetrominoes[type][rotation]
  let newTetro = new Array(tetro.length).fill()
    .map(() => new Array(tetro[0].length).fill(0));

  for (let y = 0; y < tetro.length; y++) {
    for (let x = 0; x < tetro[y].length; x++) {
      if (tetro[y][x]) {
        newTetro[y][x] = tetro[y][x] - 10;
      }
    }
  }

  return newTetro;
}

function makeGhost() {;
  ghost = Object.assign({}, piece);
  if (predictionMode && trainingFinished && !trainingMode) {
    const rotation = prediction.rotation;
    const type = ghost.type;
    ghost.rotation = rotation;
    ghost.x = prediction.x;
    ghost.y = 0;

    ghost.tetromino = createGhostTetromino(type, rotation);
    ghost = kickPieceIn(ghost);
    while (!predictCollision(ghost)) {
      ghost.y++;
    }
    ghost.y--;

    // ghost = findBestPosition();
    // const { type, rotation } = ghost;
    // ghost.tetromino = createGhostTetromino(type, rotation);

    clearGhostBlock();
    if (piece.y < ghost.y) addPieceToArena(ghost);
  } else {
    const rotation = piece.rotation;
    const type = ghost.type;
    ghost.tetromino = createGhostTetromino(type, rotation);
    while (!predictCollision(ghost)) {
      ghost.y++;
    }
    ghost.y--;
    clearGhostBlock();
    if (piece.y !== ghost.y) addPieceToArena(ghost);
  }
}

// function findBestPosition() {
//   const { type } = piece;
//   let leastEmpty = Infinity, bestlines = 0;
//   let bestX, bestY, bestRotate, bingoX, bingoY, bingoRotate, bingoZeroCount;
//   for (let rot = 0; rot < 4; rot ++) {
//     let tempPiece = Object.assign({}, piece);
//     tempPiece.rotation = rot;
//     tempPiece.tetromino = tetrominoes[type][rot];
//     const tetroLength = tempPiece.tetromino.length;
//     let begin, range=0, threshold = 0;
//     for (let lx = 0; lx < tetroLength; lx ++) {
//       let counted = false;
//       for (let ly = 0; ly < tetroLength; ly ++) {
//         if (tempPiece.tetromino[ly][lx]) {
//           if (begin === undefined) begin = lx;
//           if (!counted) {
//             range++;
//             counted = true;
//           }
//         } else threshold++;
//       }
//       if (counted) threshold -= tetroLength;
//     }

//     for (let tx = 0; tx < ARENA_WIDTH; tx++) {
//       tempPiece.x = tx;
//       tempPiece = kickPieceIn(tempPiece);
//       if (tempPiece.x != tx) continue;
//       let tempArena = new Array(ARENA_HEIGHT).fill()
//         .map(()=> new Array(ARENA_WIDTH).fill(0));
//       for (let y = 0; y < arena.length; y++) {
//         for (let x = 0; x < arena[0].length; x++) {
//           tempArena[y][x] = (arena[y][x] > 10) ? arena[y][x] : 0;
//         }
//       }
//       while (!predictCollision(tempPiece)) tempPiece.y++;
//       tempPiece.y--;
//       tempArena = addPieceTo(tempArena, tempPiece);
//       let zeroCount = -threshold;
//       for (let cy = ARENA_HEIGHT - 1; cy >= tempPiece.y - 1; cy--) {
//         const mid = (tempPiece.tetromino.length === 2) ? 0 : 1;
//         for (let cx = tempPiece.x + begin - mid;
//           cx < tempPiece.x - mid + range; cx++) {
//           if ((cx > 0 && cx < ARENA_WIDTH) 
//             && (cy > 0 && cy < ARENA_HEIGHT) 
//             && tempArena[cy][cx] === 0) {
//             zeroCount++;
//           }
//         }
//       }
//       let lines = clearAndCountRow(tempArena);
//       if (lines > bestlines) {
//         bestlines = lines;
//         bingoX = tempPiece.x;
//         bingoY = tempPiece.y;
//         bingoRotate = tempPiece.rotation;
//         bingoZeroCount = zeroCount;
//       }
//       if (zeroCount < leastEmpty) {
//         leastEmpty = zeroCount;
//         bestX = tempPiece.x;
//         bestY = tempPiece.y;
//         bestRotate = tempPiece.rotation;
//       }
//     }
//   }
//   if (bingoZeroCount <= leastEmpty) {
//     bestX = bingoX ;
//     bestY = bingoY;
//     bestRotate = bingoRotate;
//   }
//   return {
//     type,
//     rotation: bestRotate,
//     x: bestX,
//     y: bestY,
//     tetromino: tetrominoes[type][bestRotate]
//   }
// }

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
      timer = (millisecondPerDrop - 500 > 0) ? millisecondPerDrop - 500 : 0;
      hardDrop();
      if (trainingMode) {
        trainNet();
        solidify();
        resetScene();
        Tetris.renderer.render(Tetris.scene, Tetris.camera);
      }
    } else if (e.keyCode === 69) {
      e.preventDefault();
      if (hold) releasePiece();
      else holdPiece();
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
  score = 0, level = 1, millisecondPerDrop = BASE_SPEED;
  document.getElementById('score').innerText = score;
  document.getElementById('level').innerText = level;
  hold = null;
  resetScene();
  initGame();
  document.getElementsByClassName('modal')[0].classList.remove('show');
  if (!mute) bgm.play();
  gameover = false;
  pause = false;
  setupPause();
}

function clickMute(e) {
  e.preventDefault();
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

function clickSave(e) {
  e.preventDefault();
  localStorage.setItem('traindata', lzString.compress(JSON.stringify(trainingData)));
}

function clickClear(e) {
  e.preventDefault();
  localStorage.removeItem('traindata');
  localStorage.removeItem('savedNN');
  trainingData = [];
  trainingFinished = false;
  canTrain = true;
  net = new brain.NeuralNetwork();
  document.getElementById('td').innerText = 0;
}

function clickPredictionMode(e) {
  if (e) e.preventDefault();
  if (predictionMode) {
    predictionMode = false;
    document.getElementById('pmode').innerText = 'Predict Mode : OFF';
  } else {
    predictionMode = true;
    document.getElementById('pmode').innerText = 'Predict Mode : ON';
  }
  if (trainingFinished) makePrediction();
}

function clickTrainingMode(e) {
  if (e) e.preventDefault();
  if (trainingMode) {
    trainingMode = false;
    document.getElementById('tmode').innerText = 'Training Mode : OFF';
  } else {
    trainingMode = true;
    document.getElementById('tmode').innerText = 'Training Mode : ON';
  }
}

function holdPiece() {
  hold = piece;
  piece = next;
  next = next2;
  next2 = next3;
  next3 = generateNewPiece();
  clearActiveBlock();
  if (trainingFinished) makePrediction();
  makeGhost();
  drawNextTetro();
  addPieceToArena(piece);
  timer = 0;
  resetScene();
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
}

function releasePiece() {
  const {y} = piece;
  let temp = piece;
  piece = hold;
  hold = temp;
  hold.y = piece.y = y;
  while (predictCollision(piece)) {
    piece.y--;
  }
  clearActiveBlock();
  if (trainingFinished) makePrediction();
  makeGhost();
  drawNextTetro();
  addPieceToArena(piece);
  resetScene();
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
}

// three.js stuff below
let Tetris = {};
let vector = new THREE.Vector3(0, 0, 0);

Tetris.init = function () {
  // scene dimension
  const ASPECT = ARENA_WIDTH / ARENA_HEIGHT;
  const HEIGHT = window.innerHeight - 40;
  const WIDTH = HEIGHT * ASPECT;

  // camera attributes
  const VIEW_ANGLE = 90;
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
  document.getElementById('canvas-holder')
  .appendChild(Tetris.renderer.domElement);
}

Tetris.init();

// make a bounding box to align the tetrominoes
let boundingBoxConfig = {
  width: ARENA_WIDTH*40,
  height: ARENA_HEIGHT*40,
  depth: 40,
  splitX: ARENA_WIDTH,
  splitY: ARENA_HEIGHT,
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
      color = 0x51A919
      // color = 0x72CB3B
      break;
    case 12:
    case 13:
      color = 0xDDB300
      // color = 0xFFD500
      break;
    case 14:
    case 15:
      color = 0xDD7500
      // color = 0xFF971C
      break;
    case 16:
      color = 0xDD1000
      // color = 0xFF3213
      break;
    case 17:
      color = 0x0051A2
      // color = 0x1073C4
      break;
    default:
      color = 0x0341AE
      break;
  }
  if (val > 0) mat = { color }
  else mat = { color, opacity: 0.5, transparent: true }

  let blockGeo = new THREE.CubeGeometry(Tetris.blockSize+1, Tetris.blockSize+1, Tetris.blockSize+1);

  let outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(blockGeo),
    new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
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

function drawNextTetro(){
  drawTetroOnCanvas('nextTetromino', next);
  drawTetroOnCanvas('nextTetromino2', next2);
  drawTetroOnCanvas('nextTetromino3', next3);
  if (hold) drawTetroOnCanvas('holdTetromino', hold);
}

function drawTetroOnCanvas(elementId, drawPiece) {
  const canvas = document.getElementById(elementId);
  const width = 32;
  const ctx = canvas.getContext('2d');
  const matrix = drawPiece.tetromino;
  const colorScheme = {t: "#72CB3B", z:"#FFD500", s:"#FFD500", 
                       j: "#FF971C", l:"#FF971C", i:"#FF3213", o:"#1073C4"};
  canvas.width = width * matrix.length;
  canvas.height = width * matrix.length;
  ctx.clearRect(0, 0, canvas.width, canvas.width);
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeRect(x * width,
          y * width,
          width, width);
        ctx.fillStyle = colorScheme[drawPiece.type];
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

  if (!gameover && !pause && !trainingMode) {
    timer += frameTime;
    if (timer > millisecondPerDrop) {
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
  next2 = generateNewPiece();
  next3 = generateNewPiece();
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
document.getElementById('savedata').onclick = clickSave;
document.getElementById('cleardata').onclick = clickClear;
document.getElementById('pmode').onclick = clickPredictionMode;
document.getElementById('tmode').onclick = clickTrainingMode;

initGame();

if (prev) {
  trainingData = JSON.parse(lzString.decompress(prev));
  console.log(trainingData[0]);
  if (trainingData.length > 50) nextTrain = trainingData.length + 50;
  document.getElementById('td').innerText = trainingData.length;
}
if (savedNN) {
  net.fromJSON(JSON.parse(lzString.decompress(savedNN)));
  trainingFinished = true;
  makePrediction();
}

gameLoop();

window.net = net;
window.arena = arena;
window.piece = piece;