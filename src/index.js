import "./styles/index.scss";
const THREE = require('three');

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

let Tetris = {};
let vector = new THREE.Vector3(0,0,0);

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
  Tetris.renderer = new THREE.WebGLRenderer();
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

Tetris.spotLight = new THREE.SpotLight(0xcccccc, 0.6);
Tetris.spotLight.position.set(0, 1, 0);
Tetris.scene.add(Tetris.spotLight);
Tetris.scene.add(Tetris.spotLight.target); // add target to the scene

let boundingBox = new THREE.Mesh(
  new THREE.CubeGeometry(
    boundingBoxConfig.width, boundingBoxConfig.height, boundingBoxConfig.depth,
    boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ),
  new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true })
);
Tetris.scene.add(boundingBox);

function moveShapesDown() {
  let canMove = true;
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
  // if no collision, swap the blocks with empty space one space below
  if (canMove) {
    for (let y = arena.length - 1; y >= 0; y--) {
      for (let x = 0; x < arena[y].length; x++) {
        if (arena[y][x] > 0 && arena[y][x] < 10) {
          arena[y + 1][x] = arena[y][x];
          arena[y][x] = 0;
        }
      }
    }
  }
}

Tetris.staticBlocks = [];
Tetris.addStaticBlock = function (x, y) {
  if (Tetris.staticBlocks[x] === undefined) Tetris.staticBlocks[x] = [];

  var mesh = new THREE.Mesh(new THREE.CubeGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize), 
    new THREE.MeshPhongMaterial({ color: 0x0000ff, wireframe:false }) 
  );


  mesh.position.x = (x - Tetris.boundingBoxConfig.splitX/2) * Tetris.blockSize + Tetris.blockSize / 2;
  mesh.position.y = (Tetris.boundingBoxConfig.splitY / 2 - y) * Tetris.blockSize - Tetris.blockSize / 2;
  mesh.position.z = ( -Tetris.boundingBoxConfig.splitZ / 2) * Tetris.blockSize + Tetris.blockSize / 2;
  mesh.overdraw = true;

  Tetris.scene.add(mesh);
  Tetris.staticBlocks[x][y] = mesh;
};

function convertArenaToBlocks () {
  for (const [y, row] of arena.entries()) {
    for (const [x, val] of row.entries()) {
      if (val) Tetris.addStaticBlock(x, y);
    }
  }
}

function removeMeshes() {
  while (Tetris.scene.children.length > 0)  {
    Tetris.scene.remove(Tetris.scene.children[0]);
  }
}

console.log(Tetris.scene.children)

let lastTime = 0;
let timer = 0;

function gameLoop(time = 0) {
  const frameTime = time - lastTime;
  lastTime = time;

  if (Tetris.camera.position.x > -100) {
    // Tetris.camera.position.y += 1;
    Tetris.camera.position.x += -1;
  }

  Tetris.camera.lookAt(vector);
  Tetris.renderer.render(Tetris.scene, Tetris.camera);

  timer += frameTime;
  console.log(timer)
  if (timer > 1000) {
    timer = 0;
    removeMeshes();
    convertArenaToBlocks();
    Tetris.scene.add(Tetris.camera);
    Tetris.scene.add(boundingBox);
    moveShapesDown();
  }

  requestAnimationFrame(gameLoop);
}

convertArenaToBlocks();
Tetris.renderer.render(Tetris.scene, Tetris.camera);
gameLoop();
