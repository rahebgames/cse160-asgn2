class Tetrahedron {
  constructor(matrix, color) {
    this.matrix = matrix;
    this.color = color;
  }

  render(gl, shaderVars) {
    gl.uniformMatrix4fv(shaderVars[1], false, this.matrix.elements);

    // front
    gl.uniform4fv(shaderVars[3], this.color);
    drawTriangle(gl, shaderVars, [-0.5,-0.5,0.5, 0.5,-0.5,0.5, 0,0.5,0], this.color);

    // right
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.8));
    drawTriangle(gl, shaderVars, [0.5,-0.5,0.5, 0,-0.5,-0.5, 0,0.5,0], this.color);

    // left
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.9));
    drawTriangle(gl, shaderVars, [0,-0.5,-0.5, -0.5,-0.5,0.5, 0,0.5,0], this.color);

    // bottom
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.6));
    drawTriangle(gl, shaderVars, [-0.5,-0.5,0.5, 0,-0.5,-0.5, 0.5,-0.5,0.5], this.color);
  }

  darkenColor(mod) {
    return [this.color[0]*mod, this.color[1]*mod, this.color[2]*mod, this.color[3]];
  }
}

function drawTriangle(gl, shaderVars, vertices) {
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
