class Cube {
  constructor(matrix, color) {
    this.matrix = matrix;
    this.color = color;
  }

  render(gl, shaderVars) {
    gl.uniformMatrix4fv(shaderVars[1], false, this.matrix.elements);

    // front
    gl.uniform4fv(shaderVars[3], this.color);
    drawTriangle(gl, shaderVars, [-0.5,-0.5,-0.5,  0.5,0.5,-0.5,  0.5,-0.5,-0.5], this.color);
    drawTriangle(gl, shaderVars, [-0.5,-0.5,-0.5, -0.5,0.5,-0.5,  0.5,0.5,-0.5], this.color);

    // top
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.9));
    drawTriangle(gl, shaderVars, [-0.5,0.5,-0.5, -0.5,0.5,0.5,  0.5,0.5,0.5], this.color);
    drawTriangle(gl, shaderVars, [-0.5,0.5,-0.5,  0.5,0.5,0.5,  0.5,0.5,-0.5], this.color);

    // back
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.7));
    drawTriangle(gl, shaderVars, [-0.5,-0.5,0.5,  0.5,-0.5,0.5,  0.5,0.5,0.5], this.color);
    drawTriangle(gl, shaderVars, [-0.5,-0.5,0.5,  0.5,0.5,0.5, -0.5,0.5,0.5], this.color);

    // left
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.8));
    drawTriangle(gl, shaderVars, [-0.5,-0.5,-0.5, -0.5,0.5,0.5, -0.5,-0.5,0.5], this.color);
    drawTriangle(gl, shaderVars, [-0.5,-0.5,-0.5, -0.5,0.5,-0.5, -0.5,0.5,0.5], this.color);

    // right
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.8));
    drawTriangle(gl, shaderVars, [0.5,-0.5,-0.5,  0.5,-0.5,0.5,  0.5,0.5,0.5], this.color);
    drawTriangle(gl, shaderVars, [0.5,-0.5,-0.5,  0.5,0.5,0.5,  0.5,0.5,-0.5], this.color);

    // bottom
    gl.uniform4fv(shaderVars[3], this.darkenColor(0.6));
    drawTriangle(gl, shaderVars, [-0.5,-0.5,-0.5,  0.5,-0.5,0.5, -0.5,-0.5,0.5], this.color);
    drawTriangle(gl, shaderVars, [-0.5,-0.5,-0.5,  0.5,-0.5,-0.5,  0.5,-0.5,0.5], this.color);
  }

  darkenColor(mod) {
    return [this.color[0]*mod, this.color[1]*mod, this.color[2]*mod, this.color[3]];
  }
}
