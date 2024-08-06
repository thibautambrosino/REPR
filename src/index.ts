import { GUI } from 'dat.gui';
import { mat4, vec3, quat } from 'gl-matrix';
import { Camera } from './camera';
import { SphereGeometry } from './geometries/sphere';
import { GLContext } from './gl';
import { PBRShader } from './shader/pbr-shader';
import { Texture, Texture2D } from './textures/texture';
import { UniformType } from './types';

interface GUIProperties {
  albedo: number[];
}

/**
 * Class representing the current application with its state.
 *
 * @class Application
 */
class Application {
  private _context: GLContext; // Context used to draw to the canvas
  private _shader: PBRShader;
  private _geometry: SphereGeometry;
  private _uniforms: Record<string, UniformType | Texture>;
  private _textureExample: Texture2D<HTMLElement> | null;
  private _camera: Camera;
  private _mouseClicked: boolean;
  private _mouseCurrentPosition: { x: number, y: number };
  private _guiProperties: GUIProperties; // Object updated with the properties from the GUI

  constructor(canvas: HTMLCanvasElement) {
    this._context = new GLContext(canvas);
    this._mouseClicked = false;
    this._mouseCurrentPosition = { x: 0, y: 0 };
    this._camera = new Camera(0.0, 0.0, 18.0);
    this._geometry = new SphereGeometry();
    this._shader = new PBRShader();
    this._textureExample = null;
    this._uniforms = {
      'uMaterial.albedo': vec3.create(),
      'uModel.LsToWs': mat4.create(),
      'uCamera.WsToCs': mat4.create(),
    };
    this._guiProperties = {
      albedo: [255, 255, 255]
    };

    this._createGUI();
  }

  /**
   * Initializes the application.
   */
  async init() {
    this._context.uploadGeometry(this._geometry);
    this._context.compileProgram(this._shader);

    // Example showing how to load a texture and upload it to GPU.
    this._textureExample = await Texture2D.load(
      'assets/ggx-brdf-integrated.png'
    );
    if (this._textureExample !== null) {
      this._context.uploadTexture(this._textureExample);
      // You can then use it directly as a uniform:
      // ```uniforms.myTexture = this._textureExample;```
    }

    // Event handlers (mouse and keyboard)
    canvas.addEventListener('keydown', this.onKeyDown, true);
    canvas.addEventListener('pointerdown', this.onPointerDown, true);
    canvas.addEventListener('pointermove', this.onPointerMove, true);
    canvas.addEventListener('pointerup', this.onPointerUp, true);
    canvas.addEventListener('pointerleave', this.onPointerUp, true);
  }

  /**
   * Called at every loop, before the [[Application.render]] method.
   */
  update() {
    /** Empty. */
  }

  /**
   * Called when the canvas size changes.
   */
  resize() {
    this._context.resize();
  }

  /**
   * Called at every loop, after the [[Application.update]] method.
   */
  render() {
    this._context.clear();
    this._context.setDepthTest(true);

    const props = this._guiProperties;

    // Set the color from the GUI into the uniform list.
    vec3.set(
      this._uniforms['uMaterial.albedo'] as vec3,
      props.albedo[0] / 255,
      props.albedo[1] / 255,
      props.albedo[2] / 255
    );

    // Set World-Space To Clip-Space transformation matrix (view projection).
    const aspect = this._context.gl.drawingBufferWidth / this._context.gl.drawingBufferHeight;
    let WsToCs = this._uniforms['uCamera.WsToCs'] as mat4;
    mat4.multiply(WsToCs, this._camera.computeProjection(aspect), this._camera.computeView());

    // Draw the 5x5 grid of spheres
    const rows = 5;
    const columns = 5;
    const spacing = this._geometry.radius * 2.5;
    for (let r = 0; r < rows; ++r) {
      for (let c = 0; c < columns; ++c) {

        // Set Local-Space To World-Space transformation matrix
        const WsSphereTranslation = vec3.set(
          vec3.create(),
          (c - columns * 0.5) * spacing + spacing * 0.5,
          (r - rows * 0.5) * spacing + spacing * 0.5,
          0.0
        );
        const LsToWs = this._uniforms["uModel.LsToWs"] as mat4;
        mat4.fromTranslation(LsToWs, WsSphereTranslation);

        // Draws the triangle.
        this._context.draw(this._geometry, this._shader, this._uniforms);
      }
    }
  }

  /**
   * Creates a GUI floating on the upper right side of the page.
   *
   * You are free to do whatever you want with this GUI. It's useful to have
   * parameters you can dynamically change to see what happens.
   *
   * @private
   */
  private _createGUI(): GUI {
    const gui = new GUI();
    gui.addColor(this._guiProperties, 'albedo');
    return gui;
  }

  /**
   * Handle keyboard and mouse inputs to translate and rotate camera.
   */
  onKeyDown(event: KeyboardEvent) {
    const speed = 0.2;

    let forwardVec = vec3.fromValues(0.0, 0.0, -speed);
    vec3.transformQuat(forwardVec, forwardVec, app._camera.rotation);
    let rightVec = vec3.fromValues(speed, 0.0, 0.0);
    vec3.transformQuat(rightVec, rightVec, app._camera.rotation);

    if (event.key == 'z' || event.key == 'ArrowUp') {
      vec3.add(app._camera.position, app._camera.position, forwardVec);
    }
    else if (event.key == 's' || event.key == 'ArrowDown') {
      vec3.add(app._camera.position, app._camera.position, vec3.negate(forwardVec, forwardVec));
    }
    else if (event.key == 'd' || event.key == 'ArrowRight') {
      vec3.add(app._camera.position, app._camera.position, rightVec);
    }
    else if (event.key == 'q' || event.key == 'ArrowLeft') {
      vec3.add(app._camera.position, app._camera.position, vec3.negate(rightVec, rightVec));
    }
  }

  onPointerDown(event: MouseEvent) {
    app._mouseCurrentPosition.x = event.clientX;
    app._mouseCurrentPosition.y = event.clientY;
    app._mouseClicked = true;
  }

  onPointerMove(event: MouseEvent) {
    if (!app._mouseClicked) {
      return;
    }

    const dx = event.clientX - app._mouseCurrentPosition.x;
    const dy = event.clientY - app._mouseCurrentPosition.y;
    const angleX = dy * 0.002;
    const angleY = dx * 0.002;
    quat.rotateX(app._camera.rotation, app._camera.rotation, angleX);
    quat.rotateY(app._camera.rotation, app._camera.rotation, angleY);

    app._mouseCurrentPosition.x = event.clientX;
    app._mouseCurrentPosition.y = event.clientY;
  }

  onPointerUp(event: MouseEvent) {
    app._mouseClicked = false;
  }

}

const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
const app = new Application(canvas as HTMLCanvasElement);
app.init();

function animate() {
  app.update();
  app.render();
  window.requestAnimationFrame(animate);
}
animate();

/**
 * Handles resize.
 */
const resizeObserver = new ResizeObserver((entries) => {
  if (entries.length > 0) {
    const entry = entries[0];
    canvas.width = window.devicePixelRatio * entry.contentRect.width;
    canvas.height = window.devicePixelRatio * entry.contentRect.height;
    app.resize();
  }
});

resizeObserver.observe(canvas);
