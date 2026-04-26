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

let g_shapes = [];
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_lastPos = [0,0];

function main() {
  let [canvas, gl] = setupWebGL();
  if (!gl) return;
  gl.enable(gl.DEPTH_TEST);

  let shaderVars = connectVariablesToGLSL(gl);
  if (shaderVars[0] == -1) return;

  setupUI(gl, shaderVars, canvas);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  createMoogle();
  renderAllShapes(gl, shaderVars);
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

function setupUI(gl, shaderVars, canvas) {
  // inspired by code by Ronan Wong
  canvas.onmousemove = function (e) {
    let [x, y] = coordsEventtoGL(e, canvas);
    if (e.buttons == 1) {
      g_globalAngleX += (y - g_lastPos[1]) * 100;
      g_globalAngleY -= (x - g_lastPos[0]) * 100;

      renderAllShapes(gl, shaderVars);
    }
    g_lastPos = [x, y];
  }

  let angleSlider = document.getElementById("angle");
  angleSlider.addEventListener("mousemove", function () {
    g_globalAngleY = this.value / 1.0; 
    renderAllShapes(gl, shaderVars);
  });
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
  let matrix;
  let color;

  let bodyColor = color255to1([224, 206, 191, 255])
  let noseColor = color255to1([144, 118, 108, 255])
  let innerEarColor = color255to1([179, 152, 138, 255]);
  let antennaColor = color255to1([102, 98, 95, 255]);
  let pompomColor = color255to1([245, 144, 78, 255]);
  let wingColor = color255to1([117, 112, 129, 255]);

  // body
  matrix = new Matrix4();
  matrix.setTranslate(0, -0.25, 0);
  //matrix.rotate(0, 0, 0, 1);
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
  matrix.rotate(20, 0, 1, 0);
  matrix.rotate(20, 1, 0, 0);
  matrix.scale(0.1, 0.2, 0.05);
  color = wingColor;
  pushCube(matrix, color);

  // left wing middle
  matrix = new Matrix4();
  matrix.setTranslate(-0.23, -0.18, 0.3);
  matrix.rotate(0, 0, 0, 1);
  matrix.rotate(50, 0, 1, 0);
  matrix.rotate(20, 1, 0, 0);
  matrix.scale(0.1, 0.2, 0.05);
  color = wingColor;
  pushCube(matrix, color);

  // left wing outer
  matrix = new Matrix4();
  matrix.setTranslate(-0.3, -0.2, 0.37);
  matrix.rotate(0, 0, 0, 1);
  matrix.rotate(70, 0, 1, 0);
  matrix.rotate(20, 1, 0, 0);
  matrix.scale(0.15, 0.25, 0.05);
  color = wingColor;
  pushCube(matrix, color);

  // right wing inner
  matrix = new Matrix4();
  matrix.setTranslate(0.15, -0.2, 0.25);
  matrix.rotate(10, 0, 0, 1);
  matrix.rotate(-20, 0, 1, 0);
  matrix.rotate(20, 1, 0, 0);
  matrix.scale(0.1, 0.2, 0.05);
  color = wingColor;
  pushCube(matrix, color);

  // right wing middle
  matrix = new Matrix4();
  matrix.setTranslate(0.23, -0.18, 0.3);
  matrix.rotate(-50, 0, 1, 0);
  matrix.rotate(20, 1, 0, 0);
  matrix.scale(0.1, 0.2, 0.05);
  color = wingColor;
  pushCube(matrix, color);

  // right wing outer
  matrix = new Matrix4();
  matrix.setTranslate(0.3, -0.2, 0.37);
  matrix.rotate(-70, 0, 1, 0);
  matrix.rotate(20, 1, 0, 0);
  matrix.scale(0.15, 0.25, 0.05);
  color = wingColor;
  pushCube(matrix, color);
}

function pushCube(matrix, color) {
  g_shapes.push(new Cube(matrix, color));
}

function pushTetrahedron(matrix, color) {
  g_shapes.push(new Tetrahedron(matrix, color));
}

function renderAllShapes(gl, shaderVars) {
  u_GlobalRotateMatrix = new Matrix4()
  // inspired by code by Ronan Wong
  u_GlobalRotateMatrix.rotate(g_globalAngleY + 45, 0, 1, 0);
  u_GlobalRotateMatrix.rotate(g_globalAngleX, 1, 0, 0);
  gl.uniformMatrix4fv(shaderVars[2], false, u_GlobalRotateMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (let i = 0; i < g_shapes.length; i++) {
    g_shapes[i].render(gl, shaderVars);
  }
}
