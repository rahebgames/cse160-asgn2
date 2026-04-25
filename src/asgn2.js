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
let g_globalAngle;

function main() {
  let [canvas, gl] = setupWebGL();
  if (!gl) return;
  gl.enable(gl.DEPTH_TEST);

  let shaderVars = connectVariablesToGLSL(gl);
  if (shaderVars[0] == -1) return;

  setupUI(gl, shaderVars);

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

function setupUI(gl, shaderVars) {
  let angleSlider = document.getElementById("angle");
  angleSlider.addEventListener("mousemove", function () {
    g_globalAngle = this.value; 
    renderAllShapes(gl, shaderVars);
  });
  g_globalAngle = angleSlider.value;
}

function createMoogle() {
  let matrix;
  let color;

  // body
  matrix = new Matrix4();
  matrix.setTranslate(-0.2, -0.5, 0);
  //matrix.rotate(0, 0, 0, 1);
  matrix.scale(0.45, 0.45, 0.45);
  color = [1,1,1,1];
  pushCube(matrix, color);

  // head
  matrix = new Matrix4();
  matrix.setTranslate(-0.225, -0.05, -0.03);
  //matrix.rotate(0, 0, 0, 1);
  matrix.scale(0.5, 0.5, 0.5);
  color = [1,1,1,1];
  pushCube(matrix, color);
}

function pushCube(matrix, color) {
  g_shapes.push(new Cube(matrix, color));
}

function renderAllShapes(gl, shaderVars) {
  u_GlobalRotateMatrix = new Matrix4()
  u_GlobalRotateMatrix.rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(shaderVars[2], false, u_GlobalRotateMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (let i = 0; i < g_shapes.length; i++) {
    g_shapes[i].render(gl, shaderVars);
  }
}
