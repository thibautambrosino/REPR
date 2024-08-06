import { mat4, vec3, quat } from 'gl-matrix';

/**
 * Helper for a camera. This allows to easily compute the view and proj matrices.
 */
export class Camera {
  public position: vec3;
  public rotation: quat;
  public speed: number;

  public constructor(posX: number, posY: number, posZ: number) {
    this.position = vec3.fromValues(posX, posY, posZ);
    this.rotation = quat.create();
    this.speed = 0.3;
  }

  public computeView(): mat4 {
    let view = mat4.create();
    mat4.fromRotationTranslation(view, this.rotation, this.position);
    mat4.invert(view, view);
    return view;
  }

  public computeProjection(aspect: number, near = 0.1, far = 100.0): mat4 {
    let projection = mat4.create();
    mat4.perspective(projection, 0.785, aspect, near, far);
    return projection;
  }
}
