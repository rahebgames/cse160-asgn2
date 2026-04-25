class Cube {
  constructor(matrix, color) {
    this.matrix = matrix;
    this.color = color;
  }

  render(gl, shaderVars) {
    gl.uniformMatrix4fv(shaderVars[1], false, this.matrix.elements);

    // front
    gl.uniform4fv(shaderVars[3], this.color);
    drawTriangle3D(gl, shaderVars, [0,0,0, 1,1,0, 1,0,0], this.color);
    drawTriangle3D(gl, shaderVars, [0,0,0, 0,1,0, 1,1,0], this.color);

    // top
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.9));
    drawTriangle3D(gl, shaderVars, [0,1,0, 0,1,1, 1,1,1], this.color);
    drawTriangle3D(gl, shaderVars, [0,1,0, 1,1,1, 1,1,0], this.color);

    // back
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.7));
    drawTriangle3D(gl, shaderVars, [0,0,1, 1,0,1, 1,1,1], this.color);
    drawTriangle3D(gl, shaderVars, [0,0,1, 1,1,1, 0,1,1], this.color);

    // left
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.8));
    drawTriangle3D(gl, shaderVars, [0,0,0, 0,1,1, 0,0,1], this.color);
    drawTriangle3D(gl, shaderVars, [0,0,0, 0,1,0, 0,1,1], this.color);

    // right
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.8));
    drawTriangle3D(gl, shaderVars, [1,0,0, 1,0,1, 1,1,1], this.color);
    drawTriangle3D(gl, shaderVars, [1,0,0, 1,1,1, 1,1,0], this.color);

    // bottom
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.6));
    drawTriangle3D(gl, shaderVars, [0,0,0, 1,0,1, 0,0,1], this.color);
    drawTriangle3D(gl, shaderVars, [0,0,0, 1,0,0, 1,0,1], this.color);
  }

  darkenColor(mod) {
    return [this.color[0]*mod, this.color[1]*mod, this.color[2]*mod, this.color[3]];
  }
}
