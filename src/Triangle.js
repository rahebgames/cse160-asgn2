class Triangle {
  constructor(position, size, color) {
    this.position = position;
    this.size = size;
    this.color = color;
  }

  render(gl, shaderVars) {
    gl.uniform4fv(shaderVars[2], this.color);

    let xy = this.position;
    let delta = this.size / 200.0;
    let vertices = new Float32Array([xy[0],xy[1], xy[0]+delta,xy[1], xy[0],xy[1]+delta,
    ]);
    let n = Math.floor(3); // The number of vertices

    // Create a buffer object
    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log("Failed to create the buffer object");
      return -1;
    }
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(shaderVars[0], 2, gl.FLOAT, false, 0, 0);
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(shaderVars[0]);

    gl.drawArrays(gl.TRIANGLES, 0, n);
    gl.disableVertexAttribArray(shaderVars[0]);
  }
}

function drawTriangle(gl, shaderVars, vertices, color) {
  gl.uniform4fv(shaderVars[3], color);

  let vertices_array = new Float32Array(vertices);
  let n = 3; // The number of vertices

  // Create a buffer object
  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices_array, gl.DYNAMIC_DRAW);

  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
  gl.disableVertexAttribArray(a_Position);
}

function drawTriangle3D(gl, shaderVars, vertices) {
  let vertices_array = new Float32Array(vertices);
  let n = 3; // The number of vertices

  // Create a buffer object
  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices_array, gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(shaderVars[0], 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(shaderVars[0]);

  gl.drawArrays(gl.TRIANGLES, 0, n);
  gl.disableVertexAttribArray(shaderVars[0]);
}
