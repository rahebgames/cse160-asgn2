class Point {
  constructor(position, size, color) {
    this.position = position;
    this.size = size;
    this.color = color;
  }

  render(gl, shaderVars) {
    gl.vertexAttrib2fv(shaderVars[0], this.position);
    gl.uniform1f(shaderVars[1], this.size);
    gl.uniform4fv(shaderVars[2], this.color);

    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
