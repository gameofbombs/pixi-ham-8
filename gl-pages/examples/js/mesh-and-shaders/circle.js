import { Application, Assets, Geometry, Mesh, Shader } from 'pixi.js';
import * as PIXI from 'pixi.js';

const vertex = `
in vec2 aPosition;
// in vec3 aColor;
// in vec2 aUV;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;

uniform mat3 uTransformMatrix;

out vec2 vUV;
out vec2 coord_pixel;
out vec3 circle_pixel;

void main() {
    coord_pixel = (uWorldTransformMatrix * uTransformMatrix * vec3(aPosition, 1.0)).xy;

    // circle coord
    circle_pixel = uWorldTransformMatrix * vec3(uTransformMatrix[2].xy, 1.0);
    // circle radius
    circle_pixel.z = length((uWorldTransformMatrix * vec3(uTransformMatrix[0].xy, 1.0)).xy);
    
    // coord_pixel += 10.0 * aPosition; // cool animation
    // coord_pixel += normalize(coord_pixel - circle_pixel.xy); // debug this

    gl_Position = vec4((uProjectionMatrix * vec3(coord_pixel, 1.0)).xy, 0.0, 1.0);

    // vColor = aColor;
    vUV = aPosition * 0.5 + 0.5;
}
`;

// A C tx
// B D ty
// 0 0 1

//uTransformMatrix[2].xy   tx ty

const fragment = `
// in vec3 vColor;
in vec2 vUV;
in vec2 coord_pixel;
in vec3 circle_pixel;

uniform sampler2D uTexture;

float getAlpha() { 
    float dist = length(coord_pixel - circle_pixel.xy);
    float rad = circle_pixel.z;
    float segX = max(0.0, min(dist + 0.5, rad) - max(dist - 0.5, -rad));
    float segY = min(2.0 * rad, 1.0);
    return segX * segY;
}

void main() {
    vec4 color = texture2D(uTexture, vUV);
    
    color *= getAlpha();
    
    gl_FragColor = color;
}
`;

const prog = new PIXI.GlProgram({
    vertex,
    fragment,
    name: 'circle-prog'
});

class CircleShader extends PIXI.Shader {
    constructor() {
        super({
            glProgram: prog,
            resources: {
                uTexture: PIXI.Texture.EMPTY.source,
            },
        })
        this._texture = PIXI.Texture.EMPTY
    }

    _texture

    get texture() {
        return this._texture
    }

    set texture(value) {
        this._texture = value
        this.resources.uTexture = value.source
    }
}

(async () =>
{
    Assets.loader.parsers[0].config.preferWorkers = false
    const texture = await Assets.load('./examples/assets/alpaca.jpg');

    // Create a new application
    const app = new Application();
    // Initialize the application
    await app.init({
        resizeTo: window,
        preference: 'webgl',
    });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    const w = 1.05
    const buffer = new PIXI.Buffer({ data: new Float32Array([
            w, 0.4,
        0.4, w,
            0.0, 0.0,
        -0.4, w,
        -w, 0.4,
            0.0, 0.0,
        -w, -0.4,
        -0.4, -w,
            0.0, 0.0,
        0.4, -w,
            w, -0.4,
            0.0, 0.0,
            w, 0.4,
    ])})

    const geometry = new Geometry({
        attributes: {
            aPosition: buffer
        },
    });
    geometry.topology = 'triangle-strip'

    const shader = new CircleShader()

    const triangle = new Mesh({
        geometry,
        shader,
        texture: texture
    });

    triangle.position.set(400, 300);
    triangle.scale.set(100.0)

    console.log(triangle.texture)

    app.stage.addChild(triangle);

    app.ticker.add(() =>
    {
        triangle.rotation += 0.01;
    });
})();
