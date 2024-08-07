import { mat4, vec3, quat } from 'gl-matrix';

/**
 * Helper for a camera. This allows to easily compute the view and proj matrices.
 */
export class Camera {
  public position: vec3;
  public rotation: quat;
  //
  public translationSpeed: number;
  public rotationSpeed: number;
  //
  private _mouseClicked: boolean;
  private _mouseCurrentPosition: { x: number, y: number };

  public constructor(posX: number, posY: number, posZ: number) {
    this.position = vec3.fromValues(posX, posY, posZ);
    this.rotation = quat.create();
    this.translationSpeed = 0.3;
    this.rotationSpeed = 0.002;
    this._mouseClicked = false;
    this._mouseCurrentPosition = { x: 0, y: 0 };
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


  /**
   * Handle keyboard and mouse inputs to translate and rotate camera.
   */
  public onKeyDown(event: KeyboardEvent) {
    let forwardVec = vec3.fromValues(0.0, 0.0, -this.translationSpeed);
    vec3.transformQuat(forwardVec, forwardVec, this.rotation);
    let rightVec = vec3.fromValues(this.translationSpeed, 0.0, 0.0);
    vec3.transformQuat(rightVec, rightVec, this.rotation);

    if (event.key == 'z' || event.key == 'ArrowUp') {
      vec3.add(this.position, this.position, forwardVec);
    }
    else if (event.key == 's' || event.key == 'ArrowDown') {
      vec3.add(this.position, this.position, vec3.negate(forwardVec, forwardVec));
    }
    else if (event.key == 'd' || event.key == 'ArrowRight') {
      vec3.add(this.position, this.position, rightVec);
    }
    else if (event.key == 'q' || event.key == 'ArrowLeft') {
      vec3.add(this.position, this.position, vec3.negate(rightVec, rightVec));
    }
  }

  public onPointerDown(event: MouseEvent) {
    this._mouseCurrentPosition.x = event.clientX;
    this._mouseCurrentPosition.y = event.clientY;
    this._mouseClicked = true;
  }

  public onPointerMove(event: MouseEvent) {
    if (!this._mouseClicked) {
      return;
    }

    const dx = event.clientX - this._mouseCurrentPosition.x;
    const dy = event.clientY - this._mouseCurrentPosition.y;
    const angleX = dy * this.rotationSpeed;
    const angleY = dx * this.rotationSpeed;
    quat.rotateX(this.rotation, this.rotation, angleX);
    quat.rotateY(this.rotation, this.rotation, angleY);

    this._mouseCurrentPosition.x = event.clientX;
    this._mouseCurrentPosition.y = event.clientY;
  }

  public onPointerUp(event: MouseEvent) {
    this._mouseClicked = false;
  }
}
