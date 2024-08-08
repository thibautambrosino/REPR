import { mat4, vec3, quat } from 'gl-matrix';

/**
 * Helper for a camera. This allows to easily compute the view and proj matrices.
 */
export class Camera {
  public _position: vec3;
  public _rotation: quat;
  //
  public _translationSpeed: number;
  public _rotationSpeed: number;
  //
  private _mouseClicked: boolean;
  private _mouseCurrentPosition: { x: number, y: number };

  public constructor(posX: number, posY: number, posZ: number) {
    this._position = vec3.fromValues(posX, posY, posZ);
    this._rotation = quat.create();
    this._translationSpeed = 0.3;
    this._rotationSpeed = 0.002;
    this._mouseClicked = false;
    this._mouseCurrentPosition = { x: 0, y: 0 };
  }

  public computeView(): mat4 {
    let view = mat4.create();
    mat4.fromRotationTranslation(view, this._rotation, this._position);
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
    let forwardVec = vec3.fromValues(0.0, 0.0, -this._translationSpeed);
    vec3.transformQuat(forwardVec, forwardVec, this._rotation);
    let rightVec = vec3.fromValues(this._translationSpeed, 0.0, 0.0);
    vec3.transformQuat(rightVec, rightVec, this._rotation);

    if (event.key == 'z' || event.key == 'ArrowUp') {
      vec3.add(this._position, this._position, forwardVec);
    }
    else if (event.key == 's' || event.key == 'ArrowDown') {
      vec3.add(this._position, this._position, vec3.negate(forwardVec, forwardVec));
    }
    else if (event.key == 'd' || event.key == 'ArrowRight') {
      vec3.add(this._position, this._position, rightVec);
    }
    else if (event.key == 'q' || event.key == 'ArrowLeft') {
      vec3.add(this._position, this._position, vec3.negate(rightVec, rightVec));
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
    const angleX = dy * this._rotationSpeed;
    const angleY = dx * this._rotationSpeed;
    quat.rotateX(this._rotation, this._rotation, angleX);
    quat.rotateY(this._rotation, this._rotation, angleY);

    this._mouseCurrentPosition.x = event.clientX;
    this._mouseCurrentPosition.y = event.clientY;
  }

  public onPointerUp(event: MouseEvent) {
    this._mouseClicked = false;
  }
}
