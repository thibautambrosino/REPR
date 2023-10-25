import { mat4 } from 'gl-matrix';
import { Transform } from './transform';

/**
 * Helper for a camera. This allows to easily cache the view matrix, as well
 * as to create the perspective projection.
 */
export class Camera {
  public transform: Transform;
  public view: mat4;
  public projection: mat4;

  public constructor() {
    this.transform = new Transform();
    this.view = mat4.create();
    this.projection = mat4.create();
  }

  public computeProjection(aspect: number, near = 0.1, far = 100.0): mat4 {
    mat4.perspective(this.projection, 0.785, aspect, near, far);
    return this.projection;
  }

  public computeView(): mat4 {
    mat4.copy(this.view, this.transform.combine());
    return this.view;
  }
}
