import { mat4, vec3 } from 'gl-matrix';

/**
 * Helper for a camera. This allows to easily compute the view and proj matrices.
 */
export class Camera {
  public position: vec3;
  public view: mat4;
  public projection: mat4;

  public constructor() {
    this.position = vec3.create();
    this.view = mat4.create();
    this.projection = mat4.create();
  }

  public computeProjection(aspect: number, near = 0.1, far = 100.0) {
    mat4.perspective(this.projection, 0.785, aspect, near, far);
  }

  public lookAt(target: vec3, up: vec3) {
    let zAxis = vec3.create();
    vec3.sub(zAxis, this.position, target);
    vec3.normalize(zAxis, zAxis);

    let xAxis = vec3.create();
    vec3.cross(xAxis, up, zAxis);
    vec3.normalize(xAxis, xAxis);

    let yAxis = vec3.create();
    vec3.cross(yAxis, zAxis, xAxis);
    vec3.normalize(yAxis, yAxis);

    mat4.set(this.view,
      xAxis[0], xAxis[1], xAxis[2], 0,
      yAxis[0], yAxis[1], yAxis[2], 0,
      zAxis[0], zAxis[1], zAxis[2], 0,
      this.position[0],
      this.position[1],
      this.position[2],
      1
    );
  }
}
