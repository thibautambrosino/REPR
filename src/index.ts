import { GUI } from 'dat.gui';
import { mat4, vec3 } from 'gl-matrix';
import { Camera } from './camera';
import { SphereGeometry } from './geometries/sphere';
import { GLContext } from './gl';
import { PBRShader } from './shader/pbr-shader';
import { Texture, Texture2D } from './textures/texture';
import { UniformType } from './types';
import { DirectionalLight } from './lights/lights';
import { PointLight } from './lights/lights';

// GUI elements
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
  private _guiProperties: GUIProperties; // Object updated with the properties from the GUI


  constructor(canvas: HTMLCanvasElement) {
    this._context = new GLContext(canvas);
    this._camera = new Camera(0.0, 0.0, 18.0);
    this._geometry = new SphereGeometry();
    this._shader = new PBRShader();
    this._textureExample = null;
    this._uniforms = {
      'uMaterial.albedo': vec3.create(),
      'uModel.LS_to_WS': mat4.create(),
      'uCamera.WS_to_CS': mat4.create(),
      'uCamera.position': vec3.create(),
    };

    // Set GUI default values
    this._guiProperties = {
      albedo: [255, 255, 255],
    };
    // Creates a GUI floating on the upper right side of the page.
    // You are free to do whatever you want with this GUI.
    // It's useful to have parameters you can dynamically change to see what happens.
    const gui = new GUI();
    gui.addColor(this._guiProperties, 'albedo');
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

    // Handle keyboard and mouse inputs to translate and rotate camera.
    canvas.addEventListener('keydown', this._camera.onKeyDown.bind(this._camera), true);
    canvas.addEventListener('pointerdown', this._camera.onPointerDown.bind(this._camera), true);
    canvas.addEventListener('pointermove', this._camera.onPointerMove.bind(this._camera), true);
    canvas.addEventListener('pointerup', this._camera.onPointerUp.bind(this._camera), true);
    canvas.addEventListener('pointerleave', this._camera.onPointerUp.bind(this._camera), true);
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
    this._context.resetViewport();
  }

  /**
   * Called at every loop, after the [[Application.update]] method.
   */
  render() {
    this._context.clear();
    this._context.setDepthTest(true);

    const props = this._guiProperties;

    // Set World-Space to Clip-Space transformation matrix (a.k.a view-projection).
    const aspect = this._context.gl.drawingBufferWidth / this._context.gl.drawingBufferHeight;
    let WS_to_CS = this._uniforms['uCamera.WS_to_CS'] as mat4;
    this._uniforms['uCamera.position'] = this._camera._position;
    mat4.multiply(WS_to_CS, this._camera.computeProjection(aspect), this._camera.computeView());

    // Initialize lights
    const pointLight1 = new PointLight();
    pointLight1.setColorRGB(200.0, 200.0, 0.0);
    pointLight1.setPosition(6.0, 6.0, 15.0);
    pointLight1.setIntensity(0.5);

    const pointLight2 = new PointLight();
    pointLight2.setColorRGB(0.0, 255.0, 0.0);
    pointLight2.setPosition(-6.0, -6.0, 15.0);
    pointLight2.setIntensity(1.0);

    const pointLight3 = new PointLight();
    pointLight3.setColorRGB(0.0, 0.0, 255.0);
    pointLight3.setPosition(5.5, 5.5, 15.0);
    pointLight3.setIntensity(0.5);

    const pointLight4 = new PointLight();
    pointLight4.setColorRGB(0.0, 120.0, 0.0);
    pointLight4.setPosition(-6.0, -6.5, 15.0);
    pointLight4.setIntensity(0.2);

    const pointLight5 = new PointLight();
    pointLight5.setColorRGB(255.0, 0.0, 0.0);
    pointLight5.setPosition(-5.5, 5.5, 5.0);
    pointLight5.setIntensity(0.5);

    const pointLight6 = new PointLight();
    pointLight6.setColorRGB(0.0, 255.0, 0.0);
    pointLight6.setPosition(6.0, -6.5, 5.0);
    pointLight6.setIntensity(0.2);

    // Set Point light array
    const PLights = [
      pointLight3,
      pointLight4,
      pointLight5,
      pointLight6
    ]

    // Give to the shader the Point light array as uniform
    for (let i = 0; i< PLights.length; i++) {
      this._uniforms[`uLights[${i}].position`] = PLights[i].positionWS;
      this._uniforms[`uLights[${i}].color`] = PLights[i].color;
      this._uniforms[`uLights[${i}].intensity`] = PLights[i].intensity;
    }

    // Draw the 5x5 grid of spheres
    const rows = 5;
    const columns = 5;
    const spacing = this._geometry.radius * 2.5;
    for (let r = 0; r < rows; ++r) {
      for (let c = 0; c < columns; ++c) {
        const materialID = c + r *rows;

        // Set the albedo uniform using the GUI value
        this._uniforms[`uMaterial[${materialID}].albedo`] = vec3.fromValues(
          props.albedo[0] / 255,
          props.albedo[1] / 255,
          props.albedo[2] / 255);

        // Set Local-Space to World-Space transformation matrix (a.k.a model).
        const WsSphereTranslation = vec3.fromValues(
          (c - columns * 0.5) * spacing + spacing * 0.5,
          (r - rows * 0.5) * spacing + spacing * 0.5,
          0.0
        );
        const LS_to_WS = this._uniforms["uModel.LS_to_WS"] as mat4;
        mat4.fromTranslation(LS_to_WS, WsSphereTranslation);

        // set Material uniforms 
        this._uniforms[`uMaterial[${materialID}].metalness`] = 1 - (0.2 * c);
        this._uniforms[`uMaterial[${materialID}].roughness`] = 1 - (0.2 * r);
        this._uniforms[`uMaterialID`] = materialID;

        // Draw the triangles
        this._context.draw(this._geometry, this._shader, this._uniforms);
      } 
    }
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
