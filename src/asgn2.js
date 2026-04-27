// Based on ColoredPoint.js (c) 2012 matsuda

// Vertex shader program
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
let FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

let gl;
let g_shaderVars;

let g_shapes = [];
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_lastPos = [0,0];

let g_wingParts = [];

let g_wingAngles = [0,0,0];

let g_animationToggle = true;
let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;

let g_fpsElement;
let g_fpsQueue = [];

function main() {
  let [canvas, new_gl] = setupWebGL();
  if (!new_gl) return;
  gl = new_gl;
  gl.enable(gl.DEPTH_TEST);

  g_shaderVars = connectVariablesToGLSL(gl);
  if (g_shaderVars[0] == -1) return;

  createMoogle();

  setupUI(canvas);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //renderAllShapes();
  requestAnimationFrame(tick);
}

function setupWebGL() {
  // Retrieve <canvas> element
  let canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  let gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) console.log("Failed to get the rendering context for WebGL");
  else {
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  return [canvas, gl];
}

function connectVariablesToGLSL(gl) {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return [-1];
  }

  // Get the storage location of a_Position
  let a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return [-1];
  }

  // Get the storage location of u_ModelMatrix
  let u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return [-1];
  }

  // Get the storage location of u_GlobalRotateMatrix
  let u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return [-1];
  }

  // Get the storage location of u_FragColor
  let u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return [-1];
  }

  return [a_Position, u_ModelMatrix, u_GlobalRotateMatrix, u_FragColor];
}

function setupUI(canvas) {
  // inspired by code by Ronan Wong
  canvas.onmousemove = function (e) {
    let [x, y] = coordsEventtoGL(e, canvas);
    if (e.buttons == 1) {
      g_globalAngleX += (y - g_lastPos[1]) * 100;
      g_globalAngleY -= (x - g_lastPos[0]) * 100;

      renderAllShapes();
    }
    g_lastPos = [x, y];
  }

  let onButton = document.getElementById("on");
  onButton.onclick = function() { g_animationToggle = true; }

  let offButton = document.getElementById("off");
  offButton.onclick = function() { g_animationToggle = false; }

  let wing1Slider = document.getElementById("wing1");
  wing1Slider.addEventListener("input", function () {
    g_wingAngles[0] = this.value; });

  let wing2Slider = document.getElementById("wing2");
  wing2Slider.addEventListener("input", function () {
    g_wingAngles[1] = this.value; });

  let wing3Slider = document.getElementById("wing3");
  wing3Slider.addEventListener("input", function () {
    g_wingAngles[2] = this.value; });

  let angleSlider = document.getElementById("angle");
  angleSlider.addEventListener("input", function () {
    g_globalAngleY = this.value / 1.0; });

  g_fpsElement = document.getElementById("fps");
}

// inspired by code by Ronan Wong
function coordsEventtoGL(e, canvas) {
  let x = e.clientX;
  let y = e.clientY;
  let rect = e.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
  return [x, y];
}

function color255to1(color) {
  return [color[0] / 255.0, color[1] / 255.0, color[2] / 255.0, color[3] / 255.0];
}

function createMoogle() {
  let wing1Parts = [];
  let wing2Parts = [];
  let wing3Parts = [];

  let matrix;
  let color;
  let newShape;
  let matrixStack;
  let transformMatrix;

  let bodyColor = color255to1([224, 206, 191, 255])
  let noseColor = color255to1([144, 118, 108, 255])
  let innerEarColor = color255to1([179, 152, 138, 255]);
  let antennaColor = color255to1([102, 98, 95, 255]);
  let pompomColor = color255to1([245, 144, 78, 255]);
  let wingColor = color255to1([117, 112, 129, 255]);

  let wing1Angle = 30;
  let wing2Angle = 30;
  let wing3Angle = 110;

  // body
  matrix = new Matrix4();
  matrix.setTranslate(0, -0.25, 0);
  matrix.scale(0.45, 0.45, 0.45);
  color = bodyColor;
  pushCube(matrix, color);

  // head
  matrix = new Matrix4();
  matrix.setTranslate(0, 0.2, 0);
  matrix.scale(0.48, 0.48, 0.48);
  color = bodyColor;
  pushCube(matrix, color);

  // nose
  matrix = new Matrix4();
  matrix.setTranslate(0, 0.1, -0.25);
  matrix.scale(0.05, 0.1, 0.05);
  color = noseColor;
  pushCube(matrix, color);

  // left eye
  matrix = new Matrix4();
  matrix.setTranslate(-0.15, 0.2, -0.25);
  matrix.rotate(60, 0, 0, 1);
  matrix.scale(0.02, 0.12, 0.02);
  color = noseColor;
  pushCube(matrix, color);

  // right eye
  matrix = new Matrix4();
  matrix.setTranslate(0.15, 0.2, -0.25);
  matrix.rotate(-60, 0, 0, 1);
  matrix.scale(0.02, 0.12, 0.02);
  color = noseColor;
  pushCube(matrix, color);

  // left ear
  matrix = new Matrix4();
  matrix.setTranslate(-0.23, 0.48, 0);
  matrix.rotate(35, 0, 0, 1);
  matrix.rotate(180, 0, 1, 0);
  matrix.scale(0.2, 0.2, 0.2);
  color = bodyColor;
  pushTetrahedron(matrix, color);

  // left inner ear
  matrix = new Matrix4();
  matrix.setTranslate(-0.22, 0.46, -0.04);
  matrix.rotate(35, 0, 0, 1);
  matrix.rotate(180, 0, 1, 0);
  matrix.scale(0.15, 0.15, 0.15);
  color = innerEarColor;
  pushTetrahedron(matrix, color);

  // right ear
  matrix = new Matrix4();
  matrix.setTranslate(0.23, 0.48, 0);
  matrix.rotate(-35, 0, 0, 1);
  matrix.rotate(180, 0, 1, 0);
  matrix.scale(0.2, 0.2, 0.2);
  color = bodyColor;
  pushTetrahedron(matrix, color);

  // right inner ear
  matrix = new Matrix4();
  matrix.setTranslate(0.22, 0.46, -0.04);
  matrix.rotate(-35, 0, 0, 1);
  matrix.rotate(180, 0, 1, 0);
  matrix.scale(0.15, 0.15, 0.15);
  color = innerEarColor;
  pushTetrahedron(matrix, color);

  // left arm
  matrix = new Matrix4();
  matrix.setTranslate(-0.25, -0.19, 0);
  matrix.rotate(130, 0, 0, 1);
  matrix.rotate(180, 0, 1, 0);
  matrix.scale(0.23, 0.23, 0.23);
  color = bodyColor;
  pushTetrahedron(matrix, color);

  // right arm
  matrix = new Matrix4();
  matrix.setTranslate(0.25, -0.19, 0);
  matrix.rotate(-130, 0, 0, 1);
  matrix.rotate(180, 0, 1, 0);
  matrix.scale(0.23, 0.23, 0.23);
  color = bodyColor;
  pushTetrahedron(matrix, color);

  // left leg
  matrix = new Matrix4();
  matrix.setTranslate(-0.1, -0.55, -0.01);
  matrix.rotate(180, 0, 0, 1);
  matrix.scale(0.23, 0.23, 0.46);
  color = bodyColor;
  pushTetrahedron(matrix, color);

  // right leg
  matrix = new Matrix4();
  matrix.setTranslate(0.1, -0.55, -0.01);
  matrix.rotate(180, 0, 0, 1);
  matrix.scale(0.23, 0.23, 0.46);
  color = bodyColor;
  pushTetrahedron(matrix, color);

  // antenna
  matrix = new Matrix4();
  matrix.setTranslate(0, 0.5, 0);
  matrix.scale(0.03, 0.2, 0.03);
  color = antennaColor;
  pushCube(matrix, color);

  // pompom
  matrix = new Matrix4();
  matrix.setTranslate(0, 0.7, 0);
  matrix.scale(0.2, 0.2, 0.2);
  color = pompomColor;
  pushCube(matrix, color);

  // left wing inner
  matrix = new Matrix4();
  matrix.setTranslate(-0.15, -0.2, 0.25);
  matrix.rotate(-10, 0, 0, 1);
  matrix.rotate(wing1Angle, 0, 1, 0);
  matrix.rotate(20, 1, 0, 0);
  matrix.scale(0.1, 0.2, 0.05);
  color = wingColor;
  newShape = pushCube(matrix, color);
  newShape.side = 1;
  newShape.startMatrix = new Matrix4(matrix);
  wing1Parts.push(newShape);
  matrixStack = matrix;

  // left wing middle
  matrix = new Matrix4(matrixStack);
  transformMatrix = new Matrix4();
  transformMatrix.translate(-1, 0.02, 0.05);
  transformMatrix.rotate(wing2Angle, 0, 1, 0);
  matrix.multiply(transformMatrix)
  color = wingColor;
  newShape = pushCube(matrix, color);
  newShape.side = 1;
  newShape.matrixStack = matrixStack;
  newShape.transformMatrix = new Matrix4(transformMatrix);
  wing2Parts.push(newShape);
  matrixStack = matrix;

  // left wing outer
  matrix = new Matrix4(matrixStack);
  transformMatrix = new Matrix4();
  transformMatrix.translate(-1.2, 0, 0.12);
  transformMatrix.rotate(wing3Angle, 0, 1, 0);
  transformMatrix.scale(1, 1.25, 1.5);
  matrix.multiply(transformMatrix)
  color = wingColor;
  newShape = pushCube(matrix, color);
  newShape.side = 1;
  newShape.matrixStack = matrixStack;
  newShape.transformMatrix = new Matrix4(transformMatrix);
  wing3Parts.push(newShape);

  // right wing inner
  matrix = new Matrix4();
  matrix.setTranslate(0.15, -0.2, 0.25);
  matrix.rotate(10, 0, 0, 1);
  matrix.rotate(-wing1Angle, 0, 1, 0);
  matrix.rotate(20, 1, 0, 0);
  matrix.scale(0.1, 0.2, 0.05);
  color = wingColor;
  newShape = pushCube(matrix, color);
  newShape.side = -1;
  newShape.startMatrix = new Matrix4(matrix);
  wing1Parts.push(newShape);
  matrixStack = matrix;

  // right wing middle
  matrix = new Matrix4(matrixStack);
  transformMatrix = new Matrix4();
  transformMatrix.setTranslate(1, 0.02, 0.05);
  transformMatrix.rotate(-wing2Angle, 0, 1, 0);
  matrix.multiply(transformMatrix)
  color = wingColor;
  newShape = pushCube(matrix, color);
  newShape.side = -1;
  newShape.matrixStack = matrixStack;
  newShape.transformMatrix = new Matrix4(transformMatrix);
  wing2Parts.push(newShape);
  matrixStack = matrix;

  // right wing outer
  matrix = new Matrix4(matrixStack);
  transformMatrix = new Matrix4();
  transformMatrix.translate(1.2, 0, 0.12);
  transformMatrix.rotate(-wing3Angle, 0, 1, 0);
  transformMatrix.scale(1, 1.25, 1.5);
  matrix.multiply(transformMatrix)
  color = wingColor;
  newShape = pushCube(matrix, color);
  newShape.side = -1;
  newShape.matrixStack = matrixStack;
  newShape.transformMatrix = new Matrix4(transformMatrix);
  wing3Parts.push(newShape);

  g_wingParts = [wing1Parts, wing2Parts, wing3Parts];
}

// my version of updateAnimationAngles
function updateMoogle() {
  let newAngle;
  for (shape of g_wingParts[0]) {
    shape.matrix.set(shape.startMatrix);

    if (g_animationToggle) newAngle = Math.sin(g_seconds * 4) * 45 * shape.side;
    else newAngle = g_wingAngles[0] * shape.side;
    shape.matrix.rotate(newAngle, 0, 1, 0);
  }

  for (shape of g_wingParts[1]) {
    shape.matrix.set(shape.matrixStack);
    shape.matrix.multiply(shape.transformMatrix);

    if (g_animationToggle) newAngle = Math.sin(g_seconds * 3) * 30 * shape.side;
    else newAngle = g_wingAngles[1] * shape.side;
    shape.matrix.rotate(newAngle, 0, 1, 0);
  }

  for (shape of g_wingParts[2]) {
    shape.matrix.set(shape.matrixStack);
    shape.matrix.multiply(shape.transformMatrix);

    if (g_animationToggle) newAngle = Math.sin(g_seconds * 2) * 15 * shape.side;
    else newAngle = g_wingAngles[2] * shape.side;
    shape.matrix.rotate(newAngle, 0, 1, 0);
  }
}

function pushCube(matrix, color) {
  let newCube = new Cube(matrix, color)
  g_shapes.push(newCube);
  return newCube;
}

function pushTetrahedron(matrix, color) {
  g_shapes.push(new Tetrahedron(matrix, color));
}

function tick() {
  let now = performance.now();
  g_seconds = now / 1000.0 - g_startTime;

  // fps tracker by https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html
  let duration = now - g_startTime;
  while (g_fpsQueue.length > 0 && g_fpsQueue[0] <= now - 1000) {
    g_fpsQueue.shift();
  }
  g_fpsQueue.push(now);
  let fps = g_fpsQueue.length;
  g_fpsElement.innerText = "ms: " + Math.floor(duration) + " fps: " + fps;

  //console.log(g_seconds);

  updateMoogle();

  renderAllShapes();

  requestAnimationFrame(tick);
}

// my version of renderScene
function renderAllShapes() {
  u_GlobalRotateMatrix = new Matrix4()
  // inspired by code by Ronan Wong
  u_GlobalRotateMatrix.rotate(g_globalAngleY + 45, 0, 1, 0);
  u_GlobalRotateMatrix.rotate(g_globalAngleX, 1, 0, 0);
  gl.uniformMatrix4fv(g_shaderVars[2], false, u_GlobalRotateMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (let i = 0; i < g_shapes.length; i++) {
    g_shapes[i].render(gl, g_shaderVars);
  }

  // Performance Tester
  // let K = 300.0;
  // for (let i = 1; i < K; i++) {
  //   let c = new Cube(new Matrix4(), [1,1,1,1]);
  //   c.matrix.translate(-0.8, 1.9 * i / K - 1.0, 0);
  //   c.matrix.rotate(g_seconds * 100, 1, 1, 1);
  //   c.matrix.scale(0.1, 0.5 / K, 1.0 / K);
  //   c.render(gl, g_shaderVars);
  // }
}
